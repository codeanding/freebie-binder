import { describe, expect, it } from "vitest";
import { isBlocked } from "@/lib/moderation";

describe("isBlocked", () => {
  it("lets an image without labels through", () => {
    expect(isBlocked([])).toBe(false);
  });

  it("blocks a blocked level-1 category", () => {
    expect(isBlocked([{ Name: "Explicit" }])).toBe(true);
  });

  it("blocks a level-2 label through its parent", () => {
    expect(isBlocked([{ Name: "Graphic Violence", ParentName: "Violence" }])).toBe(true);
  });

  it("blocks kissing, which lives under a blocked category", () => {
    expect(isBlocked([{ Name: "Kissing on the Lips", ParentName: "Non-Explicit Nudity of Intimate parts and Kissing" }])).toBe(true);
  });

  it.each(["Swimwear or Underwear", "Alcohol", "Drugs & Tobacco", "Gambling"])("lets %s through", (name) => {
    expect(isBlocked([{ Name: name }, { Name: `Child of ${name}`, ParentName: name }])).toBe(false);
  });
});
