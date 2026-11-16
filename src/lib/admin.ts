import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

/**
 * Requires the admin role, stored in Clerk's publicMetadata ({ "role": "admin" }).
 * publicMetadata can only be set from the backend or the Clerk dashboard,
 * so nobody can grant it to themselves from the browser.
 * Non-admins get a 404: the panel doesn't reveal that it exists.
 */
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await (await clerkClient()).users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") {
    notFound();
  }
  return { id: userId };
}
