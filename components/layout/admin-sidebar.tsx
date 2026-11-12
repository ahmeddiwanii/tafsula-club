"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Building2,
  ShieldAlert,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { UserAvatar } from "../user-avatar"
import { LogoWordmark } from "@/components/brand/logo"

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedSections, setExpandedSections] = useState<string[]>(["main"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  // Exact match for dashboard root, prefix match for sub-pages
  const isActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const NavLink = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: string }) => (
    <Link
      href={href}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-[13px] font-medium group relative overflow-hidden ${isActive(href)
        ? "text-white"
        : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
        }`}
    >
      {isActive(href) && (
        <motion.div layoutId="admin-sidebar-active" className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-white/10" />
      )}
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 z-10 transition-colors ${isActive(href) ? "text-purple-400" : "group-hover:text-white/80"}`} />
      <span className="flex-1 truncate z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 ${isActive(href) ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/10 text-white/60"}`}>
          {badge}
        </span>
      )}
    </Link>
  )

  const sidebarContent = (
    <>
      {/* Logo & Org */}
      <div className="px-4 py-8 border-b border-white/[0.06]">
        <Link href="/dashboard/admin" className="group flex flex-col gap-1.5" onClick={() => setIsOpen(false)}>
          <LogoWordmark href={null} compact className="h-9" />
          <div className="min-w-0 pl-0.5">
            <p className="truncate text-sm font-semibold text-jasmine/90">
              Platform admin
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">System</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <NavLink href="/dashboard/admin" icon={LayoutDashboard} label="Overview" />
        <NavLink href="/dashboard/admin/join-requests" icon={ShieldAlert} label="Club requests" />
        <NavLink href="/dashboard/admin/organizations" icon={Building2} label="Clubs" />
        <NavLink href="/dashboard/admin/users" icon={Users} label="Users" />
        <NavLink href="/dashboard/admin/events" icon={Calendar} label="All events" />
        <NavLink href="/dashboard/admin/settings" icon={Building2} label="Settings" />
      </nav>

      {/* User & Sign Out */}
      <div className="border-t border-white/[0.06] px-3 py-6 space-y-4 bg-white/[0.01]">
        <div className="flex items-center gap-3 px-3">
          <div className="ring-2 ring-purple-500/20 rounded-full p-0.5">
            <UserAvatar avatarId={(session?.user as any)?.avatarId} name={session?.user?.name} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{session?.user?.name || "Super Admin"}</p>
            <p className="text-[10px] text-white/20 truncate uppercase tracking-tighter">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-[10px] font-black w-full text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 uppercase tracking-widest"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col bg-[#050508] border-r border-white/[0.06] shadow-2xl z-40">
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
              onClick={() => setIsOpen(false)} 
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-screen w-72 bg-[#0a0a0f] border-r border-white/10 shadow-2xl flex flex-col pt-4"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white border border-white/5">
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
