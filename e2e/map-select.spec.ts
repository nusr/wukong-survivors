import { test, expect } from "@playwright/test";

test.describe("Map Select Page", () => {
  test.beforeEach(async ({ page }) => {
    // 先导航到首页，然后进入地图选择页面
    await page.goto("/", { waitUntil: "networkidle" });

    // 选择第一个角色
    const firstUnlockedCharacter = page
      .locator('[data-testid^="character-card-"]')
      .first();
    await firstUnlockedCharacter.click();

    // 点击开始按钮进入地图选择
    await page.locator('[data-testid="start-button"]').click();
  });

  test("should load map select page with correct elements", async ({
    page,
  }) => {
    // 验证页面标题
    await expect(page.locator('[data-testid="page-title"]')).toHaveText(
      "Select Chapter",
    );

    // 验证地图网格
    await expect(page.locator('[data-testid="maps-grid"]')).toBeVisible();

    // 验证至少有一个地图卡片
    const mapCards = page.locator('[data-testid^="map-card-"]');
    await expect(mapCards.count()).resolves.toBeGreaterThan(0); // 至少有一个地图卡片

    // 验证开始游戏按钮
    await expect(
      page.locator('[data-testid="start-game-button"]'),
    ).toBeVisible();

    // 验证返回首页按钮
    await expect(
      page.locator('[data-testid="back-to-home-button"]'),
    ).toBeVisible();
  });

  test("should select a map and enable start button", async ({ page }) => {
    // 选择第一个解锁的地图
    const firstUnlockedMap = page.locator('[data-testid^="map-card-"]').first();
    await firstUnlockedMap.click();

    // 验证开始游戏按钮可点击
    await expect(
      page.locator('[data-testid="start-game-button"]'),
    ).not.toBeDisabled();
  });

  test("should navigate back to home page", async ({ page }) => {
    // 点击返回首页按钮
    await page.locator('[data-testid="back-to-home-button"]').click();

    // 验证导航回首页（通过检查金币显示元素）
    await expect(page.locator('[data-testid="gold-display"]')).toBeVisible();
  });
});
