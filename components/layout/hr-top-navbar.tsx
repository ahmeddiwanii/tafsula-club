"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { UserAvatar } from "../user-avatar"
import { LogoWordmark } from "@/components/brand/logo"
import { 
  Menu as MenuIcon, 
  Bell as BellIcon, 
  Search as SearchIcon, 
  Zap as ZapIcon, 
  Terminal as TerminalIcon 
} from "lucide-react"

interface HRTopNavProps {
  organizationName: string
  onMenuAction: () => void
}

export function HRTopNav({ organizationName, onMenuAction }: HRTopNavProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 w-full border-b-[2.5px] border-soot/10 bg-jasmine/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMenuAction}
            className="md:hidden p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 md:hidden">
            <LogoWordmark href={null} compact className="h-8" />
            <span className="truncate text-xs font-semibold text-soot/60">
              {organizationName.split(" ")[0]}
            </span>
          </div>

          {/* Desktop Search / Breadcrumbs Placeholder */}
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] group focus-within:border-blue-500/30 transition-all">
            <SearchIcon className="w-3.5 h-3.5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search…"
              className="bg-transparent border-none outline-none text-[11px] font-medium text-white/60 placeholder:text-white/10 w-48"
            />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">⌘K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 pr-4 border-r border-white/5">
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   <span className="text-[10px] font-semibold text-soot/80">Online</span>
                </div>
                <span className="text-[8px] font-medium text-soot/40">Bureau workspace</span>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all group">
              <BellIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#050508]" />
            </button>
            
            <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all group">
              <TerminalIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            <div className="ml-2 pl-4 border-l border-white/5 hidden xs:flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {session?.user?.name}
                  </p>
                  <p className="text-[8px] font-bold text-blue-400/60 uppercase tracking-widest">Administrator</p>
               </div>
               <div className="ring-2 ring-blue-500/10 rounded-full p-0.5">
                  <UserAvatar avatarId={(session?.user as any)?.avatarId} name={session?.user?.name} size="sm" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
