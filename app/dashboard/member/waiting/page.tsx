"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "framer-motion"

import { BrandFigure } from "@/components/brand/figures"
import { Button } from "@/components/ui/button"

type MemberStatus = "TEST_PENDING" | "AWAITING_HR" | "ACCEPTED" | "REJECTED"

export default function MemberWaitingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [status, setStatus] = useState<MemberStatus | null>(null)
  const [orgName, setOrgName] = useState<string>("your club")
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const res = await fetch("/api/dashboard/member/onboarding-status", { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    const nextStatus = data.memberStatus as MemberStatus
    if (data.organizationName) setOrgName(data.organizationName)

    if (nextStatus === "TEST_PENDING" || nextStatus === "ACCEPTED") {
      router.replace(data.profileCompleted ? "/dashboard/member/home" : "/dashboard/member/profile")
      return
    }
    setStatus(nextStatus)

    if (nextStatus === "REJECTED") {
      await signOut({ callbackUrl: "/auth/login?message=rejected" })
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!active) return
      setLoading(true)
      await refresh()
      if (!active) return
      setLoading(false)
    })()

    const t = setInterval(() => {
      refresh()
    }, 4000)

    return () => {
      active = false
      clearInterval(t)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F3EA] px-5 py-12 text-[#161210]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[12%] top-[-8%] h-[42%] w-[42%] rounded-full bg-[#F3C4B0]/55 blur-[90px]" />
        <div className="absolute -right-[10%] bottom-[-5%] h-[38%] w-[38%] rounded-full bg-[#C9E4D8]/6 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto w-full max-w-lg text-center"
      >
        <div className="mx-auto mb-6 max-w-[260px] sm:max-w-[300px]">
          <BrandFigure id="peek" float delay={0.1} />
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#161210]/45">
          Request sent
        </p>
        <h1
          className="mb-3 text-3xl font-semibold tracking-tight text-[#161210] sm:text-4xl"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Waiting for approval
        </h1>
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-[#161210]/65">
          {loading
            ? "Checking your status…"
            : status === "AWAITING_HR"
              ? `Thanks${session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}. Your request to join ${orgName} is with their team now. We’ll email you once you’re approved — then your club dashboard opens.`
              : "Syncing your club status…"}
        </p>

        <div className="mx-auto mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-[#161210]"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>

        <div className="rounded-[1.4rem] border-[2.5px] border-[#161210] bg-white/70 px-5 py-4 text-left text-sm text-[#161210]/7 shadow-[4px_5px_0_0_#161210]">
          <p className="font-semibold text-[#161210]">What happens next</p>
          <ul className="mt-2 space-y-1.5 list-disc pl-5">
            <li>The club reviews your request</li>
            <li>You get an email when they decide</li>
            <li>This page updates on its own — no need to refresh</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => refresh()}
            className="h-11 rounded-full border-[2.5px] border-[#161210] bg-transparent px-6 font-semibold text-[#161210]"
          >
            Check again
          </Button>
          <Button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="h-11 rounded-full bg-[#161210] px-6 font-semibold text-[#F7F3EA] hover:bg-[#161210]/90"
          >
            Sign out for now
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
