#!/usr/bin/env node
// Print a page's legacy (old website) content as Markdown.
// Usage: pnpm --dir studio legacy:page <slug>
// The legacy content lives in page.migration.legacy.content.sections and is a
// starting point for the page rethink, never something to reproduce.

import process from "node:process";
import { getCliClient } from "sanity/cli";

const slug = process.argv[2]?.replace(/^\/+|\/+$/g, "");
if (!slug) {
  console.error("Usage: pnpm --dir studio legacy:page <slug>");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-03-23" });

const page = await client.fetch(
  `*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id, title, "slug": slug.current,
    "headerImageAlt": headerImage.alt,
    "blocks": blocks[]._type,
    "legacy": migration.legacy.content.sections
  }`,
  { slug },
);

if (!page) {
  console.error(`No published page with slug "${slug}".`);
  process.exit(2);
}

const TEXT_FIELDS = new Set([
  "title",
  "heading",
  "subheading",
  "text",
  "label",
  "question",
  "answer",
  "quote",
  "author",
  "buttonText",
  "name",
  "alt",
]);

function portableText(blocks) {
  return blocks
    .filter((b) => b && b._type === "block")
    .map((b) => {
      const text = (b.children ?? []).map((c) => c.text ?? "").join("");
      if (b.listItem) return `- ${text}`;
      if (/^h\d$/.test(b.style ?? "")) return `\n**${text}**`;
      return text;
    })
    .join("\n");
}

function walk(value, out) {
  if (Array.isArray(value)) {
    const blocks = value.filter((v) => v?._type === "block");
    if (blocks.length) out.push(portableText(blocks));
    value.filter((v) => v?._type !== "block").forEach((v) => walk(v, out));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, v] of Object.entries(value)) {
    if (key.startsWith("_")) continue;
    if (typeof v === "string" && TEXT_FIELDS.has(key)) out.push(`${key}: ${v}`);
    else walk(v, out);
  }
}

console.log(`# ${page.title}  (/${page.slug})`);
console.log(`Document: ${page._id}`);
console.log(`Current blocks: ${page.blocks?.length ? page.blocks.join(", ") : "none"}`);
if (page.headerImageAlt) console.log(`Header image alt: ${page.headerImageAlt}`);

for (const section of page.legacy ?? []) {
  const lines = [];
  walk(section, lines);
  console.log(`\n## [${section._type}]\n${lines.join("\n")}`);
}
if (!page.legacy?.length) console.log("\n(no legacy sections)");
