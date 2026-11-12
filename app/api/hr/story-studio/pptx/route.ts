import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRSessionUser } from "@/lib/hr-session-user"
import { UserRole } from "@/types/user"
import { buildStoryPptx } from "@/lib/story-studio/pptx"
import type { StoryDeck } from "@/lib/story-studio/types"

export const maxDuration = 60
export const runtime = "nodejs"

export async function POST(req: Request) {
  const user = getHRSessionUser(await getServerSession(authOptions))
  if (!user || user.role !== UserRole.HR || !user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { deck } = (await req.json()) as { deck?: StoryDeck }
    if (!deck?.slides?.length) return NextResponse.json({ error: "Missing deck" }, { status: 400 })
    const buf = await buildStoryPptx(deck)
    const filename = `${(deck.organizationName || "club").replace(/[^\w]+/g, "-")}-story.pptx`
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[story-studio] pptx failed", error)
    return NextResponse.json({ error: "PowerPoint export failed" }, { status: 500 })
  }
}
