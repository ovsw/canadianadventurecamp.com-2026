// The boxes, phase frames, and connections of the page-draft flow.
// Shared by build-excalidraw.mjs and build-drawio.mjs.
const SESSION = "session model";
const n = (id, cx, y, kind, text, o = {}) => ({ id, cx, y, kind, text, ...o });
const e = (from, to, label = "", o = {}) => ({ from, to, label, ...o });

// ---- the picture ---------------------------------------------------------
export const L = -420, C = 0, R = 440, RR = 880, FAR = -900;
export const nodes = [
  // id, x centre, y top, kind, text, options
  n("start", C, 0, "pill", "Start: Ovi names a page", { fill: "#788896", color: "#fff" }),
  n("note", RR, -40, "box", "Every AGENT box is a new agent with an empty memory. It knows only what the script hands it, and what is on disk, on GitHub, in Sanity, on Basecamp. A box that runs again is a new agent again.", { w: 420, fill: "#fffbe6", stroke: "#b8a200" }),
  n("claim", C, 110, "box", "AGENT: take the page (sonnet)\nFind the page's Basecamp card. If nobody else has it, mark it in progress with this branch name"),
  n("q1", C, 300, "diamond", "SCRIPT checks: did we get the page?"),
  n("stop", L, 340, "pill", "Stop. Touch nothing."),
  n("q2", C, 480, "diamond", "SCRIPT checks: has the plan for this page already been written?"),

  n("gA", -580, 720, "box", "AGENT: research A\nWho the page is for, and the writing rules", { w: 260 }),
  n("gB", -290, 720, "box", "AGENT: research B\nWhat the old page says", { w: 260 }),
  n("gC", 0, 720, "box", "AGENT: research C\nRelated blog posts, and the pages next to it in the menu", { w: 260 }),
  n("gD", 290, 720, "box", "AGENT: research D\nWhich page sections exist, and the design rules", { w: 260 }),
  n("gE", 580, 720, "box", "AGENT: research E\nWhich photos exist", { w: 260 }),

  n("readPlan", FAR, 1120, "box", "AGENT: read the plan (sonnet)\nReads the plan that is already written"),
  n("writePlan", C, 960, "box", `AGENT: write the plan (${SESSION})\nWrite the plan as a GitHub issue and link it on the card`),
  n("secondReader", C, 1120, "box", `AGENT: second reader (${SESSION}, high effort)\nReads the plan as the parent it is written for, and lists the problems. A new agent each round`),
  n("q3", C, 1300, "diamond", "SCRIPT checks: found problems? Up to 3 rounds"),
  n("fixPlan", R, 1200, "box", `AGENT: fix the plan (${SESSION})\nApplies the fixes to the issue. A new agent each round`),

  n("getReady", C, 1600, "box", "AGENT: get ready (sonnet)\nGet the latest code, check nobody else is editing the same sections, back up the content database"),
  n("q4", C, 1790, "diamond", "SCRIPT checks: latest code pulled, backup made and checked?"),
  n("buildSection", C, 1960, "box", `AGENT: build one section (${SESSION})\nA new agent for each new or redesigned section, one after the other. None of them sees what the one before it did, only its files`),
  n("writeText", C, 2120, "box", `AGENT: write the page text (${SESSION})\nWrite the text and save it as a draft in Sanity`),
  n("proofread", C, 2280, "box", `AGENT: proofread (${SESSION}, high effort)\nVoice, banned words, unconfirmed facts, colours alternate, buttons in place. A new agent each round`),
  n("q5", C, 2470, "diamond", "SCRIPT checks: found problems? Up to 3 rounds"),
  n("fix", R, 2370, "box", `AGENT: fix (${SESSION})\nFix them and save again. A new agent each round`),
  n("loadPage", C, 2650, "box", "AGENT: load the page (sonnet, low effort)\nLoad the page on the dev server and check every section shows up"),
  n("q6", C, 2840, "diamond", "SCRIPT checks: page loads?"),
  n("fixLoad", R, 2740, "box", `AGENT: fix (${SESSION})\nFix it, one try`),
  n("push", C, 3020, "box", "AGENT: push the code (sonnet)\nFinal checks, then push"),
  n("giveUp", RR, 2300, "box", "AGENT: give up (haiku)\nWrites what went wrong on the card and leaves it marked in progress", { fill: "#d3455b", color: "#fff", stroke: "#a02a3c" }),

  n("handOver", C, 3220, "box", "AGENT: hand over (sonnet)\nMove the card to Ovi Polish. Write on the card what to look at, what was guessed, what to ask the camp. Make the to-do list of things the camp must supply"),
  n("done", C, 3440, "pill", "Draft ready for Ovi", { fill: "#207868", color: "#fff" }),
];

export const phases = [
  // id, label, x1, y1, x2, y2, fill, stroke
  ["P1", "1. Take the page", -620, 80, 620, 640, "#f1f3f5", "#868e96"],
  ["P2", "2. Research: 5 agents at once (all sonnet)", -740, 680, 740, 860, "#e7f0fb", "#2c88d9"],
  ["P3", "3. Plan", -1080, 900, 620, 1480, "#f3e8fb", "#9c36b5"],
  ["P4", "4. Build", -620, 1540, 1080, 3140, "#fff1e6", "#e8833a"],
  ["P5", "5. Hand over to Ovi", -620, 3180, 620, 3400, "#e6f7f2", "#207868"],
];

export const edges = [
  // from, to, label, options
  e("start", "claim"),
  e("claim", "q1"),
  e("q1", "stop", "no"),
  e("q1", "q2", "yes"),
  e("q2", "P2", "no"),
  e("P2", "writePlan", "notes"),
  e("q2", "readPlan", "yes"),
  e("readPlan", "getReady"),
  e("writePlan", "secondReader"),
  e("secondReader", "q3"),
  e("q3", "fixPlan", "yes"),
  e("fixPlan", "secondReader"),
  e("q3", "getReady", "no"),
  e("getReady", "q4"),
  e("q4", "buildSection", "yes"),
  e("q4", "giveUp", "no"),
  e("buildSection", "writeText"),
  e("buildSection", "giveUp", "code will not compile", { dashed: true }),
  e("writeText", "proofread"),
  e("writeText", "giveUp", "draft will not save", { dashed: true }),
  e("proofread", "q5"),
  e("q5", "fix", "yes"),
  e("fix", "proofread"),
  e("q5", "loadPage", "no"),
  e("loadPage", "q6"),
  e("q6", "fixLoad", "no"),
  e("fixLoad", "loadPage"),
  e("q6", "push", "yes"),
  e("push", "giveUp", "push fails", { dashed: true }),
  e("push", "handOver"),
  e("handOver", "done"),
];

