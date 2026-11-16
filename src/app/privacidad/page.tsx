import { Header } from "@/components/header";
import { getLocale } from "@/lib/locale";

// Contact email for privacy requests
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

const ES = {
  title: "Privacidad",
  updated: "Actualizado: noviembre de 2026",
  sections: [
    ["Qué es Freebie Binder", "Una app independiente y gratuita para coleccionar los freebies que se intercambian en los conciertos. No está afiliada a BTS, BIGHIT MUSIC ni HYBE."],
    ["Qué datos guardamos", "Tu correo (solo para iniciar sesión, nunca se muestra), tu apodo público, país, bias y, si quieres, tu usuario de una red social. También las fotos y textos de los freebies que subes y la lista de freebies que coleccionas."],
    ["Qué es público", "Tu apodo, país, red social y los freebies que subes (foto, nombre y mensaje). Tu correo y tu nombre real no se muestran a nadie."],
    ["Moderación", "Las fotos y el texto escrito sobre ellas se revisan automáticamente con Amazon Rekognition antes de publicarse, y los textos no pueden incluir teléfonos ni links. Cualquier persona puede reportar un freebie; con varios reportes se oculta."],
    ["Menores de edad", "Si tienes menos de 14 años, necesitas el permiso de tu mamá, papá o tutor para usar la app. No compartas datos personales en tus freebies."],
    ["Dónde se guardan", "En Amazon Web Services (EE. UU.). El inicio de sesión lo gestiona Clerk. No vendemos ni compartimos tus datos con nadie más."],
    ["Borrar tus datos", "Desde Editar perfil → Eliminar mi cuenta se borran tu perfil, tu colección, tus freebies y sus fotos."],
  ],
  contact: "Contacto",
};

const EN: typeof ES = {
  title: "Privacy",
  updated: "Updated: November 2026",
  sections: [
    ["What Freebie Binder is", "An independent, free app to collect the freebies exchanged at concerts. It is not affiliated with BTS, BIGHIT MUSIC or HYBE."],
    ["What we store", "Your email (only to sign in, never shown), your public nickname, country, bias and, optionally, a social media username. Also the photos and texts of the freebies you upload and the list of freebies you collect."],
    ["What is public", "Your nickname, country, social username and the freebies you upload (photo, name and message). Your email and real name are never shown."],
    ["Moderation", "Photos, and any text written on them, are automatically reviewed with Amazon Rekognition before being published, and texts can't include phone numbers or links. Anyone can report a freebie; after several reports it gets hidden."],
    ["Minors", "If you are under 14, you need permission from a parent or guardian to use the app. Don't share personal data in your freebies."],
    ["Where it's stored", "On Amazon Web Services (USA). Sign-in is handled by Clerk. We don't sell or share your data with anyone else."],
    ["Deleting your data", "Go to Edit profile → Delete my account to delete your profile, collection, freebies and their photos."],
  ],
  contact: "Contact",
};

export default async function Privacidad() {
  const c = (await getLocale()) === "es" ? ES : EN;
  return (
    <>
      <Header back="/" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="font-display text-3xl font-bold">{c.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{c.updated}</p>
        <div className="mt-8 flex flex-col gap-6">
          {c.sections.map(([h, p]) => (
            <section key={h}>
              <h2 className="font-semibold">{h}</h2>
              <p className="mt-1 text-ink-soft">{p}</p>
            </section>
          ))}
          {CONTACT && (
            <section>
              <h2 className="font-semibold">{c.contact}</h2>
              <a href={`mailto:${CONTACT}`} className="mt-1 inline-block text-red underline underline-offset-4">{CONTACT}</a>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
