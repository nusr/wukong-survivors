import { test, expect } from "@playwright/test";

test("stats page loads correctly", async ({ page }) => {
  // Go to home page first
  await page.goto("/");
  await page.waitForTimeout(500); // Wait for page to load

  // Navigate to stats page
  await page.click('[data-testid="stats-button"]');
  await page.waitForTimeout(500); // Wait for page to load

  // Check that the page title is present
  await expect(page.locator('[data-testid="page-title"]')).toBeVisible();

  // Check that specific stats are present
  await expect(page.locator('[data-testid="stat-gold"]')).toBeVisible(); // Gold
  await expect(page.locator('[data-testid="stat-total-kills"]')).toBeVisible(); // Total kills
  await expect(
    page.locator('[data-testid="stat-best-survival"]'),
  ).toBeVisible(); // Best survival time
  await expect(
    page.locator('[data-testid="stat-total-play-time"]'),
  ).toBeVisible(); // Total play time
  await expect(
    page.locator('[data-testid="stat-unlocked-characters"]'),
  ).toBeVisible(); // Unlocked characters
  await expect(
    page.locator('[data-testid="stat-completed-chapters"]'),
  ).toBeVisible(); // Completed chapters

  // Check that each stat has a label and value
  await expect(page.locator('[data-testid="stat-gold-label"]')).toBeVisible();
  await expect(page.locator('[data-testid="stat-gold-value"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-total-kills-label"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-total-kills-value"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-best-survival-label"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-best-survival-value"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-total-play-time-label"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-total-play-time-value"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-unlocked-characters-label"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-unlocked-characters-value"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-completed-chapters-label"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="stat-completed-chapters-value"]'),
  ).toBeVisible();

  // Check that specific stats are present
  await expect(page.locator('[data-testid="stat-gold"]')).toBeVisible(); // Gold
  await expect(page.locator('[data-testid="stat-total-kills"]')).toBeVisible(); // Total kills
  await expect(
    page.locator('[data-testid="stat-best-survival"]'),
  ).toBeVisible(); // Best survival time
  await expect(
    page.locator('[data-testid="stat-total-play-time"]'),
  ).toBeVisible(); // Total play time

  // Check that the back button is present
  await expect(
    page.locator('[data-testid="back-to-home-button"]'),
  ).toBeVisible();
});

test("can go back to home from stats", async ({ page }) => {
  // Go to stats page
  await page.goto("/");
  await page.waitForTimeout(500); // Wait for page to load
  await page.click('[data-testid="stats-button"]');
  await page.waitForTimeout(500); // Wait for page to load

  // Click back button using JavaScript to avoid GitHub link intercepting click
  await page.$eval('[data-testid="back-to-home-button"]', (button) =>
    (button as HTMLElement).click(),
  );

  // Check that we are back on home page
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
});
