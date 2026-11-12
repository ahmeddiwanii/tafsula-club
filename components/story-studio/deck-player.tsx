"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Flag,
  Gauge,
  GraduationCap,
  Images,
  Map,
  Maximize2,
  Mic,
  Minimize2,
  Pause,
  Pencil,
  Play,
  Quote,
  Sparkles,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { getTheme } from "@/lib/story-studio/theme"
import type { StoryDeck, StorySlide } from "@/lib/story-studio/types"

function SlideIcon({ name, color }: { name?: string; color: string }) {
  const props = { className: "h-6 w-6", strokeWidth: 2.25, style: { color } }
  switch (name) {
    case "flag":
      return <Flag {...props} />
    case "gauge":
      return <Gauge {...props} />
    case "calendar":
      return <CalendarDays {...props} />
    case "map":
      return <Map {...props} />
    case "quote":
      return <Quote {...props} />
    case "images":
      return <Images {...props} />
    case "users":
      return <Users {...props} />
    case "door":
      return <DoorOpen {...props} />
    case "pencil":
      return <Pencil {...props} />
    case "grad":
      return <GraduationCap {...props} />
    case "mic":
      return <Mic {...props} />
    default:
      return <Sparkles {...props} />
  }
}

function SlideArt({ accent }: { accent: string }) {
  return (
    <svg className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-50" viewBox="0 0 180 180" aria-hidden>
      <circle cx="128" cy="42" r="40" fill={accent} opacity="0.28" />
      <circle cx="148" cy="28" r="12" fill="#fff" opacity="0.35" />
      <rect x="18" y="18" width="34" height="34" rx="10" fill={accent} opacity="0.4" />
      <path d="M18 150c40-56 90-56 144 0" stroke={accent} strokeWidth="4" fill="none" opacity="0.55" />
      <circle cx="40" cy="150" r="6" fill={accent} />
    </svg>
  )
}

function CountUp({ value }: { value: string }) {
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""))
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!Number.isFinite(numeric)) return
    const start = performance.now()
    const dur = 900
    let frame = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(numeric * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [numeric])
  if (!Number.isFinite(numeric)) return <>{value}</>
  return <>{n}</>
}

function SlideView({ slide, deck }: { slide: StorySlide; deck: StoryDeck }) {
  const theme = getTheme(deck.theme)
  const dir = deck.locale === "ar" ? "rtl" : "ltr"

  return (
    <div
      dir={dir}
      className="relative h-full w-full overflow-hidden"
      style={{ background: theme.cssBg, color: theme.cssInk }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: theme.cssAccent }} />
      <SlideArt accent={theme.cssAccent} />
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: theme.cssAccent }}
        animate={{ x: [0, 16, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {slide.layout === "cover" && (
        <div className="grid h-full grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-h-0 flex-col justify-center overflow-y-auto px-8 py-8 md:px-12">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.cssAccent }}>
              <SlideIcon name={slide.icon} color={theme.cssAccent} />
              {slide.kicker}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl" style={{ fontFamily: "Fraunces, serif" }}>
              {slide.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed md:text-[15px]" style={{ color: theme.cssMuted }}>
              {slide.body}
            </p>
            <p className="mt-8 text-sm font-semibold" style={{ color: theme.cssAccent }}>
              {slide.caption || deck.periodLabel}
            </p>
          </div>
          <div className="relative hidden bg-black/20 md:block">
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full" style={{ background: theme.cssCard }} />
            )}
          </div>
        </div>
      )}

      {slide.layout === "kpis" && (
        <div className="flex h-full min-h-0 flex-col justify-center overflow-y-auto px-8 md:px-12">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.cssAccent }}>
            <SlideIcon name={slide.icon} color={theme.cssAccent} />
            {slide.kicker}
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
            {slide.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: theme.cssMuted }}>
            {slide.body}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {slide.metrics?.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="rounded-2xl p-5"
                style={{ background: theme.cssCard }}
              >
                <p className="font-serif text-3xl" style={{ fontFamily: "Fraunces, serif" }}>
                  <CountUp value={m.value} />
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider" style={{ color: theme.cssMuted }}>
                  {m.label}
                </p>
                {m.hint && (
                  <p className="mt-1 text-[11px]" style={{ color: theme.cssAccent }}>
                    {m.hint}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {slide.layout === "spotlight" && (
        <div className="grid h-full grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-0 flex-col justify-center overflow-y-auto px-8 py-6 md:px-12">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.cssAccent }}>
              <SlideIcon name={slide.icon} color={theme.cssAccent} />
              {slide.kicker}
            </p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
              {slide.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed md:text-[15px]" style={{ color: theme.cssMuted }}>
              {slide.body}
            </p>
            {slide.quote && (
              <p className="mt-4 font-serif text-base italic" style={{ fontFamily: "Fraunces, serif", color: theme.cssAccent }}>
                “{slide.quote}”
              </p>
            )}
            <p className="mt-3 text-xs" style={{ color: theme.cssMuted }}>
              {slide.caption}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {slide.metrics?.map((m) => (
                <div key={m.label} className="rounded-xl px-4 py-3" style={{ background: theme.cssCard }}>
                  <p className="text-xl font-semibold">
                    <CountUp value={m.value} />
                  </p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.cssMuted }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden items-center justify-center bg-black/25 md:flex">
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
            )}
          </div>
        </div>
      )}

      {(slide.layout === "timeline" || slide.layout === "split") && (
        <div className="flex h-full min-h-0 flex-col px-8 py-8 md:px-12">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.cssAccent }}>
            <SlideIcon name={slide.icon} color={theme.cssAccent} />
            {slide.kicker}
          </p>
          <h2 className="mt-2 font-serif text-3xl" style={{ fontFamily: "Fraunces, serif" }}>
            {slide.title}
          </h2>
          {slide.body && (
            <p className="mt-2 text-sm" style={{ color: theme.cssMuted }}>
              {slide.body}
            </p>
          )}
          <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {(slide.items || slide.bullets?.map((b) => ({ title: b, meta: undefined, text: undefined })) || []).map(
              (item, i) => (
                <motion.div
                  key={`${item.title}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{ background: theme.cssCard }}
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: theme.cssAccent }} />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.meta && (
                      <p className="text-xs" style={{ color: theme.cssAccent }}>
                        {item.meta}
                      </p>
                    )}
                    {item.text && (
                      <p className="mt-1 text-sm" style={{ color: theme.cssMuted }}>
                        {item.text}
                      </p>
                    )}
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      )}

      {slide.layout === "gallery" && (
        <div className="flex h-full min-h-0 flex-col px-8 py-8 md:px-12">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.cssAccent }}>
            <SlideIcon name={slide.icon} color={theme.cssAccent} />
            {slide.kicker}
          </p>
          <h2 className="mt-2 font-serif text-3xl" style={{ fontFamily: "Fraunces, serif" }}>
            {slide.title}
          </h2>
          <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
            {slide.items?.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="overflow-hidden rounded-2xl"
                style={{ background: theme.cssCard }}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-28 w-full object-contain bg-black/20" />
                ) : (
                  <div className="h-28" style={{ background: theme.cssAccent, opacity: 0.2 }} />
                )}
                <p className="p-3 text-sm font-semibold">{item.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(slide.layout === "quote" || slide.layout === "closing" || slide.layout === "chapter") && (
        <div className="flex h-full min-h-0 flex-col items-start justify-center overflow-y-auto px-10 md:px-16">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.cssAccent }}>
            <SlideIcon name={slide.icon} color={theme.cssAccent} />
            {slide.kicker}
          </p>
          <h2
            className="mt-6 max-w-4xl font-serif text-3xl leading-tight md:text-5xl"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {slide.quote ? `“${slide.quote}”` : slide.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{ color: theme.cssMuted }}>
            {slide.quoteBy || slide.body}
          </p>
        </div>
      )}
    </div>
  )
}

export function DeckPlayer({
  deck,
  chrome = "studio",
  index,
  onIndexChange,
}: {
  deck: StoryDeck
  chrome?: "studio" | "pptx"
  index?: number
  onIndexChange?: (i: number) => void
}) {
  const [inner, setInner] = useState(0)
  const current = index ?? inner
  const setCurrent = (i: number) => {
    const next = Math.max(0, Math.min(deck.slides.length - 1, i))
    onIndexChange?.(next)
    if (index === undefined) setInner(next)
  }
  const [playing, setPlaying] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const slide = deck.slides[current]
  const theme = getTheme(deck.theme)
  const progress = useMemo(
    () => (deck.slides.length ? ((current + 1) / deck.slides.length) * 100 : 0),
    [current, deck.slides.length],
  )

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setCurrent((current + 1) % deck.slides.length), 7000)
    return () => clearTimeout(t)
  }, [playing, current, deck.slides.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrent(current + 1)
      if (e.key === "ArrowLeft") setCurrent(current - 1)
      if (e.key === "Escape") setFullscreen(false)
      if (e.key === "f" || e.key === "F") setFullscreen((v) => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, deck.slides.length])

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    if (fullscreen) {
      el.requestFullscreen?.().catch(() => null)
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => null)
    }
  }, [fullscreen])

  const stage = (
    <div
      className="relative mx-auto bg-black shadow-2xl"
      style={{
        aspectRatio: "16 / 9",
        width: fullscreen ? "min(100%, calc((100vh - 76px) * 16 / 9))" : "100%",
        maxHeight: fullscreen ? "calc(100vh - 76px)" : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current}-${slide?.title}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {slide && <SlideView slide={slide} deck={deck} />}
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/25">
        <div className="h-full" style={{ width: `${progress}%`, background: theme.cssAccent }} />
      </div>
    </div>
  )

  return (
    <div
      ref={shellRef}
      className={fullscreen ? "fixed inset-0 z-[90] flex flex-col bg-black" : "overflow-hidden rounded-2xl border border-black/10 shadow-2xl"}
    >
      {chrome === "pptx" && !fullscreen && (
        <div className="flex items-center gap-2 bg-[#2b2b2b] px-3 py-2 text-[11px] text-white/80">
          <span className="rounded bg-[#c43e1c] px-2 py-0.5 font-bold text-white">PPTX</span>
          <span className="truncate">{deck.title}.pptx — animated preview</span>
        </div>
      )}
      {fullscreen ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">{stage}</div>
      ) : (
        <div className="bg-black">{stage}</div>
      )}
      <div className="flex items-center justify-between gap-3 bg-[#111] px-4 py-3 text-white">
        <p className="min-w-0 truncate text-xs text-white/70">
          {current + 1}/{deck.slides.length} · {slide?.title} · {theme.label}
        </p>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded-lg p-2 hover:bg-white/10" onClick={() => setCurrent(current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg p-2 hover:bg-white/10" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" className="rounded-lg p-2 hover:bg-white/10" onClick={() => setCurrent(current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10"
            onClick={() => setFullscreen((v) => !v)}
            title="Full screen (F)"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
