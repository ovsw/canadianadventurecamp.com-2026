export const meta = {
  name: 'page-draft-stage',
  description:
    'One stage of the page-draft skill, run as a workflow: "research" (five readers at once) or "build" (get ready, build sections, write the text, proofread, fix, load the page, push)',
  whenToUse:
    'Only from the /page-draft skill, which takes the page, writes the plan, checks each stage, and hands over to Ovi. Never on its own.',
  phases: [
    { title: 'Research', detail: 'five readers at once, one set of notes each' },
    { title: 'Build', detail: 'get ready, build sections, write the text, proofread, fix, load the page, push' },
  ],
}

// The instructions for each step live in .claude/workflows/page-draft/.
// This script holds the two stages with real structure: the research
// fan-out and the build loop. The main agent running the /page-draft skill
// owns everything between them (taking the page, writing the plan, judging
// each stage's result, handing over) and holds the state, so nothing is
// re-derived and nothing is lost when a step agent forgets.

// ---- input -----------------------------------------------------------------
// args: { stage: 'research' | 'build', page, plan?, notes?, audienceNotes? }
// page: { slug, title, pageId, isNewPage, tier, cardId, cardUrl, branch, worktree }
// plan (build only): { issueUrl, sections: [{title, block, mark, field}], questionsForTheCamp, homepageCandidates }
// notes, audienceNotes (build only, optional): the research notes, whole and part A.
const opts = args && typeof args === 'object' ? args : {}
const stage = String(opts.stage ?? '')
if (stage !== 'research' && stage !== 'build') {
  throw new Error(`args.stage must be "research" or "build", got "${stage}"`)
}
const page = opts.page
for (const k of ['slug', 'title', 'cardId', 'cardUrl', 'branch', 'worktree']) {
  if (!page || !page[k]) throw new Error(`args.page.${k} is missing`)
}
// Cards write the slug with a leading slash; the site and the scripts want it bare.
page.slug = String(page.slug).replace(/^\/+/, '')

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
// quality use the session's model. The proofreader runs at medium effort:
// on 2026-09-05 the readers were the largest cost of a run at high effort,
// and their round 1 findings were the ones that mattered. Edit this table to
// trade cost against quality.
const MODEL = {
  research: { model: 'sonnet' },
  getReady: { model: 'sonnet' },
  buildSection: {},
  writeTheText: {},
  proofread: { effort: 'medium' },
  fix: {},
  loadThePage: { model: 'sonnet', effort: 'low' },
  push: { model: 'sonnet' },
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

const NOTES = obj({ notes: str })
const SECTION = obj({
  title: str,
  block: str,
  mark: { type: 'string', enum: ['reuse', 'extend', 'design', 'new'] },
  field: str,
})
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

// Every step runs as the `shell-and-files` agent type (.claude/agents/),
// which has five tools: Bash, Read, Edit, Write, Skill. Claude Code staples
// the definition of every tool an agent has to every message it sends, and
// the full set of thirty costs about 25k tokens a message; these five cost
// about 2.5k. Nothing in this workflow needs the rest.
const AGENT_TYPE = 'shell-and-files'

// ---- helpers ---------------------------------------------------------------
async function run(label, phaseTitle, body, schema, extra) {
  const result = await agent(`${PREAMBLE}\n\n${body}`, {
    label,
    phase: phaseTitle,
    schema,
    ...(extra ?? {}),
    agentType: AGENT_TYPE,
  })
  if (result == null) {
    throw new Error(`${label}: the agent returned nothing (it was stopped, or the API failed after retries)`)
  }
  return result
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

// A stage that cannot go on returns instead of throwing, so the main agent
// gets the notes collected so far and writes the failure on the card itself.
function failed(stepName, reason) {
  log(`Stopped: "${stepName}" failed. ${reason}`)
  return { status: 'failed', step: stepName, reason, forOvi }
}

// A reader and a fixer take one turn each. A second turn runs only when the
// first read found more than MANY problems: on 2026-09-05 both loops ran
// their full three rounds every time, because a reader asked for problems
// always finds some, and rounds 2 and 3 cost as much as round 1 while
// finding less. What the last read found is fixed but not read again; the
// script lists it for Ovi as unchecked.
const MANY = 8
const MAX_ROUNDS = 2

// ---- research --------------------------------------------------------------
if (stage === 'research') {
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
  const missing = readers.filter((r, i) => !notes[i] || !String(notes[i].notes ?? '').trim())
  if (missing.length) {
    return failed('research', `These readers returned nothing: ${missing.map((r) => r.key).join(', ')}. Run the research stage again.`)
  }
  return {
    status: 'researched',
    notes: readers.map((r, i) => `### ${r.heading}\n\n${notes[i].notes}`).join('\n\n'),
    audienceNotes: `### ${readers[0].heading}\n\n${notes[0].notes}`,
  }
}

// ---- build -----------------------------------------------------------------
const plan = opts.plan
if (!plan || !plan.issueUrl || !Array.isArray(plan.sections) || !plan.sections.length) {
  throw new Error('args.plan needs issueUrl and a non-empty sections list for the build stage')
}
plan.questionsForTheCamp = plan.questionsForTheCamp ?? []
plan.homepageCandidates = plan.homepageCandidates ?? []
const allNotes = opts.notes ? String(opts.notes) : ''
const audienceNotes = opts.audienceNotes ? String(opts.audienceNotes) : ''

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
if (!ready.ok) return failed('get ready', ready.notes)
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
    if (!built.typecheckOk) return failed(`build section ${b.block}`, built.notes)
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
      : 'There are no research notes for this run. Read the plan and `CONTEXT.md` "Copy voice", then the schema of each section you write.',
    allNotes,
  ].join('\n'),
  TEXT_SAVED,
  MODEL.writeTheText,
))
if (!text.saved) return failed('write the page text', text.notes)
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
// build.md returns the head SHA when reused sections leave nothing to push.
if (!pushed.pushed && !pushed.headSha) return failed('push the code', pushed.notes)
log(pushed.pushed ? `Pushed ${page.branch} at ${pushed.headSha}` : `Nothing to push; ${page.branch} is at ${pushed.headSha}`)

// The main agent hands over: it holds the plan, the decisions, and these
// results, and writes the card, the For Ovi comment, and the to-do list.
return {
  status: 'built',
  sections,
  sectionsForOviToDesign: sections
    .filter((s) => s.mark === 'new' || s.mark === 'design')
    .map((s) => `${s.title} [${s.block}]`),
  seedPath: text.seedPath,
  documentIds: text.documentIds,
  placeholders: text.placeholders,
  missingPhotos: text.missingPhotos,
  proofreadFixedUnchecked,
  loadProblem,
  headSha: pushed.headSha,
  forOvi,
}
