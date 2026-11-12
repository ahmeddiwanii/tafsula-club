"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { BrandFigure } from "@/components/brand/figures"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RecruitmentField, RecruitmentForm } from "@/lib/membership"

export default function JoinOrganizationPage() {
  const params = useParams()
  const organizationId = params.id as string
  const router = useRouter()
  const { data: session, status } = useSession()

  const [orgName, setOrgName] = useState("")
  const [form, setForm] = useState<RecruitmentForm | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/organizations/${organizationId}/recruitment`)
        if (!res.ok) throw new Error("fail")
        const data = await res.json()
        setOrgName(data.organizationName || "Club")
        setForm(data.form)
      } catch {
        toast.error("Could not load the join form")
      } finally {
        setLoading(false)
      }
    })()
  }, [organizationId])

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const submit = async () => {
    if (status !== "authenticated") {
      router.push(`/auth/login?callbackUrl=/organizations/${organizationId}/join`)
      return
    }
    if (!form?.isOpen) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/organizations/${organizationId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Could not submit")
        return
      }
      toast.success("Request sent")
      router.push(data.redirectTo || "/dashboard/member/waiting")
    } catch {
      toast.error("Could not submit")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: RecruitmentField) => {
    const common = {
      id: field.id,
      value: answers[field.id] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => setAnswer(field.id, e.target.value),
      placeholder: field.placeholder || "",
      required: field.required,
      className:
        "mt-1.5 w-full rounded-xl border-[2px] border-[#161210]/15 bg-white px-3 py-2.5 text-[#161210]",
    }

    if (field.type === "textarea") {
      return <Textarea {...common} rows={4} className={`${common.className} resize-none`} />
    }
    if (field.type === "select") {
      return (
        <select {...common} className={common.className}>
          <option value="">Choose…</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }
    return (
      <Input
        {...common}
        type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#161210]/15 border-t-[#161210]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F3EA] px-5 py-10 text-[#161210]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] top-[-5%] h-[40%] w-[40%] rounded-full bg-[#F3C4B0]/5 blur-[80px]" />
        <div className="absolute -right-[8%] bottom-0 h-[35%] w-[35%] rounded-full bg-[#C9E4D8]/55 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
          <Link href={`/organizations/${organizationId}`} className="text-sm font-medium text-[#161210]/55 no-underline">
            ← Back to club
          </Link>
          <div className="mx-auto mt-6 max-w-[220px] lg:mx-0">
            <BrandFigure id="join" />
          </div>
          <h1
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            {form?.title || `Join ${orgName}`}
          </h1>
          <p className="mt-3 text-base text-[#161210]/65">
            {form?.description ||
              `Apply to join ${orgName}. The club reviews every request before you get access.`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[1.6rem] border-[3px] border-[#161210] bg-white/80 p-6 shadow-[5px_7px_0_0_#161210] sm:p-8"
        >
          {!form?.isOpen ? (
            <div className="space-y-4 text-center">
              <p className="text-lg font-semibold">Not recruiting right now</p>
              <p className="text-sm text-[#161210]/6">
                This club closed applications. Check back later, or ask them for an invite link.
              </p>
              <Link href={`/organizations/${organizationId}`}>
                <Button className="rounded-full bg-[#161210] text-[#F7F3EA]">View club page</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {!session && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  You’ll need to{" "}
                  <Link
                    href={`/auth/login?callbackUrl=/organizations/${organizationId}/join`}
                    className="font-semibold underline"
                  >
                    sign in
                  </Link>{" "}
                  (or create an account) before submitting.
                </div>
              )}

              {(form.fields || []).map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="text-sm font-semibold text-[#161210]">
                    {field.label}
                    {field.required ? <span className="text-[#e85d4c]"> *</span> : null}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              <Button
                onClick={submit}
                disabled={submitting}
                className="h-12 w-full rounded-full bg-[#161210] text-base font-semibold text-[#F7F3EA] hover:bg-[#161210]/90"
              >
                {submitting ? "Sending…" : "Submit join request"}
              </Button>
              <p className="text-center text-xs text-[#161210]/45">
                After you submit, you’ll wait for the club to approve you. We’ll email you when they do.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
