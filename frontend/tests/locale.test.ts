import { describe, it, expect } from "vitest";
import { getLocale, formatDate } from "../src/utils/locale";

describe("getLocale", () => {
  it("exact: 'en-US' → 'en-US'", () => expect(getLocale("en-US")).toBe("en-US"));
  it("exact: 'de-DE' → 'de-DE'", () => expect(getLocale("de-DE")).toBe("de-DE"));
  it("exact: 'ja-JP' → 'ja-JP'", () => expect(getLocale("ja-JP")).toBe("ja-JP"));
  it("partial: 'de' → 'de-DE'", () => expect(getLocale("de")).toBe("de-DE"));
  it("partial: 'ja' → 'ja-JP'", () => expect(getLocale("ja")).toBe("ja-JP"));
  it("unsupported: 'fr-FR' → 'en-US'", () => expect(getLocale("fr-FR")).toBe("en-US"));
  it("unsupported: 'zh-CN' → 'en-US'", () => expect(getLocale("zh-CN")).toBe("en-US"));
  it("empty string → 'en-US'", () => expect(getLocale("")).toBe("en-US"));
  // Case-insensitive exact match: 'EN-US' normalises to 'en-US'
  it("case-insensitive: 'EN-US' → 'en-US'", () => expect(getLocale("EN-US")).toBe("en-US"));
});

describe("formatDate", () => {
  // Jan 15 2026, 14:30 local time
  const date = new Date(2026, 0, 15, 14, 30);

  it("returns a non-empty string for en-US", () => {
    expect(formatDate(date, "en-US").length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for de-DE", () => {
    expect(formatDate(date, "de-DE").length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for ja-JP", () => {
    expect(formatDate(date, "ja-JP").length).toBeGreaterThan(0);
  });

  it("en-US result contains a month name (not just numbers)", () => {
    // dateStyle:'medium' for en-US → e.g. "Jan 15, 2026, 2:30 PM"
    expect(formatDate(date, "en-US")).toMatch(/Jan/i);
  });
});
