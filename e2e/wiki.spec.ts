import { test, expect } from "@playwright/test";

test("wiki page loads correctly", async ({ page }) => {
  // Go to home page first
  await page.goto("/");
  await page.waitForTimeout(500); // Wait for page to load

  // Navigate to wiki page
  await page.click('[data-testid="wiki-button"]');
  await page.waitForTimeout(500); // Wait for page to load

  // Check that the page title is present
  await expect(page.locator('[data-testid="page-title"]')).toBeVisible();

  // Check that all wiki sections are present
  await expect(page.locator('[data-testid="wiki-maps-section"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-characters-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-weapons-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-elixirs-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-enemies-section"]'),
  ).toBeVisible();

  // Check that each section has a summary/title
  await expect(
    page.locator('[data-testid="wiki-maps-section"] summary'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-characters-section"] summary'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-weapons-section"] summary'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-elixirs-section"] summary'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-enemies-section"] summary'),
  ).toBeVisible();

  // Check that the back button is present
  await expect(
    page.locator('[data-testid="back-to-home-button"]'),
  ).toBeVisible();
});

test("can see all wiki sections", async ({ page }) => {
  // Navigate to wiki page
  await page.goto("/");
  await page.click('[data-testid="wiki-button"]');
  await page.waitForTimeout(500);

  // Check that all sections are present
  await expect(page.locator('[data-testid="wiki-maps-section"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-characters-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-weapons-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-elixirs-section"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="wiki-enemies-section"]'),
  ).toBeVisible();
});

test("can view content in wiki sections", async ({ page }) => {
  // Go to wiki page
  await page.goto("/");
  await page.waitForTimeout(500); // Wait for page to load
  await page.click('[data-testid="wiki-button"]');
  await page.waitForTimeout(500); // Wait for page to load

  // Expand maps section and check content exists
  await page.locator('[data-testid="wiki-maps-section"]').click();
  await page.waitForTimeout(300); // Wait for section to expand
  await expect(page.locator('[data-testid^="wiki-item-maps-"]')).toHaveCount(6); // Updated count of maps

  // Expand characters section and check content exists
  await page.locator('[data-testid="wiki-characters-section"]').click();
  await page.waitForTimeout(300); // Wait for section to expand
  await expect(
    page.locator('[data-testid^="wiki-item-characters-"]'),
  ).toHaveCount(28); // Updated count of characters

  // Expand weapons section and check content exists
  await page.locator('[data-testid="wiki-weapons-section"]').click();
  await page.waitForTimeout(300); // Wait for section to expand
  await expect(page.locator('[data-testid^="wiki-item-weapons-"]')).toHaveCount(
    35,
  ); // Updated count of weapons

  // Expand elixirs section and check content exists
  await page.locator('[data-testid="wiki-elixirs-section"]').click();
  await page.waitForTimeout(300); // Wait for section to expand
  await expect(page.locator('[data-testid^="wiki-item-elixirs-"]')).toHaveCount(
    11,
  ); // Updated count of elixirs

  // Expand enemies section and check content exists
  await page.locator('[data-testid="wiki-enemies-section"]').click();
  await page.waitForTimeout(300); // Wait for section to expand
  await expect(page.locator('[data-testid^="wiki-item-enemies-"]')).toHaveCount(
    24,
  ); // Updated count of enemies
});

test("can go back to home from wiki", async ({ page }) => {
  // Go to wiki page
  await page.goto("/");
  await page.waitForTimeout(500); // Wait for page to load
  await page.click('[data-testid="wiki-button"]');
  await page.waitForTimeout(500); // Wait for page to load

  // Click back button using JavaScript to avoid GitHub link intercepting click
  await page.$eval('[data-testid="back-to-home-button"]', (element) => {
    (element as HTMLElement).click();
  });
  // Check that we are back on home page
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
});
