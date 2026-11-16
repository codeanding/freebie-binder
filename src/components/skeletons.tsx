import { Seal, Stamp } from "./brand";

/** Loading skeletons, shown instantly while the server responds. */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-ink/8 ${className}`} />;
}

export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 border-b border-line/70 bg-paper/85">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Stamp />
        <Bar className="h-10 w-28" />
      </div>
    </div>
  );
}

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderSkeleton />
      <main aria-busy className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">{children}</main>
    </>
  );
}

export function BinderSkeleton() {
  return (
    <PageSkeleton>
      <div className="panel flex items-center gap-4 p-5">
        <div className="size-16 animate-pulse rounded-full bg-ink/8" />
        <div className="flex flex-1 flex-col gap-2"><Bar className="h-6 w-40" /><Bar className="h-4 w-56" /></div>
      </div>
      <Bar className="h-11 w-full sm:w-96" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sleeve animate-pulse rounded-xl bg-ink/8" />
        ))}
      </div>
    </PageSkeleton>
  );
}

export function FormSkeleton() {
  return (
    <PageSkeleton>
      <Bar className="h-9 w-56" />
      <div className="panel mx-auto flex w-full max-w-lg flex-col gap-6 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2"><Bar className="h-4 w-32" /><div className="h-12 animate-pulse rounded-xl bg-ink/8" /></div>
        ))}
      </div>
    </PageSkeleton>
  );
}

export function FreebieSkeleton() {
  return (
    <PageSkeleton>
      <div className="mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-12">
        <div className="sleeve mx-auto w-64 animate-pulse rounded-2xl bg-ink/8 md:w-full" />
        <div className="flex flex-col gap-4">
          <Bar className="h-9 w-3/4" /><Bar className="h-4 w-1/2" /><Bar className="h-4 w-1/3" />
          <div className="mt-6 h-14 animate-pulse rounded-full bg-ink/8" />
        </div>
      </div>
    </PageSkeleton>
  );
}

export function AppSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <main aria-busy className="grid flex-1 place-items-center">
        <Seal className="size-14 animate-pulse text-sm opacity-60" />
      </main>
    </>
  );
}
