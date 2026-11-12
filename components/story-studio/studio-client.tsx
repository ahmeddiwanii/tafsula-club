"use client"

import { useMemo, useState } from "react"
import { Clapperboard, Download, Eye, FileText, GripVertical, Loader2, Presentation, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getTheme } from "@/lib/story-studio/theme"
import type { StoryDeck, StoryLocale } from "@/lib/story-studio/types"
import { DeckPlayer } from "./deck-player"

type Stats = {
  membersAccepted: number
  membersJoinedInPeriod: number
  events: number
  registrations: number
  attendances: number
  posts: number
  teams: number
  proposals: number
}

function isoInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function StoryStudioClient() {
  const now = useMemo(() => new Date(), [])
  const [from, setFrom] = useState(() => isoInput(new Date(now.getFullYear(), 0, 1, 0, 0)))
  const [to, setTo] = useState(() => isoInput(now))
  const [brief, setBrief] = useState(
    "Professional recap of every activity, training, workshop and night we ran this year. Blue, white and orange. Cool icons. One detailed slide per event with date, venue, description and numbers. Warm, specific paragraphs.",
  )
  const [themeLock, setThemeLock] = useState("signal")
  const [voiceNote, setVoiceNote] = useState<string | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [locale, setLocale] = useState<StoryLocale>("en")
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [deck, setDeck] = useState<StoryDeck | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [preview, setPreview] = useState<{ kind: "pdf" | "pptx"; url?: string } | null>(null)

  const applyPreset = (key: string) => {
    const end = new Date()
    if (key === "year") setFrom(isoInput(new Date(end.getFullYear(), 0, 1)))
    if (key === "90") setFrom(isoInput(new Date(end.getTime() - 90 * 86400000)))
    if (key === "academic") {
      const startYear = end.getMonth() >= 8 ? end.getFullYear() : end.getFullYear() - 1
      setFrom(isoInput(new Date(startYear, 8, 1)))
    }
    setTo(isoInput(end))
  }

  const generate = async () => {
    setLoading(true)
    setPreview(null)
    try {
      const res = await fetch("/api/hr/story-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, brief, locale, theme: themeLock }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generate failed")
      setDeck(data.deck)
      setSlideIndex(0)
      setStats(data.stats)
      setVoiceNote(data.deck.voiceNote || data.voiceError || null)
      toast.success(
        data.deck.usedFallback
          ? "Built from this year's club data. AI voice skipped — check the note under the player."
          : "AI rewrote the copy from your brief",
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate")
    } finally {
      setLoading(false)
    }
  }

  const exportFile = async (kind: "pdf" | "pptx", mode: "preview" | "download") => {
    if (!deck) return
    setExporting(`${mode}-${kind}`)
    try {
      const res = await fetch(`/api/hr/story-studio/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck }),
      })
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const filename = `${deck.organizationName.replace(/[^\w]+/g, "-")}-story.${kind}`
      if (mode === "download") {
        downloadBlob(blob, filename)
        toast.success(`Downloaded ${kind.toUpperCase()}`)
      } else {
        const url = URL.createObjectURL(blob)
        setPreview({ kind, url })
      }
    } catch {
      toast.error(`Could not ${mode} ${kind.toUpperCase()}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="overflow-hidden rounded-3xl bg-[#162b2a] px-6 py-8 text-[#f7f3ea] shadow-xl md:px-10">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c4e46a]">
          <Clapperboard className="h-3.5 w-3.5" />
          Bureau only · Story Studio
        </p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
          Tell the AI what this season should look like.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#b6c6bd]">
          It reads this club’s events, attendance, teams, ideas, news and numbers between the dates you pick — then
          directs a widescreen deck you can preview and download as PDF or PowerPoint.
        </p>
      </header>

      <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "year", label: "This year" },
            { id: "90", label: "Last 90 days" },
            { id: "academic", label: "Academic year" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-full border border-[#162b2a]/15 px-3 py-1.5 text-xs font-semibold text-[#162b2a] hover:bg-[#162b2a] hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            From
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-[#f5f4ef] px-3 py-2.5 text-sm text-slate-800"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            To
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-[#f5f4ef] px-3 py-2.5 text-sm text-slate-800"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Palette</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { id: "signal", label: "Blue · white · orange" },
              { id: "ivory", label: "Navy on ivory" },
              { id: "ink", label: "Ink formal" },
              { id: "ember", label: "Warm night" },
              { id: "nile", label: "Deep blue" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setThemeLock(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  themeLock === p.id ? "bg-[#0B3A82] text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tell the AI exactly what to do
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#f5f4ef] px-4 py-3 text-sm leading-relaxed text-slate-800"
            placeholder="Example: Focus on workshops from March to June. Formal French for a sponsor. Skip internal tasks."
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as StoryLocale)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#162b2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3634] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#c4e46a]" />}
            {loading ? "Directing the deck…" : "Generate presentation"}
          </button>
        </div>
      </section>

      {stats && deck && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Events", stats.events],
            ["Check-ins", stats.attendances],
            ["Members", stats.membersAccepted],
            ["Slides", deck.slides.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="text-2xl font-semibold text-[#162b2a]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {deck && (
        <section className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Action
              icon={Eye}
              label="Preview PDF"
              busy={exporting === "preview-pdf"}
              onClick={() => exportFile("pdf", "preview")}
            />
            <Action
              icon={Download}
              label="Download PDF"
              busy={exporting === "download-pdf"}
              onClick={() => exportFile("pdf", "download")}
            />
            <Action
              icon={Presentation}
              label="Preview PPTX"
              busy={exporting === "preview-pptx"}
              onClick={() => setPreview({ kind: "pptx" })}
            />
            <Action
              icon={FileText}
              label="Download PPTX"
              busy={exporting === "download-pptx"}
              onClick={() => exportFile("pptx", "download")}
            />
          </div>

          <p className="text-xs font-medium text-slate-500">
            Palette: <span className="font-semibold text-[#162b2a]">{getTheme(deck.theme).label}</span>
            {" · "}
            {deck.slides.length} slides · Drag to reorder · Full screen from the player
          </p>
          {voiceNote && <p className="text-xs text-slate-500">{voiceNote}</p>}
          <p className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
            This run used your prompt: <span className="font-semibold text-[#0B3A82]">{brief.slice(0, 180)}</span>
          </p>
          <DeckPlayer deck={deck} index={slideIndex} onIndexChange={setSlideIndex} />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {deck.slides.map((slide, i) => (
              <button
                key={`${slide.title}-${i}`}
                type="button"
                draggable
                onDragStart={() => setDragFrom(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragFrom === null || dragFrom === i) return
                  const next = [...deck.slides]
                  const [moved] = next.splice(dragFrom, 1)
                  next.splice(i, 0, moved)
                  setDeck({ ...deck, slides: next })
                  setSlideIndex(i)
                  setDragFrom(null)
                }}
                onClick={() => setSlideIndex(i)}
                className={`w-40 shrink-0 rounded-xl border p-2 text-left text-[11px] ${
                  i === slideIndex ? "border-[#162b2a] bg-white shadow" : "border-transparent bg-white/70"
                }`}
              >
                <span className="mb-1 flex items-center gap-1 text-slate-400">
                  <GripVertical className="h-3 w-3" />
                  {i + 1} · {slide.layout}
                </span>
                <span className="line-clamp-2 font-semibold text-[#162b2a]">{slide.title || slide.quote || "Slide"}</span>
              </button>
            ))}
          </div>
          {deck.usedFallback && (
            <p className="text-xs text-slate-500">
              Script composed from live club data (events in full). Groq/OpenAI will add extra voice when the key
              responds with a long deck.
            </p>
          )}
        </section>
      )}

      {preview?.kind === "pdf" && preview.url && (
        <Modal title="PDF preview" onClose={() => setPreview(null)}>
          <iframe title="PDF preview" src={preview.url} className="h-[70vh] w-full rounded-xl bg-slate-200" />
        </Modal>
      )}
      {preview?.kind === "pptx" && deck && (
        <Modal title="PPTX preview — animated" onClose={() => setPreview(null)}>
          <DeckPlayer deck={deck} chrome="pptx" />
        </Modal>
      )}
    </div>
  )
}

function Action({
  icon: Icon,
  label,
  onClick,
  busy,
}: {
  icon: typeof Eye
  label: string
  onClick: () => void
  busy?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 text-left text-sm font-semibold text-[#162b2a] shadow-sm hover:border-[#c4e46a] hover:shadow-md disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-[#1f5c57]" />}
      {label}
    </button>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#132b2a]/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl bg-[#f5f4ef] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#162b2a]">{title}</p>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-white">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
