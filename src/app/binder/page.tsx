import Link from "next/link";
import { BookHeart, Camera, Heart, ImagePlus, Pencil, Plus, QrCode, Stamp, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FreebieCard } from "@/components/freebie-card";
import { Flag } from "@/components/flag";
import { Handle } from "@/components/handle";
import { Header } from "@/components/header";
import { listCollected, listMyFreebies, unavailableFreebies } from "@/lib/db";
import { friendsFrom } from "@/lib/friends";
import { getDict } from "@/lib/locale";
import { meWithProfile } from "@/lib/me";

export const dynamic = "force-dynamic";

const TABS = ["collected", "made", "friends"] as const;

export default async function Binder({ searchParams }: PageProps<"/binder">) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((x) => x === rawTab) ?? "collected";
  const [{ user, profile }, { t }] = await Promise.all([meWithProfile("/binder"), getDict()]);
  const [allCollected, made] = await Promise.all([listCollected(user.id), listMyFreebies(user.id)]);
  // Freebies hidden by reports or deleted by their owner are not shown
  const gone = await unavailableFreebies(allCollected.map((c) => c.id));
  const collected = allCollected.filter((c) => !gone.has(c.id));
  const friends = friendsFrom(collected);
  const countries = [...new Set(collected.map((c) => c.ownerCountry))];
  const isNew = collected.length === 0 && made.length === 0;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-6 pb-28 sm:pb-12">
        <section className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.imageUrl} alt="" className="size-16 shrink-0 rounded-full object-cover ring-4 ring-paper-deep" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold">{t.binderTitle}</h1>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
                <Flag code={profile.country} className="h-3.5" />
                <Handle social={profile.social} handle={profile.handle} fallback={profile.name} link={false} />
                <span className="inline-flex items-center gap-1 text-purple"><Heart className="size-3.5 fill-current" />{profile.bias}</span>
              </div>
            </div>
            <Link href="/onboarding?next=/binder" className="btn-ghost size-10 shrink-0 p-0" aria-label={t.editProfile} title={t.editProfile}>
              <Pencil className="size-4" />
            </Link>
          </div>
          {!isNew && <dl className="grid grid-cols-3 gap-2 sm:w-80">
            <Stat value={collected.length} label={t.statFreebies} />
            <Stat value={countries.length} label={t.statCountries}>
              <div className="mt-1 flex justify-center gap-0.5">{countries.slice(0, 4).map((c) => <Flag key={c} code={c} className="h-2.5" />)}</div>
            </Stat>
            <Stat value={friends.length} label="ARMY" />
          </dl>}
        </section>

        {isNew && (
          <section className="panel p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">{t.howTitle}</h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                [<ImagePlus key="1" />, t.how1, t.how1d],
                [<QrCode key="2" />, t.how2, t.how2d],
                [<Stamp key="3" />, t.how3, t.how3d],
              ].map(([icon, title, desc], i) => (
                <li key={i} className="flex gap-3 sm:flex-col">
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-red/10 text-red [&>svg]:size-5">
                    {icon}
                    <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-paper">{i + 1}</span>
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-ink-soft">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <nav className="flex flex-1 gap-1 overflow-x-auto rounded-full border border-line bg-card p-1 text-sm sm:flex-none">
            <TabLink href="/binder" active={tab === "collected"} icon={<BookHeart className="size-4" />}>{t.collected}</TabLink>
            <TabLink href="/binder?tab=made" active={tab === "made"} icon={<Heart className="size-4" />}>{t.made}</TabLink>
            <TabLink href="/binder?tab=friends" active={tab === "friends"} icon={<Users className="size-4" />}>{t.friends}</TabLink>
          </nav>
          <Link href="/nuevo" className="btn-primary hidden sm:inline-flex"><Plus className="size-4" />{t.uploadCta}</Link>
        </div>

        {tab === "collected" &&
          (collected.length === 0 ? <EmptyState icon={<Camera />} text={t.scanTip} /> : (
            <Grid>{collected.map((f) => <Link key={f.id} href={`/f/${f.id}`}><FreebieCard {...f} /></Link>)}</Grid>
          ))}

        {tab === "made" &&
          (made.length === 0 ? (
            <EmptyState icon={<Heart />} text={t.emptyMade} action={<Link href="/nuevo" className="btn-primary hidden sm:inline-flex"><Plus className="size-4" />{t.uploadCta}</Link>} />
          ) : (
            <Grid>
              {made.filter((f) => !f.hidden).map((f) => (
                <Link key={f.id} href={`/f/${f.id}`}>
                  <FreebieCard {...f} badge={<span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold shadow"><Heart className="size-3 fill-red text-red" />{f.collectCount}</span>} />
                </Link>
              ))}
            </Grid>
          ))}

        {tab === "friends" &&
          (friends.length === 0 ? <EmptyState icon={<Users />} text={t.emptyFriends} /> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {friends.map((f) => (
                <li key={f.ownerId} className="panel flex items-center gap-3 p-4">
                  <Flag code={f.ownerCountry} className="h-6" />
                  <div className="min-w-0 flex-1 text-sm">
                    <Handle social={f.ownerSocial} handle={f.ownerHandle} fallback={f.ownerName} />
                    <p className="text-ink-soft">{f.freebies} {t.statFreebies}</p>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </main>

      <Link href="/nuevo" className="btn-primary fixed inset-x-4 bottom-5 z-20 mx-auto max-w-sm py-3.5 text-base sm:hidden">
        <Plus className="size-5" /> {t.uploadCta}
      </Link>
    </>
  );
}

function Stat({ value, label, children }: { value: number; label: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper px-2 py-3 text-center">
      <dd className="font-display text-2xl leading-none font-bold tabular-nums">{value}</dd>
      <dt className="mt-1 truncate text-xs text-ink-soft">{label}</dt>
      {children}
    </div>
  );
}

function TabLink({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 whitespace-nowrap transition sm:flex-none ${active ? "bg-ink font-semibold text-paper" : "text-ink-soft hover:text-ink"}`}>
      {icon}
      <span className={active ? "" : "hidden sm:inline"}>{children}</span>
    </Link>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">{children}</div>;
}
