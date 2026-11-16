import { Header } from "./header";

/** Layout for Clerk's sign-in and sign-up pages. */
export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header back="/" />
      <main className="flex flex-1 items-start justify-center px-4 py-10">{children}</main>
    </>
  );
}
