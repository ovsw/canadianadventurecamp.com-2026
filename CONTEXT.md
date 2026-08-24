# Domain context

Shared language for the Canadian Adventure Camp (CAC) website and content system.

## The site

**Website**

The public Next.js application in `frontend/`. Marketing site for CAC, a family-run overnight summer camp on Adventure Island, Lake Temagami, Ontario.

**Studio**

The separately deployed Sanity editing application in `studio/`.

**Site settings**

Global editable Website identity and content, including the site name, navigation, footer, and contact details.

## Content editing

**Page Builder**

The ordered section editor used to compose a page.

**Section**

One reusable Page Builder content and layout unit.

**Draft**

Content visible to an authorized editor through preview before publication.

**Published content**

Content available to public Website visitors.

**Redirect**

A permanent route from an old public URL to its current destination.

## Camp calendar

**Season**

One camp year (e.g. the 2027 season). Owns all sessions, prices, and enrollment deadlines for that year. Staff update the season's details in Sanity before each enrollment cycle.

**Session**

A single purchasable block of camp within a season. Has one length (2, 4, 6, or 8 weeks), one set of dates, one price, and one availability status. A parent picks one session and checks out. Sessions are not composed or combined.
_Avoid_: stay, booking period

**Availability status**

A session's enrollment status: Full, Limited, Open, or a spot count (e.g. "Under 5 spots"). Staff-set in Sanity, not synced from any external system.

## Programs and activities

**Program**

A named track that shapes a camper's stay, chosen at enrollment. Has its own page on the site. Examples: Gymnastics, Trampoline, Aerials, Waterski & Wakeboard (specialty programs), General Program, Y.L.P.
_Avoid_: course, stream

**Activity**

One of the 35 daily choices available to every camper. No enrollment required, no dedicated page. Listed on the Activities page.
_Avoid_: class, lesson

**Y.L.P.**

Youth Leadership Program. A program for older campers.

## Conversion funnel

**Visitor**

An anonymous person browsing the site. No contact information known. Every visitor is one of the visitor types below; the site is organized by what they are trying to do, not by asking them who they are.

**Prospective parent**

A parent or guardian deciding whether to send their child to CAC. The buyer. The primary visitor type; most of the site serves them.
_Avoid_: prospective family, user

**Prospective camper**

A child who may attend camp, browsing activities and media. Influences the parent's decision but does not buy.

**Prospective staff**

A person considering working at camp. A separate audience from parents; handed off to the staff application portal.
_Avoid_: job seeker, applicant (until they apply)

**Enrolled family**

A parent whose camper is enrolled for the coming or current season. Needs logistics before camp and updates during it.
_Avoid_: current family, returning family (alumni parents re-enrolling are prospective parents until they enroll)

**In-season mode**

The site state during the camp session weeks, when enrolled families are the main visitors. Switches navigation, homepage, and possibly other parts of the site to serve them. The rest of the year is off-season. Enrollment, pre-camp preparation, and staff recruiting all overlap within off-season and are not separate modes.

**Lead**

A person whose contact information the site or camp has captured. The first conversion point (info request form) turns a visitor into a lead.
_Avoid_: prospect, contact

**Qualified lead**

A lead ready to purchase. The second conversion point (enrollment system link) hands them off to enroll.

**Info request**

A form submission containing parent name, email, camper age, and optional notes. Delivered to the camp office via Formspark. The artifact that turns a visitor into a lead.
_Avoid_: inquiry, contact form submission

## External systems

**Enrollment system**

The external service where parents complete enrollment and payment. Currently CampBrain (`canadianadventurecamp.campbrainregistration.com`). The site links to it but does not host or track enrollment.
_Avoid_: registration system, sign-up portal

**Staff application portal**

The external service where prospective staff apply. Currently CampBrain (`canadianadventurecamp.campbrainstaff.com`).

**Camper photo portal**

The external platform where parents view daily photos and weekly videos during the season. The site links to it but does not host media.

## Places and things

**Adventure Island**

The island on Lake Temagami that CAC owns and operates. The physical location of the camp.
_Avoid_: private island, secluded, exclusive, hideaway (see Copy voice)

**Big Top**

The camp's large gymnastics and performance facility.

**Tuck shop**

The on-island camp store. A $150 deposit is added per camper; unused funds are refunded.

## Copy voice

**Trust language**

Site copy describes the island and camp through supervision, accreditation, and history, never through isolation. Prefer: supervised, community-based, accredited, family legacy, structured program, staff-to-camper ratio, OCA and CCA accredited, operating since 1975.
_Avoid_: private, secluded, hideaway, exclusive, escape the world, in the middle of nowhere

## Ownership rules

- Code owns layout, rendering rules, validation, and safe fallbacks.
- Sanity owns editor-managed content and site settings.
- This repository owns its Sanity project, dataset, credentials, and hosting.
