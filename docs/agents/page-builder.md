# Page Builder sections

Read this guide before adding or changing a section in a page's `blocks` array.

## How a section reaches the page

A top-level section passes through this flow:

1. A Sanity schema defines its fields.
2. The Page schema allows editors to insert it.
3. A GROQ projection selects the data the frontend needs.
4. Sanity TypeGen turns the schema and query into TypeScript types.
5. The frontend block dispatcher selects its React renderer.

The section's Sanity `_type` is the shared identifier across every step. Keep it exact and use the existing camelCase naming convention.

## Add a top-level section

Create the vertical slice with the generator, then shape its three files together:

```bash
pnpm page-builder:new <name> --title "Studio title"
```

The default `content` scope makes the section available on regular and home
pages. Use `--scope general` or `--scope home` for a page-specific section.
Pass `--preview ./image.jpg` when the Studio grid preview is ready. Use
`--dry-run` to inspect the planned paths without writing.

The generator:

- creates the Studio schema in `studio/schemas/blocks/`;
- registers the schema and Page Builder scope;
- creates and registers the GROQ projection;
- creates and registers a typed React renderer with click-to-edit attributes;
- copies and registers an optional Studio preview image.

After generation, replace the starter `title` and `description` fields with the
chosen section's real content model. Keep the schema, query, and renderer in
sync. Run TypeGen once after those shapes settle.

Then complete the section in Sanity. Back up the dataset, locate the intended
draft page, insert the section, and populate every required field with supplied,
reference, or practical draft content. Generator output alone is not complete.

For a manual addition, preserve the mirrored folder structure in Studio,
queries, and renderers.

1. Define the Studio schema in `studio/schemas/blocks/`.
2. Register the schema and any supporting object schemas in `studio/schema-types.ts`.
3. Add the top-level type to the Page schema's `blocks.of` list in `studio/schemas/documents/page.ts`.
4. Add the type to one insert-menu group in the same file.
5. Add its preview image at `studio/static/images/preview/<type>.jpg`. The Page schema resolves this path by `_type`.
6. Create its GROQ projection in `frontend/sanity/queries/` and interpolate it into `frontend/sanity/queries/page.ts`.
7. Create its React renderer in `frontend/components/blocks/` and register it in the `componentMap` in `frontend/components/blocks/index.tsx`.
8. Run TypeGen once after the schema and query settle. Do not edit
   `studio/schema.json` or `frontend/sanity.types.ts` by hand.
9. Back up the dataset, add the section to the intended draft page, and fill its
   final content shape.

## Add a nested block

A nested block is an object used only inside another section, such as a card inside a grid. It still needs a Studio schema registration, a parent GROQ projection, and a React renderer or parent rendering logic. It does not belong in the Page schema's `blocks.of`, Page insert-menu groups, or the top-level `componentMap` unless editors can insert it directly as a page section.

## Change an existing section

Trace the whole vertical slice before editing:

- Studio fields: `studio/schemas/blocks/`
- GROQ data shape: `frontend/sanity/queries/`
- Generated types: `frontend/sanity.types.ts`
- React rendering: `frontend/components/blocks/`

When a field is added, renamed, removed, or changes type or structure, update
the schema and projection together, regenerate types, inspect every affected
Sanity document, and migrate content that no longer matches the stored shape.
Preserve each document's draft or published state.

For visual changes, treat the existing design system as the default:

- Reuse tokens from `frontend/app/globals.css`.
- Reuse `SectionContainer`, shared buttons, and nearby block patterns before adding a new primitive.
- Check the full page and mobile layout, not only the section in isolation.
- Introduce a one-off value or variant only when the design intentionally requires it.

## Definition of done

- The same `_type` is present at every required top-level registration point.
- The GROQ projection returns every field the renderer uses.
- The section exists on the intended Sanity draft with complete content in the
  final schema shape.
- Every affected existing document has been migrated; Ovi is not left with
  content entry or reshaping work.
- The GROQ query returns the updated dataset content used by the renderer.
- Generated files are current and are not manually edited.
- The handoff names the backup path and every document created or changed.
- Ovi has the exact URL, viewport, state, and actions needed to test the section.
- Add automated tests only for destructive data work, security or authorization,
  subtle pure logic that is hard to verify manually, or an expensive regression.

`pnpm verify` is reserved for an explicitly requested pull-request or release
gate. Do not run it during Page Builder iteration.
