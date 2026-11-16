"use server";

import { requireAdmin } from "@/lib/admin";
import { adminDeleteFreebie, setHidden } from "@/lib/db";
import { parseFreebieId } from "@/lib/ids";
import { deleteImage } from "@/lib/storage";

export async function adminSetHidden(freebieId: string, hidden: boolean) {
  await requireAdmin();
  const id = parseFreebieId(freebieId);
  if (id) {
    await setHidden(id, hidden === true);
  }
  return { to: `/admin?r=${hidden ? "hidden" : "shown"}` };
}

/** Only deletes freebies that are already hidden: hiding first is part of the confirmation. */
export async function adminDelete(freebieId: string) {
  await requireAdmin();
  const id = parseFreebieId(freebieId);
  const imageKey = id ? await adminDeleteFreebie(id) : null;
  if (imageKey) {
    await deleteImage(imageKey);
  }
  return { to: `/admin?r=${imageKey ? "deleted" : "not-hidden"}` };
}
