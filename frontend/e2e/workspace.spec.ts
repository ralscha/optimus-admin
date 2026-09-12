import { test, expect, Page } from "@playwright/test";

const axePath = require.resolve("axe-core/axe.min.js");

async function signIn(page: Page): Promise<void> {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Try the demo" }).click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("$45,231.89", { exact: true })).toBeVisible();
}

async function selectOption(
  page: Page,
  label: string,
  option: string,
): Promise<void> {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("sign-in, command search, themes, mobile navigation and screenshots", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.screenshot({ path: "test-results/sign-in.png", fullPage: true });
  await signIn(page);
  await page.screenshot({
    path: "test-results/dashboard-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByText("$45,231.89", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Search pages" }).fill("Tasks");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Tasks", exact: true })
    .click();
  await expect(page).toHaveURL("/tasks");
  await page.setViewportSize({ width: 393, height: 852 });
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await page
    .getByRole("complementary", { name: "Main navigation" })
    .getByRole("link", { name: "Overview", exact: true })
    .click();
  await expect(page.getByText("$45,231.89", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
});

test("every route renders without browser errors and passes accessibility checks", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await signIn(page);
  const routes = [
    "/dashboard",
    "/dashboard2",
    "/payment-dashboard",
    "/payment-transactions",
    "/tasks",
    "/users",
    "/kanban",
    "/calendar",
    "/mail",
    "/chats",
    "/settings",
    "/settings/account",
    "/settings/appearance",
    "/settings/notifications",
    "/components",
    "/help-center",
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    await page.addScriptTag({ path: axePath });
    if (route === "/components") {
      await page.getByRole("slider", { name: /Project completion/ }).focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "65",
      );
    }
    for (const scheme of ["light", "dark"]) {
      const dark = await page
        .locator("html")
        .evaluate((element) => element.classList.contains("dark"));
      if (dark !== (scheme === "dark"))
        await page.getByRole("button", { name: "Toggle color theme" }).click();
      // Measure final colors, rather than a frame in the theme transition.
      await page.evaluate(async () => {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => undefined)));
      });
      const violations = await page.evaluate(async () => {
        const axe = (
          window as unknown as {
            axe: {
              run: (options: object) => Promise<{
                violations: { id: string; nodes: { target: string[] }[] }[];
              }>;
            };
          }
        ).axe;
        return (
          await axe.run({
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            },
          })
        ).violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        }));
      });
      expect.soft(violations, `${route} (${scheme})`).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test("tasks can be created, filtered, edited, persisted and deleted", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/tasks");
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Browser test task");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("textbox", { name: "Search tasks" })
    .fill("Browser test task");
  await expect(
    page.getByRole("row").filter({ hasText: "Browser test task" }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Edit Browser test task", exact: true })
    .click();
  await selectOption(page, "Status", "Done");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Search tasks" })
    .fill("Browser test task");
  await expect(
    page.getByRole("row").filter({ hasText: "Browser test task" }),
  ).toContainText("Done");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("tasks.csv");
  await page
    .getByRole("button", { name: "Delete Browser test task", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete task", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Browser test task" }),
  ).toHaveCount(0);
});

test("user directory supports create and remove", async ({ page }) => {
  await signIn(page);
  await page.goto("/users");
  await page.getByRole("button", { name: "Add user", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("Browser Test User");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("browser.test@example.com");
  await page.getByRole("button", { name: "Save user", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Search users" })
    .fill("Browser Test User");
  await expect(
    page.getByRole("row").filter({ hasText: "Browser Test User" }),
  ).toContainText("Invited");
  await page
    .getByRole("button", { name: "Delete Browser Test User", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Remove user", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Browser Test User" }),
  ).toHaveCount(0);
});

test("board status can be changed without dragging", async ({ page }) => {
  await signIn(page);
  await page.goto("/kanban");
  await page
    .getByRole("button", { name: "Edit Setup CI/CD Pipeline", exact: true })
    .click();
  await selectOption(page, "Status", "Done");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  const done = page
    .locator(".board-column")
    .filter({ has: page.getByRole("heading", { name: "Done", exact: true }) });
  await expect(
    done.getByRole("heading", { name: "Setup CI/CD Pipeline" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Setup CI/CD Pipeline", exact: true })
    .click();
  await selectOption(page, "Status", "To do");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("calendar events persist across a reload", async ({ page }) => {
  await signIn(page);
  await page.goto("/calendar");
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await page
    .getByLabel("Event title", { exact: true })
    .fill("Browser test event");
  await page.getByRole("button", { name: "Save event", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: /Browser test event/ }).click();
  await expect(page.getByLabel("Event title", { exact: true })).toHaveValue(
    "Browser test event",
  );
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete event", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Browser test event/ }),
  ).toHaveCount(0);
});

test("mail and chat save sample messages through the API", async ({ page }) => {
  await signIn(page);
  await page.goto("/mail");
  await page.getByRole("button", { name: "Compose", exact: true }).click();
  await page.getByLabel("To", { exact: true }).fill("sample@example.com");
  await page.getByLabel("Subject", { exact: true }).fill("Browser test mail");
  await page
    .getByLabel("Message", { exact: true })
    .fill("A sample message from the browser test.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("button")
    .filter({ hasText: "Browser test mail" })
    .click();
  await expect(page.locator(".mail-body")).toContainText(
    "A sample message from the browser test.",
  );
  await page.goto("/chats");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Browser test chat message");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".chat-messages")).toContainText(
    "Browser test chat message",
  );
  await page.reload();
  await expect(page.locator(".chat-messages")).toContainText(
    "Browser test chat message",
  );
});

test("transaction status and profile changes persist", async ({ page }) => {
  await signIn(page);
  await page.goto("/payment-transactions");
  await page
    .getByRole("button", { name: "View PAY-2026-00001", exact: true })
    .click();
  await selectOption(page, "Update status", "Pending");
  await page.getByRole("button", { name: "Save status", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "PAY-2026-00001" }),
  ).toContainText("Pending");
  await page
    .getByRole("button", { name: "View PAY-2026-00001", exact: true })
    .click();
  await selectOption(page, "Update status", "Completed");
  await page.getByRole("button", { name: "Save status", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.goto("/settings");
  await page
    .getByLabel("Bio", { exact: true })
    .fill("Profile saved by the browser test.");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Settings saved", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Bio", { exact: true })).toHaveValue(
    "Profile saved by the browser test.",
  );
});

test("failed API reads show a recoverable dashboard error", async ({
  page,
}) => {
  await signIn(page);
  await page.route("**/api/dashboard", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unavailable" }),
    }),
  );
  await page.goto("/dashboard");
  await expect(
    page.getByText("Couldn’t load your dashboard.", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/api/dashboard");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByText("$45,231.89", { exact: true })).toBeVisible();
});
