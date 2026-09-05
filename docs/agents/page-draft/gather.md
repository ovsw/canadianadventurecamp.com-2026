# Gather: five readers, one dossier each

Five agents run at once. Each reads its sources in full and returns one
dossier: Markdown, under 1500 words, facts and quotes verbatim where a later
stage may cite them, and nothing the sources do not say. The decide stage
reads the dossiers instead of the sources, so a fact left out of a dossier is
a fact the page will not have.

## A. Avatars and rules

Sources: `docs/avatars.md` (the page's matrix row, tier, every avatar marked
P or S, their profiles in full); `CONTEXT.md` sections "Conversion funnel" and
"Copy voice"; `docs/adr/0001-conversion-funnel-and-header-ctas.md`;
`frontend/PRODUCT.md` (verified facts, the "Do not fabricate" list).

Dossier: primary, secondary, and ignored avatars with the basis; each chosen
avatar's "Top questions" filtered to this page, in their order; the "confident
enough" exit beliefs; the CTA rules from the funnel ADR that apply; the
banned words; the verified facts that touch this page; the do-not-fabricate
list; the rules of the two profiles that constrain the page (Rachel never
sees the fit quiz, Maya never gets a form, and any like them).

## B. The old page

Sources: `pnpm legacy:page <slug>`. When it prints no legacy sections, fetch
`https://canadianadventurecamp.com/<slug>` and read it as text. Note the
images it uses.

Dossier: the sections in order with their text condensed; every fact,
number, date, name, price, and quote verbatim; the claims the camp must
confirm; the images referenced; then one paragraph: what the page tries to
do, which avatar questions it answers, which it leaves open.

## C. Posts and neighbours

Sources: `post` documents in Sanity on the page's topic (title, excerpt, the
body where it holds a fact or a story); the `navigation` document
(`items[].label`, each item's links) for the page's nav group and
neighbours; the neighbours' current sections and descriptions.

Dossier: the posts worth citing with their facts or stories; the nav group
and neighbours with what each already covers, so content can move between
neighbours instead of repeating.

## D. Blocks and design

Sources: `studio/schemas/blocks/` (every block's name and fields), the
`homePage` document's block list, `frontend/DESIGN.md` in full, the block
lock list and the undesigned list per `page-workflow.md` "Shared-state rules
for parallel drafts".

Dossier: one line per block (Studio title, schema name, fields, designed or
undesigned, locked by which branch or free); the named rules of `DESIGN.md`
with one line each on what they demand; the homepage block order.

## E. Images

Sources: `frontend/public/images/`; Sanity image assets matched by alt text,
filename, and usage on related documents.

Dossier: every photo plausibly usable on this page with asset id or public
path, alt, dimensions, and where it is used already.
