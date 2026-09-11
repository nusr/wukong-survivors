import { Page, expect, test as base } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "";

const isWhiteList = (text: string) => {
  const whiteList: string[] = [
    "WebGL warning",
    "GL Driver",
    "Failed to create WebGL context",
    "the server responded with a status of 404",
  ];
  return whiteList.some((item) => text.includes(item));
};

export async function gotoHomePage(page: Page) {
  page.on("pageerror", (err) => {
    if (isWhiteList(err.message)) {
      return;
    }
    throw err;
  });

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if ((type === "error" || type === "warning") && !isWhiteList(text)) {
      throw new Error(text);
    }
  });

  if (!baseURL) {
    throw new Error("process.env.BASE_URL is not defined");
  }

  await page.goto(baseURL);

  await page.waitForTimeout(1000);

  await expect(page.getByTestId("loading-overlay")).toBeHidden();

  await expect(page.getByTestId("wiki-button")).toBeVisible();
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await gotoHomePage(page);

    await use(page);
  },
});

export { expect };
