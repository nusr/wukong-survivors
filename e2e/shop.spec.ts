import { test, expect } from "@playwright/test";

test.describe("Shop Page", () => {
  test.beforeEach(async ({ page }) => {
    // 先导航到首页，然后进入商店页面
    await page.goto("/", { waitUntil: "networkidle" });

    // 点击商店按钮进入商店页面
    await page.locator('[data-testid="shop-button"]').click();
  });

  test("should load shop page with correct elements", async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('[data-testid="shop-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="shop-title"]')).toHaveText(
      "Permanent Upgrades",
    );

    // 验证金币显示
    await expect(
      page.locator('[data-testid="shop-gold-display"]'),
    ).toBeVisible();

    // 验证升级网格
    await expect(page.locator('[data-testid="upgrades-grid"]')).toBeVisible();

    // 验证至少有一个升级卡片
    const upgradeCards = page.locator('[data-testid^="upgrade-card-"]');
    await expect(upgradeCards.count()).resolves.toBeGreaterThan(0); // 至少有一个升级卡片

    // 验证返回按钮
    await expect(
      page.locator('[data-testid="shop-back-button"]'),
    ).toBeVisible();

    // 验证重置升级按钮
    await expect(
      page.locator('[data-testid="reset-upgrades-button"]'),
    ).toBeVisible();
  });

  test("should display upgrade cards with correct information", async ({
    page,
  }) => {
    // 获取第一个升级卡片
    const firstUpgradeCard = page
      .locator('[data-testid^="upgrade-card-"]')
      .first();

    // 验证升级卡片可见
    await expect(firstUpgradeCard).toBeVisible();

    // 验证升级卡片包含购买按钮
    await expect(
      firstUpgradeCard.locator('[data-testid^="purchase-button-"]'),
    ).toBeVisible();

    // 验证升级卡片包含文本内容（名称、描述等）
    await expect(firstUpgradeCard).toContainText(/[\w]/);
  });

  test("should navigate back to home page", async ({ page }) => {
    // 点击返回按钮
    await page.locator('[data-testid="shop-back-button"]').click();

    // 验证导航回首页（通过检查金币显示元素）
    await expect(page.locator('[data-testid="gold-display"]')).toBeVisible();
  });
});
