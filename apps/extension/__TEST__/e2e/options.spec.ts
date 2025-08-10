import fs from "node:fs";
import { describe, expect, test } from "./fixtures";

describe("Extension options page", () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html`);
  });

  test("Hash routes are able to navigate correctly", async ({ page, extensionId }) => {
    const rulesEditorLink = page.getByRole("link", { name: "Settings" });
    expect(rulesEditorLink).toBeVisible();
    expect(rulesEditorLink).toHaveAttribute("href", "#/");
    expect(rulesEditorLink).toHaveAttribute("aria-current", "page");
    const changelogLink = page.getByRole("link", { name: "Changelog" });
    expect(changelogLink).toHaveAttribute("href", "#/changelog");
    await changelogLink.click();
    expect(page.url()).toBe(`chrome-extension://${extensionId}/options.html#/changelog`);
  });

  test("Toggle theme to Dark/Light ", async ({ page }) => {
    const getThemeLocalStorage = async () => {
      return await page.evaluate("localStorage.getItem('theme')");
    };

    expect(await getThemeLocalStorage()).toBeNull();
    expect((await page.getAttribute("html", "class"))?.includes("dark")).toBeFalsy();
    const toggle = page.getByRole("button", { name: "Toggle Theme Mode" });

    await toggle.click();
    expect((await page.getAttribute("html", "class"))?.includes("dark")).toBeTruthy();
    expect(await getThemeLocalStorage()).toBe("dark");

    await toggle.click();
    expect((await page.getAttribute("html", "class"))?.includes("dark")).toBeFalsy();
    expect(await getThemeLocalStorage()).toBe("light");
  });
});

describe("Kanji filter page", () => {
  const PAGE_SELECTOR = ".playwright-kanji-filter-page";
  const FILTER_ITEM_SELECTOR = ".playwright-kanji-filter-item";
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/kanji-filter`);
    await page.waitForSelector(PAGE_SELECTOR);
  });

  test("Default kanji filters are loaded", async ({ page }) => {
    const kanjiElements = await page.$$(FILTER_ITEM_SELECTOR);
    expect(kanjiElements.length).toBeGreaterThanOrEqual(995);
    const firstKanji = await kanjiElements.at(0)!.innerText();
    expect(firstKanji).toContain("#1");
    expect(firstKanji).toContain("一");
    expect(firstKanji).toContain("イチ, ヒト");
    const secondKanji = await kanjiElements.at(1)!.innerText();
    expect(secondKanji).toContain("#2");
    expect(secondKanji).toContain("一人");
    expect(secondKanji).toContain("ヒトリ");
  });

  test("Delete first kanji filter", async ({ page }) => {
    const kanjiElements = await page.$$(FILTER_ITEM_SELECTOR);
    const kanjiElementCount = kanjiElements.length;
    const firstKanjiElement = kanjiElements.at(0)!;
    const firstKanjiText = await firstKanjiElement.innerText();

    const deleteBtn = await firstKanjiElement.$(".playwright-kanji-filter-item-delete-btn");
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.click();
    const confirmBtn = page.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeTruthy();
    await confirmBtn.click();
    expect(confirmBtn).toBeHidden();
    expect(await firstKanjiElement.isVisible()).toBeFalsy();

    await page.reload();
    await page.waitForSelector(PAGE_SELECTOR);
    const reloadKanjiElements = await page.$$(FILTER_ITEM_SELECTOR);
    expect(reloadKanjiElements.length).toBe(kanjiElementCount - 1);
    const firstReloadKanjiText = await reloadKanjiElements.at(0)!.innerText();
    expect(firstReloadKanjiText).not.toContain(firstKanjiText);
  });

  test("Clear all kanji filters", async ({ page }) => {
    expect(await page.$(FILTER_ITEM_SELECTOR)).toBeTruthy();
    const clearBtn = await page.$(".playwright-kanji-filter-clear-config-btn");
    expect(clearBtn).toBeTruthy();
    await clearBtn!.click();
    const confirmBtn = page.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeTruthy();
    await confirmBtn.click();
    expect(confirmBtn).toBeHidden();
    await page.waitForSelector(".playwright-not-found-mark");
    expect(await page.$(FILTER_ITEM_SELECTOR)).toBeNull();
    expect(await clearBtn!.isDisabled()).toBeTruthy();

    await page.reload();
    await page.waitForSelector(PAGE_SELECTOR);
    expect(await page.$(".playwright-not-found-mark")).toBeTruthy();
    expect(await page.$(FILTER_ITEM_SELECTOR)).toBeNull();
  });

  test("Export kanji filters file with JSON format", async ({ page }) => {
    const exportBtn = await page.$(".playwright-kanji-filter-export-config-btn");
    const downloadPromise = page.waitForEvent("download");
    expect(exportBtn).toBeTruthy();
    await exportBtn!.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("furigana-maker-kanji-filter.json");
    const path = await download.path();
    const content = fs.readFileSync(path!, "utf-8");
    const json = JSON.parse(content);
    expect(json).toBeInstanceOf(Array);
    const kanjiElements = await page.$$(FILTER_ITEM_SELECTOR);
    const kanjiElementsCount = kanjiElements.length;
    expect((json as unknown[]).length).toBeGreaterThanOrEqual(kanjiElementsCount);
    expect((json as unknown[])[0]).toEqual({
      kanji: "一",
      yomikatas: ["イチ", "ヒト"],
    });

    const firstKanjiElement = await page.$(`${FILTER_ITEM_SELECTOR}:nth-child(1)`);
    expect(firstKanjiElement).toBeTruthy();
    const deleteBtn = await firstKanjiElement!.$(".playwright-kanji-filter-item-delete-btn");
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.click();
    const confirmBtn = page.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeTruthy();
    await confirmBtn.click();
    const newDownloadPromise = page.waitForEvent("download");
    await exportBtn!.click();
    const newDownload = await newDownloadPromise;
    const newPath = await newDownload.path();
    const newContent = fs.readFileSync(newPath!, "utf-8");
    const newJson = JSON.parse(newContent);
    expect(newJson).toBeInstanceOf(Array);
    expect((newJson as unknown[]).length).toBeGreaterThanOrEqual(kanjiElementsCount - 1);
    expect((newJson as unknown[])[0]).toEqual({
      kanji: "一人",
      yomikatas: ["ヒトリ"],
    });
  });
});
