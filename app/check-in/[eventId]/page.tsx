"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

import { BrandFigure } from "@/components/brand/figures"
import { Button } from "@/components/ui/button"

export default function EventCheckInPage() {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const code = search.get("code") || ""
  const { status } = useSession()

  const [phase, setPhase] = useState<"loading" | "ok" | "error">("loading")
  const [message, setMessage] = useState("Checking you in…")
  const [detail, setDetail] = useState<{
    eventTitle?: string
    checkInTime?: string
    pointsAwarded?: number
    alreadyCheckedIn?: boolean
  }>({})

  useEffect(() => {
    if (status === "loading") return
    if (status !== "authenticated") {
      router.replace(
        `/auth/login?callbackUrl=${encodeURIComponent(`/check-in/${eventId}?code=${code}`)}`,
      )
      return
    }
    if (!code) {
      setPhase("error")
      setMessage("This QR code is missing its check-in code.")
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/qr-code/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
        const data = await res.json()
        if (!res.ok) {
          setPhase("error")
          setMessage(data.error || "Could not check you in")
          return
        }
        setPhase("ok")
        setMessage(data.alreadyCheckedIn ? "You’re already checked in" : "You’re here — checked in!")
        setDetail({
          eventTitle: data.eventTitle,
          checkInTime: data.checkInTime,
          pointsAwarded: data.pointsAwarded,
          alreadyCheckedIn: data.alreadyCheckedIn,
        })
      } catch {
        setPhase("error")
        setMessage("Something went wrong while checking in")
      }
    })()
  }, [status, eventId, code])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F3EA] px-5 py-12 text-[#161210]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[10%] top-[-8%] h-[40%] w-[40%] rounded-full bg-[#C9E4D8]/6 blur-[90px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="mx-auto mb-5 max-w-[220px]">
          <BrandFigure id={phase === "ok" ? "leap" : phase === "error" ? "peek" : "work"} />
        </div>

        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          {phase === "loading" ? "Checking you in" : phase === "ok" ? "Present" : "Almost"}
        </h1>
        <p className="mt-3 text-base text-[#161210]/65">{message}</p>

        {phase === "ok" && (
          <div className="mt-6 space-y-2 rounded-[1.4rem] border-[2.5px] border-[#161210] bg-white/80 px-5 py-4 text-left text-sm shadow-[4px_5px_0_0_#161210]">
            {detail.eventTitle && (
              <p>
                <span className="font-semibold">Event:</span> {detail.eventTitle}
              </p>
            )}
            {detail.checkInTime && (
              <p>
                <span className="font-semibold">Checked in at:</span>{" "}
                {new Date(detail.checkInTime).toLocaleString()}
              </p>
            )}
            {typeof detail.pointsAwarded === "number" && (
              <p>
                <span className="font-semibold">Points:</span> +{detail.pointsAwarded}
                {detail.alreadyCheckedIn ? " (already counted)" : ""}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard/member/events">
            <Button className="h-11 w-full rounded-full bg-[#161210] font-semibold text-[#F7F3EA]">
              Back to my events
            </Button>
          </Link>
          {phase === "error" && (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-11 w-full rounded-full border-[2.5px] border-[#161210]"
            >
              Try again
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
