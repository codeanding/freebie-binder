import { Header } from "@/components/header";
import { COUNTRIES } from "@/lib/catalog";
import { getDict } from "@/lib/locale";
import { me } from "@/lib/me";
import { safeNext } from "@/lib/safe-next";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function Onboarding({ searchParams }: PageProps<"/onboarding">) {
  const { next } = await searchParams;
  const [{ profile }, { locale, t }] = await Promise.all([me(), getDict()]);
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const countries = COUNTRIES.map((c) => ({ code: c, name: names.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name, locale));
  const returnTo = safeNext(next);

  return (
    <>
      <Header back={profile ? returnTo : undefined} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">{profile ? t.editProfile : t.onbTitle}</h1>
        <ProfileForm t={t} profile={profile} countries={countries} returnTo={returnTo} />
      </main>
    </>
  );
}
