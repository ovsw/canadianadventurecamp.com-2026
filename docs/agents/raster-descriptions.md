# Raster AI descriptions for Sanity images

Raster (raster.app) writes an AI description for every image you upload to it.
Sanity does not. The media plugin's search only matches text that is stored on
the asset, so an image with no description is hard to find. This workflow
copies the Raster description onto the matching Sanity image asset.

Sanity is the system of record. Raster is only the intake and description
source. Nothing links the two after the sync. Match is by file name.

## One-time setup

`studio/.env.local` needs, next to the Sanity variables:

```
RASTER_API_KEY=<key from raster.app, Settings > API keys>
RASTER_ORG_ID=cac
```

Do not use the `SANITY_STUDIO_` prefix for these names. Sanity inlines every
variable with that prefix into the public Studio bundle. The key is scoped per
Raster library. If the script reports `API_KEY_NOT_AUTHORIZED_FOR_LIBRARY`,
grant the key access to that library in Raster.

## Adding new images

1. Upload the image files to the Sanity media library as usual, either in the
   Studio Media tab or from an image field. Keep the original file names.
2. Upload the same files to the Raster library `latest`. Any library works,
   and reusing one is fine: the sync skips assets whose description already
   matches. A new library only shortens the dry-run report, and the API key
   must be granted access to it in Raster first.
3. Wait until Raster shows a description on each asset. This takes seconds to
   a minute.
4. Dry-run the sync from the repo root:

   ```
   pnpm raster:sync --library latest
   ```

   It prints what it would patch and what it could not match. Nothing is
   written.

5. Apply:

   ```
   pnpm raster:sync --library latest --apply
   ```

6. Check in Studio: open the Media tab, search a word from one of the new
   descriptions, and confirm the image appears.

## How matching works

Raster strips the file extension from the asset name on upload. The script
therefore compares the Sanity `originalFilename` without its extension against
the Raster asset name, case-insensitively. Two consequences:

- Rename nothing between the two uploads.
- Two files with the same name and different extensions collide. If two Raster
  assets share a name but have different descriptions, the script skips that
  name and reports it as ambiguous.

The script only fills empty descriptions. Pass `--overwrite` to replace
existing ones, for example after re-describing a batch in Raster.

## Refusals and safety

- The script refuses to run against any project or dataset except
  `bf76qlx9/production`. See `studio/scripts/assert-cac-production-target.mjs`.
- It writes one field, `description`, on `sanity.imageAsset` documents. It
  never creates, deletes, or re-uploads assets, and never touches tags.
- Patches go in transactions of 50. A failed transaction leaves earlier ones
  applied. Re-running is safe because already-matching descriptions are skipped.

## Related

- `studio/scripts/sync-raster-descriptions.mjs` is the script.
- `studio/scripts/import-raster-assets.mjs` is the original 2026-08 bulk import
  of the `old` library into Sanity. It is not part of this workflow.
- Media plugin tags are reserved for hand-made collections. Do not import
  Raster's AI tags. See the tags decision in the 2026-09-14 cleanup.
- To replace an image everywhere, use the media plugin's Replace button: tick
  one image card in the Media tab. It re-points all references.
