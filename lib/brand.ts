export const BRAND = {
  name: "Tafsula",
  markName: "Tafsula",
  tagline: {
    en: "Your next opportunity is a door, not a rumor.",
    fr: "Ta prochaine opportunité est une porte, pas une rumeur.",
    ar: "فرصتك التالية باب، وليست إشاعة.",
  },
  mission: {
    en: "Tafsula helps Tunisian youth find real opportunities — clubs, events, teams, work they can show — and gives clubs a house so those doors stay open.",
    fr: "Tafsula aide la jeunesse tunisienne à trouver de vraies opportunités — clubs, événements, équipes, un travail à montrer — et donne aux clubs une maison pour que ces portes restent ouvertes.",
    ar: "تفسولة تساعد شباب تونس على إيجاد فرص حقيقية — نوادٍ وفعاليات وفرق وعمل يُظهرونه — وتعطي النوادي بيتًا لتبقى تلك الأبواب مفتوحة.",
  },
  colors: {
    soot: "#161210",
    plaster: "#EFE6D6",
    jasmine: "#F7F3EA",
    pomegranate: "#9C1C28",
    saffron: "#C9891A",
    copper: "#A65D32",
    indigo: "#243056",
    tile: "#1F5C57",
    ink: "#1A1612",
  },
} as const

export type Locale = "fr" | "ar" | "en"

export const LOCALES: Locale[] = ["fr", "ar", "en"]
export const DEFAULT_LOCALE: Locale = "fr"

export const VOCAB = {
  organization: { en: "Club", fr: "Club", ar: "نادي" },
  hr: { en: "Bureau", fr: "Bureau", ar: "المكتب" },
  member: { en: "Member", fr: "Membre", ar: "عضو" },
  admin: { en: "Platform admin", fr: "Admin plateforme", ar: "مشرف المنصة" },
  team: { en: "Team", fr: "Équipe", ar: "فريق" },
  teamLead: { en: "Team lead", fr: "Chef d’équipe", ar: "قائد الفريق" },
  eventLead: { en: "Event lead", fr: "Responsable événement", ar: "مسؤول الفعالية" },
  proposal: { en: "Idea", fr: "Idée", ar: "فكرة" },
  credits: { en: "Points", fr: "Points", ar: "نقاط" },
  events: { en: "Events", fr: "Événements", ar: "فعاليات" },
  posts: { en: "News", fr: "Actualités", ar: "أخبار" },
  tasks: { en: "Tasks", fr: "Tâches", ar: "مهام" },
} as const

export type FigurineId = 1 | 2 | 3 | 4

export interface Figurine {
  id: FigurineId
  name: string
  role: { en: string; fr: string; ar: string }
  color: string
  glyph: string
  emptyHint: { en: string; fr: string; ar: string }
}

export const FIGURINES: Figurine[] = [
  {
    id: 1,
    name: "Nar",
    role: { en: "Opens doors — events & energy", fr: "Ouvre les portes — événements", ar: "يفتح الأبواب — الفعاليات" },
    color: "#9C1C28",
    glyph: "ن",
    emptyHint: {
      en: "No events yet — Nar is waiting for your bureau to light one.",
      fr: "Pas d’événements — Nar attend que le bureau en allume un.",
      ar: "لا فعاليات بعد — نار ينتظر أن يشعل المكتب واحدة.",
    },
  },
  {
    id: 2,
    name: "Wasl",
    role: { en: "Connects people — welcome & community", fr: "Relie les gens — accueil", ar: "يربط الناس — الترحيب" },
    color: "#1F5C57",
    glyph: "و",
    emptyHint: {
      en: "No teammates yet — Wasl is holding the door.",
      fr: "Pas encore d’équipe — Wasl tient la porte.",
      ar: "لا زملاء بعد — وصل يمسك الباب.",
    },
  },
  {
    id: 3,
    name: "Thabit",
    role: { en: "Holds the line — logistics & care", fr: "Tient la ligne — logistique", ar: "يثبت الخط — اللوجستيك" },
    color: "#A65D32",
    glyph: "ث",
    emptyHint: {
      en: "Nothing to check in — Thabit is ready when you are.",
      fr: "Rien à cocher — Thabit est prêt.",
      ar: "لا شيء للتحقق — ثابت جاهز.",
    },
  },
  {
    id: 4,
    name: "Ayn",
    role: { en: "Sees the plan — tasks & craft", fr: "Voit le plan — tâches", ar: "يرى الخطة — المهام" },
    color: "#243056",
    glyph: "ع",
    emptyHint: {
      en: "No tasks yet — Ayn is sharpening the next step.",
      fr: "Pas de tâches — Ayn prépare l’étape suivante.",
      ar: "لا مهام بعد — عين يجهّز الخطوة التالية.",
    },
  },
]

export function getFigurine(id?: number | null): Figurine {
  return FIGURINES.find((f) => f.id === id) ?? FIGURINES[0]
}
