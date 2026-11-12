"use client"

import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { UserAvatar } from "../user-avatar"
import {
  Menu as MenuIcon,
  Bell as BellIcon,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrgSwitcher } from "@/components/org-switcher"

interface MemberTopNavProps {
  organizationName: string
  onMenuAction: () => void
}

export function MemberTopNav({ organizationName: _organizationName, onMenuAction }: MemberTopNavProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#0a0c10]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:h-16 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuAction}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 md:hidden"
            type="button"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="min-w-0 md:hidden">
            <OrgSwitcher />
          </div>

          <div className="hidden md:block">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Your club</p>
            <OrgSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/member/events"
            className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white no-underline ring-1 ring-white/10 hover:bg-white/15 sm:inline-flex"
          >
            Find an event
          </Link>

          <button
            type="button"
            className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-white/45"
            aria-label="Notifications"
          >
            <BellIcon className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-2.5 text-white/80"
              >
                <UserAvatar avatarId={(session?.user as { avatarId?: number } | undefined)?.avatarId} name={session?.user?.name} size="sm" />
                <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/member/profile" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="flex items-center gap-2 text-rose-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
