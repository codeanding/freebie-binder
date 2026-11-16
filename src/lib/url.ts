import "server-only";
import { headers } from "next/headers";

/** Absolute URL for a path on the current host (behind CloudFront, from the forwarded headers). */
export async function absoluteUrl(path: string): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}${path}`;
}
