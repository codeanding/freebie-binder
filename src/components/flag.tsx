import { Globe } from "lucide-react";
import { COUNTRIES } from "@/lib/catalog";

/** SVG flag (flag emojis don't render on Windows). */
export function Flag({ code, className = "h-3.5" }: { code: string; className?: string }) {
  if (!COUNTRIES.includes(code)) {
    return <Globe className={`${className} w-auto text-ink-soft`} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/flags/${code}.svg`} alt="" className={`${className} inline-block aspect-[3/2] rounded-[3px] object-cover shadow-[0_0_0_1px_rgb(0_0_0/0.08)]`} />
  );
}
