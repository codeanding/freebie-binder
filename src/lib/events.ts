import type { Locale } from "./i18n";

/**
 * Latin American stops of BTS WORLD TOUR 'ARIRANG' (2026).
 * Change these and `EVENTS` to reuse the app for another tour.
 */
export const CITIES = {
  cdmx: { name: "Ciudad de México", flag: "MX", venue: "Estadio GNP Seguros" },
  bogota: { name: "Bogotá", flag: "CO", venue: "Estadio El Campín" },
  lima: { name: "Lima", flag: "PE", venue: "Estadio San Marcos" },
  santiago: { name: "Santiago", flag: "CL", venue: "Estadio Nacional" },
  laplata: { name: "La Plata", flag: "AR", venue: "Estadio Único Diego Armando Maradona" },
  saopaulo: { name: "São Paulo", flag: "BR", venue: "Estádio MorumBIS" },
} as const;

export type CityId = keyof typeof CITIES;
export type City = CityId | "otro";

export const EVENTS = [
  { id: "cdmx-2026-05-07", city: "cdmx", date: "2026-05-07" },
  { id: "cdmx-2026-05-09", city: "cdmx", date: "2026-05-09" },
  { id: "cdmx-2026-05-10", city: "cdmx", date: "2026-05-10" },
  { id: "bogota-2026-10-02", city: "bogota", date: "2026-10-02" },
  { id: "bogota-2026-10-03", city: "bogota", date: "2026-10-03" },
  { id: "lima-2026-10-07", city: "lima", date: "2026-10-07" },
  { id: "lima-2026-10-09", city: "lima", date: "2026-10-09" },
  { id: "lima-2026-10-10", city: "lima", date: "2026-10-10" },
  { id: "santiago-2026-10-14", city: "santiago", date: "2026-10-14" },
  { id: "santiago-2026-10-16", city: "santiago", date: "2026-10-16" },
  { id: "santiago-2026-10-17", city: "santiago", date: "2026-10-17" },
  { id: "laplata-2026-10-21", city: "laplata", date: "2026-10-21" },
  { id: "laplata-2026-10-23", city: "laplata", date: "2026-10-23" },
  { id: "laplata-2026-10-24", city: "laplata", date: "2026-10-24" },
  { id: "saopaulo-2026-10-28", city: "saopaulo", date: "2026-10-28" },
  { id: "saopaulo-2026-10-30", city: "saopaulo", date: "2026-10-30" },
  { id: "saopaulo-2026-10-31", city: "saopaulo", date: "2026-10-31" },
  { id: "otro", city: "otro", date: null },
] as const satisfies readonly { id: string; city: City; date: string | null }[];

export type EventId = (typeof EVENTS)[number]["id"];
export type EventInfo = { city: City; date: string | null };

export const OTHER_EVENT: EventId = "otro";

/** Dated events in one city, in tour order. */
export function eventsIn(city: CityId): { id: EventId; date: string }[] {
  return EVENTS.flatMap((e) => (e.city === city && e.date ? [{ id: e.id, date: e.date }] : []));
}

export const isEventId = (value: unknown): value is EventId => EVENTS.some((e) => e.id === value);

/** Also understands the undated ids from the first version ("lima-2026", "santiago-2026"). */
export function eventInfo(id: string): EventInfo {
  const found = EVENTS.find((e) => e.id === id);
  if (found) {
    return found;
  }
  const city = (Object.keys(CITIES) as CityId[]).find((c) => id.startsWith(c));
  return { city: city ?? "otro", date: null };
}

/** Next tour date (or today's), used as the suggested option when uploading a freebie. */
export function suggestedEvent(today = new Date()): EventId {
  const day = today.toISOString().slice(0, 10);
  return EVENTS.find((e) => e.date && e.date >= day)?.id ?? OTHER_EVENT;
}

/** "vie 9 oct" in the given locale. Dates are stored as UTC days. */
export function formatEventDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** Short label for a freebie's event: "Lima · vie 9 oct". */
export function eventLabel(info: EventInfo, locale: Locale, otherLabel: string): string {
  if (info.city === "otro") {
    return otherLabel;
  }
  const city = CITIES[info.city];
  return `${city.name} · ${info.date ? formatEventDate(info.date, locale) : city.venue}`;
}
