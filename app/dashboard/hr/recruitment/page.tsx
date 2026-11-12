"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Copy, Link2 } from "lucide-react"

import { HRLayout } from "@/components/layout/hr-layout"
import { PageTour } from "@/components/dashboard/page-tour"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RecruitmentField, RecruitmentForm } from "@/lib/membership"
import type { PointsFormula } from "@/lib/points"
import { DEFAULT_POINTS_FORMULA } from "@/lib/points"

export default function HRRecruitmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const orgId = session?.user?.organizationId

  const [form, setForm] = useState<RecruitmentForm>({
    isOpen: false,
    title: "Join our club",
    description: "",
    fields: [],
  })
  const [points, setPoints] = useState<PointsFormula>(DEFAULT_POINTS_FORMULA)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && orgId) load()
  }, [status, orgId])

  const load = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/recruitment`)
      if (!res.ok) throw new Error("fail")
      const data = await res.json()
      if (data.form) setForm(data.form)
      if (data.pointsFormula) setPoints(data.pointsFormula)
    } catch {
      toast.error("Could not load settings")
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/organizations/${orgId}/recruitment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, pointsFormula: points }),
      })
      if (!res.ok) throw new Error("fail")
      toast.success("Saved")
    } catch {
      toast.error("Could not save")
    } finally {
      setSaving(false)
    }
  }

  const createInvite = async () => {
    try {
      const res = await fetch("/api/memberships/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "fail")
      setInviteUrl(data.url)
      await navigator.clipboard.writeText(data.url)
      toast.success("Invite link copied")
    } catch {
      toast.error("Could not create invite link")
    }
  }

  const updateField = (index: number, patch: Partial<RecruitmentField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }))
  }

  if (loading || status === "loading") {
    return (
      <HRLayout>
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#203b36]/15 border-t-[#203b36]" />
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout>
      <PageTour
        storageKey="tafsula_tour_hr_recruitment_v1"
        steps={[
          {
            target: "recruit-toggle",
            title: "Recruiting",
            body: "Turn recruiting on, build a short join form, and share invite links. People still need your approval.",
          },
          {
            target: "recruit-points",
            title: "Points",
            body: "Set how many points members earn when they scan an event QR or finish a task.",
          },
        ]}
      />

      <div className="mx-auto max-w-3xl space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#203b36]">Recruiting & points</h1>
          <p className="mt-1 text-sm text-[#737c74]">
            Control who can ask to join, what they answer, and how points work at events.
          </p>
        </div>

        <section data-tour="recruit-toggle" className="space-y-4 rounded-3xl border border-[#203b36]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#203b36]">Open for new members</h2>
              <p className="text-sm text-[#737c74]">
                When on, people see a Join button on your public club page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
              className={`relative h-8 w-14 rounded-full transition ${form.isOpen ? "bg-emerald-500" : "bg-slate-300"}`}
              aria-pressed={form.isOpen}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.isOpen ? "left-7" : "left-1"}`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#737c74]">Form title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#737c74]">
              Short description
            </label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-3 border-t border-[#203b36]/8 pt-4">
            <p className="text-sm font-semibold text-[#203b36]">Questions on the join form</p>
            {form.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 rounded-2xl border border-[#203b36]/10 bg-[#F7F3EA]/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Question label"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        fields: prev.fields.filter((_, i) => i !== index),
                      }))
                    }
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, { type: e.target.value as RecruitmentField["type"] })
                    }
                    className="h-10 rounded-lg border border-[#203b36]/15 bg-white px-2 text-sm"
                  >
                    <option value="text">Short text</option>
                    <option value="textarea">Long text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="select">Dropdown</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-[#203b36]">
                    <input
                      type="checkbox"
                      checked={Boolean(field.required)}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
                {field.type === "select" && (
                  <Input
                    value={(field.options || []).join(", ")}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Options, separated by commas"
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  fields: [
                    ...prev.fields,
                    {
                      id: `q_${Date.now()}`,
                      label: "New question",
                      type: "textarea",
                      required: false,
                    },
                  ],
                }))
              }
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add question
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#203b36]/10 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#203b36]">Invite link</h2>
            <p className="text-sm text-[#737c74]">
              Share a link. When someone accepts, they still wait for your approval.
            </p>
          </div>
          <Button type="button" onClick={createInvite} className="bg-[#203b36] text-white">
            <Link2 className="mr-2 h-4 w-4" /> Create invite link
          </Button>
          {inviteUrl && (
            <div className="flex items-center gap-2 rounded-xl border border-[#203b36]/10 bg-[#F7F3EA]/60 px-3 py-2 text-sm">
              <code className="flex-1 truncate">{inviteUrl}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl)
                  toast.success("Copied")
                }}
                className="rounded-lg p-2 hover:bg-white"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <section data-tour="recruit-points" className="space-y-4 rounded-3xl border border-[#203b36]/10 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#203b36]">Points formula</h2>
            <p className="text-sm text-[#737c74]">
              Used when a member scans an event QR, and when you approve a task.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["attendanceScan", "Points for scanning event QR"],
                ["earlyBonus", "Early check-in bonus"],
                ["earlyWindowMinutes", "Early window (minutes after start)"],
                ["taskApproved", "Points when a task is approved"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-[#737c74]">{label}</label>
                <Input
                  type="number"
                  min={0}
                  value={points[key]}
                  onChange={(e) =>
                    setPoints((p) => ({ ...p, [key]: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <Button
          onClick={save}
          disabled={saving}
          className="h-12 w-full rounded-full bg-[#203b36] text-base font-semibold text-white sm:w-auto sm:px-10"
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </HRLayout>
  )
}
