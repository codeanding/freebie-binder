import { imageUrl } from "@/lib/images";
import { Flag } from "./flag";
import { Handle } from "./handle";
import { Sleeve } from "./sleeve";

type Props = {
  title: string;
  imageKey: string;
  ownerHandle: string;
  ownerName: string;
  ownerSocial?: string;
  ownerCountry: string;
  badge?: React.ReactNode;
};

/** A photocard in its sleeve: photo, title and who made it. */
export function FreebieCard({ title, imageKey, ownerHandle, ownerName, ownerSocial, ownerCountry, badge }: Props) {
  return (
    <figure className="group flex flex-col gap-2">
      <Sleeve
        src={imageUrl(imageKey)}
        alt={title}
        lazy
        className="rounded-xl shadow-[0_10px_24px_-14px_rgb(23_18_15/0.55)] transition group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
      >
        {badge && <div className="absolute top-1.5 right-1.5">{badge}</div>}
      </Sleeve>
      <figcaption className="min-w-0 px-0.5">
        <p className="truncate text-sm leading-tight font-semibold">{title}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
          <Flag code={ownerCountry} className="h-3" />
          <Handle social={ownerSocial} handle={ownerHandle} fallback={ownerName} link={false} className="" />
        </p>
      </figcaption>
    </figure>
  );
}
