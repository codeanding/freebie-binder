// Contact details in public text: phone numbers, links and messaging apps
const CONTACT = [
  /https?:\/\//i,
  /\bwww\./i,
  /\b[a-z0-9-]+\.(com|net|org|io|me|ly|gg|link)\b/i,
  /(?:\d[\s.-]?){7,}/,
  /\b(whats\s?app|wsp|wpp|telegram|t\.me|wa\.me|kakao|line\s?id|snap(chat)?)\b/i,
];

/** True when none of the texts contains contact details. */
export function textIsSafe(...texts: string[]): boolean {
  return texts.every((t) => !CONTACT.some((re) => re.test(t)));
}
