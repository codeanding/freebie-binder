import { deDE, enUS, esMX, frFR, itIT, jaJP, koKR, ptBR, zhCN } from "@clerk/localizations";
import type { Locale } from "./i18n";

type Copy = { inTitle: string; subtitle: string; firstTime: string; create: string; upTitle: string; upSubtitle: string; haveOne: string; signIn: string };

// Custom copy so sign-in sounds like the rest of the app (informal "tú", "binder")
const COPY: Record<Locale, Copy> = {
  es: { inTitle: "Entra a tu binder", subtitle: "Con Google o con tu correo", firstTime: "¿Primera vez?", create: "Crea tu binder", upTitle: "Crea tu binder", upSubtitle: "Gratis y en menos de un minuto", haveOne: "¿Ya tienes binder?", signIn: "Entra" },
  en: { inTitle: "Open your binder", subtitle: "With Google or your email", firstTime: "First time?", create: "Create your binder", upTitle: "Create your binder", upSubtitle: "Free, in under a minute", haveOne: "Already have a binder?", signIn: "Sign in" },
  pt: { inTitle: "Abra seu binder", subtitle: "Com Google ou seu e-mail", firstTime: "Primeira vez?", create: "Crie seu binder", upTitle: "Crie seu binder", upSubtitle: "Grátis e em menos de um minuto", haveOne: "Já tem binder?", signIn: "Entrar" },
  ko: { inTitle: "내 바인더 열기", subtitle: "Google 또는 이메일로", firstTime: "처음이신가요?", create: "바인더 만들기", upTitle: "바인더 만들기", upSubtitle: "무료, 1분이면 끝나요", haveOne: "이미 바인더가 있나요?", signIn: "로그인" },
  ja: { inTitle: "バインダーを開く", subtitle: "Googleまたはメールで", firstTime: "はじめての方", create: "バインダーを作る", upTitle: "バインダーを作る", upSubtitle: "無料・1分で完了", haveOne: "バインダーをお持ちの方", signIn: "ログイン" },
  zh: { inTitle: "打开我的收藏册", subtitle: "使用 Google 或邮箱", firstTime: "第一次来？", create: "创建收藏册", upTitle: "创建收藏册", upSubtitle: "免费，一分钟搞定", haveOne: "已经有收藏册了？", signIn: "登录" },
  fr: { inTitle: "Ouvre ton binder", subtitle: "Avec Google ou ton e-mail", firstTime: "Première fois ?", create: "Crée ton binder", upTitle: "Crée ton binder", upSubtitle: "Gratuit, en moins d'une minute", haveOne: "Tu as déjà un binder ?", signIn: "Connexion" },
  de: { inTitle: "Öffne deinen Binder", subtitle: "Mit Google oder deiner E-Mail", firstTime: "Zum ersten Mal hier?", create: "Binder erstellen", upTitle: "Erstelle deinen Binder", upSubtitle: "Kostenlos, in unter einer Minute", haveOne: "Schon einen Binder?", signIn: "Anmelden" },
  it: { inTitle: "Apri il tuo binder", subtitle: "Con Google o la tua e-mail", firstTime: "Prima volta?", create: "Crea il tuo binder", upTitle: "Crea il tuo binder", upSubtitle: "Gratis, in meno di un minuto", haveOne: "Hai già un binder?", signIn: "Accedi" },
};

const BASE = { es: esMX, en: enUS, pt: ptBR, ko: koKR, ja: jaJP, zh: zhCN, fr: frFR, de: deDE, it: itIT } as const;

export function clerkLocalization(locale: Locale) {
  const base = BASE[locale];
  const c = COPY[locale];
  return {
    ...base,
    formFieldInputPlaceholder__emailAddress: "you@email.com",
    signIn: {
      ...base.signIn,
      start: { ...base.signIn?.start, title: c.inTitle, subtitle: c.subtitle, actionText: c.firstTime, actionLink: c.create },
    },
    signUp: {
      ...base.signUp,
      start: { ...base.signUp?.start, title: c.upTitle, subtitle: c.upSubtitle, actionText: c.haveOne, actionLink: c.signIn },
    },
  };
}
