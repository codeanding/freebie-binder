import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "./db";
import { safeNext } from "./safe-next";

/** Session + profile. Uses only the session's user id, so pages don't call the Clerk API. */
export async function me() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return { user: { id: userId }, profile: await getProfile(userId) };
}

/** Requires a complete profile; otherwise sends the person to onboarding and back to `returnTo`. */
export async function meWithProfile(returnTo: string) {
  const data = await me();
  if (!data.profile) {
    redirect(`/onboarding?next=${encodeURIComponent(safeNext(returnTo))}`);
  }
  return { ...data, profile: data.profile };
}
