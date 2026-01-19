import { test, expect } from "@playwright/test";

test("home page loads correctly", async ({ page }) => {
  // Go to the home page
  await page.goto("/");

  // Check that the page title is present
  await expect(page.locator('[data-testid="page-title"]')).toBeVisible();

  // Check that all main buttons are present
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="shop-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="stats-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="settings-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="wiki-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="reset-save-button"]')).toBeVisible();
});

test("can navigate to character selection from home", async ({ page }) => {
  // Go to the home page
  await page.goto("/");

  // Click the start button
  await page.click('[data-testid="start-button"]');

  // Check that we can see character selection elements
  await expect(page.locator('[data-testid="characters-grid"]')).toBeVisible();
});

test("can navigate to settings from home", async ({ page }) => {
  // Go to the home page
  await page.goto("/");

  // Click the settings button
  await page.click('[data-testid="settings-button"]');

  // Check that we can see settings elements
  await expect(page.locator('[data-testid="page-title"]')).toContainText(
    /Settings/i,
  );
});

test("can navigate to shop from home", async ({ page }) => {
  // Go to the home page
  await page.goto("/");

  // Click the shop button
  await page.click('[data-testid="shop-button"]');

  // Check that we can see shop elements
  await expect(page.locator('[data-testid="shop-title"]')).toBeVisible();
});
