import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { getDict } from "@/lib/locale";
import { Logo, Stamp } from "./brand";
import { LanguageSwitcher } from "./language-switcher";

export async function Header({ back }: { back?: string }) {
  const { locale, t } = await getDict();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
          {back && (
            <Link href={back} className="btn-ghost -ml-2 size-10 p-0" aria-label={t.back}>
              <ArrowLeft className="size-5" />
            </Link>
          )}
          <Link href="/" className="min-w-0" aria-label="Freebie Binder">
            <span className="sm:hidden">
              <Stamp />
            </span>
            <span className="hidden sm:inline">
              <Logo />
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={t.language} />
          <Show when="signed-in">
            <div className="grid size-10 place-items-center">
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
