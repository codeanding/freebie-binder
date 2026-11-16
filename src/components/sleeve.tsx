/** Photocard sleeve (55×85 mm) with a plastic shine over the photo. */
export function Sleeve({
  src,
  alt,
  lazy = false,
  className = "",
  children,
}: {
  src: string;
  alt: string;
  lazy?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`sleeve relative overflow-hidden bg-paper-deep ring-1 ring-ink/10 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={lazy ? "lazy" : undefined} className="absolute inset-0 size-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      {children}
    </div>
  );
}
