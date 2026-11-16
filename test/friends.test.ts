import { describe, expect, it } from "vitest";
import type { Collected } from "@/lib/db/types";
import { friendsFrom } from "@/lib/friends";

const item = (id: string, ownerId: string, ownerName: string): Collected => ({
  id,
  title: id,
  imageKey: `freebies/${id}.jpg`,
  ownerId,
  ownerName,
  ownerHandle: ownerName.toLowerCase(),
  ownerSocial: "instagram",
  ownerCountry: "PE",
  event: "otro",
  at: 0,
});

describe("friendsFrom", () => {
  it("groups freebies by who gave them", () => {
    const friends = friendsFrom([item("a", "u1", "Lu"), item("b", "u2", "Bia"), item("c", "u1", "Lu")]);
    expect(friends).toEqual([
      expect.objectContaining({ ownerId: "u1", ownerName: "Lu", freebies: 2 }),
      expect.objectContaining({ ownerId: "u2", ownerName: "Bia", freebies: 1 }),
    ]);
  });

  it("returns an empty list for an empty binder", () => {
    expect(friendsFrom([])).toEqual([]);
  });
});
