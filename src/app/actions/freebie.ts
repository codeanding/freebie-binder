"use server";

import { collect, deleteFreebie, getFreebie, report, withinRate } from "@/lib/db";
import { parseFreebieId } from "@/lib/ids";
import { me, meWithProfile } from "@/lib/me";
import { deleteImage } from "@/lib/storage";

export async function collectAction(freebieId: string) {
  const id = parseFreebieId(freebieId);
  if (!id) {
    return { to: "/binder" };
  }
  const { user } = await meWithProfile(`/f/${id}`);
  if (!(await withinRate(user.id, "collect"))) {
    return { to: `/f/${id}?r=rate` };
  }
  const freebie = await getFreebie(id);
  const result = freebie && !freebie.hidden ? await collect(user.id, freebie) : "missing";
  return { to: `/f/${id}?r=${result}` };
}

export async function reportAction(freebieId: string) {
  const id = parseFreebieId(freebieId);
  if (!id) {
    return { to: "/binder" };
  }
  const { user } = await meWithProfile(`/f/${id}`);
  if (await withinRate(user.id, "report")) {
    const freebie = await getFreebie(id);
    if (freebie && freebie.ownerId !== user.id) {
      await report(id, user.id);
    }
  }
  return { to: `/f/${id}?r=reported` };
}

/** Deletes one of the person's own freebies and its image. */
export async function deleteAction(freebieId: string) {
  const { user } = await me();
  const id = parseFreebieId(freebieId);
  const imageKey = id ? await deleteFreebie(id, user.id) : null;
  if (imageKey) {
    await deleteImage(imageKey);
  }
  return { to: "/binder?tab=made" };
}
