---
name: Canadian Adventure Camp
description: A field guide to a private island camp. Dark forest greens, map-legend labels, campfire-amber handwriting.
colors:
  campfire-amber: "#E8A23B"
  campfire-amber-deep: "#C9861F"
  pine-night: "#16200F"
  forest-floor: "#35491F"
  forest-panel: "#24331A"
  cedar: "#527033"
  cedar-deep: "#3A5222"
  birch-bark: "#F3EFE2"
  birch-bark-bright: "#FAF7EE"
  sunlit-moss: "#C7DD96"
  moss: "#A9C46C"
  lake-night: "#0D1626"
  ember-red: "#B4441F"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6.5rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.025em"
    fontVariation: "'opsz' 96"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.625rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  script:
    fontFamily: "Caveat, cursive"
    fontSize: "1.15em"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-small:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.12em"
  eyebrow:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.24em"
rounded:
  xs: "3px"
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "26px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "26px"
  lg: "34px"
  xl: "46px"
  section: "120px"
  gutter: "56px"
components:
  button-primary:
    backgroundColor: "{colors.campfire-amber}"
    textColor: "{colors.pine-night}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "16px 30px"
  button-primary-hover:
    backgroundColor: "{colors.campfire-amber-deep}"
    textColor: "{colors.pine-night}"
  button-primary-small:
    backgroundColor: "{colors.campfire-amber}"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.birch-bark}"
    rounded: "{rounded.pill}"
    padding: "18px 30px"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  chip-label:
    backgroundColor: "transparent"
    textColor: "{colors.birch-bark}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
  card-light:
    backgroundColor: "{colors.birch-bark}"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.lg}"
    padding: "34px 30px"
  card-dark:
    backgroundColor: "{colors.forest-panel}"
    textColor: "{colors.birch-bark}"
    rounded: "{rounded.xl}"
    padding: "46px 46px 40px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.pine-night}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "15px 16px"
---

# Design System: Canadian Adventure Camp

## Overview

**Creative North Star: "The Island Field Guide"**

The site reads like a trail map of Adventure Island that a parent can trust and a kid wants to read. Deep forest greens are the paper; small monospace labels are the map legend; a handwritten Campfire Amber script is the note scrawled in the margin by someone who has actually been there. Photos are the terrain. The voice is bold, warm, and confident: big type that says the thing plainly, then a wink in amber.

Density is high but never cramped. Sections are full-bleed colour fields (dark green, pine black, birch cream) that alternate like day and night on the lake, with content sitting on a wide 1320px measure. Inside those fields, information is packed tight: hairline-divided grids, pill chips, session bars, numbered programs. Every interactive thing moves a little when touched. Nothing is decorative for its own sake; the map legend, the stamp, the script all carry meaning.

Confirmed rejections: no soft pastel "summer camp" palette, no rounded-bubbly kid branding, no stock-photo hero with a gradient overlay and centred text. The old site's logo and colours are not binding.

**Key Characteristics:**
- Forest-dark fields as the default canvas; cream fields for money, trust, and forms.
- One accent, Campfire Amber, reserved for action, emphasis, and handwritten notes.
- Three voices of type: Bricolage display, Archivo body, monospace legend, plus Caveat script for the human aside.
- Pills everywhere (buttons, chips, stamps); large soft radii on media and cards; hairline borders in translucent cream.
- Tonal layering for depth; shadows appear only on lift or under hero media.
- Motion on scroll and hover is constant but short and eased; it reveals, never loops.

## Colors

A forest at dusk, lit by one fire.

### Primary
- **Campfire Amber** (`{colors.campfire-amber}`): the only accent. Primary buttons, the handwritten script word in a headline, eyebrow labels on dark fields, hover fills on arrows and bars, "sold out" stamps, text selection. **Campfire Amber Deep** (`{colors.campfire-amber-deep}`) is its pressed/hover state.

### Secondary
- **Cedar** (`{colors.cedar}`): links on light fields, eyebrow labels on cream, focus borders on inputs, the script word when it sits on cream, hover tint on cabin bunks. **Cedar Deep** (`{colors.cedar-deep}`) is link hover.
- **Sunlit Moss** (`{colors.sunlit-moss}`) and **Moss** (`{colors.moss}`): small positive signals on dark fields (open session markers, availability dots, map trails). Never large areas.

### Neutral
- **Pine Night** (`{colors.pine-night}`): body text on cream; the darkest section field (facilities, world globe); text on amber.
- **Forest Floor** (`{colors.forest-floor}`): the default dark section field (hero, programs, activities, safety).
- **Forest Panel** (`{colors.forest-panel}`): cards and panels sitting on Forest Floor or Pine Night.
- **Birch Bark** (`{colors.birch-bark}`): page background, text on dark fields, light cards. **Birch Bark Bright** (`{colors.birch-bark-bright}`) for the testimonial field.
- **Lake Night** (`{colors.lake-night}`): the globe container only; near-black blue.
- **Ember Red** (`{colors.ember-red}`): one use, the "Full" session marker. Error red if ever needed.

Translucent neutrals do the quiet work: secondary text is Birch Bark at 66-75% on dark and Pine Night at 65-70% on cream; hairlines are Birch Bark at 12-22% on dark and Pine Night at 10-18% on cream; muted labels sit at 45%.

### Named Rules
**The One Fire Rule.** Campfire Amber touches at most a few elements per viewport: one button, one script word, one label. Its scarcity is what makes it read as "act here."

**The Dusk Alternation Rule.** Sections alternate dark field (Forest Floor or Pine Night) and cream field (Birch Bark). Two dark fields may touch; two cream fields never do.

**The Translucent Ink Rule.** Secondary text, borders, and dividers are never a new grey. They are the field's text colour at reduced alpha.

## Typography

**Display Font:** Bricolage Grotesque (variable, opsz 12-96, wght 300-800; fallback sans-serif)
**Body Font:** Archivo (400-700; fallback sans-serif)
**Label/Mono Font:** ui-monospace, Menlo, monospace (system; no webfont)
**Script Font:** Caveat (500, 600; fallback cursive)

**Character:** Bricolage at 800 with tight tracking is loud and a little quirky, like a hand-painted camp sign. Archivo underneath is plain and legible, the parent-facing voice. The system monospace is the map legend: small, wide-tracked, uppercase. Caveat is one human hand writing over all of it.

### Hierarchy
- **Display** (800, clamp 3rem to 6.5rem, line-height 0.96, tracking -0.025em): hero headline only. One word or phrase of it is swapped to Script in Campfire Amber.
- **Headline** (800, 58px desktop, line-height 1.02, tracking -0.02em): section openers. Pine Night on cream, Birch Bark on dark.
- **Title** (700, 19-30px, line-height 1-1.1): card and program titles, stat numbers, nav wordmark at 15px with +0.04em tracking.
- **Script** (Caveat 600, roughly 1.15x the surrounding headline size, up to 118px in the hero): the aside inside a headline, a pull quote signature, a margin note. Always Campfire Amber on dark, Cedar on cream.
- **Body** (Archivo 400, 16-17px, line-height 1.6): paragraphs, max 520-620px wide. Secondary body at 15px / 1.55 and reduced alpha.
- **Eyebrow** (mono, 12px, tracking 0.24em, uppercase): the small line above a headline, Campfire Amber on dark, Cedar on cream, 20px below it.
- **Label** (mono, 10-11px, tracking 0.1-0.14em, uppercase): chips, map markers, stamps, metadata, nav sub-line.

### Named Rules
**The Legend Rule.** Anything that annotates (labels, metadata, coordinates, prices in tables, session dates) is set in the monospace at 10-12px, uppercase, wide-tracked. Never in Archivo.

**The One Hand Rule.** Caveat appears at most once per section, as one phrase, never a full sentence and never for UI text.

## Layout

Content sits on a 1320px max-width measure with 56px side gutters; the hero nav and hero text share the same left edge. Sections are full-bleed colour fields with roughly 120px vertical padding; the hero is a full-viewport media field with the nav absolutely positioned over it and a 34px marquee ticker above the nav.

Internal grids are explicit and asymmetric where the content is asymmetric: 1fr 1fr for text/media pairs, 1fr 620px when media must hold a fixed width, 330px 1fr for sidebar-plus-content, repeat(4, 1fr) for program and safety tiles, 150px 1fr 138px for session rows (dates, bar, CTA). Tile grids use 1px gaps over a translucent cream background so the gaps themselves draw hairlines (The Hairline Grid).

Spacing steps observed: 8, 14, 26, 34, 46px inside components; 20px between eyebrow and headline; 120px between sections. Text measures cap at 520-620px.

### Responsive
Three breakpoints: phone below 640px, tablet 640-1023px, desktop 1024px and up. The drama survives on phones; it stacks, it does not shrink away.

- **Phone:** gutters 20px; section padding 72px; every grid one column; hairline-grid tiles two columns; Display 48px, Headline 36px, Script scales with them; body stays 16px; text measures go full width. Session rows become a stacked card per session (dates, bar, CTA). Tilting cards lose the tilt and keep the image scale and metadata on tap. The globe and island walk keep working by touch.
- **Tablet:** gutters 32px; section padding 96px; two-column pairs stay two columns where the media side can hold 320px, else stack; tiles two columns; Display 72px, Headline 46px.
- **Desktop:** as specified above.

**The Stack, Don't Shrink Rule.** Below 1024px, layouts stack and type steps down one size; no section is removed, no interaction is removed.

## Elevation & Depth

Depth is tonal. Forest Panel sits on Forest Floor; Forest Floor sits on Pine Night; Birch Bark cards sit on Birch Bark Bright. Hairlines (translucent cream or translucent pine) separate rather than shadows. Shadows exist for two reasons only: something is media-heavy and meant to feel physical (the island map, the globe, the hero video frame), or something has been lifted by the cursor.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 40px 70px -22px rgba(13,18,8,.65)`): hover state for tilting program and activity cards, paired with a -8px translateY and 1.06 image scale.
- **Media rest** (`box-shadow: 0 36px 70px rgba(13,18,8,.45)`): heavy media containers at rest on dark fields (island walk, globe uses `0 42px 84px rgba(0,0,0,.5)`).
- **Card rest, cream** (`box-shadow: 0 22px 44px rgba(22,32,15,.12)`): light cards that float on the cream field (pricing, testimonial portraits).
- **Stamp** (`box-shadow: 0 10px 24px rgba(13,18,8,.35)`): small amber stamps and floating chips.
- **Glass chips** use `backdrop-filter: blur(6-8px)` over a 45-55% Pine Night fill instead of a shadow.

### Named Rules
**The Flat-Until-Touched Rule.** Cards and tiles are flat at rest. The lift shadow is a response to hover or focus, never a resting state. Hairline-grid tiles never lift; they tint (5% cream) instead.

## Shapes

Two silhouettes: the pill and the soft slab. Every button, chip, label, stamp, and marker is a full pill (999px). Every media frame, card, and panel is a soft slab at 22-26px, with 14px for inputs and 8px for small inner thumbnails, 3px for bars and ticks. Circles (50%) are reserved for dots, avatars, and the 26px arrow button. The footer and the final CTA band round only their top corners at 44px, like the page being tucked into an envelope.

Borders are 1px (1.5px on buttons and inputs) and always translucent: cream at 12-22% on dark, pine at 10-18% on cream. No solid grey borders. Media is always clipped to its slab; images inside a slab may scale on hover but never escape it.

## Components

Tactile and confident. Everything that can be touched answers: pills lift, arrows rotate, bars slide, stamps pop.

### Buttons
- **Shape:** full pill (999px), Archivo 700, 14-17px, inline-flex with 10px gap for an arrow.
- **Primary:** Campfire Amber fill, Pine Night text, 16px 30px padding (18px 34px in the hero with `0 12px 32px rgba(0,0,0,.35)` shadow; 11px 22px for the small nav/ticker variant).
- **Hover:** background to Campfire Amber Deep and -2px translateY over .2s ease.
- **Focus:** see The Field Ring Rule below.
- **Ghost on dark:** transparent, 1.5px Birch Bark at 50%, Birch Bark text, 600 weight, 18px 30px, blur(6px) backdrop; hover brightens the border.
- **Ghost on cream:** transparent, 1.5px Pine Night at 25%, Pine Night text, 600 weight, 12px 24px.
- **Arrow trailing:** "Enroll →" style arrows are text glyphs; in cards the arrow is a 26px circle outline that fills amber and rotates -45deg on hover.

### Chips / Labels
- **Style:** mono 11px, 0.12em tracking, uppercase, pill, 7px 12px padding.
- **Glass (on media):** Birch Bark text on 55% Pine Night fill, blur(8px), 1px Birch Bark at 22% border.
- **Outline (on cream):** Pine Night at 70% text, 1px Pine Night at 18% border; hover border to Campfire Amber at 85% with -2px lift.
- **Stamp:** Campfire Amber fill, Pine Night text, 700 weight, 0.14em, rotated -7deg, pops in with a scale-down from 1.7.

### Cards / Containers
- **Light card:** Birch Bark, 1px Pine Night at 10% border, 22px radius, 34px 30px padding; on hover lifts with the cream rest shadow.
- **Dark panel:** Forest Panel, 1px Birch Bark at 12% border, 26px radius, 46px 46px 40px padding; used for quotes and pricing on dark fields.
- **Media card (tilting):** 26px radius, overflow hidden, 3D tilt up to a few degrees following the cursor, cursor-tracked warm radial glow, a sheen sweep, and metadata chips that rise from the bottom on hover. Image desaturated to .94 at rest, 1.12 on hover.
- **Hairline-grid tile:** no radius, no border; 1px gaps over Birch Bark at 16% draw the grid. Hover tints the tile 5% cream. Program number badge fills amber on hover.

### Inputs / Fields
- **Style:** white fill, 1.5px Pine Night at 18% border, 14px radius, 15px 16px padding, Archivo 16px, Pine Night text.
- **Focus:** border to Cedar plus a 3px Cedar at 25% outer ring.
- **Submit:** full-width primary button, 18px padding, 17px text.
- **Error:** validated on blur, one field at a time. Border to Ember Red, label stays, and a mono 11px Ember Red message appears 8px below in the site's voice ("We need an email to reply to", not "Invalid input"). The message is linked with `aria-describedby`; the field gets `aria-invalid`. Submit re-checks every field and moves focus to the first error. Success replaces the form with a Forest Panel thank-you and the phone number.
- **Disabled:** 45% alpha, no hover.

### Focus
**The Field Ring Rule.** Every focusable element shows a 2px solid ring with 3px offset on `:focus-visible`: Campfire Amber on dark fields, Cedar on cream fields. Inputs use the Cedar border plus soft ring above instead. Never remove outlines without replacing them; never use the browser default blue.

### Navigation
- **Style:** absolute over the hero, 26px 56px padding, wordmark in Bricolage 700 15px +0.04em with a mono 10px sub-line ("Temagami, Ontario · Est. 1975"). Links in Archivo 500 15px, Birch Bark at 85%, hover to 100%. Trailing small primary Enroll pill.
- **Ticker:** 34px Campfire Amber marquee above the nav, Archivo 600 13px, Pine Night, with a dot and an arrowed Enroll link; slides down on load.
- **Mobile (below 1024px):** wordmark (sub-line hidden below 640px), small primary Enroll pill, then a 44px circle menu button with a two-line icon. Menu opens a full-screen Forest Floor sheet sliding down (.35s ease-reveal): links in Bricolage 700 at 32px, Birch Bark, 18px apart; Programs expands inline; at the bottom a mono label row with the phone number and a ghost Request Info pill. Enroll stays visible in the header while the sheet is open. Body scroll locks; Escape and the close circle dismiss.

### Session Rows (signature)
A horizontal calendar: 150px date column in mono, a 1fr track with a positioned bar (3px radius) per session, and a 138px CTA column. Open sessions carry a Moss bar that turns amber on hover while a hidden Enroll link slides in from the left (overshoot ease). Full sessions carry an Ember Red marker and an amber "FULL" stamp. Availability copy comes from the CMS.

### Eyebrow + Headline + Script (signature)
Every section opens the same way: mono eyebrow (0.24em, amber or cedar), 20px, Bricolage 800 headline at 58px, with one phrase swapped into Caveat in the accent colour. This is the most recognisable pattern on the site; reuse it on every inner page.

### Motion grammar
- **Reveal:** `riseUp` (46px translate, fade) driven by `animation-timeline: view()` over entry 0-45%; hero uses `heroRise` (34px) with .9s `cubic-bezier(.2,.7,.2,1)` and staggered delays.
- **Hover:** .2s ease for buttons; .35s `cubic-bezier(.34,1.56,.64,1)` (overshoot) for arrows, dots, and slide-ins; 1s `cubic-bezier(.2,.7,.2,1)` for image scale.
- **Ambient:** marquee ticker (40s linear loop), slow globe spin, map trail dash, and map ping are the only looping animations; they are `transform`/`stroke-dashoffset` only and must pause under `prefers-reduced-motion`.
- **Parallax:** hero media drifts ±6.5% on scroll.

## Do's and Don'ts

### Do:
- **Do** open every section with the eyebrow, headline, script triad; it is the brand's signature.
- **Do** keep Campfire Amber scarce: one button, one script phrase, one label per viewport (The One Fire Rule).
- **Do** derive every secondary text, border, and divider from the field's text colour at reduced alpha (The Translucent Ink Rule).
- **Do** set all annotation in the system monospace, 10-12px, uppercase, 0.1-0.24em (The Legend Rule).
- **Do** use pills for anything tappable and 22-26px slabs for anything that frames media or content.
- **Do** keep cards flat at rest and lift them only on hover or focus (The Flat-Until-Touched Rule).
- **Do** alternate dark and cream fields section to section (The Dusk Alternation Rule); put money, trust, and forms on cream.
- **Do** drive scroll reveals with `animation-timeline: view()` and provide a no-motion path under `prefers-reduced-motion`.
- **Do** ship real island, Big Top, and camper photography; the terrain is the design.
- **Do** stack below 1024px and keep every section and interaction (The Stack, Don't Shrink Rule).
- **Do** show a 2px ring, 3px offset, amber on dark and cedar on cream, on every `:focus-visible` (The Field Ring Rule).
- **Do** validate form fields on blur with a plain-English mono message in Ember Red.

### Don't:
- **Don't** introduce a second accent or a new grey; the palette is thirteen named colours and their alphas.
- **Don't** use Caveat for more than one phrase per section or for any UI text.
- **Don't** set annotation, prices, dates, or chips in Archivo.
- **Don't** place resting drop shadows on cards or tiles; only media frames and lifted states carry shadow.
- **Don't** use solid grey borders, square corners on tappable elements, or radii between 3px and 14px except the 8px thumbnail.
- **Don't** add looping animations beyond the ticker, globe, and map trail; no pulse, shimmer, or spinner loops.
- **Don't** fall back to a centred-text-over-gradient hero; the hero is left-aligned type over media with the script aside.
- **Don't** reintroduce the old site's logo or colours.
- **Don't** hide the Enroll pill on any viewport or while the mobile menu is open.
- **Don't** show form errors as a summary box or only on submit.
