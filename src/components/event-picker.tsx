import { CalendarDays, MapPin } from "lucide-react";
import { CITIES, OTHER_EVENT, eventsIn, formatEventDate, type CityId } from "@/lib/events";
import type { Locale } from "@/lib/i18n";
import { ChoiceChip } from "./choice-chip";
import { Flag } from "./flag";

/** Radio group with every tour date, grouped by city, plus "other event". */
export function EventPicker({ locale, defaultValue, otherLabel }: { locale: Locale; defaultValue: string; otherLabel: string }) {
  const cities = (Object.keys(CITIES) as CityId[]).map((id) => ({ id, ...CITIES[id], events: eventsIn(id) }));

  return (
    <div className="flex flex-col gap-4">
      {cities.map((city) => (
        <div key={city.id} className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm">
            <Flag code={city.flag} />
            <span className="font-semibold">{city.name}</span>
            <span className="inline-flex min-w-0 items-center gap-1 truncate text-ink-soft">
              <MapPin className="size-3.5 shrink-0" />
              {city.venue}
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {city.events.map((e) => (
              <ChoiceChip key={e.id} name="event" value={e.id} defaultChecked={defaultValue === e.id} required className="flex-col items-center gap-0.5 px-2 py-2.5">
                <CalendarDays className="size-4 opacity-70" />
                {formatEventDate(e.date, locale)}
              </ChoiceChip>
            ))}
          </div>
        </div>
      ))}
      <label className="cursor-pointer">
        <input type="radio" name="event" value={OTHER_EVENT} defaultChecked={defaultValue === OTHER_EVENT} className="peer sr-only" />
        <span className="block rounded-2xl border border-dashed border-line px-4 py-2.5 text-center text-sm text-ink-soft transition peer-checked:border-ink peer-checked:text-ink peer-focus-visible:ring-4 peer-focus-visible:ring-red/20">
          {otherLabel}
        </span>
      </label>
    </div>
  );
}
