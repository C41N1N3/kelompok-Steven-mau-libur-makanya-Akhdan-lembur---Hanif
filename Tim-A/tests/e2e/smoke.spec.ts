import { expect, test } from "playwright/test";

test("home route redirects first-time visitors to login", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page).toHaveTitle(/GLOSIO/);
  await expect(page.getByText("A Greek Learning Companion")).toBeVisible();
  await expect(page.getByRole("button", { name: /Sign In/ })).toBeVisible();
});
