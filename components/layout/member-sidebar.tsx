"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCircle,
  Calendar,
  ClipboardList,
  Lightbulb,
  LogOut,
  X,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { UserAvatar } from "../user-avatar"
import { LogoWordmark } from "@/components/brand/logo"

interface MemberSidebarProps {
  organizationName: string
  isOpen: boolean
  setIsOpenAction: (open: boolean) => void
}

export function MemberSidebar({ organizationName, isOpen, setIsOpenAction }: MemberSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Exact match for dashboard root, prefix match for sub-pages
  const isActive = (href: string) => {
    if (href === "/dashboard/member") return pathname === "/dashboard/member"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const [hasActiveTeams, setHasActiveTeams] = useState(false)

  useEffect(() => {
    fetch("/api/user/teams/status")
      .then(res => res.json())
      .then(data => setHasActiveTeams(data.hasActiveTeams))
      .catch(() => {})
  }, [pathname])

  const NavLink = ({ href, icon: Icon, label, badge, showDot }: { href: string; icon: any; label: string; badge?: string; showDot?: boolean }) => (
    <Link
      href={href}
      onClick={() => setIsOpenAction(false)}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-[13px] font-medium group relative overflow-hidden ${isActive(href)
        ? "text-white"
        : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
        }`}
    >
      {isActive(href) && (
        <motion.div layoutId="member-sidebar-active" className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-white/10" />
      )}
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 z-10 transition-colors ${isActive(href) ? "text-blue-400" : "group-hover:text-white/80"}`} />
      <span className="flex-1 truncate z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 ${isActive(href) ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10 text-white/60"}`}>
          {badge}
        </span>
      )}
      {showDot && (
        <span className="relative flex h-2.5 w-2.5 z-10 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        </span>
      )}
    </Link>
  )

  const sidebarContent = (
    <>
      {/* Logo & Org */}
      <div className="px-4 py-8 border-b border-white/[0.06]">
        <Link href="/dashboard/member/home" className="group flex flex-col gap-1.5" onClick={() => setIsOpenAction(false)}>
          <LogoWordmark href={null} compact className="h-9" />
          <div className="min-w-0 pl-0.5">
            <p className="truncate text-sm font-semibold text-white/90 transition-colors group-hover:text-blue-300">
              {organizationName || "Club"}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Member</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <NavLink href="/dashboard/member" icon={LayoutGrid} label="Overview" />
        <NavLink href="/dashboard/member/home" icon={LayoutDashboard} label="Home" />
        <NavLink href="/dashboard/member/posts" icon={MessageSquare} label="News" />
        <NavLink href="/dashboard/member/events" icon={Calendar} label="Events" />
        <NavLink href="/dashboard/member/tasks" icon={ClipboardList} label="Tasks" />
        <NavLink href="/dashboard/member/proposals" icon={Lightbulb} label="Ideas" />
        <NavLink href="/dashboard/member/teams" icon={Users} label="Teams" showDot={hasActiveTeams} />
        <NavLink href="/dashboard/member/profile" icon={UserCircle} label="Profile" />
      </nav>

      {/* User & Sign Out */}
      <div className="border-t border-white/[0.06] px-3 py-6 space-y-4 bg-white/[0.01]">
        <div className="flex items-center gap-3 px-3">
          <div className="ring-2 ring-blue-500/20 rounded-full p-0.5">
            <UserAvatar avatarId={(session?.user as any)?.avatarId} name={session?.user?.name} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{session?.user?.name || "Member"}</p>
            <p className="text-[10px] text-white/20 truncate uppercase tracking-tighter">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-[10px] font-black w-full text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 uppercase tracking-widest"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col bg-soot border-r border-jasmine/10 shadow-2xl z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsOpenAction(false)} 
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-screen w-72 bg-[#0a0a0f] border-r border-white/10 shadow-2xl flex flex-col pt-4"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsOpenAction(false)} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white border border-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
