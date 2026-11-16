"use client";

import Link from "next/link";
import { Check, LoaderCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { deleteAccountAction, saveProfileAction, type ProfileState } from "@/app/actions/profile";
import { ChoiceChip } from "@/components/choice-chip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormActions } from "@/components/form-actions";
import { Notice } from "@/components/notice";
import { CountryCombobox } from "@/components/country-combobox";
import { SocialHandleField } from "@/components/social-handle-field";
import { MEMBERS, type Social } from "@/lib/catalog";
import type { Dict } from "@/lib/i18n";

type Profile = { name: string; social?: Social; handle: string; country: string; bias: string } | undefined;

export function ProfileForm({ t, profile, countries, returnTo }: { t: Dict; profile: Profile; countries: { code: string; name: string }[]; returnTo: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfileAction, undefined);
  const router = useRouter();
  useEffect(() => {
    if (state?.to) {
      router.push(state.to);
    }
  }, [state, router]);
  const error = state?.error === "nickname" ? t.nicknameError : state?.error === "consent" ? t.consentError : state?.error === "rate" ? t.rateError : null;

  return (
    <>
      <form action={action} className="panel flex flex-col gap-7 p-5 sm:p-7">
        <input type="hidden" name="next" value={returnTo} />

        <label className="flex flex-col gap-2">
          <span className="label">{t.nickname}</span>
          <input name="nickname" required minLength={2} maxLength={30} defaultValue={profile?.name} placeholder={t.nicknamePh} aria-invalid={state?.error === "nickname"} className="field" />
          <span className={`text-xs ${state?.error === "nickname" ? "text-red" : "text-ink-soft"}`}>{state?.error === "nickname" ? t.nicknameError : t.nicknameHint}</span>
        </label>

        <SocialHandleField defaultSocial={profile?.social ?? "instagram"} defaultHandle={profile?.handle ?? ""} t={t} />

        <label className="flex flex-col gap-2">
          <span className="label">{t.onbCountry}</span>
          <CountryCombobox name="country" countries={countries} defaultValue={profile?.country} placeholder={t.searchCountry} emptyText={t.noResults} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2">{t.onbBias}</legend>
          <div className="grid grid-cols-4 gap-2">
            {MEMBERS.map((m) => (
              <ChoiceChip key={m} tone="purple" name="bias" value={m} required defaultChecked={profile?.bias === m} className="h-11 items-center justify-center rounded-xl px-1">
                {m}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        {!profile && (
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 text-sm">
            <input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-5 shrink-0 accent-red" />
            <span>
              {t.consent}{" "}
              <Link href="/privacidad" target="_blank" className="font-semibold underline underline-offset-2">{t.privacy}</Link>
            </span>
          </label>
        )}

        {error && state?.error !== "nickname" && (
          <Notice tone="error">{error}</Notice>
        )}

        <FormActions cancelHref={profile ? returnTo : undefined} cancelLabel={t.cancel}>
          <button disabled={pending} className="btn-primary">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />} {t.save}
          </button>
        </FormActions>
      </form>

      {profile && (
        <div className="mt-8 flex flex-col items-center gap-2 text-sm">
          <Link href="/privacidad" className="text-ink-soft underline underline-offset-4">{t.privacy}</Link>
          <ConfirmDialog
            action={deleteAccountAction}
            hard
            message={t.deleteAccountConfirm}
            cancelLabel={t.cancel}
            triggerClassName="btn-ghost text-red hover:bg-red/5 hover:text-red"
            trigger={
              <>
                <Trash className="size-4" /> {t.deleteAccount}
              </>
            }
            confirm={
              <>
                <Trash className="size-4" /> {t.delete}
              </>
            }
          />
        </div>
      )}
    </>
  );
}
