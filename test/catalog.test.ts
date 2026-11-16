import { describe, expect, it } from "vitest";
import { normalizeHandle, normalizeNickname } from "@/lib/catalog";

describe("normalizeHandle", () => {
  it.each([
    ["@army.lu", "army.lu"],
    ["  army.lu ", "army.lu"],
    ["https://instagram.com/army.lu", "army.lu"],
    ["https://www.tiktok.com/@army.lu?lang=es", "army.lu"],
    ["https://x.com/army_lu/", "army_lu"],
  ])("%j → %j", (raw, expected) => {
    expect(normalizeHandle(raw)).toBe(expected);
  });
});

describe("normalizeNickname", () => {
  it("collapses spaces", () => {
    expect(normalizeNickname("  Lu   ARMY ")).toBe("Lu ARMY");
  });

  it("accepts any script", () => {
    expect(normalizeNickname("지민 팬")).toBe("지민 팬");
  });

  it.each(["a", "x".repeat(31), "lu@mail.com", "<script>"])("rejects %j", (raw) => {
    expect(normalizeNickname(raw)).toBeNull();
  });
});
