/** Red "아미" (ARMY) seal stamp, used as the app icon. */
export function Stamp({ className = "" }: { className?: string }) {
  return (
    <span className={`grid size-8 -rotate-6 place-items-center rounded-lg bg-red text-[11px] leading-none font-bold text-white shadow-sm ${className}`}>
      아미
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <Stamp />
      <span className="font-display text-lg font-bold tracking-tight">Freebie Binder</span>
    </span>
  );
}

/** Round "보라해" (I purple you) seal, stamped on collected freebies. */
export function Seal({ className = "", animate = false }: { className?: string; animate?: boolean }) {
  return (
    <span
      className={`grid place-items-center rounded-full border-4 border-red text-center font-display font-bold text-red ${animate ? "animate-stamp" : ""} ${className}`}
    >
      보라해
    </span>
  );
}
