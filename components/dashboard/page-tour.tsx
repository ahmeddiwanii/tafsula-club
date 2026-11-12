"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

export type PageTourStep = {
  /** Matches `data-tour="..."` on the element to highlight */
  target: string
  title: string
  body: string
}

type Box = { top: number; left: number; width: number; height: number }

function readBox(el: Element | null): Box | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 && r.height < 2) return null
  const pad = 10
  return {
    top: Math.max(8, r.top - pad),
    left: Math.max(8, r.left - pad),
    width: Math.min(window.innerWidth - 16, r.width + pad * 2),
    height: Math.min(window.innerHeight - 16, r.height + pad * 2),
  }
}

export function PageTour({
  storageKey,
  steps,
}: {
  storageKey: string
  steps: PageTourStep[]
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (!localStorage.getItem(storageKey)) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [storageKey])

  const finish = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
    setOpen(false)
  }, [storageKey])

  const measure = useCallback(() => {
    if (!open || !steps[index]) {
      setBox(null)
      return
    }
    const el = document.querySelector(`[data-tour="${steps[index].target}"]`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }
    // Wait a beat for scroll, then measure
    window.setTimeout(() => {
      setBox(readBox(document.querySelector(`[data-tour="${steps[index].target}"]`)))
    }, 280)
  }, [open, index, steps])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onResize = () => setBox(readBox(document.querySelector(`[data-tour="${steps[index]?.target}"]`)))
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
    }
  }, [open, index, steps, measure])

  if (!mounted || !open || steps.length === 0) return null

  const step = steps[index]
  const isLast = index >= steps.length - 1
  const tipTop = box
    ? Math.min(
        window.innerHeight - 200,
        box.top + box.height + 14 > window.innerHeight - 180
          ? Math.max(16, box.top - 170)
          : box.top + box.height + 14,
      )
    : 80
  const tipLeft = box
    ? Math.min(window.innerWidth - 320, Math.max(16, box.left))
    : 16

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Page guide">
      {/* Dim layer with spotlight hole */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id={`page-tour-mask-${storageKey}`}>
            <rect width="100%" height="100%" fill="white" />
            {box && (
              <rect
                x={box.left}
                y={box.top}
                width={box.width}
                height={box.height}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(22,18,16,0.72)"
          mask={`url(#page-tour-mask-${storageKey})`}
        />
      </svg>

      {/* Click catcher outside tip */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent"
        aria-label="Close guide background"
        onClick={finish}
      />

      {/* Pulsing ring around target */}
      {box && (
        <div
          className="pointer-events-none absolute rounded-2xl border-[3px] border-[#c4e46a] shadow-[0_0_0_4px_rgba(196,228,106,0.35)] animate-pulse"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
          }}
        />
      )}

      {/* Tip card */}
      <div
        className="absolute z-[91] w-[min(100%-2rem,300px)] rounded-2xl border-[2.5px] border-[#161210] bg-[#F7F3EA] p-4 text-[#161210] shadow-[5px_6px_0_0_#161210]"
        style={{ top: tipTop, left: tipLeft }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c45c4a]">
            Quick tip · {index + 1} / {steps.length}
          </p>
          <button
            type="button"
            onClick={finish}
            className="rounded-full p-1 text-[#161210]/40 hover:bg-[#161210]/5 hover:text-[#161210]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-base font-semibold leading-snug">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#161210]/65">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={finish}
            className="rounded-full px-2.5 py-1.5 text-sm text-[#161210]/45 hover:text-[#161210]"
          >
            Skip
          </button>
          <div className="ml-auto flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="rounded-full border-2 border-[#161210] bg-transparent px-3 py-1.5 text-sm font-semibold"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={finish}
                className="rounded-full bg-[#161210] px-3.5 py-1.5 text-sm font-semibold text-[#F7F3EA]"
              >
                Got it
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => i + 1)}
                className="rounded-full bg-[#161210] px-3.5 py-1.5 text-sm font-semibold text-[#F7F3EA]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
