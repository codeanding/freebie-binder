import { describe, expect, it } from "vitest";
import { newFreebieId, parseFreebieId } from "@/lib/ids";

describe("freebie ids", () => {
  it("generates ids that parse back", () => {
    const id = newFreebieId();
    expect(id).toHaveLength(10);
    expect(parseFreebieId(id)).toBe(id);
  });

  it("accepts hand-made demo ids", () => {
    expect(parseFreebieId("demopulsr1")).toBe("demopulsr1");
  });

  it.each(["short", "ABCDEFGHIJ", "abc/../xyz", "abcdefghijk", null, 123])("rejects %j", (value) => {
    expect(parseFreebieId(value)).toBeNull();
  });
});
