/** Dashed placeholder for empty lists. */
export function EmptyState({ icon, text, action }: { icon: React.ReactNode; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center text-ink-soft">
      <span className="grid size-14 place-items-center rounded-full bg-paper-deep text-red [&>svg]:size-6">{icon}</span>
      <p className="max-w-xs text-balance">{text}</p>
      {action}
    </div>
  );
}
