import { Header } from "@/components/header";
import { EventPicker } from "@/components/event-picker";
import { suggestedEvent } from "@/lib/events";
import { getDict } from "@/lib/locale";
import { meWithProfile } from "@/lib/me";
import { NewFreebieForm } from "./form";

export const dynamic = "force-dynamic";

export default async function Nuevo() {
  const [, { locale, t }] = await Promise.all([meWithProfile("/nuevo"), getDict()]);
  return (
    <>
      <Header back="/binder?tab=made" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">{t.newTitle}</h1>
        <NewFreebieForm t={t} eventPicker={<EventPicker locale={locale} defaultValue={suggestedEvent()} otherLabel={t.evOther} />} />
      </main>
    </>
  );
}
