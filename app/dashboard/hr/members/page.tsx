"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, CheckCircle, Clock, Mail, Eye, Bell } from "lucide-react"
import type { MemberData } from "@/lib/types"
import { toast } from "sonner"

export default function MembersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [members, setMembers] = useState<MemberData[]>([])
  const [filteredMembers, setFilteredMembers] = useState<MemberData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "completed" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && session?.user.role === "HR" && session.user.organizationId) {
      fetchMembers()
    }
  }, [status, router, session])

  useEffect(() => {
    let filtered = members
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
      )
    }
    if (filterType !== "all") {
      filtered = filtered.filter((m) =>
        filterType === "completed" ? m.testCompleted : !m.testCompleted,
      )
    }
    setFilteredMembers(filtered)
  }, [searchQuery, members, filterType])

  const fetchMembers = async () => {
    try {
      const response = await fetch(
        `/api/users?organizationId=${session?.user.organizationId}&role=MEMBER`,
      )
      if (!response.ok) throw new Error("Failed")
      const data = await response.json()
      const formattedMembers = data.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        dominantType: member.results[0]?.dominantType || null,
        testCompleted: member.results.length > 0,
        memberStatus: member.memberStatus,
      }))
      setMembers(formattedMembers)
      setFilteredMembers(formattedMembers)
    } catch {
      setError("Could not load members. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const typeLabel = (type: string | null) => {
    switch (type) {
      case "D":
        return "Dominant (D)"
      case "I":
        return "Influencer (I)"
      case "S":
        return "Steady (S)"
      case "C":
        return "Careful (C)"
      default:
        return "No result yet"
    }
  }

  const statusPill = (m: MemberData) => {
    if (m.memberStatus === "REJECTED")
      return { label: "Rejected", cls: "bg-rose-50 text-rose-700 border-rose-200" }
    if (m.memberStatus === "AWAITING_HR")
      return { label: "Needs review", cls: "bg-violet-50 text-violet-700 border-violet-200" }
    if (m.memberStatus === "TEST_PENDING")
      return { label: "Invited", cls: "bg-amber-50 text-amber-700 border-amber-200" }
    return { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  }

  const stats = {
    total: members.length,
    active: members.filter((e) => e.memberStatus === "ACCEPTED" || !e.memberStatus).length,
    waiting: members.filter((e) => e.memberStatus === "AWAITING_HR").length,
  }

  if (isLoading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#203b36]/15 border-t-[#203b36]" />
            <p className="mt-4 text-sm text-[#737c74]">Loading members…</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  if (error) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <PageTour
        storageKey="tafsula_tour_hr_members_v1"
        steps={[
          {
            target: "members-actions",
            title: "Invite people",
            body: "Send an invite, or download your member list as a CSV file.",
          },
          {
            target: "members-stats",
            title: "Quick numbers",
            body: "See how many members you have, and who still needs review.",
          },
          {
            target: "members-search",
            title: "Find someone",
            body: "Search by name or email. Filter by who finished the DISC test.",
          },
          {
            target: "members-list",
            title: "Member cards",
            body: "Open a profile to see details, or remind someone to finish their test.",
          },
        ]}
      />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">
              Members
            </h1>
            <p className="mt-1 text-sm text-[#737c74]">
              Invite people, see who is active, and export your list.
            </p>
          </div>
          <div data-tour="members-actions" className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-[#deddd3] text-[#203b36] sm:w-auto"
              onClick={() => {
                window.location.href = "/api/hr/members/export"
              }}
            >
              Export CSV
            </Button>
            <Button
              asChild
              className="h-11 w-full rounded-xl bg-[#203b36] text-white hover:bg-[#2d5148] sm:w-auto"
            >
              <Link href="/dashboard/hr/members/invite" className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invite member
              </Link>
            </Button>
          </div>
        </div>

        <div data-tour="members-stats" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={Users} label="All members" value={stats.total} sub="In your club" />
          <StatCard icon={CheckCircle} label="Active" value={stats.active} sub="Ready to help" />
          <StatCard icon={Clock} label="Waiting" value={stats.waiting} sub="Need your review" />
        </div>

        <div data-tour="members-search" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
            <Input
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-[#deddd3] bg-white pl-11 text-sm text-[#1e302d] placeholder:text-[#9aa39a]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "completed", label: "Test done" },
                { id: "pending", label: "Test pending" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`h-10 rounded-xl border px-4 text-xs font-semibold ${
                  filterType === f.id
                    ? "border-[#203b36] bg-[#203b36] text-white"
                    : "border-[#deddd3] bg-white text-[#53635a]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div data-tour="members-list">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-[#e7e5dc] bg-white py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-[#cfcfc4]" />
              <p className="text-lg font-semibold text-[#1e302d]">No members found</p>
              <p className="mt-2 text-sm text-[#737c74]">
                Try another search, or invite someone new.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((member) => {
                const pill = statusPill(member)
                return (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-[#1e302d]">
                          {member.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-[#737c74]">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {member.email}
                        </p>
                      </div>
                      <Badge className={`shrink-0 border text-[10px] font-semibold ${pill.cls}`}>
                        {pill.label}
                      </Badge>
                    </div>

                    <div className="mb-4 rounded-xl border border-[#eeebe3] bg-[#fbfaf7] px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b938a]">
                        DISC result
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#1e302d]">
                        {typeLabel(member.dominantType)}
                      </p>
                    </div>

                    {member.memberStatus === "AWAITING_HR" ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          className="h-11 flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/hr/employees/${member.id}/decision`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ decision: "ACCEPTED" }),
                              })
                              if (!res.ok) throw new Error("fail")
                              toast.success(`${member.name} approved`)
                              fetchMembers()
                            } catch {
                              toast.error("Could not approve")
                            }
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 flex-1 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/hr/employees/${member.id}/decision`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ decision: "REJECTED" }),
                              })
                              if (!res.ok) throw new Error("fail")
                              toast.success("Request declined")
                              fetchMembers()
                            } catch {
                              toast.error("Could not decline")
                            }
                          }}
                        >
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="h-11 w-full rounded-xl bg-[#203b36] text-white hover:bg-[#2d5148]"
                        onClick={() => router.push(`/dashboard/hr/members/${member.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Open profile
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </HRLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any
  label: string
  value: number
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b938a]">{label}</p>
        <div className="rounded-xl bg-[#f5f4ef] p-2 text-[#53635a]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[#1e302d]">{value}</p>
      <p className="mt-1 text-xs text-[#8b938a]">{sub}</p>
    </div>
  )
}
