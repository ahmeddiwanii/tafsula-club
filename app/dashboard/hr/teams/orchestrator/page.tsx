"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import {
  Users,
  Search,
  ArrowLeft,
  Shield,
  Plus,
  UserPlus,
  Trash2,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatarId: number
  teams?: string[]
}

interface TeamMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    avatarId: number
  }
}

interface Team {
  id: string
  name: string
  purpose: string
  members: TeamMember[]
  directors: { userId: string; user: { name: string } }[]
}

export default function TeamBoardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [mobileTab, setMobileTab] = useState<"people" | "teams">("people")

  useEffect(() => {
    if (session?.user?.organizationId) fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch(`/api/users?organizationId=${session?.user.organizationId}`),
        fetch(`/api/teams?organizationId=${session?.user.organizationId}`),
      ])
      const usersData = await usersRes.json()
      const teamsData = await teamsRes.json()
      setUsers(Array.isArray(usersData) ? usersData : usersData?.users || [])
      setTeams(teamsData?.teams || (Array.isArray(teamsData) ? teamsData : []))
    } catch {
      toast.error("Could not load team board")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToTeam = async (userId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success("Member added to team")
        fetchData()
      } else {
        toast.error("Could not add member")
      }
    } catch {
      toast.error("Could not add member")
    }
  }

  const handleRemoveFromTeam = async (userId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Member removed")
        fetchData()
      } else {
        toast.error("Could not remove member")
      }
    } catch {
      toast.error("Could not remove member")
    }
  }

  const handleToggleDirector = async (userId: string, teamId: string, isDirector: boolean) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/directors`, {
        method: isDirector ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success(isDirector ? "Lead removed" : "Team lead set")
        fetchData()
      } else {
        toast.error("Could not update team lead")
      }
    } catch {
      toast.error("Could not update team lead")
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#203b36]/15 border-t-[#203b36]" />
            <p className="mt-4 text-sm text-[#737c74]">Loading team board…</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="relative z-10 space-y-5">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/hr/teams")}
            className="mb-3 -ml-2 text-[#637168] hover:bg-white hover:text-[#1e302d]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to teams
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">
            Team board
          </h1>
          <p className="mt-1 text-sm text-[#737c74]">
            Drag a person onto a team to add them. On phone, tap Add on a team card.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
          <input
            type="text"
            placeholder="Search people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#deddd3] bg-white pl-11 pr-4 text-sm text-[#1e302d] outline-none placeholder:text-[#9aa39a] focus:border-[#203b36]/40"
          />
        </div>

        <div className="flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("people")}
            className={`h-10 flex-1 rounded-xl border text-sm font-semibold ${
              mobileTab === "people"
                ? "border-[#203b36] bg-[#203b36] text-white"
                : "border-[#deddd3] bg-white text-[#53635a]"
            }`}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("teams")}
            className={`h-10 flex-1 rounded-xl border text-sm font-semibold ${
              mobileTab === "teams"
                ? "border-[#203b36] bg-[#203b36] text-white"
                : "border-[#deddd3] bg-white text-[#53635a]"
            }`}
          >
            Teams
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:h-[calc(100vh-280px)] lg:flex-row lg:overflow-hidden">
          <div
            className={`flex w-full flex-col overflow-hidden rounded-2xl border border-[#e7e5dc] bg-white shadow-sm lg:w-80 lg:shrink-0 ${
              mobileTab === "people" ? "block" : "hidden lg:flex"
            }`}
          >
            <div className="border-b border-[#eeebe3] p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1e302d]">People</span>
                <Badge className="border border-[#deddd3] bg-[#f5f4ef] text-[10px] font-semibold text-[#53635a]">
                  {filteredUsers.length}
                </Badge>
              </div>
              <p className="text-xs text-[#8b938a]">Drag onto a team, or use Add on mobile</p>
            </div>
            <div className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto p-3 lg:max-h-none">
              {filteredUsers.map((user) => (
                <PeopleCard
                  key={user.id}
                  user={user}
                  onDragStart={() => setDraggedUser(user)}
                  onDragEnd={() => setDraggedUser(null)}
                  isAssigned={teams.some((t) => t.members.some((m) => m.userId === user.id))}
                  teams={teams}
                  onAddToTeam={(teamId) => handleAssignToTeam(user.id, teamId)}
                />
              ))}
              {filteredUsers.length === 0 && (
                <p className="p-4 text-center text-sm text-[#8b938a]">No people found</p>
              )}
            </div>
          </div>

          <div
            className={`min-h-0 flex-1 space-y-4 overflow-y-auto lg:pr-1 ${
              mobileTab === "teams" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {teams.map((team) => (
                <TeamDropCard
                  key={team.id}
                  team={team}
                  onDrop={() => draggedUser && handleAssignToTeam(draggedUser.id, team.id)}
                  onRemoveMember={(userId) => handleRemoveFromTeam(userId, team.id)}
                  onToggleDirector={(userId, isDir) => handleToggleDirector(userId, team.id, isDir)}
                />
              ))}
              <button
                type="button"
                onClick={() => router.push("/dashboard/hr/teams")}
                className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#deddd3] bg-white/50 text-[#8b938a] transition hover:border-[#203b36]/40 hover:text-[#1e302d]"
              >
                <Plus className="mb-2 h-8 w-8" />
                <span className="text-sm font-semibold">Create a new team</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  )
}

function PeopleCard({
  user,
  onDragStart,
  onDragEnd,
  isAssigned,
  teams,
  onAddToTeam,
}: {
  user: User
  onDragStart: () => void
  onDragEnd: () => void
  isAssigned: boolean
  teams: Team[]
  onAddToTeam: (teamId: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?"

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-xl border border-[#eeebe3] bg-[#fbfaf7] p-3 ${isAssigned ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#203b36] text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#1e302d]">{user.name}</p>
          <p className="truncate text-xs text-[#8b938a]">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-lg border border-[#deddd3] bg-white px-2 py-1 text-[10px] font-semibold text-[#53635a] lg:hidden"
        >
          Add
        </button>
      </div>
      {showAdd && (
        <div className="mt-2 space-y-1 border-t border-[#eeebe3] pt-2">
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onAddToTeam(t.id)
                setShowAdd(false)
              }}
              className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-[#1e302d] hover:bg-white"
            >
              Add to {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamDropCard({
  team,
  onDrop,
  onRemoveMember,
  onToggleDirector,
}: {
  team: Team
  onDrop: () => void
  onRemoveMember: (id: string) => void
  onToggleDirector: (id: string, isDir: boolean) => void
}) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
        setIsOver(false)
      }}
      className={`flex min-h-[280px] flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition ${
        isOver ? "border-[#203b36] bg-[#eef3e4]/40" : "border-[#e7e5dc]"
      }`}
    >
      <div className="border-b border-[#eeebe3] p-4">
        <h3 className="text-lg font-semibold text-[#1e302d]">{team.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-[#737c74]">
          {team.purpose || "No description"}
        </p>
      </div>

      <div className="border-b border-[#eeebe3] px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#53635a]">
          <Shield className="h-3.5 w-3.5" /> Team leads
        </div>
        <div className="flex flex-wrap gap-1.5">
          {team.directors?.length ? (
            team.directors.map((dir) => (
              <Badge
                key={dir.userId}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#dce7cf] bg-[#eef3e4] px-2 py-1 text-[10px] font-semibold text-[#42592a]"
              >
                {dir.user.name.split(" ")[0]}
                <button
                  type="button"
                  onClick={() => onToggleDirector(dir.userId, true)}
                  className="text-[#637168] hover:text-rose-600"
                  aria-label="Remove lead"
                >
                  ×
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-xs italic text-[#8b938a]">No lead yet</span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#53635a]">Members</span>
          <span className="text-xs text-[#8b938a]">{team.members?.length || 0}</span>
        </div>
        {(team.members || []).map((member) => {
          const isLead = team.directors?.some((d) => d.userId === member.userId)
          return (
            <motion.div
              key={member.id}
              layout
              className="flex items-center gap-2 rounded-xl border border-[#eeebe3] bg-[#fbfaf7] p-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-[#53635a]">
                {member.user.name?.[0] || "?"}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#1e302d]">
                {member.user.name}
              </p>
              <button
                type="button"
                title={isLead ? "Remove as lead" : "Make team lead"}
                onClick={() => onToggleDirector(member.userId, !!isLead)}
                className={`rounded-lg p-1.5 ${isLead ? "text-[#42592a]" : "text-[#cfcfc4] hover:text-[#53635a]"}`}
              >
                <Shield className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Remove from team"
                onClick={() => onRemoveMember(member.userId)}
                className="rounded-lg p-1.5 text-[#cfcfc4] hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
        {(!team.members || team.members.length === 0) && (
          <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-[#deddd3] text-[#8b938a]">
            <UserPlus className="mb-2 h-6 w-6" />
            <p className="text-xs font-medium">Drop a person here</p>
          </div>
        )}
      </div>
    </div>
  )
}
