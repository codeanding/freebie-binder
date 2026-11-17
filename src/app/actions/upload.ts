"use server";

import { OTHER_EVENT, isEventId } from "@/lib/events";
import { MAX_FREEBIES_PER_USER, consumeUpload, createFreebie, listMyFreebies, reserveUpload, withinRate } from "@/lib/db";
import { newFreebieId, parseFreebieId } from "@/lib/ids";
import { meWithProfile } from "@/lib/me";
import { imageIsSafe, imageTextIsSafe } from "@/lib/moderation";
import { deleteUpload, publishImage, readUpload, uploadForm } from "@/lib/storage";
import { textIsSafe } from "@/lib/text-safety";
import { str } from "@/lib/input";

/** Step 1: reserve an id for this person and return a signed POST to the private bucket. */
export async function requestUpload() {
  const { user } = await meWithProfile("/nuevo");
  if (!(await withinRate(user.id, "upload"))) {
    return { error: "rate" as const };
  }
  const id = newFreebieId();
  await reserveUpload(id, user.id);
  const form = await uploadForm(id);
  return { id, url: form.url, fields: form.fields };
}

// "moderation" and "imageText" tell the uploader which check stopped the photo (not the exact rule),
// so they know whether to try another photo or cover the text and retake it
export type PublishError = "invalid" | "limit" | "image" | "moderation" | "imageText" | "text" | "rate";

/** Step 2: moderate the uploaded photo and, if it passes, publish the freebie. */
export async function publishFreebie(input: {
  id: string;
  title: string;
  description: string;
  event: string;
}): Promise<{ error?: PublishError; to?: string }> {
  const { user, profile } = await meWithProfile("/nuevo");
  const id = parseFreebieId(input?.id);
  const title = str(input?.title, 60).trim();
  const description = str(input?.description, 200).trim();
  if (!id || !title) {
    return { error: "invalid" };
  }
  if (!(await withinRate(user.id, "publish"))) {
    return { error: "rate" };
  }
  if (!textIsSafe(title, description)) {
    return { error: "text" };
  }
  if ((await listMyFreebies(user.id)).length >= MAX_FREEBIES_PER_USER) {
    return { error: "limit" };
  }
  // Only an upload reserved by this same person can be published
  if (!(await consumeUpload(id, user.id))) {
    return { error: "invalid" };
  }

  const bytes = await readUpload(id);
  await deleteUpload(id);
  if (!bytes) {
    return { error: "image" };
  }
  // Both Rekognition checks run in parallel on the same bytes
  const [imageOk, imageTextOk] = await Promise.all([imageIsSafe(bytes), imageTextIsSafe(bytes)]);
  if (!imageOk) {
    return { error: "moderation" };
  }
  if (!imageTextOk) {
    return { error: "imageText" };
  }

  const imageKey = `freebies/${id}.jpg`;
  await publishImage(imageKey, bytes);
  await createFreebie({
    id,
    ownerId: user.id,
    ownerName: profile.name,
    ownerHandle: profile.handle,
    ownerSocial: profile.social,
    ownerCountry: profile.country,
    title,
    description: description || undefined,
    imageKey,
    event: isEventId(input?.event) ? input.event : OTHER_EVENT,
    createdAt: Date.now(),
    collectCount: 0,
  });
  return { to: `/f/${id}` };
}
