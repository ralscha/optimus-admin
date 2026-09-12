import { test, expect } from "@playwright/test";

test("registration, role protection and logout work against the Go API", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await page.getByLabel("Full name", { exact: true }).fill("Sample Viewer");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("new.viewer@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Viewer123!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL("/dashboard");
  await expect(
    page.getByText("Welcome back, Sample.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator(".sidebar").getByRole("link", { name: "Users", exact: true }),
  ).toHaveCount(0);
  await page.goto("/users");
  await expect(page).toHaveURL("/forbidden");
  await expect(
    page.getByRole("heading", { name: "This page needs an admin." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to dashboard", exact: true })
    .click();
  await page.getByRole("button", { name: "Account menu", exact: true }).click();
  await page.getByRole("menuitem", { name: /Sign out/ }).click();
  await expect(page).toHaveURL("/sign-in");
  await page.goto("/tasks");
  await expect(page).toHaveURL(/\/sign-in\?returnUrl=/);
  await page
    .getByLabel("Email address", { exact: true })
    .fill("new.viewer@example.com");
  await page.getByLabel("Password", { exact: true }).fill("WrongPassword1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("p-message")).toContainText(/invalid|incorrect/i);
});
