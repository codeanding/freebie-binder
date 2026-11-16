import { describe, expect, it } from "vitest";
import { textIsSafe } from "@/lib/text-safety";

describe("textIsSafe", () => {
  it.each(["Photocard de Jimin", "Pulsera Borahae 💜", "Hecho con amor para ARMY", ""])("accepts %j", (text) => {
    expect(textIsSafe(text)).toBe(true);
  });

  it.each([
    "WhatsApp 987 654 321",
    "escríbeme al 987654321",
    "https://example.com",
    "www.example.com",
    "mi tienda en example.com",
    "telegram: @army",
    "t.me/army",
  ])("rejects %j", (text) => {
    expect(textIsSafe(text)).toBe(false);
  });

  it("rejects long dates too, a known false positive", () => {
    expect(textIsSafe("2026.11.16")).toBe(false);
  });

  it("checks every text it receives", () => {
    expect(textIsSafe("ok", "wa.me/51987654321")).toBe(false);
  });
});
