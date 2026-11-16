import { customAlphabet } from "nanoid";

// No look-alike characters (0/o, 1/l/i), so ids are easy to read from a shared link
export const newFreebieId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

// Validation is looser than the alphabet so hand-made demo ids keep working
const FREEBIE_ID = /^[a-z0-9]{10}$/;

/** Returns the id only if it has the shape of a freebie id; otherwise null. */
export function parseFreebieId(value: unknown): string | null {
  return typeof value === "string" && FREEBIE_ID.test(value) ? value : null;
}
