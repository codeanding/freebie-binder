import Link from "next/link";
import { Eye, EyeOff, Flag as FlagIcon, Inbox, ShieldCheck, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Flag } from "@/components/flag";
import { Handle } from "@/components/handle";
import { Header } from "@/components/header";
import { Notice } from "@/components/notice";
import { Sleeve } from "@/components/sleeve";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/admin";
import { REPORTS_TO_HIDE, listAllFreebies, type Freebie } from "@/lib/db";
import { imageUrl } from "@/lib/images";
import { adminDelete, adminSetHidden } from "./actions";

export const dynamic = "force-dynamic";

// Internal panel: Spanish only
const MESSAGES: Record<string, string> = {
  hidden: "Freebie oculto. Ya no se ve en la app ni se puede coleccionar.",
  shown: "Freebie visible otra vez.",
  deleted: "Freebie e imagen eliminados.",
  "not-hidden": "Solo se pueden eliminar freebies ocultos.",
};

type Filter = "reportados" | "ocultos" | "todos";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "reportados", label: "Reportados" },
  { id: "ocultos", label: "Ocultos" },
  { id: "todos", label: "Todos" },
];

function matches(f: Freebie, filter: Filter) {
  if (filter === "reportados") {
    return (f.reportCount ?? 0) > 0;
  }
  if (filter === "ocultos") {
    return !!f.hidden;
  }
  return true;
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { r, ver } = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.id === ver) ? (ver as Filter) : "reportados";

  const all = await listAllFreebies();
  // What needs attention first: most reports, then newest
  all.sort((a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0) || b.createdAt - a.createdAt);
  const list = all.filter((f) => matches(f, filter));
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, all.filter((x) => matches(x, f.id)).length]));
  const message = typeof r === "string" ? MESSAGES[r] : undefined;

  return (
    <>
      <Header back="/binder" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 size-7 shrink-0 text-red" />
          <div>
            <h1 className="font-display text-2xl font-bold">Moderación</h1>
            <p className="text-sm text-ink-soft">
              Rekognition revisa cada foto antes de publicarla. Aquí revisas lo que reportaron las personas: con {REPORTS_TO_HIDE} reportes un freebie se oculta solo.
            </p>
          </div>
        </div>

        {message && <Notice>{message}</Notice>}

        <nav className="flex gap-2" aria-label="Filtro">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin?ver=${f.id}`}
              className={f.id === filter ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
            >
              {f.label} <span className="opacity-70">{counts[f.id]}</span>
            </Link>
          ))}
        </nav>

        {list.length === 0 ? (
          <EmptyState icon={<Inbox />} text="No hay freebies en esta lista." />
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((f) => (
              <li key={f.id} className="panel flex gap-4 p-3">
                <Link href={`/f/${f.id}`} className="shrink-0">
                  <Sleeve src={imageUrl(f.imageKey)} alt={f.title} className={`w-20 rounded-lg ${f.hidden ? "opacity-40 grayscale" : ""}`} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{f.title}</span>
                    {f.hidden && <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">Oculto</span>}
                    {(f.reportCount ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red/10 px-2 py-0.5 text-xs font-semibold text-red">
                        <FlagIcon className="size-3" /> {f.reportCount} {f.reportCount === 1 ? "reporte" : "reportes"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    <Flag code={f.ownerCountry} />
                    <Handle social={f.ownerSocial} handle={f.ownerHandle} fallback={f.ownerName} link={false} />
                    <span>· {new Date(f.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionForm action={adminSetHidden.bind(null, f.id, !f.hidden)}>
                      <SubmitButton pendingLabel="Guardando…" className="btn-secondary px-4 py-2 text-sm">
                        {f.hidden ? <><Eye className="size-4" /> Mostrar</> : <><EyeOff className="size-4" /> Ocultar</>}
                      </SubmitButton>
                    </ActionForm>
                    {f.hidden && (
                      <ConfirmDialog
                        action={adminDelete.bind(null, f.id)}
                        message={`¿Eliminar "${f.title}" y su imagen? No se puede deshacer.`}
                        cancelLabel="Cancelar"
                        triggerClassName="btn-ghost px-4 py-2 text-sm text-red"
                        trigger={
                          <>
                            <Trash2 className="size-4" /> Eliminar
                          </>
                        }
                        confirm={
                          <>
                            <Trash2 className="size-4" /> Eliminar
                          </>
                        }
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
