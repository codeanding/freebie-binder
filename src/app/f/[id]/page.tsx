import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { BookHeart, CalendarDays, Check, Flag as FlagIcon, Heart, Plus } from "lucide-react";
import { collectAction, deleteAction, reportAction } from "@/app/actions/freebie";
import { ActionForm } from "@/components/action-form";
import { Seal } from "@/components/brand";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Flag } from "@/components/flag";
import { Handle } from "@/components/handle";
import { Header } from "@/components/header";
import { Notice } from "@/components/notice";
import { Sleeve } from "@/components/sleeve";
import { SubmitButton } from "@/components/submit-button";
import { getFreebie, hasCollected } from "@/lib/db";
import { eventInfo, eventLabel } from "@/lib/events";
import { imageUrl } from "@/lib/images";
import { getDict } from "@/lib/locale";
import { absoluteUrl } from "@/lib/url";
import { OwnerActions } from "./owner-actions";

export const dynamic = "force-dynamic";

export default async function FreebiePage({ params, searchParams }: PageProps<"/f/[id]">) {
  const [{ id }, { r }] = await Promise.all([params, searchParams]);
  const [{ userId }, freebie, { locale, t }] = await Promise.all([auth(), getFreebie(id), getDict()]);

  if (!freebie || freebie.hidden) {
    return (
      <>
        <Header back="/binder" />
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="font-display text-xl">{t.notFound}</p>
          <Link href="/binder" className="btn-secondary">
            <BookHeart className="size-4" />
            {t.myBinder}
          </Link>
        </main>
      </>
    );
  }

  const isOwner = userId === freebie.ownerId;
  const collected = !!userId && !isOwner && (await hasCollected(userId, id));
  const justCollected = r === "ok";

  return (
    <>
      <Header back={isOwner ? "/binder?tab=made" : "/binder"} />
      <main className="mx-auto grid w-full max-w-4xl flex-1 items-start gap-8 px-4 py-8 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-12 md:py-12">
        <div className="relative mx-auto w-64 md:w-full">
          <Sleeve src={imageUrl(freebie.imageKey)} alt={freebie.title} className="rounded-2xl shadow-[0_24px_48px_-24px_rgb(23_18_15/0.6)]" />
          {collected && (
            <Seal animate={justCollected} className="absolute -right-3 -bottom-3 size-24 -rotate-12 bg-card/85 text-lg shadow-lg" />
          )}
        </div>

        <section className="flex flex-col gap-6">
          {r === "reported" && <Notice>{t.reported}</Notice>}
          {r === "rate" && <Notice>{t.rateError}</Notice>}
          {justCollected && (
            <Notice tone="success" icon={<Check className="size-5" />}>
              {t.collectedOk}
            </Notice>
          )}

          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl leading-tight font-bold text-balance">{freebie.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-2">
                {t.madeBy} <Flag code={freebie.ownerCountry} />
                <Handle social={freebie.ownerSocial} handle={freebie.ownerHandle} fallback={freebie.ownerName} />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {eventLabel(eventInfo(freebie.event), locale, t.evOther)}
              </span>
            </div>
          </div>

          {freebie.description && (
            <blockquote className="relative rounded-2xl border-l-4 border-red bg-card px-5 py-4 font-display text-lg text-balance">
              {freebie.description}
            </blockquote>
          )}

          <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <Heart className="size-4 fill-red text-red" />
            <b className="text-ink">{freebie.collectCount}</b> {t.collectors}
          </p>

          <div className="flex flex-col gap-3 border-t border-line pt-6">
            {!userId ? (
              <SignInButton mode="modal" forceRedirectUrl={`/f/${id}`} signUpForceRedirectUrl={`/onboarding?next=/f/${id}`}>
                <button className="btn-primary w-full py-3.5 text-base">
                  <Plus className="size-5" /> {t.collectCta}
                </button>
              </SignInButton>
            ) : isOwner ? (
              <OwnerActions url={await absoluteUrl(`/f/${id}`)} title={freebie.title} deleteAction={deleteAction.bind(null, id)} t={t} />
            ) : collected ? (
              <Link href="/binder" className="btn-secondary w-full py-3.5 text-base">
                <BookHeart className="size-5" /> {t.myBinder}
              </Link>
            ) : (
              <ActionForm action={collectAction.bind(null, id)}>
                <SubmitButton pendingLabel={t.collecting} className="btn-primary w-full py-3.5 text-base">
                  <Plus className="size-5" /> {t.collectCta}
                </SubmitButton>
              </ActionForm>
            )}
            {userId && !isOwner && r !== "reported" && (
              <ConfirmDialog
                action={reportAction.bind(null, id)}
                message={t.reportConfirm}
                cancelLabel={t.cancel}
                triggerClassName="btn-ghost mx-auto text-sm"
                trigger={
                  <>
                    <FlagIcon className="size-4" /> {t.report}
                  </>
                }
                confirm={
                  <>
                    <FlagIcon className="size-4" /> {t.report}
                  </>
                }
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
