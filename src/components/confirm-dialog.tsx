"use client";

import { useRef } from "react";
import { ActionForm, type ActionResult } from "./action-form";

type ModalProps = {
  action: () => Promise<ActionResult>;
  message: string;
  /** Content of the red confirm button (icon + label). */
  confirm: React.ReactNode;
  cancelLabel: string;
  /** Full page navigation after the action, e.g. after deleting the account. */
  hard?: boolean;
};

/** Modal asking to confirm a destructive server action. Open it with `ref.current.showModal()`. */
export function ConfirmModal({ ref, action, message, confirm, cancelLabel, hard }: ModalProps & { ref: React.RefObject<HTMLDialogElement | null> }) {
  return (
    <dialog ref={ref} className="m-auto w-[min(92vw,24rem)] rounded-3xl bg-card p-0 backdrop:bg-ink/60">
      <ActionForm action={action} hard={hard} className="flex flex-col gap-5 p-6 text-ink">
        <p className="text-balance">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => ref.current?.close()} className="btn-secondary">
            {cancelLabel}
          </button>
          <button className="btn bg-red text-white">{confirm}</button>
        </div>
      </ActionForm>
    </dialog>
  );
}

/** A button that opens a ConfirmModal. */
export function ConfirmDialog({ trigger, triggerClassName, ...modal }: ModalProps & { trigger: React.ReactNode; triggerClassName: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={triggerClassName}>
        {trigger}
      </button>
      <ConfirmModal ref={ref} {...modal} />
    </>
  );
}
