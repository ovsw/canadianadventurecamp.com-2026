import assert from "node:assert/strict";
import test from "node:test";

import { createRemoveButtonStylePlans } from "./migrate-remove-button-styles.mjs";

const button = (key, variant) => ({ _key: key, _type: "button", text: "Go", variant });

test("plans a guarded unset for every stored button style, drafts included", () => {
  const plans = createRemoveButtonStylePlans([
    {
      _id: "drafts.about",
      _rev: "r1",
      blocks: [
        { _key: "hero", _type: "innerHero", buttons: [button("a", "default"), button("b", "secondary")] },
        { _key: "price", _type: "pricingSingleToggle", button: { _type: "button", variant: "outline" } },
      ],
    },
  ]);
  assert.deepEqual(plans, [
    {
      _id: "drafts.about",
      _rev: "r1",
      paths: [
        'blocks[_key=="hero"].buttons[_key=="a"].variant',
        'blocks[_key=="hero"].buttons[_key=="b"].variant',
        'blocks[_key=="price"].button.variant',
      ],
    },
  ]);
});

test("finds rich text button marks and retired link styles", () => {
  const [plan] = createRemoveButtonStylePlans([
    {
      _id: "post",
      _rev: "r1",
      body: [{ _key: "p", _type: "block", markDefs: [{ _key: "m", _type: "buttonLink", variant: "link" }] }],
      legacy: { _type: "link", buttonVariant: "ghost" },
    },
  ]);
  assert.deepEqual(plan.paths, ['body[_key=="p"].markDefs[_key=="m"].variant', "legacy.buttonVariant"]);
});

test("leaves section variants and documents without button styles alone", () => {
  const plans = createRemoveButtonStylePlans([
    { _id: "clean", _rev: "r1", blocks: [{ _key: "c", _type: "ctaBanner", variant: "nudge", buttons: [{ _key: "a", _type: "button", text: "Go" }] }] },
  ]);
  assert.deepEqual(plans, []);
});

test("refuses a document without a revision, so every write stays guarded", () => {
  assert.throws(() => createRemoveButtonStylePlans([{ _id: "noRev" }]), /must include _id and _rev/);
});
