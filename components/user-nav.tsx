"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { useSession } from "next-auth/react"
import { useSignOut } from "../hooks/useSignOut"
import { UserAvatar } from "./user-avatar"
import Link from "next/link"
import { LogIn, LayoutDashboard, UserCircle, Settings } from "lucide-react"
import { UserRole } from "@/types/user"

interface UserNavProps {
  variant?: "light" | "dark"
}

export function UserNav({ variant = "light" }: UserNavProps) {
  const { data: session, status } = useSession()
  const { signOut, isSigningOut } = useSignOut()

  if (status === "loading") return null

  // Not logged in — show a clear Login button
  if (!session) {
    const loginStyles = variant === "dark"
      ? "text-white/70 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/10"
      : "text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50"

    return (
      <Link href="/auth/login">
        <Button
          variant="ghost"
          className={`gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all border ${loginStyles}`}
        >
          <LogIn className="w-4 h-4" />
          Login
        </Button>
      </Link>
    )
  }

  // Logged in — show avatar dropdown
  const triggerHover = variant === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"
  const role = session.user?.role
  const dashboardHref =
    role === UserRole.HR
      ? "/dashboard/hr"
      :     role === UserRole.SUPERADMIN
        ? "/dashboard/admin"
        : role === UserRole.MEMBER
          ? "/dashboard/member/home"
          : "/dashboard"
  const profileHref =
    role === UserRole.MEMBER ? "/dashboard/member/profile" : "/dashboard/hr/settings"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${triggerHover} transition-colors p-0`}>
          <UserAvatar
            avatarId={session.user?.avatarId}
            name={session.user?.name}
            size="md"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white border border-gray-200 shadow-lg rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarId={session.user?.avatarId}
              name={session.user?.name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 leading-none truncate">{session.user?.name || "User"}</div>
              <div className="text-xs text-gray-500 leading-none mt-1 truncate">{session.user?.email}</div>
              {session.user?.role && (
                <div className="text-xs text-gray-500 leading-none mt-1.5 px-2 py-0.5 bg-gray-100 rounded-full inline-block">
                  {session.user.role}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 transition-colors">
          <Link href={dashboardHref} className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 opacity-60" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 transition-colors">
          <Link href={profileHref} className="flex items-center gap-2">
            <UserCircle className="w-4 h-4 opacity-60" />
            {role === UserRole.MEMBER ? "My profile" : "Profile & org"}
          </Link>
        </DropdownMenuItem>
        {role !== UserRole.MEMBER && (
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 transition-colors">
            <Link href="/dashboard/hr/settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4 opacity-60" />
              Settings
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-red-50 text-red-600 font-medium py-2 px-4 transition-colors"
          onClick={() => signOut()}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
