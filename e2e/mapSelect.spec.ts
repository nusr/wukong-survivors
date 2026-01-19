import { test, expect } from "@playwright/test";

test("map select page loads correctly", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Click the start button to go to character select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for character select page to load
  await page.waitForTimeout(500);

  // Click the start button to go to map select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for map select page to load
  await page.waitForTimeout(500);

  // Check that the page title is present
  await expect(page.locator('[data-testid="page-title"]')).toBeVisible();

  // Check that the maps grid is present
  await expect(page.locator('[data-testid="maps-grid"]')).toBeVisible();

  // Check that map cards are displayed
  const mapCards = page.locator('[data-testid^="map-card-"]');
  await expect(mapCards).toHaveCount(6); // There are 6 maps in total

  // Check that the start game button is present and enabled (chapter1 is selected by default)
  const startGameButton = page.locator('[data-testid="start-game-button"]');
  await expect(startGameButton).toBeVisible();
  await expect(startGameButton).toBeEnabled();

  // Check that the back to character select button is present
  await expect(
    page.locator('[data-testid="back-to-home-button"]'),
  ).toBeVisible();
});

test("can select a map and see details", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Click the start button to go to character select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for character select page to load
  await page.waitForTimeout(500);

  // Click the start button to go to map select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for map select page to load
  await page.waitForTimeout(500);

  // Select the first map (chapter1)
  const firstMapCard = page.locator('[data-testid="map-card-chapter1"]');
  await firstMapCard.click();

  // Check that the map card is selected
  await expect(firstMapCard).toHaveClass(/selected/);

  // Check that map details are displayed
  const mapDetails = page.locator('[data-testid="map-details"]');
  await expect(mapDetails).toBeVisible();

  // Check that the start game button is now enabled
  const startGameButton = page.locator('[data-testid="start-game-button"]');
  await expect(startGameButton).toBeEnabled();
});

test("can go back to character select from map select", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Click the start button to go to character select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for character select page to load
  await page.waitForTimeout(500);

  // Click the start button to go to map select page
  await page.locator('[data-testid="start-button"]').click();

  // Wait for map select page to load
  await page.waitForTimeout(500);

  // Click the back to character select button
  await page.locator('[data-testid="back-to-home-button"]').click();

  // Wait for character select page to load
  await page.waitForTimeout(500);

  // Check that we're back on the character select page
  await expect(page.locator('[data-testid="characters-grid"]')).toBeVisible();
});
