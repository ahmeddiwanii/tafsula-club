"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Membership = {
  organizationId: string
  name: string
  status: string
  isActive: boolean
}

export function OrgSwitcher({
  className = "",
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [items, setItems] = useState<Membership[]>([])
  const [activeName, setActiveName] = useState("Your club")
  const [switching, setSwitching] = useState(false)

  const load = async () => {
    try {
      const res = await fetch("/api/memberships")
      if (!res.ok) return
      const data = await res.json()
      setItems(data.memberships || [])
      const active = (data.memberships || []).find((m: Membership) => m.isActive)
      if (active) setActiveName(active.name)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load()
  }, [])

  const switchTo = async (organizationId: string) => {
    if (switching) return
    setSwitching(true)
    try {
      const res = await fetch("/api/memberships/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Could not switch club")
        return
      }
      toast.success("Switched club")
      router.push(data.redirectTo || "/dashboard/member/home")
      router.refresh()
      // Force session refresh via full reload so JWT picks up new org
      window.location.href = data.redirectTo || "/dashboard/member/home"
    } catch {
      toast.error("Could not switch club")
    } finally {
      setSwitching(false)
    }
  }

  if (items.length <= 1) {
    return compact ? null : (
      <div className={`flex items-center gap-2 text-sm text-white/80 ${className}`}>
        <Building2 className="h-4 w-4 text-white/40" />
        <span className="truncate font-semibold">{activeName}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex max-w-[220px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white ${className}`}
        >
          <Building2 className="h-4 w-4 shrink-0 text-white/45" />
          <span className="min-w-0 flex-1 truncate font-semibold">{activeName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your clubs</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((m) => (
          <DropdownMenuItem
            key={m.organizationId}
            onClick={() => !m.isActive && switchTo(m.organizationId)}
            className="flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {m.status === "AWAITING_HR"
                  ? "Waiting for approval"
                  : m.status === "ACCEPTED"
                    ? "Active member"
                    : m.status}
              </p>
            </div>
            {m.isActive ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/organizations")}>
          Find another club
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
