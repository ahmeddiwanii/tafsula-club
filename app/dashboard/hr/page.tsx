import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { ArrowUpRight, CalendarDays, CheckCheck, ClipboardList, Plus, Sparkles, UsersRound } from "lucide-react"

import { HRAnalytics, type DISCPoint, type HRTrendPoint } from "@/components/hr/hr-analytics"
import { KPICard } from "@/components/hr/dashboard-client"
import { GuideBanner } from "@/components/dashboard/guide-banner"
import { HRLayout } from "@/components/layout/hr-layout"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getHRSessionUser } from "@/lib/hr-session-user"
import { UserRole } from "@/types/user"

export default async function HRDashboardPage() {
  const user = getHRSessionUser(await getServerSession(authOptions))

  if (!user) {
    return <div className="p-8 text-center text-rose-600">Please sign in to continue.</div>
  }
  if (user.role !== UserRole.HR) {
    return <div className="p-8 text-center text-rose-600">You do not have access to this workspace.</div>
  }
  if (!user.organizationId) {
    return <div className="p-8 text-center text-rose-600">No organization is assigned to your account.</div>
  }

  const organizationId = user.organizationId
  const now = new Date()
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  let organization
  let memberCount = 0
  let testCompletionCount = 0
  let totalEvents = 0
  let totalRegistrations = 0
  let approvedRegistrations = 0
  let pendingTasks = 0
  let pendingProposals = 0
  let discResults: DISCPoint[] = []
  let upcomingEvents: {
    id: string
    title: string
    startAt: Date
    format: string
    type: string
    _count: { registrations: number }
  }[] = []
  let recentTasks: {
    id: string
    title: string
    status: string
    priority: string
    team: { name: string }
  }[] = []
  let membersCreated: Date[] = []
  let registrationsCreated: Date[] = []

  try {
    const [
      organizationRecord,
      members,
      assessedMembers,
      latestResults,
      eventCount,
      registrationCount,
      approvedCount,
      events,
      taskReviewCount,
      proposalReviewCount,
      tasks,
      memberActivity,
      eventActivity,
    ] = await Promise.all([
      prisma.organization.findUnique({ where: { id: organizationId } }),
      prisma.user.count({ where: { organizationId, role: "MEMBER" } }),
      prisma.user.count({
        where: { organizationId, role: "MEMBER", result: { some: {} } },
      }),
      prisma.user.findMany({
        where: { organizationId, role: "MEMBER", result: { some: {} } },
        select: {
          result: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { dominantType: true },
          },
        },
      }),
      prisma.event.count({ where: { organizationId } }),
      prisma.eventRegistration.count({
        where: { event: { organizationId } },
      }),
      prisma.eventRegistration.count({
        where: { event: { organizationId }, status: "APPROVED" },
      }),
      prisma.event.findMany({
        where: {
          organizationId,
          startAt: { gte: now },
          status: { not: "CANCELLED" },
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          format: true,
          type: true,
          _count: { select: { registrations: true } },
        },
        orderBy: { startAt: "asc" },
        take: 4,
      }),
      prisma.teamTaskAssignment.count({
        where: {
          task: { team: { organizationId } },
          status: "SUBMITTED",
        },
      }),
      prisma.proposal.count({
        where: { organizationId, status: "PENDING" },
      }),
      prisma.teamTask.findMany({
        where: { team: { organizationId } },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          team: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          organizationId,
          role: "MEMBER",
          createdAt: { gte: trendStart },
        },
        select: { createdAt: true },
      }),
      prisma.eventRegistration.findMany({
        where: {
          event: { organizationId },
          appliedAt: { gte: trendStart },
        },
        select: { appliedAt: true },
      }),
    ])

    organization = organizationRecord
    memberCount = members
    testCompletionCount = assessedMembers
    totalEvents = eventCount
    totalRegistrations = registrationCount
    approvedRegistrations = approvedCount
    pendingTasks = taskReviewCount
    pendingProposals = proposalReviewCount
    upcomingEvents = events
    recentTasks = tasks
    membersCreated = memberActivity.map(({ createdAt }) => createdAt)
    registrationsCreated = eventActivity.map(({ appliedAt }) => appliedAt)

    const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }
    for (const member of latestResults) {
      const type = member.result[0]?.dominantType
      if (type && type in counts) counts[type] += 1
    }
    discResults = Object.entries(counts).map(([type, count]) => ({ type, count }))
  } catch (error) {
    console.error("HR dashboard data load failed:", error)
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-sm text-rose-700 shadow-sm">
        We couldn&apos;t load your dashboard right now. Please refresh the page or try again later.
      </div>
    )
  }

  const completionRate =
    memberCount > 0 ? Math.round((testCompletionCount / memberCount) * 100) : 0

  const trend: HRTrendPoint[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    const countInMonth = (dates: Date[]) =>
      dates.filter(
        (activityDate) =>
          activityDate.getFullYear() === date.getFullYear() &&
          activityDate.getMonth() === date.getMonth(),
      ).length

    return {
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      members: countInMonth(membersCreated),
      registrations: countInMonth(registrationsCreated),
    }
  })

  return (
    <HRLayout orgName={organization?.name}>
      <div className="space-y-6">
        <GuideBanner
          storageKey="tafsula_hr_checklist_v2"
          title="Start here"
          body="Invite people, create an event, give a task, then post club news. You can edit events and posts later."
          steps={[
            { id: "invite", label: "Invite a member", href: "/dashboard/hr/members/invite", done: memberCount > 0 },
            { id: "event", label: "Create an event", href: "/dashboard/hr/events", done: totalEvents > 0 },
            { id: "task", label: "Create a task", href: "/dashboard/hr/tasks/create" },
            { id: "news", label: "Post club news", href: "/dashboard/hr/posts/new" },
          ]}
        />
        <section className="hr-hero relative isolate overflow-hidden rounded-[26px] bg-[#19332f] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-32 -z-10 h-80 w-80 rounded-full border-[44px] border-[#c4e46a]/10" />
          <div className="pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#c4e46a]/[0.07] blur-3xl" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              <Sparkles className="h-3.5 w-3.5 text-[#c4e46a]" />
              People &amp; culture
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Good to see you, {user.name?.split(" ")[0] || "there"}.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#c2d0c8]">
              A clearer picture of your people, priorities and what&apos;s coming up at{" "}
              <span className="font-medium text-white">{organization?.name || "your organization"}</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/hr/members/invite"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/[0.14]"
            >
              <UsersRound className="h-4 w-4" />
              Invite member
            </Link>
            <Link
              href="/dashboard/hr/events/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c4e46a] px-3.5 text-sm font-semibold text-[#19332f] shadow-sm shadow-black/10 transition-colors hover:bg-[#d3ed88]"
            >
              <Plus className="h-4 w-4" />
              New event
            </Link>
            <Link
              href="/dashboard/hr/story-studio"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c4e46a]/40 bg-[#c4e46a]/10 px-3.5 text-sm font-medium text-[#c4e46a] transition-colors hover:bg-[#c4e46a]/20"
            >
              <Sparkles className="h-4 w-4" />
              Story Studio
            </Link>
          </div>
          </div>
        </section>

        <section aria-label="Club metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            iconName="users"
            label="Members"
            value={memberCount}
            sub="People in your club"
            color="blue"
          />
          <KPICard
            iconName="check"
            label="Ideas to review"
            value={pendingProposals}
            sub="Member ideas waiting on the bureau"
            color="emerald"
          />
          <KPICard
            iconName="calendar"
            label="Upcoming events"
            value={upcomingEvents.length}
            sub={`${totalEvents} events created in total`}
            color="purple"
          />
          <KPICard
            iconName="zap"
            label="Event sign-ups"
            value={totalRegistrations}
            sub={`${approvedRegistrations} approved`}
            color="amber"
          />
        </section>

        <HRAnalytics trend={trend} disc={[]} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming events</h3>
                <p className="mt-1 text-xs text-slate-500">What&apos;s next for your team</p>
              </div>
              <Link
                href="/dashboard/hr/events"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All events <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {upcomingEvents.length ? (
              <div className="divide-y divide-slate-100">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/hr/events/${event.id}`}
                    className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-1"
                  >
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <span className="text-[9px] font-bold uppercase">
                        {new Intl.DateTimeFormat("en", { month: "short" }).format(event.startAt)}
                      </span>
                      <span className="text-sm font-semibold leading-4">{event.startAt.getDate()}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                        {event.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {event.format.replaceAll("_", " ")} · {event._count.registrations} registered
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">No upcoming events</p>
                <p className="mt-1 text-xs text-slate-500">Create an event to bring your team together.</p>
                <Link
                  href="/dashboard/hr/events/new"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
                >
                  Create an event <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Needs your attention</h3>
                <p className="mt-1 text-xs text-slate-500">Items waiting for HR review</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ClipboardList className="h-4 w-4" />
              </span>
            </div>
            <div className="space-y-2">
              <Link
                href="/dashboard/hr/tasks/review"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CheckCheck className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-semibold text-slate-800">Task submissions</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Review member work</span>
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {pendingTasks}
                </span>
              </Link>
              <Link
                href="/dashboard/hr/proposals"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-semibold text-slate-800">Team proposals</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Share feedback with your team</span>
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {pendingProposals}
                </span>
              </Link>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent team tasks</h3>
              <p className="mt-1 text-xs text-slate-500">Latest work across your teams</p>
            </div>
            <Link
              href="/dashboard/hr/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage tasks <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentTasks.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/dashboard/hr/tasks"
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-indigo-100 hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-800">{task.title}</span>
                    <span className="mt-1 block truncate text-[11px] text-slate-500">{task.team.name}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium capitalize text-slate-600">
                    {task.status.replaceAll("_", " ").toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">No team tasks yet</p>
              <p className="mt-1 text-xs text-slate-500">Create a task to get your team moving.</p>
              <Link
                href="/dashboard/hr/tasks/create"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
              >
                Create a task <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 text-[11px] text-slate-400">
          <span>{organization?.name || "Tafsula"} · HR workspace</span>
          <span>Metrics are based on current organization records.</span>
        </footer>
      </div>
    </HRLayout>
  )
}
