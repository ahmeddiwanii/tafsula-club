import { prisma } from "@/lib/db"
import type { OrgActivityContext } from "./types"

function asImageList(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object" && "url" in item) return String((item as { url: unknown }).url || "")
        return ""
      })
      .filter((url) => /^https?:\/\//i.test(url))
      .slice(0, 8)
  }
  return []
}

function clip(text: string | null | undefined, max = 280) {
  if (!text) return ""
  const clean = text.replace(/\s+/g, " ").trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

function periodLabel(from: Date, to: Date) {
  const fmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" })
  return `${fmt.format(from)} — ${fmt.format(to)}`
}

export async function gatherOrgActivity(
  organizationId: string,
  from: Date,
  to: Date,
): Promise<OrgActivityContext> {
  const range = { gte: from, lte: to }

  const [
    organization,
    profile,
    membersAccepted,
    membersJoinedInPeriod,
    events,
    posts,
    teams,
    proposals,
    projects,
    tasksCompleted,
    credits,
  ] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true } }),
    prisma.organizationProfile.findUnique({ where: { organizationId } }),
    prisma.organizationMembership.count({
      where: { organizationId, status: "ACCEPTED" },
    }),
    prisma.organizationMembership.count({
      where: { organizationId, status: "ACCEPTED", createdAt: range },
    }),
    prisma.event.findMany({
      where: { organizationId, startAt: range, status: { not: "CANCELLED" } },
      orderBy: { startAt: "asc" },
      take: 40,
      include: {
        _count: { select: { registrations: true, attendances: true } },
        attendances: { where: { status: "ATTENDED" }, select: { id: true } },
        feedbacks: { select: { rating: true } },
      },
    }),
    prisma.organizationPost.findMany({
      where: {
        organizationId,
        createdAt: range,
        OR: [{ status: "approved" }, { approvalStatus: "approved" }, { status: "published" }],
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { title: true, content: true, imageUrl: true, createdAt: true },
    }),
    prisma.team.findMany({
      where: { organizationId },
      take: 16,
      include: { _count: { select: { members: true } } },
    }),
    prisma.proposal.findMany({
      where: { organizationId, createdAt: range },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { title: true, type: true, status: true, createdAt: true },
    }),
    prisma.project.findMany({
      where: {
        organizationId,
        OR: [{ createdAt: range }, { timelineStart: range }, { timelineEnd: range }],
      },
      take: 10,
      select: { title: true, status: true, description: true },
    }),
    prisma.teamTask.count({
      where: {
        team: { organizationId },
        updatedAt: range,
        OR: [{ status: "COMPLETED" }, { taskStatus: "FINALIZED" }],
      },
    }),
    prisma.memberCredit.findMany({
      where: { organizationId },
      select: { totalCredits: true },
    }),
  ])

  if (!organization) {
    throw new Error("Organization not found")
  }

  const mappedEvents = events.map((event) => {
    const ratings = event.feedbacks.map((f) => f.rating).filter((n): n is number => typeof n === "number")
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
    return {
      title: event.title,
      type: event.type,
      format: event.format,
      startAt: event.startAt.toISOString(),
      location: event.location,
      endAt: event.endAt ? event.endAt.toISOString() : null,
      venue: event.venue,
      summary: clip(event.summary, 520),
      description: clip(event.description, 700),
      posterUrl: event.posterUrl,
      gallery: asImageList(event.galleryImagesJson),
      registrations: event._count.registrations,
      attendances: event.attendances.length,
      rating: avg ? Math.round(avg * 10) / 10 : null,
    }
  })

  const registrations = mappedEvents.reduce((sum, e) => sum + e.registrations, 0)
  const attendances = mappedEvents.reduce((sum, e) => sum + e.attendances, 0)
  const pointsAwarded = credits.reduce((sum, c) => sum + (c.totalCredits || 0), 0)

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      bio: clip(profile?.bio, 400),
      location: profile?.location,
      website: profile?.website,
      logoUrl: profile?.profileImageUrl,
      coverUrl: profile?.coverImageUrl,
      gallery: asImageList(profile?.galleryImagesJson),
    },
    period: {
      from: from.toISOString(),
      to: to.toISOString(),
      label: periodLabel(from, to),
    },
    stats: {
      membersAccepted,
      membersJoinedInPeriod,
      events: events.length,
      registrations,
      attendances,
      posts: posts.length,
      teams: teams.length,
      proposals: proposals.length,
      projects: projects.length,
      tasksCompleted,
      pointsAwarded: Math.round(pointsAwarded),
    },
    events: mappedEvents,
    posts: posts.map((p) => ({
      title: p.title,
      content: clip(p.content, 180),
      imageUrl: p.imageUrl,
      createdAt: p.createdAt.toISOString(),
    })),
    teams: teams.map((t) => ({
      name: t.name,
      purpose: clip(t.purpose || t.description, 120),
      members: t._count.members,
    })),
    proposals: proposals.map((p) => ({
      title: p.title,
      type: p.type,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    projects: projects.map((p) => ({
      title: p.title,
      status: p.status,
      description: clip(p.description, 140),
    })),
  }
}
