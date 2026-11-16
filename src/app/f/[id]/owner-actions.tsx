"use client";

import { Check, Ellipsis, QrCode, Share2, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import type { ActionResult } from "@/components/action-form";
import { ConfirmModal } from "@/components/confirm-dialog";

type T = { showQr: string; qrHint: string; share: string; linkCopied: string; close: string; moreActions: string; delete: string; confirmDelete: string; cancel: string };

export function OwnerActions({ url, title, deleteAction, t }: { url: string; title: string; deleteAction: () => Promise<ActionResult>; t: T }) {
  const qrRef = useRef<HTMLDialogElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    }
  }

  return (
    <>
      <div className="flex w-full items-center gap-2">
        <button onClick={() => qrRef.current?.showModal()} className="btn-primary flex-1 py-3.5 text-base">
          <QrCode className="size-5" /> {t.showQr}
        </button>
        <button onClick={share} className="btn-secondary size-[52px] shrink-0 p-0" aria-label={t.share} title={t.share}>
          {copied ? <Check className="size-5 text-red" /> : <Share2 className="size-5" />}
        </button>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} className="btn-secondary size-[52px] p-0" aria-label={t.moreActions} aria-expanded={menu}>
            <Ellipsis className="size-5" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
              <div className="absolute right-0 bottom-full z-40 mb-2 w-48 rounded-2xl border border-line bg-card p-1.5 shadow-xl">
                <button
                  onClick={() => {
                    setMenu(false);
                    deleteRef.current?.showModal();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red hover:bg-red/5"
                >
                  <Trash className="size-4" /> {t.delete}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {copied && <p role="status" className="text-sm text-ink-soft">{t.linkCopied}</p>}

      {/* Full-screen QR on white: scans better in low light */}
      <dialog ref={qrRef} className="m-auto w-[min(92vw,26rem)] rounded-3xl bg-white p-0 backdrop:bg-ink/70 backdrop:backdrop-blur-sm" onClick={(e) => e.target === qrRef.current && qrRef.current?.close()}>
        <div className="flex flex-col items-center gap-5 p-6 text-center text-ink">
          <div className="flex w-full items-center justify-between">
            <p className="truncate font-display text-lg font-bold">{title}</p>
            <button onClick={() => qrRef.current?.close()} className="btn-ghost size-10 p-0" aria-label={t.close}><X className="size-5" /></button>
          </div>
          <QRCode value={url} size={512} style={{ width: "100%", height: "auto" }} />
          <p className="text-sm text-ink-soft">{t.qrHint}</p>
        </div>
      </dialog>

      <ConfirmModal
        ref={deleteRef}
        action={deleteAction}
        message={t.confirmDelete}
        cancelLabel={t.cancel}
        confirm={
          <>
            <Trash className="size-4" /> {t.delete}
          </>
        }
      />
    </>
  );
}
