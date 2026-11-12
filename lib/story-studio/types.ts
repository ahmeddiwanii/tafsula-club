export type StoryLayout =
  | "cover"
  | "kpis"
  | "timeline"
  | "spotlight"
  | "split"
  | "gallery"
  | "quote"
  | "chapter"
  | "closing"

export type StoryTheme =
  | "ember"
  | "nile"
  | "saffron"
  | "ink"
  | "rose"
  | "ocean"
  | "sand"
  | "violet"
  | "copper"
  | "ivory"
  | "midnight"
  | "plaster"
  | "tile"
  | "signal"

export type StoryLocale = "en" | "fr" | "ar"

export interface StoryMetric {
  label: string
  value: string
  hint?: string
}

export interface StoryItem {
  title: string
  meta?: string
  text?: string
  imageUrl?: string
}

export interface StorySlide {
  layout: StoryLayout
  kicker?: string
  title: string
  body?: string
  bullets?: string[]
  metrics?: StoryMetric[]
  items?: StoryItem[]
  imageUrl?: string
  caption?: string
  quote?: string
  quoteBy?: string
  icon?: string
}

export interface StoryDeck {
  title: string
  subtitle: string
  periodLabel: string
  organizationName: string
  logoUrl?: string | null
  coverUrl?: string | null
  theme: StoryTheme
  locale: StoryLocale
  usedFallback: boolean
  voiceNote?: string
  slides: StorySlide[]
}

export interface StoryVoice {
  title?: string
  subtitle?: string
  theme?: StoryTheme
  coverBody?: string
  events?: Array<{ title: string; body?: string; quote?: string }>
  error?: string
}

export interface StoryGenerateInput {
  from: string
  to: string
  brief: string
  locale?: StoryLocale
}

export interface OrgActivityContext {
  organization: {
    id: string
    name: string
    bio?: string | null
    location?: string | null
    website?: string | null
    logoUrl?: string | null
    coverUrl?: string | null
    gallery: string[]
  }
  period: { from: string; to: string; label: string }
  stats: {
    membersAccepted: number
    membersJoinedInPeriod: number
    events: number
    registrations: number
    attendances: number
    posts: number
    teams: number
    proposals: number
    projects: number
    tasksCompleted: number
    pointsAwarded: number
  }
  events: Array<{
    title: string
    type: string
    format: string
    startAt: string
    endAt?: string | null
    location?: string | null
    venue?: string | null
    summary?: string | null
    description?: string | null
    posterUrl?: string | null
    gallery: string[]
    registrations: number
    attendances: number
    rating?: number | null
  }>
  posts: Array<{ title: string; content: string; imageUrl?: string | null; createdAt: string }>
  teams: Array<{ name: string; purpose?: string | null; members: number }>
  proposals: Array<{ title: string; type: string; status: string; createdAt: string }>
  projects: Array<{ title: string; status: string; description?: string | null }>
}
