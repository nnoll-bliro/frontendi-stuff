import { expect, test } from "@playwright/test";

const routes = [
  "/companies", "/people", "/meetings", "/agent-sessions",
  "/companies/co_halden", "/people/per_anke", "/meetings/mtg_halden_depot",
  "/agent-sessions/as_halden_debrief", "/calendar", "/calendar/cal_halden_discovery",
  "/team", "/settings/account", "/settings/sharing", "/design-system",
];

for (const width of [390, 768, 1440]) {
  test(`product pages fit the ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => {
        const main = document.querySelector("main")!;
        return {
          document: document.documentElement.scrollWidth > window.innerWidth + 1,
          main: main.scrollWidth > main.clientWidth + 1,
        };
      });
      expect(overflow, route).toEqual({ document: false, main: false });
    }
    expect(errors).toEqual([]);
  });
}

test("collapsed navigation keeps accessible names and active state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/companies/co_halden");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Companies", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "People", exact: true }).click();
  await expect(page).toHaveURL("/people");
  await expect(nav.getByRole("link", { name: "People", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
});

test("meeting filters work with a keyboard and retain search", async ({ page }) => {
  await page.goto("/meetings");
  await page.getByRole("textbox", { name: "Search meetings" }).fill("Halden");
  await expect(page).toHaveURL(/q=Halden/);
  const held = page.getByRole("button", { name: "Held", exact: true });
  await held.focus();
  await held.press("Enter");
  await expect(held).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/status=held/);
  await expect(page.getByRole("textbox", { name: "Search meetings" })).toHaveValue("Halden");
  await expect(page.getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true })).toBeVisible();
});

test("shared input labels and product typography are applied", async ({ page }) => {
  await page.goto("/settings/account");
  const firstName = page.getByRole("textbox", { name: "First Name", exact: true });
  await expect(firstName).toHaveValue("Niko");
  await firstName.fill("Niko test");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(firstName).toHaveValue("Niko");

  await page.goto("/companies/co_halden");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "28px");
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toHaveCSS("font-size", "16px");
  const people = page.getByRole("region", { name: "People", exact: true });
  const list = people.locator('[data-surface]').first();
  await expect(list).toHaveCSS("border-radius", "8px");
  await expect(list.locator(':scope > [data-surface]').nth(1)).toHaveCSS("border-top-width", "1px");
});
