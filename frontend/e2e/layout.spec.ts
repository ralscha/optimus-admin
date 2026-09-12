import { test, expect, Locator, Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Try the demo" }).click();
  await expect(page).toHaveURL("/dashboard");
}

async function expectPageFits(page: Page) {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.content, page.url()).toBeLessThanOrEqual(
    dimensions.viewport,
  );
}

async function expectFitsWithin(element: Locator, container: Locator) {
  const child = await element.boundingBox();
  const parent = await container.boundingBox();
  expect(child).not.toBeNull();
  expect(parent).not.toBeNull();
  expect(child!.x).toBeGreaterThanOrEqual(parent!.x - 1);
  expect(child!.x + child!.width).toBeLessThanOrEqual(
    parent!.x + parent!.width + 1,
  );
}

for (const width of [320, 393, 768, 900, 901, 1024, 1440]) {
  test(`workspace layouts fit at ${width}px`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await signIn(page);
    for (const route of [
      "dashboard",
      "dashboard2",
      "payment-dashboard",
      "payment-transactions",
      "tasks",
      "users",
      "kanban",
      "calendar",
      "mail",
      "chats",
      "settings",
      "settings/account",
      "settings/appearance",
      "settings/notifications",
      "components",
      "help-center",
    ]) {
      await test.step(route, async () => {
        await page.goto(`/${route}`);
        await expect(page.locator("main h1")).toBeVisible();
        await page.waitForLoadState("networkidle");
        await expectPageFits(page);
        // Measure the text itself: a block can fit while its number spills into the padding.
        for (const value of await page.locator(".metric-value").all()) {
          const fits = await value.evaluate((element) => {
            const metric = element.closest(".metric")!;
            const rect = metric.getBoundingClientRect();
            const css = getComputedStyle(metric);
            const range = document.createRange();
            range.selectNodeContents(element);
            const text = range.getBoundingClientRect();
            return (
              text.left >= rect.left + parseFloat(css.paddingLeft) - 1 &&
              text.right <= rect.right - parseFloat(css.paddingRight) + 1
            );
          });
          expect(fits, await value.innerText()).toBe(true);
        }
        await expectFitsWithin(
          page.getByRole("button", { name: "Account menu", exact: true }),
          page.locator(".topbar"),
        );
        for (const panel of await page
          .locator(".gallery-grid .panel-body, .chat-composer")
          .all()) {
          for (const control of await panel
            .locator("button, input, .p-select")
            .all()) {
            await expectFitsWithin(control, panel);
          }
        }
      });
    }
  });
}

test("mobile message actions and editor fields stay inside their containers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await signIn(page);
  await page.goto("/mail");
  await page.locator(".mail-item").first().click();
  for (const action of await page.locator(".mail-detail-header button").all()) {
    await expectFitsWithin(action, page.locator(".mail-detail-header"));
    await expectFitsWithin(action, page.locator(".mail-layout"));
  }
  for (const [route, action] of [
    ["tasks", "New task"],
    ["users", "Add user"],
    ["calendar", "New event"],
    ["mail", "Compose"],
  ]) {
    await page.goto(`/${route}`);
    await page.getByRole("button", { name: action, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const control of await dialog
      .locator("input, textarea, .p-select, button")
      .all()) {
      await expectFitsWithin(control, dialog);
    }
    await expectPageFits(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("mobile navigation resets after returning to desktop", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await page.setViewportSize({ width: 393, height: 852 });
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeVisible();
  await expect(page.locator(".sidebar .brand-text")).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeHidden();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page.setViewportSize({ width: 393, height: 852 });
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeHidden();
});

test("mobile tables can scroll to row actions without moving the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await signIn(page);
  await page.goto("/tasks");
  const scroller = page.locator(".p-datatable-table-container");
  await scroller.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const edit = page.getByRole("button", { name: /^Edit / }).first();
  await expectFitsWithin(edit, scroller);
  await edit.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectPageFits(page);
});
