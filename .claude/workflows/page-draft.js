export const meta = {
  name: 'page-draft',
  description:
    'Rebuild one Canadian Adventure Camp page from the old site into a Sanity draft with nobody in the loop: claim, gather, decide, build, hand off',
  whenToUse:
    'Ovi names a page slug, old-site URL, Basecamp card, or spec issue to rework, or says to draft the next page',
  phases: [
    { title: 'Claim', detail: 'resolve the target, claim the card' },
    { title: 'Gather', detail: 'five readers, one dossier each' },
    { title: 'Decide', detail: 'spec, critic, revision, issue on the card' },
    { title: 'Build', detail: 'prep, blocks, seed, review loop, render check, push' },
    { title: 'Hand off', detail: 'card to Ovi Polish, client input list, issue comment' },
  ],
}

// Instructions live in .claude/workflows/page-draft/. This script holds the order,
// the loops, and the data between stages. Stage docs stay the source of truth.

// ---- input -----------------------------------------------------------------
const opts = args && typeof args === 'object' ? args : { target: args }
const target = opts.target == null ? '' : String(opts.target).trim()
const stopAfter = opts.stopAfter ? String(opts.stopAfter) : ''

const DOCS = '.claude/workflows/page-draft'
const PREAMBLE = [
  'You are one stage of the page-draft workflow for the Canadian Adventure Camp website, run inside this repository.',
  'Ovi is away. Never wait for him: take the decision you would have recommended and record the fact or rule it rests on.',
  `Read \`${DOCS}/README.md\` first, then the file named for your stage. Repository facts (Basecamp ids, the claim protocol, shared-state rules, scripts, the render check) are in \`docs/agents/page-workflow.md\`.`,
  'Your final output is data for the orchestrating script, never a message for a person. Fill every field the schema asks for; what you do not return is lost.',
  'When the schema has `forOvi`, return one line per assumption, educated guess, decision a human should confirm, or fact to check with the client that you made in this stage, prefixed with its kind: `decision:`, `review:`, `client:`, or `assumption:`. Empty list only when you made none.',
].join('\n')

// Model and effort per stage. Mechanical stages run on a smaller model; the
// stages that write copy, design blocks, or judge inherit the session model.
// Edit here to tune cost against quality.
const MODEL = {
  claim: { model: 'sonnet' },
  gather: { model: 'sonnet' },
  readSpec: { model: 'sonnet' },
  decide: {},
  critic: { effort: 'high' },
  revise: {},
  prep: { model: 'sonnet' },
  block: {},
  seed: {},
  review: { effort: 'high' },
  fix: {},
  render: { model: 'sonnet', effort: 'low' },
  push: { model: 'sonnet' },
  handoff: { model: 'sonnet' },
  abort: { model: 'haiku', effort: 'low' },
}

// ---- schema helpers --------------------------------------------------------
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

const CLAIM = obj(
  {
    status: { type: 'string', enum: ['claimed', 'owned-elsewhere', 'not-found'] },
    slug: str,
    title: str,
    pageId: str,
    isNewPage: bool,
    tier: str,
    cardId: str,
    cardUrl: str,
    branch: str,
    issueNumber: int,
    note: str,
  },
  ['status', 'slug', 'title', 'pageId', 'isNewPage', 'cardId', 'cardUrl', 'branch', 'note'],
)
const DOSSIER = obj({ dossier: str })
const SECTION = obj({
  title: str,
  block: str,
  mark: { type: 'string', enum: ['reuse', 'extend', 'design', 'new'] },
  field: str,
})
const SPEC = obj({
  issueNumber: int,
  issueUrl: str,
  sections: list(SECTION),
  homepageCandidates: strList,
  clientQuestions: strList,
  decisions: str,
})
const CRITIQUE = obj({ issues: list(obj({ section: str, problem: str, fix: str })) })
const PREP = obj(
  { ok: bool, backupPath: str, lockConflicts: strList, sections: list(SECTION), forOvi: strList, notes: str },
  ['ok', 'backupPath', 'lockConflicts', 'forOvi', 'notes'],
)
const BLOCK = obj({ block: str, typecheckOk: bool, files: strList, forOvi: strList, notes: str })
const SEED = obj({
  applied: bool,
  seedPath: str,
  documentIds: strList,
  placeholders: strList,
  missingImages: strList,
  forOvi: strList,
  notes: str,
})
const REVIEW = obj({ issues: list(obj({ where: str, problem: str, fix: str })) })
const FIX = obj({ fixed: strList, forOvi: strList, notes: str })
const RENDER = obj({ ok: bool, missingHeadings: strList, errors: strList })
const PUSH = obj({ pushed: bool, headSha: str, forOvi: strList, notes: str })
const HANDOFF = obj({
  cardUrl: str,
  issueUrl: str,
  clientInputUrl: str,
  coherenceIssueUrls: strList,
  designPassSections: strList,
  placeholders: strList,
  missingImages: strList,
  studioPath: str,
  summary: str,
})
const DONE = obj({ done: bool })

// ---- agent helpers ---------------------------------------------------------
async function run(label, phaseTitle, body, schema, extra) {
  const result = await agent(`${PREAMBLE}\n\n${body}`, {
    label,
    phase: phaseTitle,
    schema,
    ...(extra ?? {}),
  })
  if (result == null) {
    throw new Error(`${label}: the agent returned nothing (stopped, or an API error after retries)`)
  }
  return result
}

// Everything a human must confirm, review, or check with the client,
// collected from every build stage and written on the card at hand off.
const forOvi = []
function collect(stage, result) {
  for (const line of result.forOvi ?? []) forOvi.push(`${stage}: ${line}`)
  return result
}

function pageLine(claim) {
  return [
    `Page: "${claim.title}", slug \`${claim.slug}\`, Sanity id \`${claim.pageId || '(none yet: new page)'}\`,`,
    `tier ${claim.tier || '?'}, card ${claim.cardUrl} (id ${claim.cardId}), branch \`${claim.branch}\`.`,
  ].join(' ')
}

function outlineText(sections) {
  return sections
    .map((s, i) => `${i + 1}. ${s.title} — ${s.mark} ${s.block}${s.field ? ` (${s.field})` : ''}`)
    .join('\n')
}

async function abort(claim, stage, reason) {
  log(`Stopping: ${stage} failed. ${reason}`)
  await run(
    'abort',
    'Hand off',
    [
      `Stage: abort. The build stopped at "${stage}": ${reason}`,
      pageLine(claim),
      'Comment on the Basecamp card (Markdown from stdin, per page-workflow.md "Basecamp") with the stage, the reason, what a human should check, and the "For Ovi" lines below. Leave the card in Building. Commit nothing, push nothing, write nothing to Sanity.',
      '',
      forOvi.length ? forOvi.map((l) => `- ${l}`).join('\n') : '(no For Ovi lines yet)',
    ].join('\n'),
    DONE,
    MODEL.abort,
  )
  return { status: 'failed', stage, reason, card: claim.cardUrl, branch: claim.branch }
}

// ---- 1. Claim --------------------------------------------------------------
phase('Claim')
const claim = await run(
  'claim',
  'Claim',
  [
    `Stage: claim. Follow \`${DOCS}/claim.md\`.`,
    `Target: ${target || '(none: take the top card in the To Build column)'}.`,
  ].join('\n'),
  CLAIM,
  MODEL.claim,
)
if (claim.status !== 'claimed') {
  log(`Not claimed: ${claim.status}. ${claim.note}`)
  return { status: claim.status, note: claim.note, slug: claim.slug, card: claim.cardUrl }
}
log(`Claimed "${claim.title}" (/${claim.slug}) on ${claim.branch}`)
if (stopAfter === 'claim') return { status: 'stopped-after-claim', claim }

// ---- 2 + 3. Gather and decide, or read the existing spec -------------------
let spec
if (claim.issueNumber) {
  log(`Spec issue #${claim.issueNumber} exists; gather and decide are skipped`)
  spec = await run(
    'read-spec',
    'Decide',
    [
      `Stage: read the existing spec. ${pageLine(claim)}`,
      `Read GitHub issue #${claim.issueNumber} with \`gh issue view\` and return its outline: every section of "Content outline" in order with block, mark, and field colour; the homepage candidates; the open questions for the client; and a short summary of "Decisions made without Ovi". Change nothing.`,
    ].join('\n'),
    SPEC,
    MODEL.readSpec,
  )
} else {
  phase('Gather')
  const readers = [
    { key: 'avatars', section: 'A. Avatars and rules' },
    { key: 'old-page', section: 'B. The old page' },
    { key: 'posts-nav', section: 'C. Posts and neighbours' },
    { key: 'blocks-design', section: 'D. Blocks and design' },
    { key: 'images', section: 'E. Images' },
  ]
  // Barrier on purpose: decide needs all five dossiers together.
  const dossiers = await parallel(
    readers.map((r) => () =>
      run(
        `gather:${r.key}`,
        'Gather',
        [
          `Stage: gather, reader "${r.section}". Follow that section of \`${DOCS}/gather.md\` and nothing else.`,
          pageLine(claim),
        ].join('\n'),
        DOSSIER,
        MODEL.gather,
      ),
    ),
  )
  const missing = readers.filter((r, i) => !dossiers[i])
  if (missing.length) {
    throw new Error(`Gather readers returned nothing: ${missing.map((r) => r.key).join(', ')}. Relaunch to resume.`)
  }
  const dossierText = readers
    .map((r, i) => `### ${r.section}\n\n${dossiers[i].dossier}`)
    .join('\n\n')
  if (stopAfter === 'gather') return { status: 'stopped-after-gather', claim, dossiers: dossierText }

  phase('Decide')
  const drafted = await run(
    'decide',
    'Decide',
    [
      `Stage: decide. Follow \`${DOCS}/decide.md\` steps 1 to 4 and "File the spec".`,
      pageLine(claim),
      '',
      'The five dossiers from the gather stage follow. They are your inputs; open a source file again only where a dossier is unclear.',
      '',
      dossierText,
    ].join('\n'),
    SPEC,
    MODEL.decide,
  )
  log(`Spec filed: ${drafted.issueUrl} (${drafted.sections.length} sections)`)
  const critique = await run(
    'critic',
    'Decide',
    [
      `Stage: critic. Follow "Critic" in \`${DOCS}/decide.md\`.`,
      pageLine(claim),
      `Spec issue: ${drafted.issueUrl}. Read the issue, the avatar dossier below, and the rules it cites. Return problems only.`,
      '',
      `### ${readers[0].section}\n\n${dossiers[0].dossier}`,
    ].join('\n'),
    CRITIQUE,
    MODEL.critic,
  )
  if (critique.issues.length) {
    log(`Critic found ${critique.issues.length} problem(s); revising`)
    spec = await run(
      'revise',
      'Decide',
      [
        `Stage: revise. Follow "Revise" in \`${DOCS}/decide.md\`.`,
        pageLine(claim),
        `Spec issue: ${drafted.issueUrl}. Apply each fix below, then return the outline again.`,
        '',
        JSON.stringify(critique.issues, null, 2),
      ].join('\n'),
      SPEC,
      MODEL.revise,
    )
  } else {
    spec = drafted
  }
}
if (stopAfter === 'spec') return { status: 'stopped-after-spec', claim, spec }

// ---- 4. Build --------------------------------------------------------------
phase('Build')
const prep = collect('prep', await run(
  'prep',
  'Build',
  [
    `Stage: build, section "Prep" of \`${DOCS}/build.md\`.`,
    pageLine(claim),
    `Spec issue: ${spec.issueUrl}. Outline:`,
    outlineText(spec.sections),
  ].join('\n'),
  PREP,
  MODEL.prep,
))
if (!prep.ok) return abort(claim, 'prep', prep.notes)
const sections = prep.sections && prep.sections.length ? prep.sections : spec.sections
if (prep.lockConflicts.length) log(`Locked blocks avoided: ${prep.lockConflicts.join(', ')}`)

// One agent per block that needs code, design and new first, extend last,
// one after the other: they share the generator-marker files.
const rank = { design: 0, new: 0, extend: 1 }
const blocks = []
for (const s of sections) {
  if (s.mark !== 'reuse' && !blocks.some((b) => b.block === s.block)) blocks.push(s)
}
blocks.sort((a, b) => rank[a.mark] - rank[b.mark])
for (const b of blocks) {
  const uses = sections.filter((s) => s.block === b.block).map((s) => s.title)
  const body = [
    `Stage: build, section "Blocks" of \`${DOCS}/build.md\`. Build only the block \`${b.block}\`, mark \`${b.mark}\`, used by: ${uses.join('; ')}.`,
    pageLine(claim),
    `Spec issue: ${spec.issueUrl}. Read its "Content outline" and "Implementation Decisions" for this block.`,
  ].join('\n')
  let result = collect(`block ${b.block}`, await run(`block:${b.block}`, 'Build', body, BLOCK, MODEL.block))
  if (!result.typecheckOk) {
    result = collect(
      `block ${b.block}`,
      await run(
        `block:${b.block}:fix`,
        'Build',
        `${body}\n\nThe previous attempt left typecheck failing: ${result.notes}\nFix it until \`pnpm typecheck\` and \`pnpm verify:typegen\` pass, then commit.`,
        BLOCK,
        MODEL.block,
      ),
    )
    if (!result.typecheckOk) return abort(claim, `block ${b.block}`, result.notes)
  }
  log(`Block ${b.block} (${b.mark}) built`)
}

const seed = collect('seed', await run(
  'seed',
  'Build',
  [
    `Stage: build, section "Seed" of \`${DOCS}/build.md\`.`,
    pageLine(claim),
    `Spec issue: ${spec.issueUrl}. Outline:`,
    outlineText(sections),
    `Client questions already known: ${spec.clientQuestions.join(' | ') || '(none)'}`,
  ].join('\n'),
  SEED,
  MODEL.seed,
))
if (!seed.applied) return abort(claim, 'seed', seed.notes)
log(`Seeded ${seed.documentIds.length} document(s)`)

let unresolved = []
for (let round = 1; round <= 3; round++) {
  const review = await run(
    `review:${round}`,
    'Build',
    [
      `Stage: build, section "Review" of \`${DOCS}/build.md\`, checker, round ${round} of 3.`,
      pageLine(claim),
      `Spec issue: ${spec.issueUrl}. Seed: ${seed.seedPath}. Return problems only.`,
    ].join('\n'),
    REVIEW,
    MODEL.review,
  )
  unresolved = review.issues
  if (!unresolved.length) {
    log(`Review round ${round}: clean`)
    break
  }
  log(`Review round ${round}: ${unresolved.length} problem(s)`)
  collect(`fix round ${round}`, await run(
    `fix:${round}`,
    'Build',
    [
      `Stage: build, section "Review" of \`${DOCS}/build.md\`, fixer, round ${round}.`,
      pageLine(claim),
      `Seed: ${seed.seedPath}. Apply every fix below (seed then \`pnpm page:seed ... --apply\`, or code), commit, and report what you fixed.`,
      '',
      JSON.stringify(unresolved, null, 2),
    ].join('\n'),
    FIX,
    MODEL.fix,
  ))
}

let render = await run(
  'render',
  'Build',
  [
    `Stage: build, section "Render check" of \`${DOCS}/build.md\`.`,
    pageLine(claim),
    'Section headings to find:',
    sections.map((s) => `- ${s.title}`).join('\n'),
  ].join('\n'),
  RENDER,
  MODEL.render,
)
if (!render.ok) {
  collect('render fix', await run(
    'render:fix',
    'Build',
    [
      `Stage: build, render fixer. The server render of /${claim.slug} failed.`,
      pageLine(claim),
      `Missing headings: ${render.missingHeadings.join('; ') || '(none)'}`,
      `Errors: ${render.errors.join('; ') || '(none)'}`,
      'Find the cause (renderer crash, missing field, seed mismatch), fix it, commit, and report.',
    ].join('\n'),
    FIX,
    MODEL.fix,
  ))
  render = await run(
    'render:again',
    'Build',
    [
      `Stage: build, section "Render check" of \`${DOCS}/build.md\`, second run.`,
      pageLine(claim),
      'Section headings to find:',
      sections.map((s) => `- ${s.title}`).join('\n'),
    ].join('\n'),
    RENDER,
    MODEL.render,
  )
}

const push = collect('push', await run(
  'push',
  'Build',
  [`Stage: build, section "Push" of \`${DOCS}/build.md\`.`, pageLine(claim)].join('\n'),
  PUSH,
  MODEL.push,
))
if (!push.pushed) return abort(claim, 'push', push.notes)
log(`Pushed ${claim.branch} at ${push.headSha}`)

// ---- 5. Hand off -----------------------------------------------------------
phase('Hand off')
const handoff = await run(
  'handoff',
  'Hand off',
  [
    `Stage: hand off. Follow \`${DOCS}/handoff.md\`.`,
    pageLine(claim),
    `Spec issue: ${spec.issueUrl}. Head: ${push.headSha}.`,
    `Design-pass sections (new and design blocks): ${
      sections.filter((s) => s.mark === 'new' || s.mark === 'design').map((s) => `${s.title} [${s.block}]`).join('; ') || '(none)'
    }`,
    `Placeholders: ${seed.placeholders.join('; ') || '(none)'}`,
    `Missing images: ${seed.missingImages.join('; ') || '(none)'}`,
    `Review problems left unresolved: ${unresolved.length ? JSON.stringify(unresolved) : '(none)'}`,
    `Render check: ${render.ok ? 'passed' : `still failing: ${render.errors.join('; ')} ${render.missingHeadings.join('; ')}`}`,
    `Homepage candidates: ${spec.homepageCandidates.join('; ') || '(none)'}`,
    `Client questions: ${spec.clientQuestions.join(' | ') || '(none)'}`,
    '',
    'For Ovi lines collected from the build stages (add the spec issue\'s "Decisions made without Ovi" and "Open questions for the client" to them):',
    forOvi.length ? forOvi.map((l) => `- ${l}`).join('\n') : '- (none returned)',
  ].join('\n'),
  HANDOFF,
  MODEL.handoff,
)

return {
  status: 'draft',
  page: claim.title,
  slug: claim.slug,
  branch: claim.branch,
  issue: spec.issueUrl,
  card: handoff.cardUrl,
  clientInput: handoff.clientInputUrl,
  coherenceIssues: handoff.coherenceIssueUrls,
  studioPath: handoff.studioPath,
  designPass: handoff.designPassSections,
  placeholders: handoff.placeholders,
  missingImages: handoff.missingImages,
  unresolved,
  forOvi,
  renderOk: render.ok,
  summary: handoff.summary,
}
