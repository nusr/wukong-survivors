import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    // 设置默认语言为en-US
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("should load home page with correct elements", async ({ page }) => {
    // 验证页面加载
    await expect(page).toHaveURL("/");

    // 验证金币显示
    await expect(page.locator('[data-testid="gold-display"]')).toBeVisible();

    // 验证角色网格
    await expect(page.locator('[data-testid="characters-grid"]')).toBeVisible();

    // 验证至少有一个角色卡片
    const characterCards = page.locator('[data-testid^="character-card-"]');
    await expect(characterCards.count()).resolves.toBeGreaterThan(0); // 至少有一个角色卡片

    // 验证开始按钮
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible();

    // 验证商店按钮
    await expect(page.locator('[data-testid="shop-button"]')).toBeVisible();

    // 验证统计按钮
    await expect(page.locator('[data-testid="stats-button"]')).toBeVisible();

    // 验证重置保存按钮
    await expect(
      page.locator('[data-testid="reset-save-button"]'),
    ).toBeVisible();
  });

  test("should select a character and navigate to map select", async ({
    page,
  }) => {
    // 选择第一个解锁的角色
    const firstUnlockedCharacter = page
      .locator('[data-testid^="character-card-"]')
      .first();
    await firstUnlockedCharacter.click();

    // 验证开始按钮可点击
    await expect(
      page.locator('[data-testid="start-button"]'),
    ).not.toBeDisabled();

    // 点击开始按钮
    await page.locator('[data-testid="start-button"]').click();

    // 验证导航到地图选择页面
    await expect(page.locator('[data-testid="page-title"]')).toHaveText(
      "Select Chapter",
    );
  });

  test("should navigate to shop page", async ({ page }) => {
    // 点击商店按钮
    await page.locator('[data-testid="shop-button"]').click();

    // 验证导航到商店页面
    await expect(page.locator('[data-testid="shop-title"]')).toHaveText(
      "Permanent Upgrades",
    );
  });

  test("should open stats dialog", async ({ page }) => {
    // 点击统计按钮
    await page.locator('[data-testid="stats-button"]').click();

    // 验证统计对话框打开
    await expect(page.locator('[data-testid="stats-dialog"]')).toBeVisible();
  });
});
