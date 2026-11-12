"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Search,
  Users,
  Plus,
  Calendar,
  Briefcase,
  Eye,
  Edit,
  CheckCircle,
  Trash2,
  MoreVertical,
  LayoutGrid,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Team {
  id: string
  name: string
  purpose?: string
  description?: string
  status: string
  eventId?: string
  projectId?: string
  members: any[]
  memberCount: number
  taskCount: number
  createdBy: string
}

interface Event {
  id: string
  title: string
  startAt: string
  endAt?: string
  description?: string
}

export default function TeamsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "event-based" | "independent">("all")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", purpose: "", type: "independent" })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && session?.user.role === "HR") {
      fetchTeamsAndEvents()
    }
  }, [status, router, session])

  useEffect(() => {
    let filtered = teams
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(q))
    }
    if (filterType === "event-based") filtered = filtered.filter((t) => t.eventId)
    if (filterType === "independent") filtered = filtered.filter((t) => !t.eventId)
    if (selectedEvent && filterType !== "independent") {
      filtered = filtered.filter((t) => t.eventId === selectedEvent)
    }
    setFilteredTeams(filtered)
  }, [searchQuery, teams, filterType, selectedEvent])

  const fetchTeamsAndEvents = async () => {
    try {
      const [teamsRes, eventsRes] = await Promise.all([
        fetch(`/api/teams?organizationId=${session?.user.organizationId}`),
        fetch(`/api/events?organizationId=${session?.user.organizationId}`),
      ])
      if (!teamsRes.ok || !eventsRes.ok) throw new Error("Failed to fetch")
      const teamsData = await teamsRes.json()
      const eventsResponse = await eventsRes.json()
      const teamsArray = teamsData?.teams || (Array.isArray(teamsData) ? teamsData : [])
      setTeams(teamsArray)
      setFilteredTeams(teamsArray)
      setEvents(eventsResponse?.events || [])
    } catch {
      toast.error("Could not load teams")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Team deleted")
      fetchTeamsAndEvents()
    } catch {
      toast.error("Could not delete team")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error("Please enter a team name")
      return
    }
    if (newTeam.type === "event-based" && !selectedEvent) {
      toast.error("Please pick an event")
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeam.name,
          purpose: newTeam.purpose,
          organizationId: session?.user.organizationId,
          eventId: newTeam.type === "event-based" ? selectedEvent : null,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Team created")
      setNewTeam({ name: "", purpose: "", type: "independent" })
      setShowCreateModal(false)
      setSelectedEvent(null)
      await fetchTeamsAndEvents()
    } catch {
      toast.error("Could not create team")
    } finally {
      setIsCreating(false)
    }
  }

  const stats = {
    total: teams.length,
    eventBased: teams.filter((t) => t.eventId).length,
    independent: teams.filter((t) => !t.eventId).length,
    active: teams.filter((t) => t.status === "active" || t.status === "ACTIVE").length,
  }

  if (isLoading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#203b36]/15 border-t-[#203b36]" />
            <p className="mt-4 text-sm text-[#737c74]">Loading teams…</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <PageTour
        storageKey="tafsula_tour_hr_teams_v1"
        steps={[
          {
            target: "teams-actions",
            title: "Create a team",
            body: "Add a new team, or open the board to move people into teams.",
          },
          {
            target: "teams-stats",
            title: "Quick numbers",
            body: "See how many teams you have, and which ones are linked to an event.",
          },
          {
            target: "teams-search",
            title: "Find a team",
            body: "Search by name, or filter by event teams vs standing teams.",
          },
          {
            target: "teams-list",
            title: "Your teams",
            body: "Open a team to see members and tasks. Edit or delete from the menu.",
          },
        ]}
      />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">Teams</h1>
            <p className="mt-1 text-sm text-[#737c74]">
              Make teams, add people, and give them work.
            </p>
          </div>
          <div data-tour="teams-actions" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              onClick={() => router.push("/dashboard/hr/teams/orchestrator")}
              variant="outline"
              className="h-11 w-full rounded-xl border-[#deddd3] text-[#203b36] sm:w-auto"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Team board
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-11 w-full rounded-xl bg-[#203b36] text-white hover:bg-[#2d5148] sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create team
            </Button>
          </div>
        </div>

        <div data-tour="teams-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard icon={Users} label="All teams" value={stats.total} />
          <StatCard icon={Calendar} label="For an event" value={stats.eventBased} />
          <StatCard icon={Briefcase} label="Standing teams" value={stats.independent} />
          <StatCard icon={CheckCircle} label="Active" value={stats.active} />
        </div>

        <div data-tour="teams-search" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
            <Input
              placeholder="Search by team name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-[#deddd3] bg-white pl-11 text-sm text-[#1e302d] placeholder:text-[#9aa39a]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "event-based", label: "Event teams" },
                { id: "independent", label: "Standing teams" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilterType(f.id)
                  setSelectedEvent(null)
                }}
                className={`h-10 rounded-xl border px-4 text-xs font-semibold transition-all ${
                  filterType === f.id
                    ? "border-[#203b36] bg-[#203b36] text-white"
                    : "border-[#deddd3] bg-white text-[#53635a] hover:border-[#203b36]/30 hover:text-[#1e302d]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {filterType === "event-based" && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-x-auto pb-1"
            >
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className={`h-10 shrink-0 rounded-xl border px-4 text-xs font-semibold ${
                  selectedEvent === null
                    ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                    : "border-[#deddd3] bg-white text-[#53635a]"
                }`}
              >
                All events
              </button>
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event.id)}
                  className={`h-10 shrink-0 rounded-xl border px-4 text-xs font-semibold ${
                    selectedEvent === event.id
                      ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                      : "border-[#deddd3] bg-white text-[#53635a]"
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div data-tour="teams-list">
          {filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-[#e7e5dc] bg-white py-16 text-center sm:py-20">
              <Users className="mx-auto mb-4 h-12 w-12 text-[#cfcfc4]" />
              <p className="text-lg font-semibold text-[#1e302d]">No teams yet</p>
              <p className="mx-auto mt-2 mb-6 max-w-sm text-sm text-[#737c74]">
                Create a team, add people, then give them tasks.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-11 rounded-xl bg-[#203b36] px-6 text-white hover:bg-[#2d5148]"
              >
                Create team
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTeams.map((team, index) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  index={index}
                  onManage={() => router.push(`/dashboard/hr/teams/${team.id}`)}
                  onEdit={() => router.push(`/dashboard/hr/teams/${team.id}/edit`)}
                  onDelete={() => setIsDeleting(team.id)}
                  isActionMenuOpen={actionMenuId === team.id}
                  setActionMenuId={setActionMenuId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#132b2a]/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-[#e7e5dc] bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-7"
            >
              <h3 className="text-xl font-semibold text-[#1e302d]">Create a team</h3>
              <p className="mt-1 text-sm text-[#737c74]">Give it a clear name so people know what it is for.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1e302d]">Team name</label>
                  <Input
                    placeholder="e.g. Welcome desk"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="h-11 rounded-xl border-[#deddd3] bg-[#fbfaf7] text-[#1e302d]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1e302d]">What is this team for?</label>
                  <Input
                    placeholder="Short description (optional)"
                    value={newTeam.purpose}
                    onChange={(e) => setNewTeam({ ...newTeam, purpose: e.target.value })}
                    className="h-11 rounded-xl border-[#deddd3] bg-[#fbfaf7] text-[#1e302d]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1e302d]">Team type</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setNewTeam({ ...newTeam, type: "event-based" })}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${
                        newTeam.type === "event-based"
                          ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                          : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a]"
                      }`}
                    >
                      <Calendar className="h-4 w-4" /> For an event
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTeam({ ...newTeam, type: "independent" })}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${
                        newTeam.type === "independent"
                          ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                          : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a]"
                      }`}
                    >
                      <Briefcase className="h-4 w-4" /> Standing team
                    </button>
                  </div>
                </div>

                {newTeam.type === "event-based" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1e302d]">Pick an event</label>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {events.length === 0 ? (
                        <p className="rounded-xl border border-[#deddd3] bg-[#fbfaf7] p-3 text-sm text-[#737c74]">
                          No events yet. Create an event first, or make a standing team.
                        </p>
                      ) : (
                        events.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedEvent(event.id)}
                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                              selectedEvent === event.id
                                ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                                : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a]"
                            }`}
                          >
                            {event.title}
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                selectedEvent === event.id ? "bg-[#203b36]" : "bg-[#cfcfc4]"
                              }`}
                            />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                  <Button
                    variant="ghost"
                    className="h-11 flex-1 rounded-xl text-[#53635a]"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 flex-1 rounded-xl bg-[#203b36] text-white hover:bg-[#2d5148]"
                    onClick={handleCreateTeam}
                    disabled={isCreating}
                  >
                    {isCreating ? "Saving…" : "Create team"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#132b2a]/50 backdrop-blur-sm"
              onClick={() => setIsDeleting(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative w-full rounded-t-3xl border border-[#e7e5dc] bg-white p-6 text-center shadow-xl sm:max-w-sm sm:rounded-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#1e302d]">Delete this team?</h3>
              <p className="mt-2 text-sm text-[#737c74]">
                Members will be removed from the team. This cannot be undone.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    handleDeleteTeam(isDeleting)
                    setIsDeleting(null)
                  }}
                  className="h-11 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                >
                  Yes, delete
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 rounded-xl text-[#53635a]"
                  onClick={() => setIsDeleting(null)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HRLayout>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b938a]">{label}</p>
        <div className="rounded-xl bg-[#f5f4ef] p-2 text-[#53635a]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[#1e302d]">{value}</p>
    </div>
  )
}

function TeamCard({
  team,
  index,
  onManage,
  onEdit,
  onDelete,
  isActionMenuOpen,
  setActionMenuId,
}: {
  team: Team
  index: number
  onManage: () => void
  onEdit: () => void
  onDelete: () => void
  isActionMenuOpen: boolean
  setActionMenuId: (id: string | null) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative flex flex-col rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-[#1e302d]">{team.name}</h3>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                team.status === "active" || team.status === "ACTIVE" ? "bg-emerald-500" : "bg-[#cfcfc4]"
              }`}
            />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-[#737c74]">
            {team.purpose || "No description yet"}
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setActionMenuId(isActionMenuOpen ? null : team.id)}
            className="rounded-xl border border-[#deddd3] p-2 text-[#637168] hover:bg-[#f5f4ef]"
            aria-label="Team actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {isActionMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-[#e7e5dc] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  onClick={onManage}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#1e302d] hover:bg-[#f5f4ef]"
                >
                  <Eye className="h-4 w-4 text-[#53635a]" /> Open
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#1e302d] hover:bg-[#f5f4ef]"
                >
                  <Edit className="h-4 w-4 text-[#53635a]" /> Edit
                </button>
                <div className="my-1 border-t border-[#eeebe3]" />
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {team.members?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {team.members.slice(0, 8).map((member: any) => (
            <div
              key={member.id || member.userId}
              title={member.user?.name}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e5dc] bg-[#f5f4ef] text-[10px] font-bold uppercase text-[#53635a]"
            >
              {member.user?.name?.charAt(0) || "?"}
            </div>
          ))}
          {team.members.length > 8 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce7cf] bg-[#eef3e4] text-[10px] font-bold text-[#42592a]">
              +{team.members.length - 8}
            </div>
          )}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#eeebe3] bg-[#fbfaf7] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b938a]">Members</p>
          <p className="text-lg font-semibold text-[#1e302d]">{team.memberCount ?? team.members?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[#eeebe3] bg-[#fbfaf7] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b938a]">Tasks</p>
          <p className="text-lg font-semibold text-[#1e302d]">{team.taskCount ?? 0}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[#eeebe3] pt-3">
        {team.eventId ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#637168]">
            <Calendar className="h-3.5 w-3.5" /> Event team
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#637168]">
            <Briefcase className="h-3.5 w-3.5" /> Standing team
          </span>
        )}
        <button
          type="button"
          onClick={onManage}
          className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#203b36] px-3 text-sm font-semibold text-white hover:bg-[#2d5148]"
        >
          Open <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
