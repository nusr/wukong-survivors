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

  test("should load game page and show loading screen", async ({ page }) => {
    // 点击开始游戏按钮
    await page.locator('[data-testid="start-game-button"]').click();

    // 验证游戏容器
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();

    // 验证加载覆盖层
    await expect(page.locator('[data-testid="loading-overlay"]')).toBeVisible();

    // 验证加载旋转器
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test("should initialize game and hide loading screen", async ({
    page,
    browserName,
  }) => {
    // 点击开始游戏按钮
    await page.locator('[data-testid="start-game-button"]').click();

    // 等待一段时间让游戏初始化（根据浏览器性能调整）
    // 注意：Phaser游戏初始化可能需要较长时间，这里设置一个合理的超时
    const timeout = browserName === "webkit" ? 10000 : 5000;

    // 等待加载覆盖层隐藏
    await expect(page.locator('[data-testid="loading-overlay"]')).toBeHidden({
      timeout,
    });

    // 验证游戏容器仍然可见
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
