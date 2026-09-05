# Step 2: Research

Five agents run at the same time. Each one reads its sources in full and
returns one set of notes: Markdown, under 1500 words, with facts and quotes
copied word for word where a later step may cite them, and nothing the
sources do not say. The planning step reads these notes instead of the
sources, so a fact left out of the notes is a fact the page will not have.

## A. Who the page is for, and the writing rules

Sources: `docs/avatars.md` (the page's row in the matrix, its tier, and the
full profile of every reader marked P or S); `CONTEXT.md` sections
"Conversion funnel" and "Copy voice";
`docs/adr/0001-conversion-funnel-and-header-ctas.md`; `frontend/PRODUCT.md`
(the verified facts and the "Do not fabricate" list).

Notes: the main reader, the secondary readers, and the readers this page
ignores, each with the reason; each chosen reader's "Top questions" that
this page should answer, in their order; what each reader must believe by
the end of the page (the "confident enough" list); which calls to action the
funnel document allows here; the banned words; the verified facts that touch
this page; the "do not fabricate" list; and the reader rules that limit the
page (Rachel never sees the fit quiz, Maya never gets a form, and any like
them).

## B. What the old page says

Sources: `pnpm legacy:page <slug>`. If it prints no sections, fetch
`https://canadianadventurecamp.com/<slug>` and read it as text. Note the
images it uses.

Notes: the old page's sections in order, each summarised; every fact, number,
date, name, price, and quote word for word; the claims the camp must confirm;
the images used; then one paragraph on what the page tries to do, which
reader questions it answers, and which it leaves open.

## C. Related blog posts, and the pages next to it in the menu

Sources: `post` documents in Sanity on the page's topic (title, summary, and
the body where it holds a fact or a story); the `navigation` document
(`items[].label` and each item's links) for the page's menu group and its
neighbours; what those neighbouring pages already cover.

Notes: the posts worth citing, with their facts or stories; the menu group
and the neighbouring pages with what each already covers, so content can move
to a neighbour instead of being repeated.

## D. Which page sections exist, and the design rules

Sources: `studio/schemas/blocks/` (every page section's name and fields); the
`homePage` document's list of sections; `frontend/DESIGN.md` in full; the
list of sections other branches are editing, and the list of sections that
still have no design, both from `page-workflow.md` "Rules for working in
parallel".

Notes: one line per section (its Studio title, its code name, its fields,
whether it is designed, and whether another branch is editing it and which);
the named rules in `DESIGN.md` with one line each on what they demand; the
order of sections on the homepage.

## E. Which photos exist

Sources: `frontend/public/images/`; Sanity image assets matched by alt text,
file name, and use on related documents.

Notes: every photo that could work on this page, with its asset id or public
path, alt text, size, and where it is used already.
