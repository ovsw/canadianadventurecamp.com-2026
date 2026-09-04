// One-off seed for the CAC Experience page draft (issue #54). Run with:
//   SANITY_AUTH_TOKEN=... pnpm exec sanity exec scripts/seed-cac-experience.mjs
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dynamicIconImports } from "lucide-react/dynamic.mjs";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ token: process.env.SANITY_AUTH_TOKEN, apiVersion: "2025-01-01" });

async function icon(name) {
  const load = dynamicIconImports[name];
  if (!load) throw new Error(`Unknown lucide icon ${name}`);
  const mod = await load();
  return { name, svg: renderToStaticMarkup(createElement(mod.default, { "aria-hidden": true })) };
}

const span = (key, text, marks = []) => ({ _key: key, _type: "span", marks, text });
const block = (key, children, style = "normal") => ({ _key: key, _type: "block", children, markDefs: [], style });
const p = (key, text) => block(key, [span(`${key}-s`, text)]);
const quote = (key, text) => block(key, [span(`${key}-s`, text)], "blockquote");
const heading = (key, plain, accent) => [block(key, [span(`${key}-a`, plain), span(`${key}-b`, accent, ["em"])])];
const image = (ref, alt) => ({ _type: "image", alt, asset: { _ref: ref, _type: "reference" } });
const internal = (ref) => ({ _type: "customUrl", type: "internal", openInNewTab: false, internal: { _ref: ref, _type: "reference" } });
const external = (url, openInNewTab = false) => ({ _type: "customUrl", type: "external", openInNewTab, external: url });
const button = (key, text, url, variant = "default") => ({ _key: key, _type: "button", text, url, variant });
const rowItem = (key, text) => ({ _key: key, _type: "stackedFeatureRowItem", body: [p(`${key}-b`, text)] });
const card = (key, title, text, imageRef, alt, linkText, url) => ({
  _key: key, _type: "featureCardItem", title, text, image: image(imageRef, alt),
  link: { _type: "link", text: linkText, url },
});

const IDS = {
  contact: "d3c9e613-97eb-4728-a148-e2a95508e356",
  activities: "activities",
  generalProgram: "generalProgram",
  healthSafety: "healthSafety",
  staff: "staff",
  internationalCampers: "internationalCampers",
  stayInTouch: "stayInTouchWithYourCamper",
  facilities: "accomodationFacilities",
  ylp: "youthLeadershipProgram",
  island: "uniqueLocation",
  campPictures: "campPictures",
  datesAndRates: "datesAndRates",
  gettingToCamp: "gettingToCamp",
};

const IMG = {
  hero: "image-e7fc539a8dd04f49a428b7ce44859c2789374842-2400x1350-jpg",
  arrivalDock: "image-05ab3bf1debc899931f38dd41287f6d064a0abb9-1200x800-jpg",
  arrivalCounsellor: "image-c32c3b6b0ecd3a6547a008869b4c20750ad29902-1200x800-jpg",
  arrivalCabin: "image-40ce897d690bf094ab038229924c0bd07c63a301-1200x800-jpg",
  gymWaving: "image-bc6856fa0f652a2aaee8e9f128ffb8a57a0224b6-2400x1600-jpg",
  cabinDinner: "image-165e85d0d0fb8a91c43f08f51d6e9340189c455e-1200x800-jpg",
  cabinTalk: "image-9fdb67ab246ebaec401f9ca570958437aadad0bc-1200x800-jpg",
  juniorsLake: "image-c60ead98084dee829101264790f3bef52182de4a-1200x677-jpg",
  basketball: "image-6c4d395eeb6a6ed90a113acd368e81c2eeced7a1-2400x1600-jpg",
  lunch: "image-899420ba3f19979b11c7cb2a2ccd4e2033179bb6-2048x1365-jpg",
  tubing: "image-17e1a9c946c51915a417e5ab98f8f5bf80332e47-2400x1600-jpg",
  eveningCanoe: "image-0616edde9fd2724bedf8aa3935a730e8c1ee7f93-2400x1588-jpg",
  eveningGame: "image-945e43e3c946aa350d5d9ae8dfa5470f0689bb23-2400x1600-jpg",
  groupGame: "image-3f023f811bf9f8b4749d2e2c1e012655cd7d315d-1200x800-jpg",
  campfire: "image-c984ecb790f31ce02c90f133d39a65ef3e0bd8b9-2400x1350-jpg",
  campchella: "image-4021337218a3b027597da4fa9891819c1b1b247f-2400x1600-jpg",
  staffShow: "image-10595754b9739e5d32247f3cd0104a95e307a10c-2400x1600-jpg",
  winits: "image-8e100766320a3f03d3ef2fd1b1bdf835ed2cbba7-4704x3136-jpg",
  overnight: "image-6f24c111bbf30b9c0d3969cb086615263fb58586-1200x800-jpg",
  banquet: "image-c0f1558c9606decf629345f0d71a124210c78be0-2048x1365-jpg",
  dockJump: "image-775cebccdd68aa99da4539134900f9413e5e84c2-1200x800-jpg",
  basketballSmiles: "image-7ec7c35aa58181e38a21ea2d7766b657f4737f92-1200x800-jpg",
  lifeguard: "image-9e05de31e71185711b8601cac3743cfa5ae03d94-1530x1024-jpg",
  welcome: "image-33acaea58918f44f8b5be045cfb9f597b70cd287-2400x1600-jpg",
};

const [iconCounsellor, iconCabin, iconSparkles, iconGlobe] = await Promise.all([
  icon("user-round"), icon("bed-double"), icon("sparkles"), icon("globe"),
]);

const blocks = [
  {
    _key: "expHero", _type: "innerHero",
    eyebrow: "The CAC Experience · Since 1975",
    title: heading("expHero-t", "From the first boat to the ", "last campfire."),
    body: "Two weeks on Adventure Island, told in order: who meets her at the dock, who sleeps in her cabin, what a day feels like, and the traditions she will talk about all winter.",
    buttons: [
      button("expHero-b1", "Talk to the Directors", internal(IDS.contact)),
      button("expHero-b2", "See the activities", internal(IDS.activities), "outline"),
    ],
    image: image(IMG.hero, "Campers jumping on the water trampoline on Lake Temagami while a lifeguard watches from the dock"),
    facts: [
      { _key: "expHero-f1", _type: "innerHeroFact", value: "19+", label: "Every counsellor is an adult; the average is 22" },
      { _key: "expHero-f2", _type: "innerHeroFact", value: "Better than 3 to 1", label: "Campers to staff, all session" },
      { _key: "expHero-f3", _type: "innerHeroFact", value: "10 max", label: "Campers per cabin, with their counsellor" },
      { _key: "expHero-f4", _type: "innerHeroFact", value: "Since 1975", label: "Family-run, OCA and CCA accredited" },
    ],
  },
  {
    _key: "expArrivalDay", _type: "stackedTimeline",
    eyebrow: "01 · Arrival day",
    title: heading("expArrival-t", "By dinner, ", "she knows ten names."),
    intro: "Nobody arrives alone. From the dock to the first dinner, here is who has your camper and what happens, in order. Times are typical; camp will confirm the exact schedule.",
    buttons: [button("expArrival-b1", "How campers get to the dock", internal(IDS.gettingToCamp), "outline")],
    items: [
      { _key: "arr-1", _type: "stackedTimelineItem", meta: "The dock · on arrival", title: "Greeted by name", text: "A counsellor and the directors meet every boat. Your camper hears her name before her bag is off the deck.", image: image(IMG.arrivalDock, "A group of campers arriving at camp with staff waiting to greet them") },
      { _key: "arr-2", _type: "stackedTimelineItem", meta: "Minutes later", title: "Meet your counsellor", text: "Every counsellor is 19 or older, lives in the cabin, and keeps the cabin's bedtime. This is the adult your camper will know best.", image: image(IMG.arrivalCounsellor, "A counsellor meeting a camper on arrival day") },
      { _key: "arr-3", _type: "stackedTimelineItem", meta: "The cabin", title: "Meet your cabin group", text: "Bunks for ten at most, grouped by age and gender. Cabin mates are usually the first friends. Ask to bunk with a friend when you enroll (camp to confirm).", image: image(IMG.arrivalCabin, "A cabin group sitting together on arrival day") },
      { _key: "arr-4", _type: "stackedTimelineItem", meta: "First afternoon", title: "The Big Top, and a swim", text: "The open-sided gym at the centre of camp is the first place campers visit: a look at the trampolines and the silks. Then the swim check at the beach (camp to confirm).", image: image(IMG.gymWaving, "A group of campers waving and smiling inside the gym") },
      { _key: "arr-5", _type: "stackedTimelineItem", meta: "5:30 pm", title: "First dinner, all together", text: "Cabin groups eat together. Somebody starts a song. By the time dessert lands, the new kid is not new any more.", image: image(IMG.cabinDinner, "A cabin group having dinner together in the dining hall") },
    ],
  },
  {
    _key: "expFirstNight", _type: "storyFeature",
    useCreamBackground: true, flipLayout: false,
    eyebrow: "02 · The first night",
    title: heading("expFirstNight-t", "What if she cries ", "the first night?"),
    image: image(IMG.cabinTalk, "A counsellor sitting on the cabin steps talking with her cabin group"),
    imageCaption: "Cabin time with a counsellor",
    richText: [
      p("fn-p1", "Some campers do. It is normal, and it is planned for. Her counsellor is in the cabin, awake to the same lights-out, and has done this before. The first evening is games to learn names and a cabin agreement everyone writes together."),
      quote("fn-q", "They might need help tying their shoes on day one. Two weeks later they are expert shoe tiers and don't want to go home."),
      p("fn-p2", "A CAC counsellor for the Twinkies, the youngest cabins (ages 7 to 9)."),
      p("fn-p3", "Phones stay home. Friendships don't. You still hear from her: daily photos and weekly videos all session, CACmail letters that reach the cabin the same day (camp to confirm the turnaround), and old-fashioned mail."),
    ],
    keyDetails: {
      title: "The first-night plan (camp to confirm each step)",
      items: [
        "Her counsellor stays with the cabin group through lights-out",
        "A homesick camper gets one-on-one time with her counsellor, not a phone call home",
        "The directors call you if it lasts more than a night or two",
        "You can reach camp by phone any day; the office knows every camper by name",
        "Daily photos and weekly videos, so you see her settling in",
      ],
    },
    buttons: [
      button("fn-b1", "How you hear from her", internal(IDS.stayInTouch)),
      button("fn-b2", "Read Health & Safety", internal(IDS.healthSafety), "outline"),
    ],
  },
  {
    _key: "expOneDay", _type: "journey",
    eyebrow: "03 · One full day",
    title: heading("expOneDay-t", "No fixed timetable. ", "Her pick, every period."),
    intro: "Eight activity periods a day, and campers choose each one with their counsellor. Here is the rhythm, from the morning dip to lights out. The full schedule is on the General Program page.",
    stops: [
      { _key: "day-1", _type: "journeyStop", time: "7:15 am", label: "Morning dip, then breakfast", text: "Yes, a swim before breakfast. Cold for ten seconds, then the most awake she has ever been. Breakfast at 8:15.", image: image(IMG.juniorsLake, "A big group of junior campers in the lake") },
      { _key: "day-2", _type: "journeyStop", time: "9:00 am", label: "Four periods, her pick", text: "Waterski, then archery, then trampoline, then arts and crafts. Or all four on the lake. Her call, every morning.", image: image(IMG.basketball, "Campers playing basketball on the court") },
      { _key: "day-3", _type: "journeyStop", time: "12:00 pm", label: "Musical lunch, then rest hour", text: "Lunch gets loud: table songs and clapping games. Then an hour in the cabin to read, write a letter, or nap.", image: image(IMG.lunch, "Campers eating lunch together in the dining hall") },
      { _key: "day-4", _type: "journeyStop", time: "2:00 pm", label: "Three more periods, and tuck", text: "Afternoon activities, with a stop at tuck, the camp store, at 3:15 for a treat from her tuck deposit.", image: image(IMG.tubing, "Campers smiling while tubing behind a boat") },
      { _key: "day-5", _type: "journeyStop", time: "5:30 pm", label: "Dinner, then one more period", text: "Dinner with the cabin, then period eight. Evening canoes and a warm gym are the popular picks.", image: image(IMG.eveningCanoe, "A counsellor and a camper canoeing on the lake in the evening") },
      { _key: "day-6", _type: "journeyStop", time: "7:45 pm", label: "Evening program, snack, lights out", text: "The whole camp, a cabin, or an age group plays together. Snack at 8:45, then bed, at a time set by age.", image: image(IMG.eveningGame, "Staff and campers playing a game together") },
    ],
  },
  {
    _key: "expPeople", _type: "stackedFeatureRows",
    eyebrow: "04 · Who is around her",
    title: heading("expPeople-t", "The people she spends ", "every day with."),
    rows: [
      { _key: "ppl-1", _type: "stackedFeatureRow", icon: iconCounsellor, title: "Her counsellor",
        items: [rowItem("ppl-1-1", "19 or older; the average counsellor is 22"), rowItem("ppl-1-2", "First aid certified; counsellors hold Bronze Cross, many National Lifeguard"), rowItem("ppl-1-3", "Lives in the cabin and keeps the cabin's bedtime")],
        link: { text: "Meet the staff", url: internal(IDS.staff) } },
      { _key: "ppl-2", _type: "stackedFeatureRow", icon: iconCabin, title: "Her cabin and age group",
        items: [rowItem("ppl-2-1", "Campers are 7 to 16 (camp to confirm the range)"), rowItem("ppl-2-2", "The youngest cabins are the Twinkies, ages 7 to 9, with their own special activities"), rowItem("ppl-2-3", "Cabins of ten at most; friendships form across age groups too")],
        link: { text: "Cabins and facilities", url: internal(IDS.facilities) } },
      { _key: "ppl-3", _type: "stackedFeatureRow", icon: iconSparkles, title: "Not an athlete? Fine.",
        items: [rowItem("ppl-3-1", "General campers pick every period; no tryouts, no levels"), rowItem("ppl-3-2", "Specialty campers spend half the day in their sport and the other half choosing like everyone else"), rowItem("ppl-3-3", "Beginners welcome in every activity, from first cartwheel to first waterski pull")],
        link: { text: "The General Program", url: internal(IDS.generalProgram) } },
      { _key: "ppl-4", _type: "stackedFeatureRow", icon: iconGlobe, title: "Campers from everywhere",
        items: [rowItem("ppl-4-1", "Cabins mix countries; staff come from Australia, Ireland, New Zealand, Colombia and more"), rowItem("ppl-4-2", "Returning international campers greet the new ones at the dock"), rowItem("ppl-4-3", "Most activities need very little English. Friendship needs none.")],
        link: { text: "International campers", url: internal(IDS.internationalCampers) } },
    ],
  },
  {
    _key: "expTraditions", _type: "featureCards",
    eyebrow: "05 · Traditions",
    title: heading("expTraditions-t", "What she will talk about ", "all winter."),
    description: "Every session has its own moments. These come around every summer (camp to confirm the current list).",
    groups: [{
      _key: "trad-group", _type: "featureCardGroup", heading: "Six things campers count down to", singleRowUpToFour: false,
      cards: [
        card("trad-1", "Evening program", "Every night after dinner the whole camp, a cabin, or an age group plays together. Different every night.", IMG.groupGame, "A group of campers and counsellors playing a game", "See the General Program", internal(IDS.generalProgram)),
        card("trad-2", "Campfires", "Songs, skits, and a guitar by the lake. The night older campers remember most.", IMG.campfire, "Staff lighting a campfire at dusk", "Explore the island", internal(IDS.island)),
        card("trad-3", "Campchella", "The camp music festival: staff DJs, tie-dye, flower crowns, and an acrobatic set in the Chill Out Lounge.", IMG.campchella, "Staff juggling at Campchella, the camp music festival", "Camp photos", internal(IDS.campPictures)),
        card("trad-4", "The staff show", "Counsellors on stage: improv, dance, and costumes nobody explains. Campers vote it the funniest night of the session.", IMG.staffShow, "Staff in costume performing at camp", "Meet the staff", internal(IDS.staff)),
        card("trad-5", "Winits", "Skill awards earned across the session, from a first roll on the trampoline to a full waterski slalom. Handed out on the last night.", IMG.winits, "Staff writing Winit award sheets at an activity", "See the activities", internal(IDS.activities)),
        card("trad-6", "The overnight trip", "Older campers canoe to a nearby island, pitch tents, build the fire, and paddle back before lunch. Weather permitting.", IMG.overnight, "Senior campers canoeing on Lake Temagami", "The General Program", internal(IDS.generalProgram)),
      ],
    }],
  },
  {
    _key: "expBringHome", _type: "storyFeature",
    useCreamBackground: true, flipLayout: true,
    eyebrow: "06 · Going home",
    title: heading("expBringHome-t", "What she ", "brings home."),
    image: image(IMG.banquet, "The banquet dinner in the dining hall on the last night of a session"),
    imageCaption: "The last-night banquet",
    richText: [
      p("bh-p1", "The last night is the banquet: the dining hall dressed up, Winits handed out, and a cabin that does not want to pack. She brings home a skill she did not have two weeks ago, a first waterski stand-up or a first climb on the silks, and a cabin's worth of friends she will message all year."),
      p("bh-p2", "Most first-timers come back. Many stay until sixteen, then join the Youth Leadership Program, and one day meet a new camper at the dock themselves."),
    ],
    keyDetails: {
      title: "Two weeks later",
      items: [
        "A new skill, taught by a certified coach",
        "A cabin group she will write to all winter",
        "Winits for every skill she earned",
        "A nickname, probably",
      ],
    },
    buttons: [
      button("bh-b1", "See dates and rates", internal(IDS.datesAndRates)),
      button("bh-b2", "The Youth Leadership Program", internal(IDS.ylp), "outline"),
    ],
  },
  {
    _key: "expFitQuiz", _type: "ctaBanner", variant: "nudge",
    title: "Not sure she is ready for two weeks?",
    description: "Take the two-minute fit quiz and get a sample week for your camper. No commitment, no phone call yet.",
    buttons: [button("fq-b1", "Get a sample week", external("/fit-quiz"))],
  },
  {
    _key: "expTestimonials", _type: "testimonials",
    eyebrow: "07 · What families say",
    heading: heading("expTestimonials-t", "The first two weeks, ", "in their words."),
    testimonials: [1, 2, 3].map((n) => ({ _key: `exp-t${n}`, _type: "reference", _weak: true, _ref: `testimonial-placeholder-experience-${n}` })),
  },
  {
    _key: "expTalkToDirectors", _type: "ctaBanner", variant: "closing",
    title: "Ask Justin and Anna what the first night is really like.",
    description: "The Directors take every call themselves. Bring the questions this page did not answer.",
    buttons: [
      button("ttd-b1", "Talk to the Directors", internal(IDS.contact)),
      button("ttd-b2", "Enroll on CampBrain", external("https://canadianadventurecamp.campbrainregistration.com/", true), "outline"),
    ],
  },
  {
    _key: "expNextPages", _type: "featureCards",
    eyebrow: "Up next",
    title: heading("expNextPages-t", "Where to ", "read next."),
    groups: [{
      _key: "next-group", _type: "featureCardGroup", heading: "Your next question has a page", singleRowUpToFour: true,
      cards: [
        card("next-1", "Activities", "All 35 activities she can pick from, with no sign-up needed.", IMG.dockJump, "Three campers jumping off the dock into the lake", "See the activities", internal(IDS.activities)),
        card("next-2", "General Program", "The full daily schedule, period by period, and the overnight trip.", IMG.basketballSmiles, "Campers smiling at basketball", "See the program", internal(IDS.generalProgram)),
        card("next-3", "Health & Safety", "The doctor on the island, staff certifications, and what OCA and CCA accreditation means.", IMG.lifeguard, "A lifeguard on duty at the lake", "Read Health & Safety", internal(IDS.healthSafety)),
        card("next-4", "Staff", "Who the counsellors and coaches are, how they are trained, and where they come from.", IMG.welcome, "A counsellor welcoming a camper", "Meet the staff", internal(IDS.staff)),
      ],
    }],
  },
];

const description = "Two weeks at Canadian Adventure Camp, in order: who meets your camper at the dock, who sleeps in the cabin, the first night, one full day, and the traditions campers talk about all winter.";

const testimonials = [
  { n: 1, name: "PLACEHOLDER — Parent of a first-year camper", title: "Parent of a first-year camper", origin: "Vaughan, Ontario",
    body: "She cried on the bus and I cried in the car. That night the daily photos showed the whole cabin in a pile on one bunk, laughing. Two weeks later she asked for four." },
  { n: 2, name: "PLACEHOLDER — Camper, age 11", title: "Camper, age 11", origin: "Toronto",
    body: "I didn't know anyone. By dinner I knew everyone in my cabin, and by the next day I had a nickname. I still don't know why they call me Pickles." },
  { n: 3, name: "PLACEHOLDER — Parent of two campers", title: "Parent of two campers", origin: "Madrid",
    body: "Our son's English was shy. Waterski does not need English. His cabin had boys from three countries, and by the second week he was translating for the new one." },
];

let tx = client.transaction();
for (const t of testimonials) {
  tx = tx.createOrReplace({
    _id: `drafts.testimonial-placeholder-experience-${t.n}`,
    _type: "testimonial",
    name: t.name, title: t.title, origin: t.origin, rating: 5,
    body: [p(`exp-t${t.n}-body`, t.body)],
  });
}
tx = tx.patch("drafts.theCacExperience", (patch) =>
  patch.set({
    title: "The CAC Experience",
    description,
    blocks,
    meta: {
      _type: "meta",
      title: "The CAC Experience: What Two Weeks at Camp Feel Like",
      description,
      noindex: false,
      image: { _type: "image", asset: { _ref: IMG.hero, _type: "reference" } },
    },
  }),
);

const result = await tx.commit();
console.log("Committed", result.results.map((r) => `${r.operation} ${r.id}`).join(", "));
