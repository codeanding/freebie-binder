"use client";

import { ImagePlus, LoaderCircle, RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { publishFreebie, requestUpload, type PublishError } from "@/app/actions/upload";
import { FormActions } from "@/components/form-actions";
import { Notice } from "@/components/notice";
import type { Dict } from "@/lib/i18n";

const MAX_SIDE = 1080;
// Must match MAX_IMAGE_BYTES on the server
const MAX_UPLOAD_BYTES = 2_000_000;

const ERRORS: Record<PublishError, (t: Dict) => string> = {
  invalid: (t) => t.error,
  limit: (t) => t.error,
  image: (t) => t.imageError,
  moderation: (t) => t.moderationError,
  imageText: (t) => t.imageTextError,
  text: (t) => t.textError,
  rate: (t) => t.rateError,
};

/** Shrinks the photo on the device before uploading: stadium networks are slow. */
async function toJpeg(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function NewFreebieForm({ t, eventPicker }: { t: Dict; eventPicker: React.ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    fileRef.current = file;
    setError(null);
    setPreview((old) => {
      if (old) {
        URL.revokeObjectURL(old);
      }
      return URL.createObjectURL(file);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!fileRef.current) {
      setError(t.photoRequired);
      return;
    }
    setBusy(true);
    setError(null);
    const fail = (msg: string) => {
      setError(msg);
      setBusy(false);
    };
    try {
      setStep(t.stepOptimize);
      const [blob, upload] = await Promise.all([toJpeg(fileRef.current), requestUpload()]);
      if ("error" in upload) {
        return fail(t.rateError);
      }
      // Signed POST: S3 enforces the content type and max size set by the server
      const body = new FormData();
      for (const [k, v] of Object.entries(upload.fields)) {
        body.append(k, v);
      }
      body.append("file", blob);
      setStep(t.stepUpload);
      const post = await fetch(upload.url, { method: "POST", body });
      if (!post.ok) {
        return fail(blob.size > MAX_UPLOAD_BYTES ? t.imageError : t.error);
      }
      // On success the action returns the freebie page and the browser navigates there
      setStep(t.stepReview);
      const res = await publishFreebie({
        id: upload.id,
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        event: String(form.get("event") ?? ""),
      });
      if (res.error) {
        return fail(ERRORS[res.error](t));
      }
      if (res.to) {
        router.push(res.to);
      }
    } catch (err) {
      // Next's redirect() propagates as an exception and is not a real error
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      fail(t.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel grid gap-8 p-5 sm:p-7 md:grid-cols-[minmax(0,15rem)_1fr]">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
          className={`sleeve relative flex w-48 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition md:w-full ${
            dragging ? "border-red bg-red/5" : error && !preview ? "border-red" : "border-line bg-paper hover:border-ink/40"
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-card/90 py-2 text-xs font-semibold shadow backdrop-blur">
                <RefreshCw className="size-3.5" /> {t.changePhoto}
              </span>
            </>
          ) : (
            <>
              <span className="grid size-14 place-items-center rounded-full bg-red/10 text-red"><ImagePlus className="size-6" /></span>
              <span className="text-sm font-semibold">
                <span className="md:hidden">{t.choosePhoto}</span>
                <span className="hidden md:inline">{dragging ? t.dropHere : t.dropPhoto}</span>
              </span>
              <span className="text-xs text-ink-soft">{t.photoHint}</span>
            </>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
      </div>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="label">{t.fTitle}</span>
          <input name="title" required maxLength={60} placeholder={t.fTitlePh} className="field" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">{t.fDesc}</span>
          <textarea name="description" maxLength={200} rows={3} className="field resize-none" />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2">{t.event}</legend>
          {eventPicker}
        </fieldset>

        {error && <Notice tone="error">{error}</Notice>}

        <FormActions cancelHref="/binder?tab=made" cancelLabel={t.cancel}>
          <button disabled={busy} className="btn-primary">
            {busy ? <><LoaderCircle className="size-4 animate-spin" />{step || t.uploading}</> : <><Send className="size-4" />{t.publish}</>}
          </button>
        </FormActions>
      </div>
    </form>
  );
}
