"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { UserNav } from "../../../components/user-nav"
import { LogoWordmark } from "@/components/brand/logo"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Building,
  Tag,
  Share2,
  ExternalLink,
  Ticket,
  ChevronRight,
  Menu,
  X,
  Eye,
  Zap,
} from "lucide-react"

/* ─── Shared nav from events list ─── */
function PublicNav() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: "/", label: "Home" },
    { href: "/organizations", label: "Clubs" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
  ]
  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <nav className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-4 sm:px-6 py-3">
          <LogoWordmark href="/" compact className="h-9" />
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (<Link key={l.href} href={l.href}><button className="px-3.5 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">{l.label}</button></Link>))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/organizations" className="hidden sm:block"><button className="px-4 py-2 text-sm font-medium text-white bg-[#e85d4c] rounded-xl hover:opacity-90 transition-opacity">Explore clubs</button></Link>
            <div className="hidden md:block"><UserNav /></div>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white/70">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </nav>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-2xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl p-4 space-y-1">
            {[...links, { href: "/organizations", label: "Explore clubs" }].map((l) => (<Link key={l.href} href={l.href}><button className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/[0.06] transition">{l.label}</button></Link>))}
            <div className="pt-2 border-t border-white/10"><UserNav /></div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

/* ─── Constants ─── */
const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General Event", TRAINING: "Training", WORKSHOP: "Workshop",
  CONFERENCE: "Conference", MEETING: "Meeting", WEBINAR: "Webinar",
  VOLUNTEERING: "Volunteering", FUNDRAISER: "Fundraiser",
  SOCIAL: "Social Gathering", COMPETITION: "Competition",
}
const TYPE_ICONS: Record<string, string> = {
  GENERAL: "📋", TRAINING: "🎓", WORKSHOP: "🛠️", CONFERENCE: "🎤",
  MEETING: "👔", WEBINAR: "💻", VOLUNTEERING: "🤝", FUNDRAISER: "💰",
  SOCIAL: "🎉", COMPETITION: "🏆",
}

interface Event {
  id: string; title: string; description?: string; type: string; format: string
  price: number; currency: string; visibility: string; maxParticipants?: number
  startAt: string; endAt?: string; location?: string; venue?: string
  status: string; posterUrl?: string; tags?: string[]
  organization: { id: string; name: string; organizationProfile?: { profileImageUrl?: string } }
  _count?: { registrations: number; attendances: number }
}
interface RegistrationStatus { registered: boolean; status: string | null }

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => { fetchEvent(); fetchRegistrationStatus() }, [eventId])

  const fetchEvent = async () => {
    try {
      const r = await fetch(`/api/events/${eventId}`)
      if (r.ok) setEvent(await r.json()); else setError("Event not found")
    } catch { setError("Failed to load event") } finally { setLoading(false) }
  }
  const fetchRegistrationStatus = async () => {
    try {
      const r = await fetch(`/api/events/${eventId}/register`)
      if (r.ok) setRegistrationStatus(await r.json())
    } catch (e) { console.error(e) }
  }
  const handleRegister = async () => {
    setRegistering(true); setError(null)
    try {
      const r = await fetch(`/api/events/${eventId}/register`, { method: "POST" })
      if (r.ok) { await fetchRegistrationStatus(); await fetchEvent() }
      else { const d = await r.json(); setError(d.error || "Registration failed") }
    } catch { setError("Registration failed") } finally { setRegistering(false) }
  }
  const handleUnregister = async () => {
    setRegistering(true); setError(null)
    try {
      const r = await fetch(`/api/events/${eventId}/register`, { method: "DELETE" })
      if (r.ok) { await fetchRegistrationStatus(); await fetchEvent() }
      else { const d = await r.json(); setError(d.error || "Could not cancel") }
    } catch { setError("Could not cancel registration") } finally { setRegistering(false) }
  }
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) await navigator.share({ title: event?.title, url })
    else { await navigator.clipboard.writeText(url); setShowToast(true); setTimeout(() => setShowToast(false), 2500) }
  }

  const parseVenue = (v?: string) => {
    if (!v) return { address: "", mapUrl: "" }
    try { const p = JSON.parse(v); return { address: p.address || "", mapUrl: p.mapUrl || "" } }
    catch { return { address: v, mapUrl: "" } }
  }
  const isComingSoon = (e: Event) => e.tags?.includes("COMING_SOON") || new Date(e.startAt).getFullYear() >= 2099
  const isFreeEvent = (e: Event) => e.price === 0 || e.tags?.includes("FREE")

  /* ─── Loading ─── */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center" style={{ fontFamily: "'Inter'" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center animate-pulse"><Calendar className="w-7 h-7 text-white" /></div>
        <p className="text-white/40 text-sm font-medium">Loading event...</p>
      </motion.div>
    </div>
  )

  /* ─── Error ─── */
  if (error && !event) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Inter'" }}>
      <PublicNav />
      <div className="flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] max-w-sm mx-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 flex items-center justify-center"><XCircle className="w-8 h-8 text-red-400" /></div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Event Not Found</h2>
          <p className="text-white/40 text-sm mb-6">This event may have been removed.</p>
          <Link href="/events"><button className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-emerald-500 text-white hover:opacity-90 transition">Browse Events</button></Link>
        </motion.div>
      </div>
    </div>
  )
  if (!event) return null

  /* ─── Computed ─── */
  const eventDate = new Date(event.startAt)
  const endDate = event.endAt ? new Date(event.endAt) : null
  const isFree = isFreeEvent(event)
  const comingSoon = isComingSoon(event)
  const venueInfo = parseVenue(event.venue)
  const regCount = event._count?.registrations || 0
  const spotsLeft = event.maxParticipants ? event.maxParticipants - regCount : null
  const isFull = spotsLeft !== null && spotsLeft <= 0
  const canRegister = event.status !== "COMPLETED" && event.status !== "CANCELLED"
  const visibleTags = (event.tags || []).filter(t => t !== "FREE" && t !== "COMING_SOON")

  const RegisterButton = ({ compact = false }: { compact?: boolean }) => (
    registrationStatus?.registered ? (
      <div className={compact ? "flex items-center gap-3 w-full" : "space-y-3"}>
        {!compact && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-emerald-300">You&apos;re in! See you there ✨</span>
          </div>
        )}
        {compact && (
          <div className="flex-1 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">Registered ✓</span>
          </div>
        )}
        <button
          onClick={handleUnregister}
          disabled={registering}
          className={`${compact ? "" : "w-full"} px-5 py-2.5 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50`}
        >
          {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Registration"}
        </button>
      </div>
    ) : (
      <button
        onClick={handleRegister}
        disabled={registering || isFull}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
          isFull
            ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 to-emerald-500 text-white hover:opacity-90 hover:shadow-xl shadow-amber-500/20"
        }`}
      >
        {registering ? (
          <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
        ) : isFull ? (
          "Event is Full"
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Register Now {isFree ? "— It's Free!" : `— ${event.price} ${event.currency}`}
          </span>
        )}
      </button>
    )
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'Inter'" }}>
      <PublicNav />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold">
            ✅ Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-header */}
      <div className="pt-24 pb-4 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/events" className="text-white/40 hover:text-white/70 text-sm font-medium flex items-center gap-2 transition">
          <ArrowLeft className="w-4 h-4" /> All Events
        </Link>
        <button onClick={handleShare} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition" title="Share">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-32 lg:pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* ═══ HERO ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 mb-10">

            {/* Poster */}
            <div className="lg:col-span-3">
              <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
                {event.posterUrl ? (
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-blue-500/10">
                    <span className="text-6xl sm:text-7xl mb-3">{TYPE_ICONS[event.type] || "📅"}</span>
                    <p className="text-white/30 font-semibold text-sm">{TYPE_LABELS[event.type] || event.type}</p>
                  </div>
                )}
                {/* Floating badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {comingSoon && <span className="px-3 py-1 bg-amber-500/90 text-white text-[11px] font-bold rounded-full shadow-lg backdrop-blur-sm">⏳ Coming Soon</span>}
                  {isFree ? (
                    <span className="px-3 py-1 bg-emerald-500/90 text-white text-[11px] font-bold rounded-full shadow-lg backdrop-blur-sm">🎉 Free</span>
                  ) : (
                    <span className="px-3 py-1 bg-white/90 text-gray-900 text-[11px] font-bold rounded-full shadow-lg backdrop-blur-sm">{event.currency} {event.price}</span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 text-[11px] font-bold rounded-full shadow-lg backdrop-blur-sm ${
                    event.status === "UPCOMING" ? "bg-blue-500/90 text-white" :
                    event.status === "ONGOING" ? "bg-emerald-500/90 text-white" :
                    event.status === "CANCELLED" ? "bg-red-500/90 text-white" :
                    "bg-white/20 text-white"
                  }`}>
                    {event.status === "UPCOMING" ? "📅 Upcoming" : event.status === "ONGOING" ? "🟢 Live Now" : event.status === "CANCELLED" ? "❌ Cancelled" : "✅ Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Info + CTA */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400/80">
                  {TYPE_ICONS[event.type]} {TYPE_LABELS[event.type] || event.type}
                </span>
                <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400/80">
                  {event.format === "ONLINE" ? "💻 Online" : event.format === "IN_PERSON" ? "🏢 In Person" : "🔀 Hybrid"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>{event.title}</h1>

              {/* Organization */}
              <Link href={`/organizations/${event.organization.id}`} className="group">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                    {event.organization.organizationProfile?.profileImageUrl ? (
                      <img src={event.organization.organizationProfile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/40 font-medium">Organized by</p>
                    <p className="font-bold text-white/90 group-hover:text-amber-400 transition-colors truncate text-sm">{event.organization.name}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition flex-shrink-0" />
                </div>
              </Link>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { icon: <Calendar className="w-4 h-4 text-blue-400" />, label: "Date", value: comingSoon ? "TBD" : eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                  { icon: <Clock className="w-4 h-4 text-emerald-400" />, label: "Time", value: comingSoon ? "TBD" : eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
                  { icon: <Users className="w-4 h-4 text-purple-400" />, label: "Registered", value: `${regCount}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}` },
                  { icon: <Ticket className="w-4 h-4 text-amber-400" />, label: "Price", value: isFree ? "Free" : `${event.price} ${event.currency}` },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                    <div className="flex items-center justify-center mb-1">{item.icon}</div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{item.label}</p>
                    <p className="font-bold text-white/90 text-sm mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Capacity */}
              {event.maxParticipants && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-white/30 font-medium">Capacity</span>
                    <span className={`text-[11px] font-bold ${isFull ? "text-red-400" : spotsLeft && spotsLeft <= 5 ? "text-amber-400" : "text-emerald-400"}`}>
                      {isFull ? "Event Full" : `${spotsLeft} spots left`}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((regCount / event.maxParticipants) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${isFull ? "bg-red-500" : spotsLeft && spotsLeft <= 5 ? "bg-amber-500" : "bg-gradient-to-r from-amber-500 to-emerald-500"}`}
                    />
                  </div>
                </div>
              )}

              {/* Registration CTA (Desktop) */}
              {canRegister && (
                <div className="mt-auto hidden lg:block">
                  <RegisterButton />
                  {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* ═══ DETAILS GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* Left: Description + Location + Date */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              {event.description && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
                      <span className="text-amber-400">📝</span> About This Event
                    </h2>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-white/60 whitespace-pre-wrap leading-relaxed text-sm">{event.description}</p>
                  </div>
                </motion.div>
              )}

              {/* Location */}
              {event.format !== "ONLINE" && (event.location || venueInfo.address) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
                      <span className="text-rose-400">📍</span> Location
                    </h2>
                  </div>
                  <div className="px-6 py-5 space-y-3">
                    {event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white/90 text-sm">{event.location}</p>
                          {venueInfo.address && <p className="text-white/40 text-xs mt-0.5">{venueInfo.address}</p>}
                        </div>
                      </div>
                    )}
                    {venueInfo.mapUrl && (
                      <a href={venueInfo.mapUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition">
                        <ExternalLink className="w-3 h-3" /> Open in Google Maps
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Date & Time */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
                    <span className="text-blue-400">🗓️</span> Date & Time
                  </h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white/90 text-sm">
                        {comingSoon ? "Coming Soon — Date TBD" : eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      {!comingSoon && (
                        <p className="text-white/40 text-xs mt-0.5">
                          {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {endDate && ` — ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Tags */}
              {visibleTags.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
                      <Tag className="w-3.5 h-3.5 text-amber-400" /> Tags
                    </h3>
                  </div>
                  <div className="px-5 py-4 flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-semibold border border-amber-500/20 bg-amber-500/5 text-amber-400/80">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Details */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Details
                  </h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {[
                    { label: "Type", value: `${TYPE_ICONS[event.type] || ""} ${TYPE_LABELS[event.type] || event.type}` },
                    { label: "Format", value: event.format === "ONLINE" ? "💻 Online" : event.format === "IN_PERSON" ? "🏢 In Person" : "🔀 Hybrid" },
                    { label: "Visibility", value: event.visibility === "PUBLIC" ? "🌍 Public" : event.visibility === "ORG_ONLY" ? "🏢 Org Only" : event.visibility === "MEMBERS_ONLY" ? "👥 Members" : "🔒 Private" },
                    { label: "Pricing", value: isFree ? "🎉 Free" : `${event.price} ${event.currency}` },
                    { label: "Capacity", value: event.maxParticipants ? `${event.maxParticipants} max` : "Unlimited" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-[11px] text-white/30 uppercase tracking-wider">{row.label}</span>
                      <span className="text-xs font-semibold text-white/70">{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Org Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Link href={`/organizations/${event.organization.id}`} className="block group">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06] transition-all p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                        {event.organization.organizationProfile?.profileImageUrl ? (
                          <img src={event.organization.organizationProfile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Organized by</p>
                        <p className="font-bold text-white/90 group-hover:text-amber-400 transition truncate">{event.organization.name}</p>
                        <p className="text-[11px] text-amber-400/70 font-medium mt-0.5">View Profile →</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Mobile Registration */}
              {canRegister && (
                <div className="lg:hidden">
                  <RegisterButton />
                  {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </main>

      {/* Sticky Mobile Bottom CTA */}
      {canRegister && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] p-4">
          <div className="max-w-lg mx-auto">
            <RegisterButton compact />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Tafsula</p>
          <div className="flex gap-1.5">{["bg-red-500/60", "bg-amber-400/60", "bg-emerald-500/60", "bg-blue-500/60"].map((b, i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${b}`} />)}</div>
        </div>
      </footer>
    </div>
  )
}