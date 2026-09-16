# Staff page completion — issue #158

Implemented on 2026-09-16. Ovi's visual check is pending.

The follow-up extends #158 with the inner hero, care copy, About navigation,
recruitment link, and closing director CTA requested by Ovi. The roster uses
the shared content container, current type styles, and a grid that centers a
short roster without reserving empty columns. Desktop submenu surfaces are
opaque in both header themes.

## Content and publication

Sanity project: `bf76qlx9`. Dataset: `production`.

- `drafts.staff`: five sections, in order: Inner Hero, Image and Text,
  Team Members, Call to Action (recruitment nudge), Director CTA.
- `drafts.navigation`: Our Staff follows Leadership in About. Existing links,
  keys, and header actions are preserved.
- `staff-roster-2026-01` through `staff-roster-2026-22`: published at Ovi's
  request so the page can reference them when published. No profile drafts
  remain. The first two profile IDs and reference keys are preserved.
- Published `staff` and `navigation` documents are unchanged.

Profile names are development placeholders. Each role remains “Role to
confirm.” The roster introduction states this. Do not treat the names as
identifications of the people in the photograph or as future staffing claims.

| Document suffix | Placeholder name | Document suffix | Placeholder name |
| --- | --- | --- | --- |
| 01 | Alex | 12 | Cameron |
| 02 | Jamie | 13 | Quinn |
| 03 | Morgan | 14 | Ellis |
| 04 | Taylor | 15 | Blair |
| 05 | Jordan | 16 | Drew |
| 06 | Casey | 17 | Reese |
| 07 | Riley | 18 | Rowan |
| 08 | Sam | 19 | Skylar |
| 09 | Charlie | 20 | Hayden |
| 10 | Robin | 21 | Devon |
| 11 | Avery | 22 | Finley |

The source asset is
`image-26bcc8869d048ea6593bc1e8a3961262e35e8c52-1440x1800-jpg`.
All 22 portraits reference this existing group photo. Each image field owns
its crop and hotspot. No new assets were uploaded or modified.
The photo comes from the [Basecamp source task](https://app.basecamp.com/6230954/buckets/48063970/todos/10308656413).

These are small crops from a 1440 × 1800 group photo. Some show nearby people
or have limited detail. The dark rear face and the partial face at the right
edge were not added. The other five source photos still need comparison for
additional unique people under the full roster work in #157. This draft does
not claim to include everyone across all six photos.

Care copy uses the stored legacy Staff page. The hero uses its existing
header image. The director CTA reuses the existing Health & Safety CTA's
portrait and conversion links. Names, roles, training claims, and final face
framing still need client review.

## Recovery and checks

Full export, including assets:
`backups/staff-completion-2026-09-16T12-40-37-360Z.tar.gz`.
The archive passed `gzip -t` before writes.

Local mutation plan, four focused safety checks, publication actions, before
records, and query results are in `backups/staff-completion-2026-09-16/`.
Existing drafts used revision guards. New drafts used strict creates with
stable IDs. Publication used Sanity document actions with draft revisions.

- Four safety checks passed: scoped draft targets, preserved fields and keys,
  duplicate/concurrent-write protection, and independent crops within bounds.
- The real page query in drafts perspective returns all five sections, ordered
  profiles, and 22 independent crop/hotspot objects.
- All references in the new page sections resolve in published perspective.
- The real navigation query in drafts perspective resolves Our Staff to `/staff`.
- Sanity schema validation reports no errors for the 24 affected documents.
- `pnpm verify --trace=off` passed: generated types, type checks, lint,
  324 frontend tests, 124 repository tests, both production builds, and all
  five headless Google Chrome smoke tests. Screenshot, video, and trace
  capture were off. The smoke suite checks published routes; the new draft
  was checked through its actual GROQ query and schema validation.
- No further CodeRabbit review was requested or run.

## Ovi's visual check

Open [Staff in local Studio Presentation](http://localhost:3340/presentation?preview=%2Fstaff%3Fsanity-preview-perspective%3Ddrafts&perspective=drafts).
Use the drafts perspective. The “Good people. Great summers.” hero and
22-name roster distinguish this draft from the published page.
The preview Website runs on `http://localhost:3007`.

At **1440 × 1000** and **390 × 844**:

1. Check the hero, care section, heading/grid alignment, gutters, spacing,
   portrait framing, and last roster row.
2. Open About and follow Our Staff. On desktop, inspect the submenu over the
   hero photo and after scrolling. It should have an opaque surface.
3. Use “Meet the 2026 team,” Leadership, Join our team, and the director CTA.
4. In Presentation, select a name, role, or photo. Change a crop and check that
   other portraits keep their crops. Check reference reordering controls.

No interactive browser or screenshot review was performed. Automated checks
are not a visual verdict. Draft rendering in an actual browser, crop quality,
editing interactions, and page publication were not manually inspected.
