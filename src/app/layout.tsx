import type { Metadata, Viewport } from "next";
import { Geist, Gowun_Batang } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { getLocale } from "@/lib/locale";
import { clerkLocalization } from "@/lib/clerk-localization";
import "./globals.css";

const body = Geist({ subsets: ["latin"], variable: "--font-body" });
const serif = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Freebie Binder",
  description: "Colecciona los freebies de cada ARMY que conoces en el concierto",
};

export const viewport: Viewport = { themeColor: "#f6f1e8", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${body.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ClerkProvider
          localization={clerkLocalization(locale)}
          appearance={{
            variables: {
              colorPrimary: "#c8102e",
              colorBackground: "#fffdf8",
              colorForeground: "#17120f",
              borderRadius: "0.9rem",
              fontFamily: "var(--font-body), system-ui, sans-serif",
            },
            elements: {
              cardBox: "shadow-[0_12px_32px_-20px_rgb(23_18_15/0.35)] border border-line rounded-3xl",
              headerTitle: "font-display text-2xl",
              formButtonPrimary: "rounded-full py-3 text-base",
              socialButtonsBlockButton: "rounded-full py-3",
              formFieldInput: "rounded-xl py-3",
              otpCodeFieldInput: "rounded-xl",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
