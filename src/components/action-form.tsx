"use client";

import { useRouter } from "next/navigation";

export type ActionResult = { to?: string } | void;

/**
 * Form for server actions that return `{ to }`; the browser navigates.
 * Avoids `redirect()` inside the action, which on Lambda makes Next request the next page
 * from itself and fall into a Clerk redirect loop (slow and error-prone).
 */
export function ActionForm({
  action,
  hard,
  className,
  children,
}: {
  action: () => Promise<ActionResult>;
  hard?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <form
      className={className}
      action={async () => {
        const res = await action();
        if (!res?.to) {
          return;
        }
        if (hard) {
          window.location.assign(res.to);
        } else {
          router.push(res.to);
        }
      }}
    >
      {children}
    </form>
  );
}
