import { CircleAlert } from "lucide-react";

const TONES = {
  info: "bg-paper-deep",
  success: "bg-red font-semibold text-white",
  error: "bg-red/10 text-red",
} as const;

/** Inline status or error message. Errors are announced as alerts. */
export function Notice({ tone = "info", icon, children }: { tone?: keyof typeof TONES; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${TONES[tone]}`}>
      {icon ?? (tone === "error" ? <CircleAlert className="size-4 shrink-0" /> : null)}
      {children}
    </p>
  );
}
