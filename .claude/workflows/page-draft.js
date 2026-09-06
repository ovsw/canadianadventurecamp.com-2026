export const meta = {
  name: 'page-draft',
  description:
    'Rebuild one Canadian Adventure Camp page from the old site into a draft with nobody watching: take the page, research, write the plan, build, hand over to Ovi',
  whenToUse:
    'Ovi names a page slug, an old-site URL, a Basecamp card, or a plan issue number to rework, or says to draft the next page',
  phases: [
    { title: 'Take the page', detail: 'find the card, mark it in progress' },
    { title: 'Research', detail: 'five readers at once, one set of notes each' },
    { title: 'Plan', detail: 'write the plan as a GitHub issue, second reader, fix' },
    { title: 'Build', detail: 'get ready, build sections, write the text, proofread, fix, load the page, push' },
    { title: 'Hand over to Ovi', detail: 'card to Ovi Polish, For Ovi comment, list for the camp' },
  ],
}

// The instructions for each step live in .claude/workflows/page-draft/.
// This script holds the order of the steps, the loops, and the data that
// passes between them. The step files stay the source of truth.

// ---- input -----------------------------------------------------------------
const opts = args && typeof args === 'object' ? args : { target: args }
const target = opts.target == null ? '' : String(opts.target).trim()
const stopAfter = opts.stopAfter ? String(opts.stopAfter) : ''

const DOCS = '.claude/workflows/page-draft'
const PREAMBLE = [
  'You are one step of the page-draft workflow for the Canadian Adventure Camp website, run inside this repository.',
  'Ovi is away. Never wait for him: take the decision you would have recommended to him, and write down the fact or rule it rests on.',
  `Read the file for your step in \`${DOCS}/\` and nothing else of that folder. Facts about the repo (Basecamp ids and commands, how to take a page, the rules for working in parallel, the scripts, how to load a page without a browser) are in \`docs/agents/page-workflow.md\`; read the part your step names.`,
  'Every tool call re-reads everything you have read so far, so each one costs. What your instructions hand you (notes, the plan, section lists) is true: do not read the sources again to check it. Run no `--help`: the commands you need are written in your step file, with their flags. Read a file once, read only the part you need, and stop reading when you can act.',
  'Your final output is data for the script that runs the workflow, never a message for a person. Fill in every field you are asked for; anything you do not return is lost.',
  'When you are asked for `forOvi`, return one line per thing you assumed, guessed, decided on your own, or could not confirm in this step. Start each line with `decision:`, `review:`, `client:`, or `assumption:`. Return an empty list only when there is truly nothing.',
].join('\n')

// Which model and effort each step uses. Simple, mechanical steps run on a
// smaller model. The steps that write text, design sections, or judge
// quality use the session's model. The two readers run at medium effort:
// on 2026-09-05 they were the largest cost of a run at high effort, and
// their round 1 findings were the ones that mattered. Edit this table to
// trade cost against quality.
const MODEL = {
  takeThePage: { model: 'sonnet' },
  research: { model: 'sonnet' },
  readThePlan: { model: 'sonnet' },
  writeThePlan: {},
  secondReader: { effort: 'medium' },
  fixThePlan: {},
  getReady: { model: 'sonnet' },
  buildSection: {},
  writeTheText: {},
  proofread: { effort: 'medium' },
  fix: {},
  loadThePage: { model: 'sonnet', effort: 'low' },
  push: { model: 'sonnet' },
  handOver: { model: 'sonnet' },
  giveUp: { model: 'haiku', effort: 'low' },
}

// ---- the shapes each step returns -----------------------------------------
const str = { type: 'string' }
const bool = { type: 'boolean' }
const int = { type: 'integer' }
const strList = { type: 'array', items: str }
function obj(properties, required) {
  return { type: 'object', properties, required: required ?? Object.keys(properties) }
}
function list(item) {
  return { type: 'array', items: item }
}

const PAGE = obj(
  {
    status: { type: 'string', enum: ['taken', 'someone-else-has-it', 'not-found', 'wrong-checkout'] },
    slug: str,
    title: str,
    pageId: str,
    isNewPage: bool,
    tier: str,
    cardId: str,
    cardUrl: str,
    branch: str,
    worktree: str,
    planIssueNumber: int,
    note: str,
  },
  ['status', 'slug', 'title', 'pageId', 'isNewPage', 'cardId', 'cardUrl', 'branch', 'note'],
)
const NOTES = obj({ notes: str })
const SECTION = obj({
  title: str,
  block: str,
  mark: { type: 'string', enum: ['reuse', 'extend', 'design', 'new'] },
  field: str,
})
const PLAN = obj({
  issueNumber: int,
  issueUrl: str,
  sections: list(SECTION),
  homepageCandidates: strList,
  questionsForTheCamp: strList,
  decisions: str,
})
const PROBLEMS_IN_PLAN = obj({ problems: list(obj({ section: str, problem: str, fix: str })) })
const READY = obj(
  { ok: bool, backupPath: str, sectionsOthersAreEditing: strList, sections: list(SECTION), forOvi: strList, notes: str },
  ['ok', 'backupPath', 'sectionsOthersAreEditing', 'forOvi', 'notes'],
)
const SECTION_BUILT = obj({ block: str, typecheckOk: bool, files: strList, forOvi: strList, notes: str })
const TEXT_SAVED = obj({
  saved: bool,
  seedPath: str,
  documentIds: strList,
  placeholders: strList,
  missingPhotos: strList,
  forOvi: strList,
  notes: str,
})
const PROBLEMS_IN_PAGE = obj({ problems: list(obj({ where: str, problem: str, fix: str })) })
const FIXED = obj({ fixed: strList, forOvi: strList, notes: str })
const PAGE_LOADED = obj({ ok: bool, missingHeadings: strList, errors: strList })
const PUSHED = obj({ pushed: bool, headSha: str, forOvi: strList, notes: str })
const HANDED_OVER = obj({
  cardUrl: str,
  issueUrl: str,
  clientInputUrl: str,
  coherenceIssueUrls: strList,
  sectionsForOviToDesign: strList,
  placeholders: strList,
  missingPhotos: strList,
  studioPath: str,
  summary: str,
})
const DONE = obj({ done: bool })

// Every step runs as the `shell-and-files` agent type (.claude/agents/),
// which has five tools: Bash, Read, Edit, Write, Skill. Claude Code staples
// the definition of every tool an agent has to every message it sends, and
// the full set of thirty costs about 25k tokens a message; these five cost
// about 2.5k. Nothing in this workflow needs the rest.
const AGENT_TYPE = 'shell-and-files'

// ---- helpers ---------------------------------------------------------------
// Once the page is ours, a crash must still end with a comment on the card,
// or Ovi sees a card stuck "in progress" with no explanation.
let takenPage = null
async function run(label, phaseTitle, body, schema, extra) {
  let result
  try {
    result = await agent(`${PREAMBLE}\n\n${body}`, {
      label,
      phase: phaseTitle,
      schema,
      ...(extra ?? {}),
      agentType: AGENT_TYPE,
    })
  } catch (error) {
    await writeFailureOnCard(label, error?.message ?? String(error))
    throw error
  }
  if (result == null) {
    const reason = `${label}: the agent returned nothing (it was stopped, or the API failed after retries)`
    await writeFailureOnCard(label, reason)
    throw new Error(reason)
  }
  return result
}

async function writeFailureOnCard(stepName, reason) {
  if (!takenPage || stepName === 'give up') return
  const page = takenPage
  takenPage = null // one comment, and no loop if giving up fails too
  try {
    await giveUp(page, stepName, reason)
  } catch (error) {
    log(`Could not write the failure on the card: ${error?.message ?? error}`)
  }
}

// Notes for Ovi: everything a human must confirm, review, or check with the
// camp, collected from every build step and written on the card at the end.
const forOvi = []
function collect(stepName, result) {
  for (const line of result.forOvi ?? []) forOvi.push(`${line} [${stepName}]`)
  return result
}

// Every step gets these lines. The facts an agent would otherwise go and
// find again: on 2026-09-06 three research readers spent ten or more
// commands each working out which checkout they were in and how to query
// the content database.
function pageLine(page) {
  return [
    `The page: "${page.title}", slug \`${page.slug}\`, Sanity id \`${page.pageId || '(none yet: this is a new page)'}\`,`,
    `tier ${page.tier || '?'}, Basecamp card ${page.cardUrl} (id ${page.cardId}), branch \`${page.branch}\`.`,
    `Work in \`${page.worktree}\`: start every command with \`cd "${page.worktree}" &&\`. It is a worktree of the main checkout; never use the main checkout's path, and never guess a path from the project name.`,
    'The content database: `pnpm sanity:query \'<groq>\' [\'<json params>\']` prints any query as JSON, drafts and published alike, with the token already loaded; `pnpm page:text <slug>` prints a page as text; `pnpm legacy:page <slug>` prints the old site\'s page. Nothing else is needed to read Sanity: no token lookup, no `npx sanity`, no script of your own.',
  ].join('\n')
}

function sectionList(sections) {
  return sections
    .map((s, i) => `${i + 1}. ${s.title} — ${s.mark} ${s.block}${s.field ? ` (${s.field} background)` : ''}`)
    .join('\n')
}

async function giveUp(page, stepName, reason) {
  log(`Giving up: "${stepName}" failed. ${reason}`)
  await run(
    'give up',
    'Hand over to Ovi',
    [
      `Your job: give up cleanly. The build stopped at "${stepName}": ${reason}`,
      pageLine(page),
      'Write a comment on the Basecamp card (Markdown from stdin, see page-workflow.md "Basecamp") saying which step failed, why, what a human should check, and the notes for Ovi below. Leave the card marked in progress. Commit nothing, push nothing, write nothing to Sanity.',
      '',
      forOvi.length ? forOvi.map((l) => `- ${l}`).join('\n') : '(no notes for Ovi yet)',
    ].join('\n'),
    DONE,
    MODEL.giveUp,
  )
  return { status: 'failed', step: stepName, reason, card: page.cardUrl, branch: page.branch }
}

// A reader and a fixer take one turn each. A second turn runs only when the
// first read found more than MANY problems: on 2026-09-05 both loops ran
// their full three rounds every time, because a reader asked for problems
// always finds some, and rounds 2 and 3 cost as much as round 1 while
// finding less. What the last read found is fixed but not read again; the
// script lists it for Ovi as unchecked.
const MANY = 8
const MAX_ROUNDS = 2

// ---- 1. Take the page ------------------------------------------------------
phase('Take the page')
const page = await run(
  'take the page',
  'Take the page',
  [
    `Your job: take the page. Follow \`${DOCS}/take-the-page.md\`.`,
    `Target: ${target || '(nothing given: take the top card in the "To Build" column that nobody has claimed)'}.`,
  ].join('\n'),
  PAGE,
  MODEL.takeThePage,
)
if (page.status !== 'taken') {
  log(`Did not take the page: ${page.status}. ${page.note}`)
  return { status: page.status, note: page.note, slug: page.slug, card: page.cardUrl }
}
// Cards write the slug with a leading slash; the site and the scripts want it bare.
page.slug = page.slug.replace(/^\/+/, '')
takenPage = page
log(`Took "${page.title}" (/${page.slug}) on branch ${page.branch}`)
if (stopAfter === 'take-the-page') return { status: 'stopped after taking the page', page }

// ---- 2 and 3. Research and plan, unless the plan is already written --------
let plan
let planProblemsFixedUnchecked = []
// The research notes go to the plan writer, and again to the page writer
// and the proofreader, so they do not read the sources a second time.
let allNotes = ''
let audienceNotes = ''
if (page.planIssueNumber) {
  log(`The plan is already written (issue #${page.planIssueNumber}). Skipping research and planning.`)
  plan = await run(
    'read the plan',
    'Plan',
    [
      `Your job: read the plan that is already written. ${pageLine(page)}`,
      `Read GitHub issue #${page.planIssueNumber} with \`gh issue view\` and return what it says: every section in its "Content outline", in order, with the section's code name, its label (reuse, extend, design, or new), and its background colour; the homepage candidates; the open questions for the client; and a short summary of "Decisions made without Ovi". Change nothing.`,
    ].join('\n'),
    PLAN,
    MODEL.readThePlan,
  )
} else {
  phase('Research')
  const readers = [
    { key: 'who the page is for', heading: 'A. Who the page is for, and the writing rules' },
    { key: 'the old page', heading: 'B. What the old page says' },
    { key: 'posts and neighbours', heading: 'C. Related blog posts, and the pages next to it in the menu' },
    { key: 'sections and design', heading: 'D. Which page sections exist, and the design rules' },
    { key: 'photos', heading: 'E. Which photos exist' },
  ]
  // All five sets of notes are needed together before the plan can be written.
  const notes = await parallel(
    readers.map((r) => () =>
      run(
        `research: ${r.key}`,
        'Research',
        [
          `Your job: research "${r.heading}". Follow that heading of \`${DOCS}/research.md\` and nothing else.`,
          pageLine(page),
        ].join('\n'),
        NOTES,
        MODEL.research,
      ),
    ),
  )
  const missing = readers.filter((r, i) => !notes[i])
  if (missing.length) {
    throw new Error(`These research readers returned nothing: ${missing.map((r) => r.key).join(', ')}. Relaunch the workflow to continue.`)
  }
  allNotes = readers.map((r, i) => `### ${r.heading}\n\n${notes[i].notes}`).join('\n\n')
  audienceNotes = `### ${readers[0].heading}\n\n${notes[0].notes}`
  if (stopAfter === 'research') return { status: 'stopped after research', page, notes: allNotes }

  phase('Plan')
  const written = await run(
    'write the plan',
    'Plan',
    [
      `Your job: write the plan. Follow \`${DOCS}/plan.md\` parts 1 to 4 and "Save the plan".`,
      pageLine(page),
      '',
      'The five sets of research notes follow. They are your inputs. Open a source file again only where the notes are unclear.',
      '',
      allNotes,
    ].join('\n'),
    PLAN,
    MODEL.writeThePlan,
  )
  log(`Plan saved: ${written.issueUrl} (${written.sections.length} sections)`)
  plan = written
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const secondRead = await run(
      `second reader (round ${round})`,
      'Plan',
      [
        `Your job: read the plan as the parent it is written for, round ${round}. Follow "The second reader" in \`${DOCS}/plan.md\`.`,
        pageLine(page),
        `The plan: ${plan.issueUrl}. Read the issue as it is now, and the notes below on who the page is for. Return problems only.`,
        '',
        audienceNotes,
      ].join('\n'),
      PROBLEMS_IN_PLAN,
      MODEL.secondReader,
    )
    planProblemsFixedUnchecked = secondRead.problems
    if (!planProblemsFixedUnchecked.length) {
      log(`Second reader, round ${round}: no problems`)
      break
    }
    log(`Second reader, round ${round}: ${planProblemsFixedUnchecked.length} problem(s). Fixing the plan.`)
    plan = await run(
      `fix the plan (round ${round})`,
      'Plan',
      [
        `Your job: fix the plan, round ${round}. Follow "Fix the plan" in \`${DOCS}/plan.md\`.`,
        pageLine(page),
        `The plan: ${plan.issueUrl}. Apply each fix below, then return the section list again.`,
        '',
        JSON.stringify(planProblemsFixedUnchecked, null, 2),
      ].join('\n'),
      PLAN,
      MODEL.fixThePlan,
    )
    if (planProblemsFixedUnchecked.length <= MANY) break
  }
  for (const p of planProblemsFixedUnchecked) forOvi.push(`review: plan problem found in the last read and fixed, but nobody read the plan again after the fix: ${p.section}: ${p.problem} [second reader]`)
}
if (stopAfter === 'plan') return { status: 'stopped after the plan', page, plan }

// ---- 4. Build --------------------------------------------------------------
phase('Build')
const ready = collect('get ready', await run(
  'get ready',
  'Build',
  [
    `Your job: get ready to build. Follow "Get ready" in \`${DOCS}/build.md\`: sync, the lock scan, the backup. Nothing else.`,
    pageLine(page),
    `The plan: ${plan.issueUrl}. Its sections, already checked by the plan writer against the code (a "reuse" here is designed; do not open the renderers again):`,
    sectionList(plan.sections),
  ].join('\n'),
  READY,
  MODEL.getReady,
))
if (!ready.ok) return giveUp(page, 'get ready', ready.notes)
const sections = ready.sections && ready.sections.length ? ready.sections : plan.sections
if (ready.sectionsOthersAreEditing.length) {
  log(`Sections other branches are editing, left as they are: ${ready.sectionsOthersAreEditing.join(', ')}`)
}

// One agent per section that needs code. New and redesigned sections first,
// then extended ones, one after the other: they all touch the same
// registration files.
const order = { design: 0, new: 0, extend: 1 }
const toBuild = []
for (const s of sections) {
  if (s.mark !== 'reuse' && !toBuild.some((b) => b.block === s.block)) toBuild.push(s)
}
toBuild.sort((a, b) => order[a.mark] - order[b.mark])
for (const b of toBuild) {
  const usedBy = sections.filter((s) => s.block === b.block).map((s) => s.title)
  const body = [
    `Your job: build one page section. Follow "Build one section" in \`${DOCS}/build.md\`. Build only the section \`${b.block}\`, labelled "${b.mark}", used by: ${usedBy.join('; ')}.`,
    pageLine(page),
    `The plan: ${plan.issueUrl}. Read its "Content outline" and "Implementation Decisions" for this section.`,
  ].join('\n')
  let built = collect(`build ${b.block}`, await run(`build section: ${b.block}`, 'Build', body, SECTION_BUILT, MODEL.buildSection))
  if (!built.typecheckOk) {
    built = collect(
      `build ${b.block}`,
      await run(
        `build section: ${b.block} (second try)`,
        'Build',
        `${body}\n\nThe first try left the type check failing: ${built.notes}\nFix it until \`pnpm typecheck\` and \`pnpm verify:typegen\` pass, then commit.`,
        SECTION_BUILT,
        MODEL.buildSection,
      ),
    )
    if (!built.typecheckOk) return giveUp(page, `build section ${b.block}`, built.notes)
  }
  log(`Section ${b.block} (${b.mark}) built`)
}

const text = collect('write the text', await run(
  'write the page text',
  'Build',
  [
    `Your job: write the page text and save it as a draft. Follow "Write the page text and save the draft" in \`${DOCS}/build.md\`.`,
    pageLine(page),
    `The plan: ${plan.issueUrl}. Read it once with \`gh issue view\`. Its sections:`,
    sectionList(sections),
    `Questions for the camp already known: ${plan.questionsForTheCamp.join(' | ') || '(none)'}`,
    '',
    allNotes
      ? 'The research notes follow. They are your sources for the readers, the writing rules, the old page, the posts, the neighbouring pages, the sections and their fields, and the photos. Do not read those sources again.'
      : 'The plan was written in an earlier run, so there are no research notes. Read the plan and `CONTEXT.md` "Copy voice", then the schema of each section you write.',
    allNotes,
  ].join('\n'),
  TEXT_SAVED,
  MODEL.writeTheText,
))
if (!text.saved) return giveUp(page, 'write the page text', text.notes)
log(`Saved ${text.documentIds.length} draft document(s) in Sanity`)

// Same shape as the plan loop: what the last read found is fixed but not
// proofread again.
let proofreadFixedUnchecked = []
for (let round = 1; round <= MAX_ROUNDS; round++) {
  const read = await run(
    `proofread (round ${round})`,
    'Build',
    [
      `Your job: proofread the page, round ${round}. Follow "Proofread" in \`${DOCS}/build.md\`.`,
      pageLine(page),
      `The plan: ${plan.issueUrl}. The seed file: ${text.seedPath}. Return problems only.`,
      '',
      audienceNotes ? 'Who the page is for, from the research step:' : '',
      audienceNotes,
    ].join('\n'),
    PROBLEMS_IN_PAGE,
    MODEL.proofread,
  )
  proofreadFixedUnchecked = read.problems
  if (!proofreadFixedUnchecked.length) {
    log(`Proofread round ${round}: no problems`)
    break
  }
  log(`Proofread round ${round}: ${proofreadFixedUnchecked.length} problem(s)`)
  collect(`fix (round ${round})`, await run(
    `fix (round ${round})`,
    'Build',
    [
      `Your job: fix the problems the proofreader found, round ${round}. Follow "Fix" in \`${DOCS}/build.md\`.`,
      pageLine(page),
      `The seed file: ${text.seedPath}. Apply every fix below (edit the seed file and run \`pnpm page:seed … --apply\`, or edit the code), commit, and say what you fixed.`,
      '',
      JSON.stringify(proofreadFixedUnchecked, null, 2),
    ].join('\n'),
    FIXED,
    MODEL.fix,
  ))
  if (proofreadFixedUnchecked.length <= MANY) break
}

// One check, no fixer. The headings come from the draft itself (`pnpm
// page:text`), not from the plan: on 2026-09-05 the check looked for the
// plan's outline names, failed on a page that loaded fine, and a fixer
// renamed four headings to satisfy it. A page that fails here is handed
// over with the failure written for Ovi; it is a draft, and he reads it next.
const loaded = await run(
  'load the page',
  'Build',
  [
    `Your job: load the page and check it. Follow "Load the page and check it" in \`${DOCS}/build.md\`.`,
    pageLine(page),
    `The draft holds ${sections.length} sections. Every heading that \`pnpm page:text ${page.slug}\` prints must appear in the HTML.`,
  ].join('\n'),
  PAGE_LOADED,
  MODEL.loadThePage,
)
const loadProblem = loaded.ok
  ? ''
  : [...loaded.errors, ...loaded.missingHeadings.map((h) => `heading not found: ${h}`)].join('; ') || 'the page did not load'
if (loadProblem) {
  log(`The page did not load cleanly: ${loadProblem}`)
  forOvi.push(`review: the page did not load cleanly on the dev server, nobody fixed it: ${loadProblem} [load the page]`)
}

const pushed = collect('push', await run(
  'push the code',
  'Build',
  [`Your job: push the code. Follow "Push the code" in \`${DOCS}/build.md\`.`, pageLine(page)].join('\n'),
  PUSHED,
  MODEL.push,
))
if (!pushed.pushed) return giveUp(page, 'push the code', pushed.notes)
log(`Pushed ${page.branch} at ${pushed.headSha}`)

// ---- 5. Hand over to Ovi ---------------------------------------------------
phase('Hand over to Ovi')
const sectionsForOvi = sections
  .filter((s) => s.mark === 'new' || s.mark === 'design')
  .map((s) => `${s.title} [${s.block}]`)
const handed = await run(
  'hand over to Ovi',
  'Hand over to Ovi',
  [
    `Your job: hand the page over to Ovi. Follow \`${DOCS}/hand-over.md\`.`,
    pageLine(page),
    `The plan: ${plan.issueUrl}. Head commit: ${pushed.headSha}.`,
    `Sections Ovi should design himself (built new or redesigned): ${sectionsForOvi.join('; ') || '(none)'}`,
    `Placeholders: ${text.placeholders.join('; ') || '(none)'}`,
    `Missing photos: ${text.missingPhotos.join('; ') || '(none)'}`,
    `Proofreading problems fixed in the last round and not proofread again: ${proofreadFixedUnchecked.length ? JSON.stringify(proofreadFixedUnchecked) : '(none)'}`,
    `Loading the page on the dev server: ${loadProblem || 'loaded cleanly'}`,
    `Homepage candidates: ${plan.homepageCandidates.join('; ') || '(none)'}`,
    `Questions for the camp: ${plan.questionsForTheCamp.join(' | ') || '(none)'}`,
    '',
    'Notes for Ovi from the build steps. Add the plan\'s "Decisions made without Ovi" and "Open questions for the client" to them:',
    forOvi.length ? forOvi.map((l) => `- ${l}`).join('\n') : '- (none returned)',
  ].join('\n'),
  HANDED_OVER,
  MODEL.handOver,
)

return {
  status: 'draft ready for Ovi',
  page: page.title,
  slug: page.slug,
  branch: page.branch,
  plan: plan.issueUrl,
  card: handed.cardUrl,
  listForTheCamp: handed.clientInputUrl,
  homepageIssues: handed.coherenceIssueUrls,
  studioPath: handed.studioPath,
  sectionsForOviToDesign: handed.sectionsForOviToDesign,
  placeholders: handed.placeholders,
  missingPhotos: handed.missingPhotos,
  proofreadFixedUnchecked,
  planProblemsFixedUnchecked,
  loadProblem,
  forOvi,
  summary: handed.summary,
}
