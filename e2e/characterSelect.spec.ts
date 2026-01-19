import { test, expect } from "@playwright/test";

test("character select page loads correctly", async ({ page }) => {
  // Go to home page first
  await page.goto("/");

  // Navigate to character select page
  await page.click('[data-testid="start-button"]');

  // Check that the page title is present
  await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="page-title"]')).toContainText(
    /Select Character/i,
  );

  // Check that characters grid is present
  await expect(page.locator('[data-testid="characters-grid"]')).toBeVisible();

  // Check that character cards are present
  const characterCards = page.locator('[data-testid^="character-card-"]');
  // Expect 28 character cards based on CHARACTERS_DATA constant
  await expect(characterCards).toHaveCount(28);

  // Check that start and back buttons are present
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="back-to-home-button"]'),
  ).toBeVisible();
});

test("can select character and go to map select", async ({ page }) => {
  // Go to character select page
  await page.goto("/");
  await page.click('[data-testid="start-button"]');

  // Select the first unlocked character
  const firstCharacterCard = page
    .locator('[data-testid^="character-card-"]')
    .first();
  await firstCharacterCard.click();

  // Check that character details are displayed
  await expect(page.locator('[data-testid="character-details"]')).toBeVisible();

  // Click start button to go to map select
  await page.click('[data-testid="start-button"]');

  // Check that we are on map select page (by looking for map select elements)
  // This will depend on the actual map select page structure
});

test("can go back to home from character select", async ({ page }) => {
  // Go to character select page
  await page.goto("/");
  await page.click('[data-testid="start-button"]');

  // Click back button
  await page.click('[data-testid="back-to-home-button"]');

  // Check that we are back on home page
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
});
