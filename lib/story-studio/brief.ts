import type { OrgActivityContext } from "./types"

export function normTitle(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, " ").trim()
}

const STOP = new Set(
  "make me a an the this that we you they did do about presentation deck slides please write create generate give show tell only just last latest first most recent event events weve we have done ran held our club year season impact".split(
    " ",
  ),
)

export function briefSignals(brief: string) {
  const t = brief.toLowerCase()
  const lastN = t.match(/(?:last|latest|recent|dernier(?:e|s)?|آخر)\s+(\d+)\s+(?:events?|activités?|فعاليات?)/)
  return {
    funny: /funny|fun|kids|humour|humor|marrant|rigolo/.test(t),
    sponsor: /sponsor|partner|partenaire|investor|jury|formal|professionnel|professional/.test(t),
    poetic: /poetic|cinematic|sentimental|warm|émotion|emotion/.test(t),
    short: /short|court|brief deck|5 slides/.test(t),
    lastEvent:
      /last event|latest event|most recent event|dernier(?:e)?\s+événement|آخر\s+فعال|the last (one|night|activity)|last (thing|night|activity) we/.test(
        t,
      ) ||
      (/\blast\b/.test(t) && /event|activité|فعال|night|workshop/.test(t) && !lastN),
    lastCount: lastN ? Math.max(1, Math.min(8, Number(lastN[1]))) : 0,
    firstEvent: /first event|opening event|premier événement/.test(t),
    yearRecap: /year of|season recap|all activit|everything|toute la saison|whole year/.test(t),
    workshops: /workshop|atelier/.test(t) && /only|juste|seulement|فقط/.test(t),
    trainings: /training|formation/.test(t) && /only|juste|seulement|فقط/.test(t),
    raw: brief.replace(/\s+/g, " ").trim(),
  }
}

export function pickEventsForBrief<T extends { title: string; type: string; startAt: string }>(
  events: T[],
  brief: string,
): T[] {
  const sig = briefSignals(brief)
  const ordered = [...events].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
  if (!ordered.length) return ordered
  if (sig.yearRecap) return ordered
  if (sig.workshops) {
    const w = ordered.filter((e) => /WORKSHOP/i.test(e.type))
    return w.length ? w : ordered
  }
  if (sig.trainings) {
    const w = ordered.filter((e) => /TRAINING/i.test(e.type))
    return w.length ? w : ordered
  }
  if (sig.lastCount) return ordered.slice(-sig.lastCount)
  if (sig.lastEvent) return ordered.slice(-1)
  if (sig.firstEvent) return ordered.slice(0, 1)

  const t = brief.toLowerCase()
  const named = ordered.filter((e) => {
    const n = e.title.toLowerCase()
    return n.length > 4 && t.includes(n.slice(0, Math.min(n.length, 18)))
  })
  if (named.length) return named
  return ordered
}

export function scopeOrgContext(ctx: OrgActivityContext, brief: string): OrgActivityContext {
  const events = pickEventsForBrief(ctx.events, brief)
  return {
    ...ctx,
    events,
    stats: {
      ...ctx.stats,
      events: events.length,
      registrations: events.reduce((s, e) => s + e.registrations, 0),
      attendances: events.reduce((s, e) => s + e.attendances, 0),
    },
  }
}

export function titleFromBrief(club: string, brief: string, eventTitle?: string) {
  if (eventTitle && briefSignals(brief).lastEvent) return eventTitle
  const words = brief
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()))
    .slice(0, 7)
    .join(" ")
  return words ? `${club} — ${words}` : club
}

export function titleMatchesBrief(title: string, brief: string) {
  const t = title.toLowerCase()
  if (/year of impact|season recap|a year of/.test(t) && briefSignals(brief).lastEvent) return false
  const keys = brief
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
  if (!keys.length) return true
  return keys.some((w) => t.includes(w))
}

export function hashPick<T>(seed: string, items: T[]): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0
  return items[h % items.length]
}
