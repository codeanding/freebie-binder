/** Only known internal routes: prevents open redirects (`//evil.com`, `/\evil.com`). */
export function safeNext(next: unknown, fallback = "/binder"): string {
  if (typeof next !== "string") {
    return fallback;
  }
  return /^\/(binder(\?tab=(made|friends))?|nuevo|f\/[a-z0-9]{10})$/.test(next) ? next : fallback;
}
