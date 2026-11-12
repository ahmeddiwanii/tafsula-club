"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { BrandFigure } from "@/components/brand/figures"
import { Button } from "@/components/ui/button"

export default function InviteAcceptPage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()
  const { status } = useSession()
  const [orgName, setOrgName] = useState("a club")
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/memberships/invite/${token}`)
        if (!res.ok) {
          setInvalid(true)
          return
        }
        const data = await res.json()
        setOrgName(data.organizationName || "a club")
      } catch {
        setInvalid(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const accept = async () => {
    if (status !== "authenticated") {
      router.push(`/auth/login?callbackUrl=/invite/${token}`)
      return
    }
    setAccepting(true)
    try {
      const res = await fetch(`/api/memberships/invite/${token}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Could not accept invite")
        return
      }
      toast.success("Invite received — waiting for approval")
      router.push(data.redirectTo || "/dashboard/member/waiting")
    } catch {
      toast.error("Could not accept invite")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#161210]/15 border-t-[#161210]" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F3EA] px-5 py-12 text-[#161210]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-5%] h-[40%] w-[40%] rounded-full bg-[#F3DFA0]/55 blur-[90px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="mx-auto mb-5 max-w-[240px]">
          <BrandFigure id="circle" />
        </div>

        {invalid ? (
          <>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
              Link expired
            </h1>
            <p className="mt-3 text-[#161210]/65">This invite is no longer valid.</p>
            <Link href="/organizations" className="mt-6 inline-block">
              <Button className="rounded-full bg-[#161210] text-[#F7F3EA]">Browse clubs</Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
              You’re invited
            </h1>
            <p className="mt-3 text-base text-[#161210]/65">
              <span className="font-semibold text-[#161210]">{orgName}</span> invited you to join.
              After you accept, they still need to approve you — then you get your dashboard.
            </p>
            <Button
              onClick={accept}
              disabled={accepting}
              className="mt-8 h-12 w-full rounded-full bg-[#161210] text-base font-semibold text-[#F7F3EA]"
            >
              {status !== "authenticated"
                ? "Sign in to accept"
                : accepting
                  ? "Sending…"
                  : "Accept invite"}
            </Button>
            <p className="mt-4 text-xs text-[#161210]/45">
              Don’t have an account?{" "}
              <Link href={`/auth/register?callbackUrl=/invite/${token}`} className="underline">
                Create one
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
