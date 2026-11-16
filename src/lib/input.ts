/** Reads an untrusted form value as a string of at most `max` characters. */
export const str = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
