import { expect, test } from "@playwright/test";

const siteRoutes = [
  "/",
  "/contact",
  "/blog",
  "/blog/continuing-the-cac-traditions-for-the-next-generations",
] as const;

async function gotoRoute(
  page: import("@playwright/test").Page,
  path: (typeof siteRoutes)[number],
) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok(), `${path} should respond successfully`).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function expectAccessibleRoute(page: import("@playwright/test").Page) {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /theme|color mode|dark|light/i }),
  ).toHaveCount(0);
  await expect(
    page.locator("[aria-hidden='false'], [aria-hidden='true'][tabindex='0']"),
  ).toHaveCount(0);
}

for (const route of siteRoutes) {
  test(`serves ${route} from Sanity`, async ({ page }) => {
    await gotoRoute(page, route);
    await expectAccessibleRoute(page);
  });
}

test("supports keyboard access on CAC routes", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /home page/i }).first(),
  ).toBeFocused();
});

test("removes movement for reduced-motion visitors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const motionViolations = await page
    .locator("body *")
    .evaluateAll((elements) =>
      elements.filter((element) => {
        const style = getComputedStyle(element);
        const movingProperties = new Set([
          "all",
          "rotate",
          "scale",
          "transform",
          "translate",
        ]);
        const hasMovementTransition =
          style.transitionDuration !== "0s" &&
          style.transitionProperty
            .split(",")
            .some((property) => movingProperties.has(property.trim()));

        return style.animationName !== "none" || hasMovementTransition;
      }).length,
    );

  expect(motionViolations).toBe(0);
});

test("keeps content pages free of horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { height: 844, width: 390 },
    { height: 1024, width: 768 },
    { height: 1000, width: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    await gotoRoute(page, "/contact");

    expect(
      await page
        .locator("html")
        .evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBe(0);
  }
});
