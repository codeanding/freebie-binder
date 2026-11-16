import { describe, expect, it } from "vitest";
import { eventInfo, eventLabel, eventsIn, isEventId, suggestedEvent } from "@/lib/events";

describe("events", () => {
  it("lists a city's dates in order", () => {
    expect(eventsIn("lima").map((e) => e.date)).toEqual(["2026-10-07", "2026-10-09", "2026-10-10"]);
  });

  it("understands the undated ids from the first version", () => {
    expect(eventInfo("santiago-2026")).toEqual({ city: "santiago", date: null });
    expect(eventInfo("unknown")).toEqual({ city: "otro", date: null });
  });

  it("formats a label with the city and date", () => {
    expect(eventLabel(eventInfo("lima-2026-10-09"), "es", "Otro")).toMatch(/^Lima · .*9.*oct/);
    expect(eventLabel(eventInfo("lima-2026"), "es", "Otro")).toBe("Lima · Estadio San Marcos");
    expect(eventLabel(eventInfo("otro"), "es", "Otro")).toBe("Otro");
  });

  it("suggests the next show, or 'otro' after the tour", () => {
    expect(suggestedEvent(new Date("2026-10-08T12:00:00Z"))).toBe("lima-2026-10-09");
    expect(suggestedEvent(new Date("2027-01-01T00:00:00Z"))).toBe("otro");
  });

  it("validates event ids", () => {
    expect(isEventId("bogota-2026-10-02")).toBe(true);
    expect(isEventId("lima-2030-01-01")).toBe(false);
  });
});
