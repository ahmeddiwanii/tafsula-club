"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  Zap, 
  Target, 
  Shield, 
  Globe, 
  Lock, 
  Map, 
  Navigation, 
  Save, 
  Trash2, 
  ChevronRight, 
  ExternalLink,
  Radio,
  Clock,
  Sparkles,
  Command,
  Layout,
  ArrowLeft,
  X,
  Plus,
  Tags,
  MapPin,
  Users,
  Briefcase,
  Check,
  Calendar,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import Link from "next/link"

// Label mappings for select options
const TYPE_LABELS: Record<string, string> = {
  GENERAL: '📋 General Event',
  TRAINING: '🎓 Training',
  WORKSHOP: '🛠️ Workshop',
  CONFERENCE: '🎤 Conference',
  MEETING: '👔 Meeting',
  WEBINAR: '💻 Webinar',
  VOLUNTEERING: '🤝 Volunteering Shift',
  FUNDRAISER: '💰 Fundraiser',
  SOCIAL: '🎉 Social Gathering',
  COMPETITION: '🏆 Competition',
}

const TUNISIA_REGIONS: Record<string, string[]> = {
  "Tunis": ["Tunis", "Carthage", "La Marsa", "Le Bardo", "Sidi Bou Said", "El Menzah", "El Omrane"],
  "Ariana": ["Ariana Ville", "La Soukra", "Raoued", "Sidi Thabet", "Ettadhamen", "Mnihla"],
  "Ben Arous": ["Ben Arous", "Megrine", "Radès", "Hammam Lif", "Mornag", "El Mourouj", "Ezzahra"],
  "Manouba": ["Manouba", "Douar Hicher", "Oued Ellil", "Tebourba", "Mornaguia", "Borj El Amri"],
  "Nabeul": ["Nabeul", "Hammamet", "Dar Chaabane", "Kelibia", "Grombalia", "Korba", "Soliman", "Menzel Temime", "beni khalled", "menzel bouzalfa"],
  "Zaghouan": ["Zaghouan", "Zriba", "Bir Mcherga", "Fahs", "Nadhour", "Saouaf"],
  "Bizerte": ["Bizerte Nord", "Bizerte Sud", "Menzel Bourguiba", "Mateur", "Ras Jebel", "Tinja", "Ghar El Melh"],
  "Béja": ["Béja Nord", "Béja Sud", "Medjez el-Bab", "Testour", "Teboursouk", "Nefza", "Amdoun"],
  "Jendouba": ["Jendouba", "Tabarka", "Ain Draham", "Fernana", "Bousalem", "Ghardimaou", "Oued Meliz"],
  "Kef": ["Le Kef", "Dahmani", "Tajerouine", "Kalaat Senan", "Nebeur", "Sakiet Sidi Youssef"],
  "Siliana": ["Siliana", "Makthar", "Bou Arada", "Gaafour", "El Krib", "Rouhia"],
  "Sousse": ["Sousse Ville", "Sousse Jawhara", "Kalaa Kebira", "Akouda", "Hammam Sousse", "Enfidha", "Bouficha"],
  "Monastir": ["Monastir", "Moknine", "Jemmal", "Ksar Hellal", "Teboulba", "Sahline", "Sayada"],
  "Mahdia": ["Mahdia", "El Jem", "Chebba", "Ksour Essef", "Bou Merdes", "Souassi"],
  "Sfax": ["Sfax Ville", "Sfax Sud", "Sakiet Ezzit", "Sakiet Eddaier", "Thyna", "Kerkennah", "Agareb", "Mahares"],
  "Kairouan": ["Kairouan Nord", "Kairouan Sud", "Oueslatia", "Haffouz", "Sbikha", "Bouhajla", "Cherarda"],
  "Kasserine": ["Kasserine Nord", "Kasserine Sud", "Sbeitla", "Thala", "Foussana", "Feriana", "Majel Bel Abbes"],
  "Sidi Bouzid": ["Sidi Bouzid", "Meknassy", "Regueb", "Jilma", "Mezzouna", "Bir El Hafey"],
  "Gabès": ["Gabès Ville", "Gabès Sud", "Mareth", "Ghannouch", "El Hamma", "Matmata", "Nouvelle Matmata"],
  "Medenine": ["Medenine", "Djerba Houmt Souk", "Djerba Midoun", "Zarzis", "Ben Gardane", "Beni Khedache"],
  "Tataouine": ["Tataouine Nord", "Tataouine Sud", "Ghomrassen", "Remada", "Smâr"],
  "Gafsa": ["Gafsa Nord", "Gafsa Sud", "Metlaoui", "Redeyef", "Moulares", "El Ksar", "Belkhir"],
  "Tozeur": ["Tozeur", "Nefta", "Degache", "Tameghza", "Hazoua"],
  "Kebili": ["Kebili Nord", "Kebili Sud", "Douz", "Souk Lahad", "Faouar"],
}

export default function CreateEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editEventId = searchParams.get("editId")
  const { data: session } = useSession()
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(!!editEventId)
  const [error, setError] = useState<string | null>(null)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)

  const [isFree, setIsFree] = useState(false)
  const [isComingSoon, setIsComingSoon] = useState(false)
  const [governorate, setGovernorate] = useState<string>("")
  const [delegation, setDelegation] = useState<string>("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "GENERAL",
    format: "IN_PERSON",
    price: 0,
    currency: "TND",
    startAt: "",
    endAt: "",
    location: "",
    venue: "",
    visibility: "ORG_ONLY",
    maxParticipants: "",
    posterFile: null as File | null,
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [eventTeams, setEventTeams] = useState<any[]>([])
  const [eventDirectors, setEventDirectors] = useState<string[]>([])

  useEffect(() => {
    if (editEventId) {
      fetchEvent()
    }
  }, [editEventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${editEventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          type: eventData.type || "GENERAL",
          format: eventData.format || "IN_PERSON",
          price: eventData.price || 0,
          currency: eventData.currency || "TUN",
          startAt: eventData.startAt ? new Date(eventData.startAt).toISOString().slice(0, 16) : "",
          endAt: eventData.endAt ? new Date(eventData.endAt).toISOString().slice(0, 16) : "",
          location: eventData.location || "",
          venue: eventData.venue || "",
          visibility: eventData.visibility || "ORG_ONLY",
          maxParticipants: eventData.maxParticipants?.toString() || "",
          posterFile: null,
          tags: Array.isArray(eventData.tags) ? eventData.tags : (typeof eventData.tags === "string" ? JSON.parse(eventData.tags) : []),
        })
        
        if (eventData.venue && eventData.venue.startsWith('{')) {
          try {
            const venueData = JSON.parse(eventData.venue);
            setFormData(prev => ({ ...prev, venue: venueData.address }));
            setGoogleMapsUrl(venueData.mapUrl || "");
          } catch(e) {}
        }

        if (eventData.location) {
          const parts = eventData.location.split(' - ');
          if (parts.length > 0) setGovernorate(parts[parts.length - 1]);
          if (parts.length > 1) setDelegation(parts[0]);
        }

        if (eventData.posterUrl) setPosterUrl(eventData.posterUrl)
        if (eventData.price === 0) setIsFree(true)
        if (eventData.startAt && new Date(eventData.startAt).getFullYear() === 2099) setIsComingSoon(true)
        
        setIsEditMode(true)
        setCreatedEventId(editEventId)

        const [teamsRes, directorsRes] = await Promise.all([
          fetch(`/api/teams?eventId=${editEventId}`),
          fetch(`/api/event-directors?eventId=${editEventId}`)
        ])
        
        if (teamsRes.ok) {
           const teamsData = await teamsRes.json()
           setEventTeams(teamsData.data || teamsData || [])
        }
        if (directorsRes.ok) {
           const directorsData = await directorsRes.json()
           setEventDirectors(directorsData.data || [])
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let posterUrlString = posterUrl

      if (formData.posterFile) {
        posterUrlString = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.posterFile!)
        })
      }

      let finalTags = [...formData.tags]
      if (isFree && !finalTags.includes("FREE")) finalTags.push("FREE")
      if (isComingSoon && !finalTags.includes("COMING_SOON")) finalTags.push("COMING_SOON")

      const finalStartAt = isComingSoon ? "2099-12-31T23:59:00" : formData.startAt
      const finalLocation = formData.format !== "ONLINE" && governorate 
        ? `${governorate}${delegation ? ` - ${delegation}` : ''}` 
        : formData.location

      const finalVenue = googleMapsUrl 
        ? JSON.stringify({ address: formData.venue, mapUrl: googleMapsUrl }) 
        : formData.venue

      const eventPayload = {
        ...formData,
        location: finalLocation,
        venue: finalVenue,
        posterUrl: posterUrlString,
        price: isFree ? 0 : (parseFloat(formData.price.toString()) || 0),
        currency: isFree ? "TND" : formData.currency,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        startAt: finalStartAt ? new Date(finalStartAt).toISOString() : null,
        endAt: (formData.endAt && !isComingSoon) ? new Date(formData.endAt).toISOString() : null,
        tags: finalTags,
      }

      const method = isEditMode ? "PATCH" : "POST"
      const url = isEditMode ? `/api/events/${editEventId}` : "/api/events"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} event`)
      }

      if (isEditMode) {
        toast.success("Event synced with central command.")
        router.push(`/dashboard/hr/events/${editEventId}`)
      } else {
        const eventData = await response.json()
        setCreatedEventId(eventData.id || eventData.data?.id)
        setShowSetupModal(true)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoToSetup = () => {
    router.push(`/dashboard/hr/events/${createdEventId}`)
  }

  const handleSkipSetup = () => {
    router.push(`/dashboard/hr/events/${createdEventId}`)
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="relative z-10 max-w-7xl mx-auto pb-20 px-4 md:px-0">
        
        {/* Setup Modal */}
        <AnimatePresence>
          {showSetupModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/[0.08] rounded-[2.5rem] p-10 max-w-md w-full space-y-8 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3 tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Event saved</h2>
                  <p className="text-white/40 text-sm font-medium">Your operational directive has been synchronized. Initialize squad allocation now?</p>
                </div>
                <div className="space-y-3">
                  <Button onClick={handleGoToSetup} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-blue-600/20 border border-blue-500/50">
                    <Users className="w-4 h-4 mr-2" /> Set up teams
                  </Button>
                  <Button onClick={handleSkipSetup} variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    Stand By / Skip Archive
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <Button variant="ghost" onClick={() => router.push("/dashboard/hr/events")} className="text-white/40 hover:text-white transition-colors w-fit -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
            </Button>
            <div className="flex gap-4">
               <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 transition-all border border-blue-500/50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {loading ? "Saving…" : isEditMode ? "Save changes" : "Create event"}
               </Button>
            </div>
        </div>

        {/* Hero Header */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-8 md:p-12 mb-12 relative overflow-hidden backdrop-blur-xl group hover:border-blue-500/20 transition-all">
           <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
           <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/10 group-hover:scale-105 transition-transform duration-500">
                 {isEditMode ? <Command className="w-12 h-12" /> : <Layout className="w-12 h-12" />}
              </div>
              <div className="flex-1">
                 <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Badge className="bg-white/5 text-white/40 border-none py-1.5 px-3 rounded-lg uppercase font-black tracking-widest text-[9px]">
                       {isEditMode ? `ID-${editEventId?.slice(-4).toUpperCase()}` : "NEW_DIRECTIVE"}
                    </Badge>
                    <span className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">Event Configuration Console</span>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isEditMode ? 'CRITICAL REVISION' : 'OPERATIONAL SETUP'}
                 </h1>
                 <p className="text-white/40 font-medium italic max-w-2xl leading-relaxed">
                    {isEditMode ? 'Calibrate and sync existing mission parameters for the designated operation.' : 'Define new strategic boundaries and operational objectives for the upcoming organizational event.'}
                 </p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl">
              
              <div className="space-y-10">
                {/* Sector 1 */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>1. Basics</h3>
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Event name <span className="text-blue-500">*</span></p>
                      <Input value={formData.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g., TECH INNOVATION SUMMIT 2026" className="h-16 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-xl font-black rounded-2xl transition-all" />
                    </div>
                    <div className="group">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Details</p>
                      <Textarea value={formData.description} onChange={e => handleChange("description", e.target.value)} placeholder="Describe the mission objectives..." className="min-h-[160px] bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-base font-medium rounded-2xl resize-none p-6" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Poster image</p>
                      <div className="relative group/poster">
                        <Input type="file" accept="image/*" onChange={(e) => handleChange("posterFile", e.target.files?.[0] || null)} className="h-16 bg-white/[0.03] border-dashed border-2 border-white/10 hover:border-blue-500/50 rounded-2xl cursor-pointer file:hidden text-center flex items-center justify-center text-white/40 font-black uppercase tracking-widest text-[10px]" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black text-white/20 uppercase tracking-widest group-hover/poster:text-blue-400">
                           {formData.posterFile ? "Image added: " + formData.posterFile.name : "Upload a poster"}
                        </div>
                      </div>
                      {(formData.posterFile || posterUrl) && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-6">
                          <img src={formData.posterFile ? URL.createObjectURL(formData.posterFile) : (posterUrl || "/placeholder.svg")} className="w-32 h-20 object-cover rounded-xl border border-white/10" />
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Image ready</p>
                            <p className="text-xs text-white/40">Ready for deployment.</p>
                          </div>
                          <Button variant="ghost" onClick={() => { handleChange("posterFile", null); setPosterUrl(null); }} className="text-red-500/40 hover:text-red-500 hover:bg-transparent">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sector 2 */}
                <div className="pt-10 border-t border-white/5 space-y-8">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>2. Format and size</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Zap className="w-3 h-3" /> Event Modality</p>
                      <select value={formData.type} onChange={(e) => handleChange("type", e.target.value)} className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_16px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233b82f6%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                        {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val} className="bg-slate-900">{label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Target className="w-3 h-3" /> Event format</p>
                      <select value={formData.format} onChange={(e) => handleChange("format", e.target.value)} className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_16px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233b82f6%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                        <option value="IN_PERSON" className="bg-slate-900">🏢 IN PERSON</option>
                        <option value="ONLINE" className="bg-slate-900">💻 ONLINE</option>
                        <option value="HYBRID" className="bg-slate-900">🔀 HYBRID</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Globe className="w-3 h-3" /> Sector Visibility</p>
                      <select value={formData.visibility} onChange={(e) => handleChange("visibility", e.target.value)} className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_16px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233b82f6%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                        <option value="PUBLIC" className="bg-slate-900">🌍 PUBLIC</option>
                        <option value="ORG_ONLY" className="bg-slate-900">🏢 ORGANIZATION ONLY</option>
                        <option value="MEMBERS_ONLY" className="bg-slate-900">👥 MEMBERS ONLY</option>
                        <option value="PRIVATE" className="bg-slate-900">🔒 PRIVATE</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Max people</p>
                      <Input type="number" value={formData.maxParticipants} onChange={e => handleChange("maxParticipants", e.target.value)} placeholder="UNLIMITED" className="h-16 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-base font-black rounded-2xl" />
                    </div>
                  </div>
                </div>

                {/* Sector 3 */}
                <div className="pt-10 border-t border-white/5 space-y-8">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>3. Price</h3>
                  <div className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-[2rem] border border-white/10">
                    <Checkbox id="isFree" checked={isFree} onCheckedChange={(val) => setIsFree(val as boolean)} className="w-6 h-6 border-2 border-white/20" />
                    <Label htmlFor="isFree" className="text-sm font-black text-white/60 cursor-pointer uppercase tracking-widest">Non-Monetary / Volunteering Operation 🤝</Label>
                  </div>
                  {!isFree && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Access Payload (Price)</p>
                        <Input type="number" step="0.01" value={formData.price} onChange={e => handleChange("price", e.target.value)} className="h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl font-black" />
                      </div>
                      <div className="group">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Currency</p>
                        <select value={formData.currency} onChange={e => handleChange("currency", e.target.value)} className="w-full h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white outline-none">
                          <option value="TND" className="bg-slate-900">TND</option>
                          <option value="USD" className="bg-slate-900">USD</option>
                          <option value="EUR" className="bg-slate-900">EUR</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sector 4 */}
                <div className="pt-10 border-t border-white/5 space-y-10">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sector 04: Due date</h3>
                  <div className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-[2rem] border border-white/10">
                    <Checkbox id="isComingSoon" checked={isComingSoon} onCheckedChange={(val) => setIsComingSoon(val as boolean)} className="w-6 h-6 border-2 border-white/20" />
                    <Label htmlFor="isComingSoon" className="text-sm font-black text-white/60 cursor-pointer uppercase tracking-widest">Horizon Pending (Coming Soon) ⏳</Label>
                  </div>
                  {!isComingSoon && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Inception (Start)</p>
                        <Input type="datetime-local" value={formData.startAt} onChange={e => handleChange("startAt", e.target.value)} className="h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl [color-scheme:dark]" />
                      </div>
                      <div className="group">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Termination (End)</p>
                        <Input type="datetime-local" value={formData.endAt} onChange={e => handleChange("endAt", e.target.value)} className="h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl [color-scheme:dark]" />
                      </div>
                    </div>
                  )}
                  {formData.format !== "ONLINE" && (
                    <div className="space-y-8 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Governorate</p>
                          <select value={governorate} onChange={e => { setGovernorate(e.target.value); setDelegation("") }} className="w-full h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase text-white outline-none appearance-none bg-no-repeat bg-[center_right_20px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233b82f6%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                            <option value="" className="bg-slate-900">Select...</option>
                            {Object.keys(TUNISIA_REGIONS).map(gov => <option key={gov} value={gov} className="bg-slate-900">{gov}</option>)}
                          </select>
                        </div>
                        <div className="group">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Delegation</p>
                          <select value={delegation} onChange={e => setDelegation(e.target.value)} disabled={!governorate} className="w-full h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase text-white outline-none appearance-none disabled:opacity-20 bg-no-repeat bg-[center_right_20px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233b82f6%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                            <option value="" className="bg-slate-900">Select...</option>
                            {governorate && TUNISIA_REGIONS[governorate]?.map(del => <option key={del} value={del} className="bg-slate-900">{del}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Exact Venue</p>
                          <Input value={formData.venue} onChange={e => handleChange("venue", e.target.value)} placeholder="Building/Room Name" className="h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl font-black text-xs uppercase" />
                        </div>
                        <div className="group">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Navigation Link</p>
                          <Input value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} placeholder="Maps URL" className="h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl text-[10px] font-black" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sector 5 */}
                <div className="pt-10 border-t border-white/5 space-y-6">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sector 05: Requirement Tags</h3>
                  <div className="flex gap-4">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); if (!formData.tags.includes(tagInput.trim())) handleChange("tags", [...formData.tags, tagInput.trim()]); setTagInput(""); } }} placeholder="e.g. LOGISTICS, DRIVERS" className="h-16 bg-white/[0.03] border-white/[0.08] text-[10px] font-black uppercase tracking-widest rounded-2xl flex-1" />
                    <Button type="button" onClick={() => { if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) { handleChange("tags", [...formData.tags, tagInput.trim()]); setTagInput(""); } }} className="h-16 px-10 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase">ADD</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} className="bg-blue-500/10 text-blue-400 border-none px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                        {tag} <X className="w-3 h-3 cursor-pointer opacity-40 hover:opacity-100" onClick={() => handleChange("tags", formData.tags.filter(t => t !== tag))} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-8 space-y-10 sticky top-12 backdrop-blur-xl">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Next steps</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-5 rounded-3xl bg-blue-600/5 border border-blue-500/10 scale-105 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs shadow-xl shadow-blue-500/20">01</div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Configuration</p>
                     </div>
                     <div 
                       onClick={() => {
                         if (createdEventId || editEventId) {
                           router.push(`/dashboard/hr/events/${createdEventId || editEventId}`);
                         } else {
                           toast.error("Please create the operation first.");
                         }
                       }}
                       className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${(createdEventId || editEventId) ? "bg-white/[0.02] border-white/10 hover:border-blue-500/30 cursor-pointer group" : "bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed"}`}
                     >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${(createdEventId || editEventId) ? "bg-white/10 text-white/60 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all" : "bg-white/5 text-white/20"}`}>02</div>
                        <p className={`text-xs font-black uppercase tracking-widest ${(createdEventId || editEventId) ? "text-white/60 group-hover:text-white transition-all" : "text-white/40"}`}>Set up teams</p>
                     </div>
                     <div 
                       onClick={() => {
                         if (createdEventId || editEventId) {
                           router.push(`/dashboard/hr/events/${createdEventId || editEventId}`);
                         } else {
                           toast.error("Please create the operation first.");
                         }
                       }}
                       className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${(createdEventId || editEventId) ? "bg-white/[0.02] border-white/10 hover:border-blue-500/30 cursor-pointer group" : "bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed"}`}
                     >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${(createdEventId || editEventId) ? "bg-white/10 text-white/60 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all" : "bg-white/5 text-white/20"}`}>03</div>
                        <p className={`text-xs font-black uppercase tracking-widest ${(createdEventId || editEventId) ? "text-white/60 group-hover:text-white transition-all" : "text-white/40"}`}>Directors</p>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/5 space-y-6">
                  <Button onClick={handleSubmit} disabled={loading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/40 transition-all border border-blue-500/50">
                     {loading ? "INITIALIZING..." : isEditMode ? "SYNC OVERRIDE" : "DEPLOY OPERATION"}
                  </Button>
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl">
                     <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-4">Strategic Tip</p>
                     <p className="text-[10px] text-white/30 italic font-medium">Verify all spatio-temporal coordinates before deployment to ensure asset alignment.</p>
                  </div>
               </div>

               {isEditMode && (eventTeams.length > 0 || eventDirectors.length > 0) && (
                 <div className="pt-10 border-t border-white/5 space-y-6">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Current setup</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 text-center">
                          <p className="text-[9px] font-black text-white/20 uppercase mb-2">Squads</p>
                          <p className="text-3xl font-black text-white">{eventTeams.length}</p>
                       </div>
                       <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 text-center">
                          <p className="text-[9px] font-black text-white/20 uppercase mb-2">Directors</p>
                          <p className="text-3xl font-black text-white">{eventDirectors.length}</p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </HRLayout>
  )
}
