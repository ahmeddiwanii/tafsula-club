"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { UserNav } from "../../components/user-nav"
import { UserRole } from "../../types/user"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Building2,
} from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return [
          { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Club requests", href: "/dashboard/admin/join-requests", icon: <Users className="w-5 h-5" /> },
          { label: "Clubs", href: "/dashboard/admin/organizations", icon: <Building2 className="w-5 h-5" /> },
          { label: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
          { label: "All events", href: "/dashboard/admin/events", icon: <Calendar className="w-5 h-5" /> },
        ]
      case UserRole.HR:
        return [
          { label: "Dashboard", href: "/dashboard/hr", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Members", href: "/dashboard/hr/members", icon: <Users className="w-5 h-5" /> },
          { label: "Teams", href: "/dashboard/hr/teams", icon: <Users className="w-5 h-5" /> },
          { label: "Events", href: "/dashboard/hr/events", icon: <Calendar className="w-5 h-5" /> },
          { label: "Ideas", href: "/dashboard/hr/proposals", icon: <Zap className="w-5 h-5" /> },
        ]
      case UserRole.MEMBER:
        return [
          { label: "Dashboard", href: "/dashboard/member", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Events", href: "/dashboard/member/events", icon: <Calendar className="w-5 h-5" /> },
          { label: "Teams", href: "/dashboard/member/teams", icon: <Users className="w-5 h-5" /> },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navbar handled by root layout */}
      
      <div className="flex flex-1 overflow-hidden pt-20">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex border-r border-gray-200 bg-white flex-col transition-all duration-300 z-40 overflow-y-auto ${
          sidebarOpen ? "w-64" : "w-20"
        }`}>
          {/* Logo/Branding in sidebar */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && <span className="font-semibold text-gray-900 text-sm">Menu</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${sidebarOpen ? "rotate-0" : "-rotate-90"}`} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 transition-all ${
                    sidebarOpen ? "px-4" : "px-2 justify-center"
                  } text-gray-600 hover:text-gray-900 hover:bg-blue-50`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {item.icon}
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Settings & Logout */}
          <div className="border-t border-gray-200 p-3 space-y-2">
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 ${
                  sidebarOpen ? "px-4" : "px-2 justify-center"
                }`}
                title={!sidebarOpen ? "Settings" : undefined}
              >
                <Settings className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm">Settings</span>}
              </Button>
            </Link>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-24 left-6 z-40">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-20 left-0 right-0 bottom-0 bg-black/50 md:hidden z-30">
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <span className="font-semibold text-gray-900">Menu</span>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-blue-50"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>

              <div className="border-t border-gray-200 p-4 space-y-2">
                <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-600 md:text-left">
            &copy; {new Date().getFullYear()} Tafsula. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
