"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2, Clock, Plus, ArrowRight, ClipboardList, Search, Users, Calendar,
  Target, Zap, Trash2
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface Task {
  id: string; title: string; description?: string; status: string; priority: string
  dueDate?: string; createdAt: string
  createdBy: { id: string; name: string; email: string }
  team: { id: string; name: string, purpose: string }
  assignments?: { id: string, userId: string, user: { name: string } }[]
}

const priorityConfig: any = {
  URGENT: { border: "border-red-200", text: "text-red-700", bg: "bg-red-50", label: "Urgent" },
  HIGH: { border: "border-orange-200", text: "text-orange-700", bg: "bg-orange-50", label: "High" },
  MEDIUM: { border: "border-amber-200", text: "text-amber-700", bg: "bg-amber-50", label: "Medium" },
  LOW: { border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50", label: "Low" },
}

const statusConfig: any = {
  FINALIZED: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Done" },
  ACTIVE: { icon: Zap, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Active" },
  PENDING: { icon: Clock, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Pending" },
}

export default function HRTasksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/teams/tasks")
      const d = await r.json()
      setTasks(d.tasks || [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return
    try {
      const res = await fetch(`/api/teams/tasks/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Task deleted")
        fetchData()
      }
    } catch {
      toast.error("Could not delete the task")
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
    try {
      const res = await fetch(`/api/teams/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        toast.error("Could not update status")
        fetchData()
      } else {
        toast.success("Status updated")
      }
    } catch {
      toast.error("Could not update status")
      fetchData()
    }
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || t.status === statusFilter
    const matchPriority = !priorityFilter || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  // Ensure calculations dynamically map what's seen
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "PENDING").length,
    active: tasks.filter(t => t.status === "ACTIVE").length,
    finalized: tasks.filter(t => t.status === "FINALIZED").length,
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <PageTour
        storageKey="tafsula_tour_hr_tasks_v1"
        steps={[
          {
            target: "tasks-actions",
            title: "Create or review",
            body: "Create a new task, or review work people already sent in.",
          },
          {
            target: "tasks-stats",
            title: "Quick numbers",
            body: "See how many tasks are waiting, active, or done.",
          },
          {
            target: "tasks-search",
            title: "Find a task",
            body: "Type a word from the title to find it fast.",
          },
          {
            target: "tasks-filters",
            title: "Filter the list",
            body: "Tap a status or urgency to show only those tasks. Tap again to clear.",
          },
          {
            target: "tasks-list",
            title: "Your task list",
            body: "Open a task to see details, change status, or delete it.",
          },
        ]}
      />

      <div className="relative z-10 space-y-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">
              Tasks
            </h1>
            <p className="mt-1 text-sm text-[#737c74]">
              Create work, give it to a team, then check what is done.
            </p>
          </motion.div>

          <motion.div
            data-tour="tasks-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap gap-2"
          >
            <Button asChild variant="outline" className="h-11 rounded-xl border-[#deddd3] text-[#203b36]">
              <Link href="/dashboard/hr/tasks/review" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Review work
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-xl bg-[#203b36] px-5 text-white hover:bg-[#2d5148]">
              <Link href="/dashboard/hr/tasks/create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create task
              </Link>
            </Button>
          </motion.div>
        </div>

        <div data-tour="tasks-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard label="All tasks" value={stats.total} icon={ClipboardList} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} />
          <StatCard label="Active" value={stats.active} icon={Zap} />
          <StatCard label="Done" value={stats.finalized} icon={CheckCircle2} />
        </div>

        <div className="space-y-4">
          <div data-tour="tasks-search" className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
            <Input
              placeholder="Search by task name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border-[#deddd3] bg-white pl-11 text-sm text-[#1e302d] placeholder:text-[#9aa39a]"
            />
          </div>

          <div data-tour="tasks-filters" className="flex flex-wrap gap-2">
            {["PENDING", "ACTIVE", "FINALIZED"].map((s) => {
              const isActive = statusFilter === s
              const style = statusConfig[s]
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(isActive ? null : s)}
                  className={`h-10 rounded-xl border px-4 text-xs font-semibold transition-all ${
                    isActive
                      ? `${style.bg} ${style.color} ${style.border}`
                      : "border-[#deddd3] bg-white text-[#53635a] hover:border-[#203b36]/30 hover:text-[#1e302d]"
                  }`}
                >
                  {style.label}
                </button>
              )
            })}
            <span className="mx-1 hidden h-10 w-px bg-[#e7e5dc] sm:block" />
            {["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => {
              const isActive = priorityFilter === p
              const style = priorityConfig[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(isActive ? null : p)}
                  className={`h-10 rounded-xl border px-4 text-xs font-semibold transition-all ${
                    isActive
                      ? `${style.bg} ${style.text} ${style.border}`
                      : "border-[#deddd3] bg-white text-[#53635a] hover:border-[#203b36]/30 hover:text-[#1e302d]"
                  }`}
                >
                  {style.label}
                </button>
              )
            })}
          </div>
        </div>

        <div data-tour="tasks-list">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl border border-[#e7e5dc] bg-white"
                  />
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#e7e5dc] bg-white py-20 text-center"
              >
                <ClipboardList className="mx-auto mb-4 h-12 w-12 text-[#cfcfc4]" />
                <p className="text-lg font-semibold text-[#1e302d]">No tasks yet</p>
                <p className="mx-auto mt-2 mb-6 max-w-sm text-sm text-[#737c74]">
                  Create a task to give work to a team.
                </p>
                <Button asChild className="h-11 rounded-xl bg-[#203b36] px-6 text-white hover:bg-[#2d5148]">
                  <Link href="/dashboard/hr/tasks/create">Create task</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {filtered.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onDelete={() => handleDelete(task.id)}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </HRLayout>
  )
}

function StatCard({ label, value, icon: Icon }: any) {
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

function TaskCard({ task, index, onDelete, onStatusChange }: { task: Task, index: number, onDelete: () => void, onStatusChange: (status: string) => void }) {
  const pr = priorityConfig[task.priority] || priorityConfig.LOW
  const st = statusConfig[task.status] || statusConfig.PENDING
  const StatusIcon = st.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${st.bg} ${st.border}`}>
          <StatusIcon className={`h-5 w-5 ${st.color}`} />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[#1e302d] sm:text-lg">{task.title}</h3>
            <Badge className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${pr.border} ${pr.bg} ${pr.text}`}>
              {pr.label}
            </Badge>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`h-7 rounded-lg border px-2 text-[10px] font-semibold outline-none ${st.border} ${st.bg} ${st.color}`}
            >
              {["PENDING", "ACTIVE", "FINALIZED"].map((s) => (
                <option key={s} value={s}>
                  {statusConfig[s]?.label || s}
                </option>
              ))}
            </select>
          </div>

          {task.description && <p className="line-clamp-2 text-sm text-[#737c74]">{task.description}</p>}

          <div className="flex flex-wrap gap-3 text-[11px] font-medium text-[#8b938a]">
            {task.team && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {task.team.name}
              </span>
            )}
            {task.assignments && task.assignments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {task.assignments.length} assigned
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#eeebe3] pt-3 sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Link
            href={`/dashboard/hr/tasks/${task.id}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-[#203b36] px-4 text-sm font-semibold text-white no-underline sm:flex-none"
          >
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
