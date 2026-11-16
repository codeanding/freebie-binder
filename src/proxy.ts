import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /f/[id] is public: whoever scans a QR sees the freebie before signing in
const isPublic = createRouteMatcher(["/", "/f/(.*)", "/privacidad", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
