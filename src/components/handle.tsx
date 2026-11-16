import { DEFAULT_SOCIAL, SOCIALS, isSocial } from "@/lib/catalog";
import { SocialIcon } from "./social-icon";

/** @username with its network icon, optionally linking to the profile. Falls back to the nickname. */
export function Handle({
  social,
  handle,
  fallback,
  link = true,
  className = "font-semibold",
}: {
  social?: string;
  handle: string;
  fallback: string;
  link?: boolean;
  className?: string;
}) {
  if (!handle) {
    return <span className={`truncate ${className}`}>{fallback}</span>;
  }
  const net = social && isSocial(social) ? social : DEFAULT_SOCIAL;
  const content = (
    <>
      <SocialIcon social={net} className="size-3.5 shrink-0" />
      <span className="truncate">@{handle}</span>
    </>
  );
  if (!link) {
    return <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>{content}</span>;
  }
  return (
    <a
      href={SOCIALS[net].url(handle)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-w-0 items-center gap-1 hover:text-red ${className}`}
    >
      {content}
    </a>
  );
}
