"use client"

import { createContext, useContext, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquareText,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react"
import { UserAvatar } from "../user-avatar"
import { OnboardingTour } from "@/components/onboarding-tour"
import { LogoWordmark } from "@/components/brand/logo"

interface HRLayoutProps {
  children: ReactNode
  orgName?: string
  organizationName?: string
}

const navigation = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/hr", icon: LayoutDashboard },
      { label: "Club news", href: "/dashboard/hr/home", icon: MessageSquareText },
      { label: "Story Studio", href: "/dashboard/hr/story-studio", icon: Sparkles },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Members", href: "/dashboard/hr/members", icon: UsersRound },
      { label: "Recruiting", href: "/dashboard/hr/recruitment", icon: UsersRound },
      { label: "Teams", href: "/dashboard/hr/teams", icon: Activity },
      { label: "Points", href: "/dashboard/hr/members/credits", icon: BarChart3 },
      { label: "Invite a member", href: "/dashboard/hr/members/invite", icon: UsersRound },
    ],
  },
  {
    label: "Club life",
    items: [
      { label: "Tasks", href: "/dashboard/hr/tasks", icon: ClipboardCheck },
      { label: "Events", href: "/dashboard/hr/events", icon: CalendarDays },
      { label: "Ideas", href: "/dashboard/hr/proposals", icon: Lightbulb },
    ],
  },
  {
    label: "Club",
    items: [
      { label: "Club profile", href: "/dashboard/hr/organization", icon: Building2 },
      { label: "Settings", href: "/dashboard/hr/settings", icon: Settings2 },
    ],
  },
]

function getPageTitle(pathname: string) {
  const allItems = navigation.flatMap((section) => section.items)
  const matchingItem = allItems
    .filter((item) =>
      item.href === "/dashboard/hr"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (pathname.includes("/events/new")) return "Create event"
  if (pathname.includes("/tasks/create")) return "Create task"
  if (pathname.includes("/tasks/review")) return "Review tasks"
  if (pathname.includes("/posts/") && pathname.endsWith("/edit")) return "Edit post"
  if (pathname.startsWith("/dashboard/hr/posts/")) return "Create a post"
  if (pathname.includes("/attendance")) return "Event attendance"
  if (pathname.includes("/feedback")) return "Event feedback"
  if (pathname.includes("/gallery")) return "Event gallery"
  if (pathname.includes("/qr")) return "Event check-in"
  if (pathname.includes("/members/credits")) return "Points"
  if (pathname.includes("/members/invite")) return "Invite a member"
  if (pathname.includes("/events/setup-teams-and-directors")) return "Event team setup"
  return matchingItem?.label ?? "Workspace"
}

const HRWorkspaceContext = createContext(false)

export function HRLayout({
  children,
  orgName,
  organizationName,
}: HRLayoutProps) {
  const alreadyInWorkspace = useContext(HRWorkspaceContext)

  if (alreadyInWorkspace) {
    return <>{children}</>
  }

  return (
    <HRWorkspaceContext.Provider value>
      <HRLayoutFrame
        orgName={orgName}
        organizationName={organizationName}
      >
        {children}
      </HRLayoutFrame>
    </HRWorkspaceContext.Provider>
  )
}

function HRLayoutFrame({
  children,
  orgName,
  organizationName,
}: HRLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeOrganization = orgName || organizationName || "Your workspace"
  const pageTitle = getPageTitle(pathname)

  const isActive = (href: string) =>
    href === "/dashboard/hr"
      ? pathname === href
      : pathname === href ||
        (pathname.startsWith(`${href}/`) &&
          !navigation
            .flatMap((section) => section.items)
            .some(
              (item) =>
                item.href !== href &&
                item.href.startsWith(`${href}/`) &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`)),
            ))

  return (
    <div className="hr-workspace min-h-screen bg-[#f5f4ef] text-slate-800">
      <OnboardingTour role="hr" />
      <a
        href="#hr-main-content"
        className="sr-only z-[70] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#132b2a]/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/[0.08] bg-[#162b2a] text-white transition-transform duration-200 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="HR workspace navigation"
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.08] px-5">
          <Link
            href="/dashboard/hr"
            className="flex min-w-0 flex-col gap-1"
            onClick={() => setMobileNavOpen(false)}
          >
            <LogoWordmark href={null} compact className="h-9" />
            <span className="truncate pl-0.5 text-[11px] text-[#b6c6bd]">
              {activeOrganization}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[#b6c6bd] hover:bg-white/10 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <section key={section.label} aria-label={section.label}>
              <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a59a]">
                {section.label}
              </h2>
              <div className="space-y-1">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileNavOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        active
                          ? "bg-[#c4e46a] font-semibold text-[#162b2a] shadow-sm"
                          : "text-[#d1dcd5] hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          active
                            ? "text-[#162b2a]"
                            : "text-[#91a59a] group-hover:text-white"
                        }`}
                      />
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight className="h-4 w-4 text-[#42592a]" />}
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
            <UserAvatar
              avatarId={(session?.user as { avatarId?: number } | undefined)?.avatarId}
              name={session?.user?.name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {session?.user?.name || "Workspace user"}
              </p>
              <p className="truncate text-[11px] text-[#91a59a]">HR administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#b6c6bd] transition-colors hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-[#e7e5dc] bg-[#fbfaf7]/90 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={mobileNavOpen}
                className="rounded-xl border border-[#deddd3] p-2 text-[#53635a] hover:bg-white md:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="hidden items-center gap-2 text-[11px] font-medium text-[#8b938a] sm:flex">
                  <span>PEOPLE OPERATIONS</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate text-[#57635a]">{activeOrganization}</span>
                </div>
                <h1 className="truncate text-lg font-semibold tracking-tight text-[#1e302d]">
                  {pageTitle}
                </h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden text-xs font-medium text-[#737c74] lg:inline">
                People operations
              </span>
              <Link
                href="/dashboard/hr/events/new"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#203b36] px-3 text-xs font-semibold text-white shadow-sm shadow-[#203b36]/20 transition-colors hover:bg-[#2d5148] sm:px-4 sm:text-sm"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Create event</span>
                <span className="sm:hidden">Create</span>
              </Link>
              <Link
                href="/dashboard/hr/organization"
                aria-label="Organization profile"
                className="hidden rounded-xl border border-[#deddd3] p-2 text-[#637168] transition-colors hover:bg-white sm:inline-flex"
              >
                <Building2 className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main
          id="hr-main-content"
          className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
