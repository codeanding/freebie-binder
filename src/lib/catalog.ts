/** BTS members for the "bias" field; OT7 means all seven. */
export const MEMBERS = ["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jung Kook", "OT7"] as const;
export type Member = (typeof MEMBERS)[number];
export const isMember = (v: string): v is Member => (MEMBERS as readonly string[]).includes(v);

export const SOCIALS = {
  instagram: { label: "Instagram", pattern: /^[A-Za-z0-9._]{1,30}$/, url: (h: string) => `https://instagram.com/${h}` },
  x: { label: "X", pattern: /^[A-Za-z0-9_]{1,15}$/, url: (h: string) => `https://x.com/${h}` },
  tiktok: { label: "TikTok", pattern: /^[A-Za-z0-9._]{2,24}$/, url: (h: string) => `https://www.tiktok.com/@${h}` },
  threads: { label: "Threads", pattern: /^[A-Za-z0-9._]{1,30}$/, url: (h: string) => `https://www.threads.net/@${h}` },
} as const;
export type Social = keyof typeof SOCIALS;
export const isSocial = (v: string): v is Social => Object.hasOwn(SOCIALS, v);
export const DEFAULT_SOCIAL: Social = "instagram";

/** Strips spaces, leading @ and the URL prefix when someone pastes their profile link. */
export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?[^/]+\/@?/i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@+/, "");
}

// ISO 3166-1 codes; names are shown in each person's language with Intl.DisplayNames
export const COUNTRIES = (
  "AR BO BR CL CO CR CU DO EC SV GT HN MX NI PA PY PE PR UY VE US CA ES PT FR DE IT GB NL BE CH AT " +
  "SE NO DK FI PL IE GR TR RU UA KR JP CN TW HK PH ID MY TH VN SG IN AU NZ ZA EG MA SA AE IL"
).split(" ");

/** Public nickname: 2 to 30 letters (any script), digits, spaces, dot, hyphen or underscore. */
export function normalizeNickname(raw: string): string | null {
  const nick = raw.trim().replace(/\s+/g, " ");
  return /^[\p{L}\p{N} ._-]{2,30}$/u.test(nick) ? nick : null;
}
