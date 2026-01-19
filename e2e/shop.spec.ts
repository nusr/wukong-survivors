import { test, expect } from "@playwright/test";

test("shop page loads correctly", async ({ page }) => {
  // Go to home page first
  await page.goto("/");

  // Navigate to shop page
  await page.click('[data-testid="shop-button"]');

  // Check that the shop title is present
  await expect(page.locator('[data-testid="shop-title"]')).toBeVisible();

  // Check that gold display is present
  await expect(page.locator('[data-testid="shop-gold-display"]')).toBeVisible();
  await expect(page.locator('[data-testid="shop-gold-display"]')).toHaveText(
    /💰/,
  );

  // Check that upgrades grid is present
  await expect(page.locator('[data-testid="upgrades-grid"]')).toBeVisible();

  // Check that upgrade cards are present
  const upgradeCards = page.locator('[data-testid^="upgrade-card-"]');
  await expect(upgradeCards).toHaveCount(9); // There are 9 permanent upgrades

  // Check that back button is present
  await expect(page.locator('[data-testid="shop-back-button"]')).toBeVisible();
});

test("can view upgrade details", async ({ page }) => {
  // Go to shop page
  await page.goto("/");
  await page.click('[data-testid="shop-button"]');

  // Get the first upgrade card
  const firstUpgradeCard = page
    .locator('[data-testid^="upgrade-card-"]')
    .first();
  await expect(firstUpgradeCard).toBeVisible();

  // Check that upgrade card contains required elements
  await expect(firstUpgradeCard).toHaveText(/\d+ \/ \d+/); // Level information
  await expect(firstUpgradeCard).toHaveText(/💰/); // Gold icon
  await expect(
    firstUpgradeCard.locator('button[data-testid^="purchase-button-"]'),
  ).toBeVisible();
});

test("can go back to home from shop", async ({ page }) => {
  // Go to shop page
  await page.goto("/");
  await page.click('[data-testid="shop-button"]');

  // Click back button
  await page.click('[data-testid="shop-back-button"]');

  // Check that we are back on home page
  await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="shop-button"]')).toBeVisible();
});
