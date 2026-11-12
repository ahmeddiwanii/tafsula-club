"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Eye,
  Edit,
  Search,
  Trash2,
  MoreVertical,
  Heart,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  description?: string
  type: string
  format: string
  price: number
  currency: string
  visibility: string
  status: string
  startAt: string
  endAt?: string
  location?: string
  venue?: string
  posterUrl?: string
  maxParticipants?: number | null
  _count?: { registrations: number; attendances: number; feedbacks: number }
}

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
}

export default function HREventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/events?includeAll=true")
      const data = await res.json()
      setEvents(data.events || data || [])
    } catch {
      toast.error("Could not load events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        setDeleteConfirm(null)
        toast.success("Event deleted")
      } else {
        toast.error("Could not delete event")
      }
    } catch {
      toast.error("Could not delete event")
    }
  }

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e)))
        setActionMenuId(null)
        toast.success("Status updated")
      } else {
        toast.error("Could not update status")
      }
    } catch {
      toast.error("Could not update status")
    }
  }

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ["all", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <PageTour
        storageKey="tafsula_tour_hr_events_v1"
        steps={[
          {
            target: "events-create",
            title: "Create an event",
            body: "Tap here to add a new club night, workshop, or meeting.",
          },
          {
            target: "events-stats",
            title: "Quick numbers",
            body: "See how many events you have and how many people signed up.",
          },
          {
            target: "events-search",
            title: "Find an event",
            body: "Search by name, or filter by status.",
          },
          {
            target: "events-list",
            title: "Your events",
            body: "Open an event to manage people, teams, and check-in.",
          },
        ]}
      />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">Events</h1>
            <p className="mt-1 text-sm text-[#737c74]">
              Create nights, workshops, and meetings. Edit them anytime.
            </p>
          </div>
          <div data-tour="events-create">
            <Button
              asChild
              className="h-11 w-full rounded-xl bg-[#203b36] text-white hover:bg-[#2d5148] sm:w-auto"
            >
              <Link href="/dashboard/hr/events/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create event
              </Link>
            </Button>
          </div>
        </div>

        {!loading && (
          <div data-tour="events-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard icon={Calendar} label="All events" value={events.length} />
            <StatCard
              icon={Calendar}
              label="Upcoming"
              value={events.filter((e) => e.status === "UPCOMING").length}
            />
            <StatCard
              icon={Users}
              label="Sign-ups"
              value={events.reduce((acc, e) => acc + (e._count?.registrations || 0), 0)}
            />
            <StatCard
              icon={Heart}
              label="Volunteer / fundraise"
              value={events.filter((e) => e.type === "VOLUNTEERING" || e.type === "FUNDRAISER").length}
            />
          </div>
        )}

        <div data-tour="events-search" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
            <Input
              placeholder="Search by event name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border-[#deddd3] bg-white pl-11 text-sm text-[#1e302d] placeholder:text-[#9aa39a]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`h-10 rounded-xl border px-3 text-xs font-semibold sm:px-4 ${
                  statusFilter === s
                    ? "border-[#203b36] bg-[#203b36] text-white"
                    : "border-[#deddd3] bg-white text-[#53635a] hover:border-[#203b36]/30"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div data-tour="events-list">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-[#e7e5dc] bg-white" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#e7e5dc] bg-white py-16 text-center sm:py-20">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-[#cfcfc4]" />
              <p className="text-lg font-semibold text-[#1e302d]">No events yet</p>
              <p className="mx-auto mt-2 mb-6 max-w-sm text-sm text-[#737c74]">
                {search
                  ? "Nothing matches your search. Try another word."
                  : "Create your first event to get people together."}
              </p>
              <Button asChild className="h-11 rounded-xl bg-[#203b36] px-6 text-white hover:bg-[#2d5148]">
                <Link href="/dashboard/hr/events/new">Create event</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  actionMenuOpen={actionMenuId === event.id}
                  onToggleMenu={() =>
                    setActionMenuId(actionMenuId === event.id ? null : event.id)
                  }
                  onStatusChange={(s) => handleStatusChange(event.id, s)}
                  onDelete={() => {
                    setDeleteConfirm(event.id)
                    setActionMenuId(null)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#132b2a]/50 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
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
              <h3 className="text-xl font-semibold text-[#1e302d]">Delete this event?</h3>
              <p className="mt-2 text-sm text-[#737c74]">
                Sign-ups and related data for this event will be removed.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  className="h-11 flex-1 rounded-xl text-[#53635a]"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Yes, delete
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

function EventCard({
  event,
  index,
  actionMenuOpen,
  onToggleMenu,
  onStatusChange,
  onDelete,
}: {
  event: Event
  index: number
  actionMenuOpen: boolean
  onToggleMenu: () => void
  onStatusChange: (s: string) => void
  onDelete: () => void
}) {
  const statusCls =
    event.status === "ONGOING"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : event.status === "UPCOMING"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : event.status === "CANCELLED"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-slate-50 text-slate-600 border-slate-200"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-[#e7e5dc] bg-white shadow-sm"
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#f5f4ef] sm:h-40">
        {event.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-[#8b938a]">
            {event.title}
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <Badge className="border border-white/20 bg-[#1e302d]/80 text-[10px] font-semibold text-white">
            {event.type?.replaceAll("_", " ") || "Event"}
          </Badge>
          <Badge
            className={`border text-[10px] font-semibold ${
              event.visibility === "PUBLIC"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[#deddd3] bg-white text-[#53635a]"
            }`}
          >
            {event.visibility === "PUBLIC" ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-[#1e302d]">{event.title}</h3>
            <Badge className={`mt-2 border text-[10px] font-semibold ${statusCls}`}>
              {STATUS_LABELS[event.status] || event.status}
            </Badge>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={onToggleMenu}
              className="rounded-xl border border-[#deddd3] p-2 text-[#637168] hover:bg-[#f5f4ef]"
              aria-label="Event actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {actionMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 6 }}
                  className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-[#e7e5dc] bg-white py-1 shadow-lg"
                >
                  <Link
                    href={`/dashboard/hr/events/${event.id}`}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#1e302d] no-underline hover:bg-[#f5f4ef]"
                  >
                    <Eye className="h-4 w-4" /> Open
                  </Link>
                  <Link
                    href={`/dashboard/hr/events/${event.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#1e302d] no-underline hover:bg-[#f5f4ef]"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                  <div className="my-1 border-t border-[#eeebe3]" />
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b938a]">
                    Set status
                  </p>
                  {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]
                    .filter((s) => s !== event.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onStatusChange(s)}
                        className="w-full px-3 py-2 text-left text-sm text-[#53635a] hover:bg-[#f5f4ef] hover:text-[#1e302d]"
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  <div className="my-1 border-t border-[#eeebe3]" />
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-4 space-y-2 text-sm text-[#637168]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#8b938a]" />
            <span>
              {new Date(event.startAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              ·{" "}
              {new Date(event.startAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[#8b938a]" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-[#eeebe3] pt-3">
          {event.maxParticipants ? (
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-[#8b938a]">
                <span>Spots filled</span>
                <span className="font-semibold text-[#53635a]">
                  {event._count?.registrations || 0} / {event.maxParticipants}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#eeebe3]">
                <div
                  className="h-full rounded-full bg-[#203b36]"
                  style={{
                    width: `${Math.min(
                      ((event._count?.registrations || 0) / event.maxParticipants) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#637168]">
              <span className="font-semibold text-[#1e302d]">{event._count?.registrations || 0}</span>{" "}
              people signed up
            </p>
          )}
          <Link
            href={`/dashboard/hr/events/${event.id}`}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-[#203b36] text-sm font-semibold text-white no-underline hover:bg-[#2d5148]"
          >
            Open <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
