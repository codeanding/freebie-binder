const TONES = {
  red: "peer-checked:border-red peer-checked:bg-red peer-checked:text-white peer-focus-visible:ring-red/20",
  ink: "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-red/20",
  purple: "peer-checked:border-purple peer-checked:bg-purple peer-checked:font-semibold peer-checked:text-white peer-focus-visible:ring-purple/20",
} as const;

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

/** A radio button styled as a selectable chip. */
export function ChoiceChip({
  tone = "red",
  className = "",
  children,
  ...radio
}: RadioProps & { tone?: keyof typeof TONES; className?: string; children: React.ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" className="peer sr-only" {...radio} />
      <span className={`flex rounded-2xl border border-line bg-card text-center text-sm transition peer-focus-visible:ring-4 ${TONES[tone]} ${className}`}>
        {children}
      </span>
    </label>
  );
}
