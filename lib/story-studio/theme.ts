import type { StoryTheme } from "./types"

export type ThemeTokens = {
  bg: [number, number, number]
  bg2: [number, number, number]
  ink: [number, number, number]
  muted: [number, number, number]
  accent: [number, number, number]
  card: [number, number, number]
  cssBg: string
  cssInk: string
  cssMuted: string
  cssAccent: string
  cssCard: string
  label: string
}

function pack(
  label: string,
  bg: string,
  bg2: string,
  ink: string,
  muted: string,
  accent: string,
  card: string,
): ThemeTokens {
  const h = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
  return {
    label,
    bg: h(bg),
    bg2: h(bg2),
    ink: h(ink),
    muted: h(muted),
    accent: h(accent),
    card: h(card),
    cssBg: bg,
    cssInk: ink,
    cssMuted: muted,
    cssAccent: accent,
    cssCard: card,
  }
}

/** High-contrast palettes only — light text on dark, or dark text on light. */
export const THEMES: Record<StoryTheme, ThemeTokens> = {
  ember: pack("Ember night", "#1B100E", "#3A1E16", "#FFF4EC", "#E2C4B4", "#FF8A4C", "#2A1814"),
  nile: pack("Nile evening", "#0C1B33", "#16345A", "#EEF5FF", "#B9CDE8", "#7EB6FF", "#132744"),
  saffron: pack("Saffron hall", "#17110A", "#3A2A12", "#FFF6E4", "#E2CDA8", "#F0B429", "#241C10"),
  ink: pack("Ink & paper", "#111318", "#222636", "#F6F1E8", "#C9C2B4", "#E0C38A", "#1C2028"),
  rose: pack("Rose room", "#2A1218", "#4A1D2A", "#FFF0F3", "#E3B8C3", "#F4A0B5", "#3A1822"),
  ocean: pack("Deep tide", "#071A1E", "#0F343C", "#E8FAF8", "#A9D4D0", "#5EEAD4", "#0C2A30"),
  sand: pack("Warm plaster", "#F3E6D0", "#E7D4B5", "#1A140E", "#5C4A3A", "#9C3B1E", "#FFF8EE"),
  violet: pack("Studio violet", "#161022", "#2A1B44", "#F4EEFF", "#C9B8E6", "#C4B5FD", "#221833"),
  copper: pack("Copper lamp", "#1C140C", "#3D2A18", "#FFF3E6", "#DDBBA0", "#E0924A", "#2A1C12"),
  ivory: pack("Ivory lecture", "#F7F3EA", "#E8E0D0", "#1A1612", "#5A5348", "#1F4E79", "#FFFFFF"),
  midnight: pack("Midnight", "#161210", "#243056", "#F7F3EA", "#C9C2B6", "#C9891A", "#241E1A"),
  plaster: pack("Plaster", "#EFE6D6", "#F7F3EA", "#1A1612", "#5A5248", "#9C1C28", "#FFFCF6"),
  tile: pack("Tile", "#102226", "#1A3C40", "#F4FBF8", "#B7D0CA", "#7ED0B6", "#163034"),
  signal: pack("Blue · white · orange", "#0B3A82", "#0E4AA3", "#FFFFFF", "#D5E6FF", "#FF7A18", "#1248A0"),
}

export const THEME_KEYS = Object.keys(THEMES) as StoryTheme[]

export function getTheme(name?: string | null): ThemeTokens {
  if (name && name in THEMES) return THEMES[name as StoryTheme]
  return THEMES.ember
}

function hashSeed(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return h >>> 0
}

export function pickTheme(seed: string, brief = "", preferred?: string | null): StoryTheme {
  if (preferred && preferred in THEMES) return preferred as StoryTheme
  const t = brief.toLowerCase()
  if (/blue/.test(t) && (/orange/.test(t) || /white/.test(t))) return "signal"
  if (/\borange\b/.test(t) && /\bblue\b/.test(t)) return "signal"
  if (/green tile|club green/.test(t)) return "tile"
  if (/sponsor|formal|partner|investisseur|jury/.test(t)) return "ink"
  if (/universit|academic|conférence|conference|career/.test(t)) return "ivory"
  if (/hack|tech|digital|code/.test(t)) return "violet"
  if (/photo|art|studio|design/.test(t)) return "copper"
  if (/women|femme|community|care/.test(t)) return "rose"
  if (/concert|music|night|soirée|open night/.test(t)) return "ember"
  if (/summer|safran|gold/.test(t)) return "saffron"
  if (/sea|ocean|volunteer|mer/.test(t)) return "ocean"
  if (/medina|warm|plaster|sand/.test(t)) return "sand"
  const colorful = THEME_KEYS.filter((k) => !["tile", "midnight", "plaster"].includes(k))
  return colorful[hashSeed(seed) % colorful.length]
}

export function rgb01(c: [number, number, number]) {
  return { r: c[0] / 255, g: c[1] / 255, b: c[2] / 255 }
}
