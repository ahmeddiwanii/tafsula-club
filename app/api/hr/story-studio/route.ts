import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRSessionUser } from "@/lib/hr-session-user"
import { UserRole } from "@/types/user"
import { gatherOrgActivity } from "@/lib/story-studio/gather"
import { generateStoryVoice } from "@/lib/story-studio/llm"
import { finalizeDeck } from "@/lib/story-studio/compose"
import { scopeOrgContext } from "@/lib/story-studio/brief"
import type { StoryLocale } from "@/lib/story-studio/types"

export const maxDuration = 60
export const runtime = "nodejs"

function parseBound(value: unknown, fallback: Date) {
  if (typeof value !== "string" || !value) return fallback
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? fallback : d
}

export async function POST(req: Request) {
  const user = getHRSessionUser(await getServerSession(authOptions))
  if (!user || user.role !== UserRole.HR || !user.organizationId) {
    return NextResponse.json({ error: "Only the bureau of this club can generate presentations." }, { status: 403 })
  }

  let body: { from?: string; to?: string; brief?: string; locale?: StoryLocale; theme?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const now = new Date()
  const from = parseBound(body.from, new Date(now.getFullYear(), 0, 1))
  const to = parseBound(body.to, now)
  if (from >= to) {
    return NextResponse.json({ error: "The end date must be after the start date." }, { status: 400 })
  }

  const brief = String(body.brief || "").slice(0, 2000)
  const locale = body.locale === "fr" || body.locale === "ar" || body.locale === "en" ? body.locale : undefined
  const themeLock = typeof body.theme === "string" ? body.theme : null

  try {
    const gathered = await gatherOrgActivity(user.organizationId, from, to)
    const context = scopeOrgContext(gathered, brief)
    const voice = await generateStoryVoice(context, brief, locale)
    const deck = finalizeDeck(context, brief, voice, locale, themeLock)
    return NextResponse.json({
      deck,
      stats: context.stats,
      period: context.period,
      voiceError: voice.error || null,
    })
  } catch (error) {
    console.error("[story-studio] generate failed", error)
    return NextResponse.json({ error: "Could not build the presentation from club data." }, { status: 500 })
  }
}
