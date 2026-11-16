import { DEFAULT_SOCIAL } from "./catalog";
import type { Collected } from "./db/types";

export type Friend = Pick<Collected, "ownerId" | "ownerName" | "ownerHandle" | "ownerSocial" | "ownerCountry"> & {
  freebies: number;
};

/** The ARMY you met: everyone who gave you at least one freebie, in binder order. */
export function friendsFrom(collected: Collected[]): Friend[] {
  const byOwner = new Map<string, Friend>();
  for (const c of collected) {
    // Old entries may lack ownerId
    const key = c.ownerId ?? `${c.ownerHandle}|${c.ownerName}`;
    const friend = byOwner.get(key);
    if (friend) {
      friend.freebies++;
    } else {
      byOwner.set(key, {
        ownerId: key,
        ownerName: c.ownerName,
        ownerHandle: c.ownerHandle,
        ownerSocial: c.ownerSocial ?? DEFAULT_SOCIAL,
        ownerCountry: c.ownerCountry,
        freebies: 1,
      });
    }
  }
  return [...byOwner.values()];
}
