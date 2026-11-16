import Link from "next/link";

/** Form footer: optional Cancel link and the submit button. */
export function FormActions({ cancelHref, cancelLabel, children }: { cancelHref?: string; cancelLabel: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
      {cancelHref && (
        <Link href={cancelHref} className="btn-secondary">
          {cancelLabel}
        </Link>
      )}
      {children}
    </div>
  );
}
