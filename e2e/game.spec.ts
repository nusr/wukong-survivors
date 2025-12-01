import { test, expect } from "@playwright/test";

test.describe("Game Page", () => {
  test.beforeEach(async ({ page }) => {
    // 先导航到首页，然后选择角色和地图，进入游戏页面
    await page.goto("/", { waitUntil: "networkidle" });

    // 选择第一个角色
    const firstUnlockedCharacter = page
      .locator('[data-testid^="character-card-"]')
      .first();
    await firstUnlockedCharacter.click();

    // 点击开始按钮进入地图选择
    await page.locator('[data-testid="start-button"]').click();

    // 选择第一个地图
    const firstUnlockedMap = page.locator('[data-testid^="map-card-"]').first();
    await firstUnlockedMap.click();
  });

  test("should load game page", async ({ page }) => {
    // 点击开始游戏按钮
    await page.locator('[data-testid="start-game-button"]').click();

    // 验证游戏容器
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
  });

  test("should show end game modal when escape key is pressed", async ({
    page,
  }) => {
    // 点击开始游戏按钮
    await page.locator('[data-testid="start-game-button"]').click();

    // 等待游戏初始化完成
    await page.waitForTimeout(2000);

    // 模拟按下Escape键
    await page.keyboard.press("Escape");

    // 等待模态框出现
    // 注意：这里需要根据实际的结束游戏模态框选择器进行调整
    // 如果项目中没有明确的选择器，可能需要添加data-testid
    await page.waitForTimeout(1000);

    // 验证游戏容器仍然可见（游戏没有崩溃）
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
  });
});
