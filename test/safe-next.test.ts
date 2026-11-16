import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext", () => {
  it.each(["/binder", "/binder?tab=made", "/binder?tab=friends", "/nuevo", "/f/abc123xyz9"])("keeps %s", (path) => {
    expect(safeNext(path)).toBe(path);
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "/admin", "/f/short", "/binder?tab=x", undefined, 42])(
    "falls back for %j",
    (value) => {
      expect(safeNext(value)).toBe("/binder");
    },
  );
});
