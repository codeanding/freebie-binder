import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, BookHeart, QrCode, Stamp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Seal } from "@/components/brand";
import { Header } from "@/components/header";
import { getDict } from "@/lib/locale";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/binder");
  }
  const { t } = await getDict();

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-5 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
        <section className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          <h1 className="font-display text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">{t.tagline}</h1>
          <SignInButton mode="modal" forceRedirectUrl="/binder" signUpForceRedirectUrl="/onboarding">
            <button className="btn-primary px-8 text-lg">
              {t.start} <ArrowRight className="size-5" />
            </button>
          </SignInButton>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-soft md:justify-start">
            <li className="inline-flex items-center gap-1.5"><QrCode className="size-4 text-red" /> QR</li>
            <li className="inline-flex items-center gap-1.5"><Stamp className="size-4 text-red" /> 도장</li>
            <li className="inline-flex items-center gap-1.5"><BookHeart className="size-4 text-purple" /> Binder</li>
          </ul>
        </section>

        <section aria-hidden className="relative mx-auto h-64 w-full max-w-[18rem] sm:h-80 sm:max-w-sm">
          {[
            "left-2 top-8 -rotate-12 from-ink to-ink/80",
            "left-1/2 top-0 -translate-x-1/2 rotate-2 from-red to-red-deep z-10",
            "right-2 top-10 rotate-12 from-paper-deep to-card",
          ].map((cls, i) => (
            <div key={i} className={`sleeve absolute w-32 rounded-2xl sm:w-40 bg-gradient-to-br shadow-2xl ring-1 ring-ink/10 ${cls}`}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
            </div>
          ))}
          <Seal animate className="absolute right-6 bottom-4 z-20 size-24 text-xl" />
        </section>
      </main>
      <footer className="flex flex-col items-center gap-1 pb-6 text-center text-xs text-ink-soft">
        <span>{t.footer}</span>
        <Link href="/privacidad" className="underline underline-offset-4">{t.privacy}</Link>
      </footer>
    </>
  );
}
