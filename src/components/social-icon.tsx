import { siInstagram, siThreads, siTiktok, siX } from "simple-icons";
import type { Social } from "@/lib/catalog";

const ICONS = { instagram: siInstagram, x: siX, tiktok: siTiktok, threads: siThreads } satisfies Record<Social, { path: string }>;

export function SocialIcon({ social, className = "size-4" }: { social: Social; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={ICONS[social].path} />
    </svg>
  );
}
