"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import MemberLayout from "../../../../components/layout/member-layout"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { motion } from "framer-motion"
import { Shield, Save, User, Briefcase, Plus, Trash2, Zap, ChevronRight } from "lucide-react"

type ExperienceItem = {
  company: string
  role: string
  years?: string
  summary?: string
}

export default function MemberProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { company: "", role: "", years: "", summary: "" },
  ])
  const [skillsText, setSkillsText] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && session?.user?.id) fetchProfile()
  }, [status, session])

  const parseExperience = (raw: unknown): ExperienceItem[] => {
    if (!raw) return [{ company: "", role: "", years: "", summary: "" }]
    if (Array.isArray(raw)) {
      const items = raw.map((item: any) => ({
        company: String(item?.company || item?.org || ""),
        role: String(item?.role || item?.title || ""),
        years: String(item?.years || item?.period || ""),
        summary: String(item?.summary || item?.description || ""),
      }))
      return items.length ? items : [{ company: "", role: "", years: "", summary: "" }]
    }
    return [{ company: "", role: "", years: "", summary: "" }]
  }

  const parseSkills = (raw: unknown): string => {
    if (!raw) return ""
    if (Array.isArray(raw)) return raw.map(String).join(", ")
    if (typeof raw === "string") return raw
    if (typeof raw === "object" && raw !== null && Array.isArray((raw as any).skills)) {
      return (raw as any).skills.map(String).join(", ")
    }
    return ""
  }

  const fetchProfile = async () => {
    const res = await fetch(`/api/profiles/${session?.user?.id}`)
    if (!res.ok) return
    const data = await res.json()
    setHeadline(data.profile?.headline || "")
    setBio(data.profile?.bio || "")
    setLocation(data.profile?.location || "")
    setRoleTitle(data.profile?.roleTitle || "")
    setExperiences(parseExperience(data.profile?.experienceJson))
    setSkillsText(parseSkills(data.profile?.skillsJson))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const cleanExperience = experiences
        .map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          years: e.years?.trim() || undefined,
          summary: e.summary?.trim() || undefined,
        }))
        .filter((e) => e.company || e.role)

      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await fetch(`/api/profiles/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          location,
          roleTitle,
          experienceJson: cleanExperience,
          skillsJson: skills,
        }),
      })
      if (!res.ok) throw new Error("Could not save")
      toast.success("Profile saved")
      fetchProfile()
    } catch {
      toast.error("Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  const updateExperience = (index: number, key: keyof ExperienceItem, value: string) => {
    setExperiences((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  return (
    <MemberLayout>
      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#F7F3EA] sm:text-4xl">
              My profile
            </h1>
            <p className="flex items-center gap-2 text-sm text-[#F7F3EA]/55">
              <User className="h-4 w-4" /> Who you are in the club
            </p>
          </div>
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save profile
              </>
            )}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl sm:p-8"
            >
              <h2 className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-sm font-semibold uppercase tracking-wider text-[#F7F3EA]">
                <Shield className="h-4 w-4 text-blue-400" /> Basic info
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#F7F3EA]/55">Headline</label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                      placeholder="What you do in one short line"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#F7F3EA]/55">Role title</label>
                    <Input
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                      placeholder="e.g. Volunteer lead"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#F7F3EA]/55">City / location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                    placeholder="City or country"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#F7F3EA]/55">About you</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="resize-none rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                    placeholder="A few sentences about you"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl sm:p-8"
            >
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#F7F3EA]">
                <Briefcase className="h-4 w-4 text-emerald-400" /> Experience
              </h2>
              <p className="mb-6 text-sm text-[#F7F3EA]/45">
                Add jobs, clubs, or projects — normal fields, not code.
              </p>

              <div className="space-y-4">
                {experiences.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#F7F3EA]/55">Entry {index + 1}</p>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExperiences((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10"
                          aria-label="Remove entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        value={item.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company or club"
                        className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                      />
                      <Input
                        value={item.role}
                        onChange={(e) => updateExperience(index, "role", e.target.value)}
                        placeholder="Your role"
                        className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                      />
                    </div>
                    <Input
                      value={item.years || ""}
                      onChange={(e) => updateExperience(index, "years", e.target.value)}
                      placeholder="When? e.g. 2023 – 2024"
                      className="h-11 rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                    />
                    <Textarea
                      value={item.summary || ""}
                      onChange={(e) => updateExperience(index, "summary", e.target.value)}
                      placeholder="What did you do? (optional)"
                      rows={2}
                      className="resize-none rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setExperiences((prev) => [
                      ...prev,
                      { company: "", role: "", years: "", summary: "" },
                    ])
                  }
                  className="h-11 w-full rounded-xl border-white/15 bg-transparent text-[#F7F3EA]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add another experience
                </Button>
              </div>

              <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
                <label className="text-xs font-medium text-[#F7F3EA]/55">Skills</label>
                <p className="text-sm text-[#F7F3EA]/40">
                  Type skills separated by commas. Example: design, public speaking, Excel
                </p>
                <Textarea
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  rows={3}
                  className="resize-none rounded-xl border-white/10 bg-white/5 text-[#F7F3EA]"
                  placeholder="design, public speaking, Excel"
                />
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <a href="/auth/forgot-password" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Zap className="h-4 w-4 text-[#F7F3EA]/40 group-hover:text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F7F3EA]">Password</h4>
                    <p className="text-xs text-[#F7F3EA]/40">Reset via email</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#F7F3EA]/30" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}
