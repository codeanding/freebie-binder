"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { COUNTRIES, DEFAULT_SOCIAL, SOCIALS, isMember, isSocial, normalizeHandle, normalizeNickname } from "@/lib/catalog";
import { deleteUserData, saveProfile, withinRate } from "@/lib/db";
import { me } from "@/lib/me";
import { safeNext } from "@/lib/safe-next";
import { deleteImage } from "@/lib/storage";
import { str } from "@/lib/input";

export type ProfileState = { error?: "nickname" | "consent" | "rate"; to?: string } | undefined;

export async function saveProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { user, profile } = await me();
  if (!(await withinRate(user.id, "profile"))) {
    return { error: "rate" };
  }
  // The public name is a nickname: never the real name or the account email
  const name = normalizeNickname(str(formData.get("nickname"), 60));
  if (!name) {
    return { error: "nickname" };
  }
  if (!profile && formData.get("consent") !== "yes") {
    return { error: "consent" };
  }

  const rawSocial = str(formData.get("social"), 20);
  const social = isSocial(rawSocial) ? rawSocial : DEFAULT_SOCIAL;
  const rawHandle = normalizeHandle(str(formData.get("handle"), 200));
  const country = str(formData.get("country"), 2);
  const bias = str(formData.get("bias"), 20);

  await saveProfile({
    id: user.id,
    name,
    // The photo comes from Clerk (Google's or the one Clerk generates); only here do we fetch the full user
    imageUrl: (await currentUser())?.imageUrl ?? "",
    social,
    handle: SOCIALS[social].pattern.test(rawHandle) ? rawHandle : "",
    country: COUNTRIES.includes(country) ? country : "XX",
    bias: isMember(bias) ? bias : "OT7",
  });
  return { to: safeNext(formData.get("next")) };
}

/** Deletes all of the person's data (profile, binder, freebies and images) and their Clerk account. */
export async function deleteAccountAction() {
  const { user } = await me();
  const imageKeys = await deleteUserData(user.id);
  await Promise.all(imageKeys.map(deleteImage));
  await (await clerkClient()).users.deleteUser(user.id);
  return { to: "/" };
}
