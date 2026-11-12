"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { EventCard } from "../../components/event-card"
import { PublicShell } from "@/components/brand/public-shell"
import { BrandFigure } from "@/components/brand/figures"
import { LogoWordmark } from "@/components/brand/logo"
import { landingCopy } from "@/lib/landing-copy"
import { useLocale } from "@/lib/i18n/locale-context"

interface Event {
  id: string
  title: string
  description?: string
  startAt: string
  location?: string
  type?: string
  format?: string
  posterUrl?: string
  organization: { id: string; name: string; organizationProfile?: { profileImageUrl?: string } }
  _count?: { registrations: number }
}

const types = ["GENERAL", "TRAINING", "WORKSHOP", "CONFERENCE"]

export default function EventsPage() {
  const { locale } = useLocale()
  const copy = landingCopy[locale]
  const display = { fontFamily: "Fraunces, serif" }
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetch(`/api/events/upcoming?page=${page}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || [])
        setPages(d.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filter])

  const filtered = events.filter((e) => {
    const s =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organization.name.toLowerCase().includes(search.toLowerCase())
    return s && (filter === "all" || e.type === filter)
  })

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-8 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border-[2.5px] border-soot bg-[#F3DFA0] px-3.5 py-1 text-[12px] font-bold text-soot shadow-[2px_3px_0_0_#161210]">
            {copy.eventsKicker}
          </p>
          <h1 className="font-display text-4xl leading-tight text-soot sm:text-5xl" style={display}>
            {copy.eventsTitle}
            <em className="italic" style={{ color: "#C45C4A" }}>
              {copy.eventsAccent}
            </em>
          </h1>
          <p className="mt-4 max-w-lg text-soot/65">{copy.eventsSub}</p>
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soot/35" />
            <input
              placeholder={copy.eventsSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-full border-[2.5px] border-soot bg-jasmine pl-11 pr-4 text-soot placeholder:text-soot/35 focus:outline-none"
            />
          </div>
        </div>
        <BrandFigure id="join" className="mx-auto max-w-sm" />
      </section>

      <div className="border-y-[2.5px] border-soot/10 bg-[#F4EDE0]">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full border-[2px] border-soot px-4 py-1.5 text-sm font-semibold ${
              filter === "all" ? "bg-soot text-jasmine" : "bg-jasmine text-soot"
            }`}
          >
            All
          </button>
          {types.map((tp) => (
            <button
              key={tp}
              onClick={() => setFilter(tp)}
              className={`rounded-full border-[2px] border-soot px-4 py-1.5 text-sm font-semibold ${
                filter === tp ? "bg-soot text-jasmine" : "bg-jasmine text-soot"
              }`}
            >
              {tp.charAt(0) + tp.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-[1.6rem] border-[2.5px] border-soot/20 bg-plaster" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ev, i) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  title={ev.title}
                  description={ev.description}
                  startAt={ev.startAt}
                  location={ev.location}
                  organizationName={ev.organization.name}
                  organizationProfileImage={ev.organization.organizationProfile?.profileImageUrl}
                  posterUrl={ev.posterUrl}
                  registrationCount={ev._count?.registrations || 0}
                  index={i}
                  type={ev.type}
                  format={ev.format}
                />
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: Math.min(5, pages) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-10 w-10 rounded-full border-[2px] border-soot text-sm font-semibold ${
                      page === i + 1 ? "bg-soot text-jasmine" : "bg-jasmine text-soot"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <BrandFigure id="leap" className="mx-auto mb-4 max-w-[180px]" />
            <p className="font-display text-xl text-soot" style={display}>
              {locale === "fr" ? "Pas de nuit ici — encore." : "No night on this street — yet."}
            </p>
          </div>
        )}
      </section>

      <footer className="border-t-[3px] border-soot/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6">
          <LogoWordmark href={null} compact className="h-8" />
          <p className="text-sm text-soot/45">{copy.footer}</p>
        </div>
      </footer>
    </PublicShell>
  )
}
