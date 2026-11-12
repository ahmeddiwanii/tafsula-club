"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react"

export type GuideStep = {
  id: string
  label: string
  href: string
  done?: boolean
}

export function GuideBanner({
  storageKey,
  title,
  body,
  steps,
}: {
  storageKey: string
  title: string
  body: string
  steps: GuideStep[]
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [storageKey])

  if (!open) return null

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border-[2.5px] border-soot bg-jasmine p-4 shadow-[4px_5px_0_0_#161210] sm:p-5">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-soot/40 hover:bg-soot/5 hover:text-soot"
        aria-label="Dismiss guide"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soot text-jasmine">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg text-soot sm:text-xl" style={{ fontFamily: "Fraunces, serif" }}>
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-soot/60">{body}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className="flex items-center gap-2 rounded-xl border-[1.5px] border-soot/15 bg-white/50 px-3 py-2.5 text-sm font-medium text-soot no-underline transition hover:border-soot hover:bg-white"
                >
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-pomegranate" />
                  )}
                  <span className="min-w-0 truncate">{step.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" onClick={dismiss} className="mt-3 text-xs font-semibold text-soot/45 hover:text-soot">
            Hide this guide
          </button>
        </div>
      </div>
    </div>
  )
}
