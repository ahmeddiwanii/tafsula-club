"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import {
  Plus,
  ArrowLeft,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FilePlus2,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  purpose: string
  members: { userId: string; user: { name: string } }[]
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
}

export default function CreateTaskPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    teamId: "",
    assigneeId: "",
    dueDate: "",
    hrDocumentName: "",
    hrDocumentUrl: "",
  })

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchTeams()
    }
  }, [session])

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/teams?organizationId=${session?.user.organizationId}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : Array.isArray(data?.teams) ? data.teams : []
      setTeams(list)
    } catch (error) {
      console.error("Error fetching teams:", error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.teamId) {
      toast.error("Please add a title and pick a team")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId: session?.user?.organizationId,
        }),
      })

      if (res.ok) {
        toast.success("Task created")
        router.push("/dashboard/hr/tasks")
      } else {
        toast.error("Could not create the task")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTeam = Array.isArray(teams) ? teams.find((t) => t.id === formData.teamId) : undefined

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <PageTour
        storageKey="tafsula_tour_hr_create_task_v1"
        steps={[
          {
            target: "task-title",
            title: "Write a clear title",
            body: "Keep it short. Example: “Set up the welcome desk”.",
          },
          {
            target: "task-details",
            title: "Add details (optional)",
            body: "Explain what to do, where, and anything people should know.",
          },
          {
            target: "task-priority",
            title: "Set how urgent it is",
            body: "Urgent means do it first. Low means it can wait.",
          },
          {
            target: "task-assign",
            title: "Who does the work?",
            body: "Pick a team. Then you can give it to the whole team, or to one person.",
          },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2 text-[#637168] hover:bg-white hover:text-[#1e302d]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to tasks
          </Button>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">
              Create a task
            </h1>
            <p className="mt-1 text-sm text-[#737c74]">
              Write what needs to be done, pick a team, then send it.
            </p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div data-tour="task-title" className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-[#1e302d]">Task title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Print badges for the event"
                className="h-12 rounded-xl border-[#deddd3] bg-[#fbfaf7] text-base font-medium text-[#1e302d] placeholder:text-[#9aa39a] focus-visible:ring-[#203b36]/20"
              />
            </div>

            <div data-tour="task-details" className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-[#1e302d]">Details</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What should they do? Any tips or links?"
                className="min-h-[160px] resize-none rounded-xl border-[#deddd3] bg-[#fbfaf7] p-4 text-sm text-[#1e302d] placeholder:text-[#9aa39a]"
              />

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-[#1e302d]">File (optional)</p>
                <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-dashed border-[#deddd3] bg-[#fbfaf7] p-3">
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            hrDocumentName: file.name,
                            hrDocumentUrl: reader.result as string,
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <div className="rounded-lg bg-[#eef3e4] p-2 text-[#42592a]">
                    {formData.hrDocumentName ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1e302d]">
                      {formData.hrDocumentName || "Add a file"}
                    </p>
                    <p className="text-xs text-[#8b938a]">PDF, image, or text</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                data-tour="task-priority"
                className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm"
              >
                <p className="mb-3 text-sm font-semibold text-[#1e302d]">How urgent?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => {
                    const selected = formData.priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                          selected
                            ? "border-[#203b36] bg-[#203b36] text-white"
                            : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a] hover:border-[#203b36]/40 hover:text-[#1e302d]"
                        }`}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-[#1e302d]">Due date</p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b938a]" />
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-11 rounded-xl border-[#deddd3] bg-[#fbfaf7] pl-10 text-sm font-medium text-[#1e302d]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div data-tour="task-assign" className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#42592a]" />
                <h3 className="text-base font-semibold text-[#1e302d]">Who does this?</h3>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#1e302d]">Team</p>
                {loading ? (
                  <p className="text-sm text-[#8b938a]">Loading teams…</p>
                ) : teams.length === 0 ? (
                  <p className="rounded-xl border border-[#deddd3] bg-[#fbfaf7] p-3 text-sm text-[#737c74]">
                    No teams yet. Create a team first, then come back.
                  </p>
                ) : (
                  <div className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-1">
                    {teams.map((team) => {
                      const selected = formData.teamId === team.id
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, teamId: team.id, assigneeId: "" })
                          }
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-all ${
                            selected
                              ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                              : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a] hover:border-[#203b36]/35"
                          }`}
                        >
                          <span className="text-sm font-semibold">{team.name}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              selected ? "bg-[#203b36]" : "bg-[#cfcfc4]"
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {selectedTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 space-y-2 border-t border-[#eeebe3] pt-5"
                >
                  <p className="text-sm font-semibold text-[#1e302d]">Person (optional)</p>
                  <div className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assigneeId: "" })}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-all ${
                        formData.assigneeId === ""
                          ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                          : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a] hover:border-[#203b36]/35"
                      }`}
                    >
                      <span className="text-sm font-semibold">Whole team</span>
                    </button>
                    {(selectedTeam.members || []).map((member) => {
                      const selected = formData.assigneeId === member.userId
                      return (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, assigneeId: member.userId })
                          }
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-all ${
                            selected
                              ? "border-[#203b36] bg-[#eef3e4] text-[#1e302d]"
                              : "border-[#deddd3] bg-[#fbfaf7] text-[#53635a] hover:border-[#203b36]/35"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {member.user?.name || "Member"}
                          </span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-[#42592a]" />}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <Button
                disabled={submitting || !formData.title || !formData.teamId}
                className="mt-6 h-12 w-full rounded-xl bg-[#203b36] text-sm font-semibold text-white hover:bg-[#2d5148] disabled:opacity-40"
              >
                {submitting ? (
                  "Saving…"
                ) : (
                  <>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create task
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-2xl border border-[#dce7cf] bg-[#f3f7ea] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#42592a]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tip</span>
              </div>
              <p className="text-sm leading-relaxed text-[#53635a]">
                People on this task will see it right away in their task list.
              </p>
            </div>
          </div>
        </form>
      </div>
    </HRLayout>
  )
}
