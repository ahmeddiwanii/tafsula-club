"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MemberLayout from "../../../../components/layout/member-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, ClipboardList, CheckCircle2, Clock, Calendar, Users, Target, Activity, Zap
} from "lucide-react"
import { format } from "date-fns"

interface Task {
    id: string; title: string; description?: string; status: string; priority: string
    dueDate?: string; createdAt: string
    assignee?: { id: string; name: string }
    createdBy: { id: string; name: string }
}

const priorityStyle = (p: string) => {
    switch (p) {
        case "URGENT": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] text-white border-red-500"
        case "HIGH": return "bg-orange-500 text-white border-orange-500"
        case "MEDIUM": return "bg-blue-500 text-white border-blue-500"
        default: return "bg-white/10 text-white border-white/5"
    }
}

const statusColor = (s: string) => {
    switch (s) {
        case "COMPLETED": return "text-emerald-400"
        case "IN_PROGRESS": return "text-blue-400"
        case "BLOCKED": return "text-red-400"
        default: return "text-white/40"
    }
}

export default function MemberTasksPage() {
    const { data: session } = useSession()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/tasks?limit=100")
            .then(r => r.json())
            .then(d => setTasks(d.tasks || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
        const matchStatus = !statusFilter || t.status === statusFilter
        return matchSearch && matchStatus
    })

    const stats = {
        total: tasks.length,
        open: tasks.filter(t => t.status === "OPEN" || t.status === "todo").length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        completed: tasks.filter(t => t.status === "COMPLETED").length,
    }

    const handleStatusUpdate = async (taskId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
            }
        } catch { }
    }

    const filterLabels: Record<string, string> = {
        OPEN: "Open",
        IN_PROGRESS: "In progress",
        COMPLETED: "Done",
        BLOCKED: "Blocked",
    }

    return (
        <MemberLayout>
            <PageTour
                storageKey="tafsula_tour_member_tasks_v1"
                steps={[
                    {
                        target: "member-tasks-stats",
                        title: "Your numbers",
                        body: "See how many tasks you have, and how many are done.",
                    },
                    {
                        target: "member-tasks-search",
                        title: "Find a task",
                        body: "Type a word to search, or tap a filter to narrow the list.",
                    },
                    {
                        target: "member-tasks-list",
                        title: "Your task list",
                        body: "Tap Open to see details and mark your work as done.",
                    },
                ]}
            />
            <div className="relative z-10 space-y-6 pb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#F7F3EA] sm:text-4xl">
                        My tasks
                    </h1>
                    <p className="flex items-center gap-2 text-sm text-[#F7F3EA]/55">
                       <Target className="h-4 w-4" /> See your work and mark it when you finish
                    </p>
                </motion.div>

                <motion.div
                    data-tour="member-tasks-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
                >
                    {[
                        { label: "All", value: stats.total, icon: ClipboardList, color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-400/25" },
                        { label: "Open", value: stats.open, icon: Clock, color: "text-[#F7F3EA]/70", bg: "bg-white/5", border: "border-white/10" },
                        { label: "In progress", value: stats.inProgress, icon: Zap, color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-400/25" },
                        { label: "Done", value: stats.completed, icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-400/25" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-2xl border ${s.border} bg-white/[0.04] p-4 backdrop-blur-xl`}>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium text-[#F7F3EA]/55">{s.label}</span>
                                <div className={`rounded-lg p-1.5 ${s.bg} ${s.color}`}>
                                    <s.icon className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="text-3xl font-semibold text-[#F7F3EA]">{s.value}</div>
                        </div>
                    ))}
                </motion.div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl sm:p-6">
                    <div data-tour="member-tasks-search" className="mb-6 flex flex-col gap-3 sm:flex-row">
                        <div className="group relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F3EA]/35 group-focus-within:text-[#F7F3EA]/70" />
                            <Input
                                placeholder="Search by name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 border-white/10 bg-white/[0.06] pl-9 text-[#F7F3EA] placeholder:text-[#F7F3EA]/35 focus-visible:ring-1 focus-visible:ring-[#F7F3EA]/30"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["OPEN", "IN_PROGRESS", "COMPLETED", "BLOCKED"].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                        statusFilter === s
                                            ? "border-blue-400/40 bg-blue-500/20 text-blue-200"
                                            : "border-white/10 bg-white/[0.04] text-[#F7F3EA]/55 hover:bg-white/[0.08] hover:text-[#F7F3EA]"
                                    }`}
                                >
                                    {filterLabels[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div data-tour="member-tasks-list">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <Activity className="mx-auto mb-4 h-12 w-12 text-white/15" />
                            <p className="text-base font-semibold text-[#F7F3EA]/70">No tasks here</p>
                            <p className="mt-2 text-sm text-[#F7F3EA]/40">
                                {search ? "Try another search." : "When the bureau gives you work, it will show up here."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filtered.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]"
                                    >
                                        <div
                                            className={`absolute bottom-0 left-0 top-0 w-1 ${
                                                task.status === "COMPLETED"
                                                    ? "bg-emerald-500"
                                                    : task.status === "IN_PROGRESS"
                                                      ? "bg-blue-400"
                                                      : task.priority === "URGENT"
                                                        ? "bg-red-500"
                                                        : "bg-white/20"
                                            }`}
                                        />

                                        <div className="flex flex-col items-start justify-between gap-4 pl-2 sm:flex-row">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold tracking-tight text-[#F7F3EA]">
                                                        {task.title}
                                                    </h3>
                                                    <Badge
                                                        className={`border-none px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityStyle(task.priority)}`}
                                                    >
                                                        {task.priority === "URGENT" ? "Urgent" : task.priority.toLowerCase()}
                                                    </Badge>
                                                    <Badge
                                                        className={`border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColor(task.status)}`}
                                                    >
                                                        {filterLabels[task.status] || task.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                {task.description && (
                                                    <p className="mb-3 line-clamp-2 text-sm text-[#F7F3EA]/45">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#F7F3EA]/40">
                                                    {task.dueDate && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-purple-300" />
                                                            Due {format(new Date(task.dueDate), "MMM d")}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-blue-300" />
                                                        From {task.createdBy.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex w-full gap-2 border-t border-white/10 pt-4 sm:mt-0 sm:w-auto sm:border-0 sm:pt-0">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="h-9 w-full border border-blue-400/25 bg-blue-500/20 text-xs font-semibold text-blue-100 hover:bg-blue-500/30 hover:text-white sm:w-auto"
                                                >
                                                    <a href={`/dashboard/member/tasks/${task.id}`}>
                                                        <Activity className="mr-2 h-3.5 w-3.5" /> Open
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    )
}
