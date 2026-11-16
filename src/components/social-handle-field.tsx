"use client";

import { AtSign, CircleAlert } from "lucide-react";
import { useState } from "react";
import { SOCIALS, normalizeHandle, type Social } from "@/lib/catalog";
import { ChoiceChip } from "./choice-chip";
import { SocialIcon } from "./social-icon";

export function SocialHandleField({
  defaultSocial,
  defaultHandle,
  t,
}: {
  defaultSocial: Social;
  defaultHandle: string;
  t: { socialNetwork: string; handlePh: string; handleInvalid: string; handleHint: string };
}) {
  const [social, setSocial] = useState<Social>(defaultSocial);
  const [raw, setRaw] = useState(defaultHandle);
  const handle = normalizeHandle(raw);
  const invalid = handle.length > 0 && !SOCIALS[social].pattern.test(handle);

  return (
    <div className="flex flex-col gap-3">
      <span className="label">{t.socialNetwork}</span>
      <div role="radiogroup" aria-label={t.socialNetwork} className="grid grid-cols-4 gap-2">
        {(Object.keys(SOCIALS) as Social[]).map((s) => (
          <ChoiceChip key={s} tone="ink" name="social" value={s} checked={social === s} onChange={() => setSocial(s)} className="h-full flex-col items-center gap-1.5 px-1 py-3 text-xs">
            <SocialIcon social={s} className="size-5" />
            {SOCIALS[s].label}
          </ChoiceChip>
        ))}
      </div>
      <div className="relative">
        <AtSign className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => setRaw(handle)}
          placeholder={t.handlePh}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid}
          className={`field pl-10 ${invalid ? "border-red ring-4 ring-red/10" : ""}`}
        />
        {/* The submitted value never includes @ or a URL */}
        <input type="hidden" name="handle" value={invalid ? "" : handle} />
      </div>
      <p className={`flex items-center gap-1.5 text-xs ${invalid ? "text-red" : "text-ink-soft"}`}>
        {invalid && <CircleAlert className="size-3.5" />}
        {invalid ? t.handleInvalid.replace("{net}", SOCIALS[social].label) : t.handleHint}
      </p>
    </div>
  );
}
