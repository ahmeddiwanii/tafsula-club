import type { OrgActivityContext, StoryLocale, StoryVoice } from "./types"

function detectLocale(brief: string, forced?: StoryLocale): StoryLocale {
  if (forced) return forced
  const t = brief.toLowerCase()
  if (/[ء-ي]/.test(brief) || /\barabic\b|\barabe\b|\bar\b/.test(t)) return "ar"
  if (/\bfrançais\b|\bfrancais\b|\bfrench\b|\ben français\b/.test(t)) return "fr"
  return "en"
}

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const text = (fenced ? fenced[1] : raw).trim()
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start < 0 || end <= start) throw new Error("No JSON object in model output")
  return JSON.parse(text.slice(start, end + 1))
}

function messageText(data: { choices?: Array<{ message?: { content?: string; reasoning?: string } }> }) {
  const msg = data.choices?.[0]?.message
  return String(msg?.content || msg?.reasoning || "").trim()
}

function compactContext(ctx: OrgActivityContext) {
  return {
    club: ctx.organization.name,
    bio: ctx.organization.bio,
    location: ctx.organization.location,
    period: ctx.period.label,
    stats: ctx.stats,
    events: ctx.events.map((e) => ({
      title: e.title,
      type: e.type,
      format: e.format,
      date: e.startAt,
      venue: e.venue || e.location,
      description: (e.description || e.summary || "").slice(0, 320),
      signups: e.registrations,
      checkins: e.attendances,
      rating: e.rating,
    })),
    teams: ctx.teams.map((t) => ({ name: t.name, purpose: t.purpose, members: t.members })),
    ideas: ctx.proposals.map((p) => p.title),
  }
}

const GROQ_PREFERRED = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
]

async function resolveGroqModels(apiKey?: string) {
  const pinned = process.env.GROQ_MODEL?.trim()
  const fallback = pinned ? [pinned, ...GROQ_PREFERRED] : [...GROQ_PREFERRED]
  if (!apiKey) return fallback.filter((m, i, a) => a.indexOf(m) === i)
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return fallback
    const data = (await res.json()) as { data?: Array<{ id: string }> }
    const ids = new Set((data.data || []).map((m) => m.id))
    const live = fallback.filter((id) => ids.has(id))
    if (live.length) return live
    return (data.data || [])
      .map((m) => m.id)
      .filter((id) => !/whisper|tts|guard|orpheus/i.test(id))
      .slice(0, 4)
  } catch {
    return fallback
  }
}

async function callChat(url: string, apiKey: string, model: string, prompt: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 8000,
      messages: [
        {
          role: "system",
          content:
            "You write presentation copy for a youth club. Follow the bureau brief exactly (tone, language, colors, focus). Facts only from the data. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 180)}`)
  const data = JSON.parse(text)
  const out = messageText(data)
  if (!out) throw new Error(`${model} returned empty text`)
  return out
}

function buildVoicePrompt(ctx: OrgActivityContext, brief: string, locale: StoryLocale) {
  const n = ctx.events.length
  return `Bureau brief — OBEY THIS. The facts below are ALREADY filtered to match the brief. Do not invent a year recap if only one event is listed.
${brief}

Language: ${locale === "fr" ? "French" : locale === "ar" ? "Arabic" : "English"}.

Facts (${n} event${n === 1 ? "" : "s"}):
${JSON.stringify(compactContext(ctx))}

Return JSON:
{
  "title": "Must paraphrase the brief. If they asked for the last event, use that event's real name — NEVER 'Year of Impact' or a season recap unless they asked for the whole year.",
  "subtitle": "one line that paraphrases the brief",
  "theme": "signal if they asked blue/white/orange, else ember|nile|saffron|ink|rose|ocean|sand|violet|copper|ivory",
  "coverBody": "3-4 sentences about ONLY the events in the facts. Match the brief.",
  "events": [
    {
      "title": "MUST equal an event title from the data",
      "body": "3-5 sentences: date, venue, what happened, numbers.",
      "quote": "one original line that fits THIS event only"
    }
  ]
}

Write one events[] entry for each event in the facts (${n}). Do not invent events. Do not mention events that are not in the facts.`
}

export async function generateStoryVoice(
  ctx: OrgActivityContext,
  brief: string,
  localeHint?: StoryLocale,
): Promise<StoryVoice> {
  const locale = detectLocale(brief, localeHint)
  const prompt = buildVoicePrompt(ctx, brief, locale)
  const groq = process.env.GROQ_API_KEY?.trim()
  const openai = process.env.OPENAI_API_KEY?.trim()
  const models = await resolveGroqModels(groq)

  let lastError = "No AI key configured"
  let raw = ""

  if (groq) {
    for (const model of models) {
      try {
        raw = await callChat("https://api.groq.com/openai/v1/chat/completions", groq, model, prompt)
        lastError = ""
        break
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Groq failed"
      }
    }
  } else if (openai) {
    try {
      raw = await callChat(
        "https://api.openai.com/v1/chat/completions",
        openai,
        process.env.OPENAI_MODEL || "gpt-4o-mini",
        prompt,
      )
      lastError = ""
    } catch (e) {
      lastError = e instanceof Error ? e.message : "OpenAI failed"
    }
  }

  if (!raw) {
    return { error: lastError }
  }

  try {
    const parsed = extractJson(raw) as Record<string, unknown>
    const events = Array.isArray(parsed.events)
      ? parsed.events
          .map((row) => {
            const e = row as Record<string, unknown>
            return {
              title: String(e.title || ""),
              body: e.body ? String(e.body) : undefined,
              quote: e.quote ? String(e.quote) : undefined,
            }
          })
          .filter((e) => e.title)
      : []
    return {
      title: parsed.title ? String(parsed.title) : undefined,
      subtitle: parsed.subtitle ? String(parsed.subtitle) : undefined,
      theme: parsed.theme ? (String(parsed.theme) as StoryVoice["theme"]) : undefined,
      coverBody: parsed.coverBody ? String(parsed.coverBody) : undefined,
      events,
    }
  } catch {
    return { error: "AI returned unreadable JSON" }
  }
}

export { detectLocale }
