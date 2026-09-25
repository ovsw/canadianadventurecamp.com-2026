# SEO and social sharing

Status: Design complete. All five interview decisions were accepted on 2026-09-25, including treatment of existing Header Images after the read-only inventory. Implementation has not started.

## Agreed behavior

- Use one field named **Social sharing image override** on pages, the homepage, posts, the blog index, and category listings. Retire Header Image from the page editor. Preserve existing SEO image choices.
- Resolve sharing images in this order: social sharing image override, generated sharing card, Site sharing image. Keep the existing static image as the safety fallback when Site settings has no usable image.
- Keep Page Builder images separate from sharing images. Changing a hero photo must not change a shared-link preview automatically.
- Format uploaded sharing images to 1200 × 630 and support editor crop control. Use the resolved image for both Open Graph and Twitter cards.
- Resolve descriptions in this order: SEO description override, page description, site-wide description. Show editors the effective description and warn when it uses only the site-wide description.
- Use the same resolved title and description for search metadata and social metadata. Keep the current title rules; do not add separate social title or description fields.
- Make the image override work consistently on blog and category listings, where the current field is ignored.

## Existing content

Retain existing Header Image data while removing its field from the page editor. Do not copy these images into empty social sharing image overrides automatically. Editors can deliberately choose an override later; existing SEO image choices remain unchanged.

The read-only inventory on 2026-09-25 covered standard page records in Sanity project `bf76qlx9`, dataset `production`:

- 50 published records: 39 with only a Header Image, five with the same asset in both fields, two with different assets, and four with neither image.
- 10 draft records: nine with only a Header Image and one with neither image. Draft and published records can represent the same page.
- The two published records with different assets are `/transportation/airport-service` and `/canadian-adventure-camp-experience`. Their existing social image choices must remain in place.

The accepted decision preserves generated sharing cards on the 39 published pages with only a Header Image. Automatically copying those unused photos would change their shared-link previews without an editor selecting them for that purpose. The inventory checks stored references, not whether the photos make suitable sharing images.

Any later content migration must preserve draft and published states, retain image references and crop information, and follow the repository's verified backup requirements. No content changes are authorized by this inventory step.

## Reference

The comparison used [Turbo Start Sanity at commit 4fd6314](https://github.com/robotostudio/turbo-start-sanity/tree/4fd63144b5ae794310a01a690fb2e7d5842e9d2e). Useful ideas are shared SEO fields, site-wide defaults, description fallbacks, and standard sharing-image dimensions. Its image fallback uses the global image; its field guidance about inheriting a main image does not match that behavior.

This plan records intended behavior. Source inspection established the current behavior; runtime output has not been checked.
