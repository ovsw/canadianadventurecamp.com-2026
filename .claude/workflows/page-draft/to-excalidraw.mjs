import { chromium } from "/home/ovs/.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const readme = readFileSync(`${dir}/README.md`, "utf8");
const src = readme.match(/```mermaid\n([\s\S]*?)```/)[1].replace(/\(\["([^"]*)"\]\)/g, '["$1"]');
const html = `<!doctype html><html><body><script type="module">
import { parseMermaidToExcalidraw } from "https://esm.sh/@excalidraw/mermaid-to-excalidraw@1.1.2";
import { convertToExcalidrawElements, exportToSvg } from "https://esm.sh/@excalidraw/excalidraw@0.18.0?deps=react@18.2.0,react-dom@18.2.0";
const PHASE_FILL = ["#f1f3f5", "#e7f0fb", "#f3e8fb", "#fff1e6", "#e6f7f2"];
const PHASE_STROKE = ["#868e96", "#2c88d9", "#9c36b5", "#e8833a", "#207868"];
const PILL = { "Start: Ovi names a page": "#788896", "Draft ready for Ovi": "#207868", "Stop. Touch nothing.": "#e9ecef" };
function polish(els) {
  const byId = Object.fromEntries(els.map((e) => [e.id, e]));
  const groups = [];
  for (const t of els) {
    if (t.type !== "text") continue;
    const c = byId[t.containerId];
    if (!c) continue;
    const phase = /^([1-5])\. /.exec(t.text);
    if (phase) {
      const i = Number(phase[1]) - 1;
      c.backgroundColor = PHASE_FILL[i]; c.fillStyle = "solid"; c.strokeColor = PHASE_STROKE[i]; c.strokeWidth = 1;
      c.y -= 40; c.height += 40; t.y -= 40; t.fontSize = 20; t.strokeColor = PHASE_STROKE[i];
      groups.push(c.id, t.id);
    } else if (PILL[t.text]) {
      c.backgroundColor = PILL[t.text]; c.fillStyle = "solid"; c.roundness = { type: 3 };
      if (PILL[t.text] !== "#e9ecef") t.strokeColor = "#ffffff";
    } else if (c.type === "rectangle" || c.type === "diamond") {
      if (c.backgroundColor === "transparent") { c.backgroundColor = "#ffffff"; c.fillStyle = "solid"; }
    }
  }
  // Phase boxes go to the back so their fill sits under the nodes.
  const set = new Set(groups);
  return [...els.filter((e) => set.has(e.id)), ...els.filter((e) => !set.has(e.id))];
}
window.run = async (src) => {
  const { elements, files } = await parseMermaidToExcalidraw(src, { fontSize: 16 });
  const converted = polish(convertToExcalidrawElements(elements));
  const svg = await exportToSvg({ elements: converted, appState: { viewBackgroundColor: "#ffffff", exportWithDarkMode: false }, files: files ?? {}, exportPadding: 40 });
  window.__svg = svg.outerHTML;
  return JSON.stringify({ type: "excalidraw", version: 2, source: "page-draft/to-excalidraw.mjs", elements: converted, appState: { viewBackgroundColor: "#ffffff" }, files: files ?? {} }, null, 1);
};
document.body.dataset.ready = "1";
</script></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror", e.message));
page.on("console", (m) => { if (m.type() === "error") console.error("console", m.text()); });
await page.setContent(html, { waitUntil: "domcontentloaded" });
await page.waitForSelector("body[data-ready='1']", { state: "attached", timeout: 90000 });
const json = await page.evaluate((s) => window.run(s), src);
writeFileSync(`${dir}/flow.excalidraw`, json);
writeFileSync(`/tmp/flow-excalidraw.svg`, await page.evaluate(() => window.__svg));
const parsed = JSON.parse(json);
console.log("elements", parsed.elements.length, "types", [...new Set(parsed.elements.map((e) => e.type))].join(","));
await browser.close();
