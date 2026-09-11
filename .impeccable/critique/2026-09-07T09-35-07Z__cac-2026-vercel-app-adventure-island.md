---
target: Adventure Island page review
method: dual-agent
visual_verified: false
p0_count: 0
p1_count: 3
target_identity: "url:https://cac-2026.vercel.app/adventure-island"
timestamp: 2026-09-07T09-35-07Z
slug: cac-2026-vercel-app-adventure-island
---
Method: dual-agent (A: /root/island_design · B: /root/island_evidence)

# Adventure Island page review

Content and code review completed on 7 September 2026. Visual review remains incomplete because the required ChatGPT in-app browser is unavailable. No page content, application code, CMS documents, or Basecamp records were changed.

Target: https://cac-2026.vercel.app/adventure-island, from Basecamp card https://app.basecamp.com/6230954/buckets/48063970/card_tables/cards/10274041246.

Readers: Carla, a cautious first-time camper parent; Marisol, an international camper parent; and Maya, the child who helps choose the camp. The card lists all three as primary. Linked specification #29 puts Carla first, with Marisol and Maya secondary. This assessment follows Carla's decision sequence and checks the other two readers' needs. Rachel can use the existing Dates & Rates and enrollment routes. Staff recruitment is outside this page's scope.

Goal: give parents enough confidence to talk to the directors, while children can picture camp life and explore activities.

## Priority findings

1. **P1: Safety and supervision claims are too absolute.** In "One island, one community," the copy says "Nobody drives in, nobody wanders off," and promises that every counsellor knows every child by name within the first week. It also says all campers and staff stay on the island "all day, all session." The watersports point promises no outside boat traffic. These statements read as guarantees. Keep the island and community message, but describe confirmed supervision, access, and waterfront practices. The map's "counsellor always within arm's reach" needs the same review. This concern is separate from agreed editorial markers.

2. **P1: The hospital link does not provide safety information.** "Hospitals within reach" contains "Safety info link" with a destination of `#`. The link helper accepts that value and the renderer outputs it. Replace it with "Read Health & Safety" and the existing `healthSafety` reference, which resolves to `/health-and-safety`. This is confirmed from data and code; no browser click was performed.

3. **P1: The family testimonial section cannot render.** All three references in "Families on the island" point to `drafts.testimonial-placeholder-island-*`. The stored placeholder documents have canonical IDs without the draft prefix. The actual `@->` projection returns null for all three references under raw, drafts, and published perspectives. The component removes unresolved cards and returns null when none remain. Repair the references in the page draft. Keep approved sample quotes editorial until the camp supplies approved quotes; their placeholder status is not a copy defect.

4. **P2: The phone map makes a specific place harder to find.** Below 640px, CSS fixes the map canvas at 800px, hides inactive stop names, and hides the facility photo. The visitor has to pan, select markers, or wait for the automatic tour. Preserve the map, but add a named stop selector and show the selected photo below its description. Associate the selected details with the map controls for screen-reader users. Button names and selected states already exist; the missing connection is between selection and the changing details. These are source findings, not observed phone or screen-reader results.

5. **P2: The journey needs an airport pointer.** "Toronto to the island, step by step" starts at Yorkdale. Pearson appears only in a later related-page card. Marisol needs to know which travel instructions apply to her child at this point. Add a short line such as "Flying to Toronto? Read about our airport service," linked to the verified airport-service destination. Keep full flight and unaccompanied-minor instructions on the travel page. Do not add an unconfirmed airport-to-bus handoff.

6. **P2: The day sequence and contact copy need clearer expectations.** The timed swim, swing, and canoe sequence can sound like a required schedule. Introduce it as an example and state confirmed choice and beginner rules. Remove "Your first day, in your words," which sounds like a camper quotation. "Photos home, no signal" should point parents to the contact information in "Stay in touch with your camper." Photo updates, phone rules, and signal coverage answer different questions. In the emergency section, replace "In your time zone, wherever you live" with the confirmed notification procedure so it does not imply that urgent calls wait for daytime.

## Design checks that remain open

- **Navigation contrast:** the desktop header is transparent at the top. The hero's left-to-right dark wash falls to 12% at the right edge, with another wash at the bottom. Contrast therefore depends on the current photo. Check the actual crop before treating the Basecamp concern as resolved. A consistent dark strip behind navigation is a possible fix if needed.
- **Hero overlap:** current source reserves 80px below content on phones and 96px on desktop; the next section rises by 44px. Facts remain in normal flow and the hero uses a minimum height. This is evidence that clearance has been considered, not proof of the rendered result. Do not report the card's old overlap concern as a confirmed current bug.
- **Footer transition:** the current related-cards component uses a dark background, followed by the darker footer with rounded top corners. No visual conclusion about spacing or exposed corners is possible. Preserve any page-specific approved light treatment during subsequent fixes; do not restyle shared defaults.
- Source heading order is coherent. Main actions have generous targets. Actual contrast, keyboard focus, touch use, page overflow, media loading, crops, and image scale remain unverified.
- The detector reported 12 advisory font-size findings in five files. These are maintenance signals, not proof of poor readability. Use named type utilities when a change is warranted; preserve weight, line height, and tracking for size-only changes.

## Preserve

Keep the island photography, sixteen-stop map, and the current map → community → travel → emergency → daily-life sequence. Keep the explanation of Big Top and Flintstone Field, the named director call, the explicit "Enroll on CampBrain" label, and the four relevant next-page choices. This is a page about a specific camp, with a clear purpose; it does not need a new design direction.

## Client answers and existing dependencies

The existing [client-input list](https://app.basecamp.com/6230954/buckets/48063970/todolists/10273561669) already tracks travel times, boat duration and access, emergency procedures and contact abroad, island facts, morning swimming, signal coverage, and family contact channels. Those items were still open when read. Extend the factual review to the absolute supervision and boat-traffic wording. Real family quotes also need client approval.

The sample-week fit quiz is an explicit dependency in specification #29. Its button points to `/fit-quiz`; this assessment did not audit or build that destination. Director buttons resolve to `/contact`; transport buttons to `/transportation`; other page references resolve to their named facilities, safety, and activity pages. Enrollment points to the camp's CampBrain registration URL. No destination-page audit was performed.

## Evidence

- Repository: `/work/dev/cac/canadianadventurecamp.com-2026`, branch `main`.
- CMS project `bf76qlx9`, dataset `production`.
- Two raw reads by ID and slug returned the populated `uniqueLocation` document with ten sections, revision `TC4AEZTvQdwZvosYYf9blm`, updated `2026-09-04T19:33:05Z`. No separate `drafts.uniqueLocation` document was returned. Shared map content has both draft and published documents.
- Read all ten stored page sections, all sixteen shared map descriptions, footer content, linked avatar notes, specification #29, and the client-input list. Read the relevant components and design system.
- Testimonial dereference check returned null in all three Sanity perspectives. This check establishes the rendering input and code outcome, not a browser observation.
- Browser bootstrap returned `Browser is not available: iab`; supported discovery returned `[]`. No alternative browser was used because repository instructions require the in-app browser for Sanity checks.
- No viewport was inspected. Desktop 1440×900 and phone 390×844 remain planned coverage, not completed coverage. No screenshot, media decoding check, overlay, or runtime accessibility result exists for this review.
- Independent design and detector assessments were kept separate until assessment A finished. Detector ran once on seventeen explicit markup files, returned twelve `design-system-font-size` advisories, and had no stderr output. No CodeRabbit review or broad tests ran.
- No development server was started. No application source or CMS write was made. Existing user changes were left intact.

No numerical score is assigned, as the requested page-review format excludes arbitrary scores and visual coverage is incomplete. Client questions are recorded separately above; no implementation decision is required for this assessment-only task.
