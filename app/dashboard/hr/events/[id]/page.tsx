"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  MapPin, 
  Calendar, 
  Zap, 
  Target, 
  Shield, 
  Clock, 
  Edit, 
  UserPlus, 
  X,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  ClipboardList,
  Radio,
  UserCheck,
  MoreVertical
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import { HREventRegistrations } from "@/components/hr-event-registrations"

interface Director {
  id: string
  user: {
     id: string
     name: string
     email: string
     avatarId: number
  }
}

interface Team {
  id: string
  name: string
  purpose?: string
  _count: {
    members: number
    tasks: number
  }
}

interface Registration {
  id: string
  userId: string
  status: string
  preferredTeamId?: string
  appliedAt: string
  user: {
    id: string
    name: string
    email: string
    avatarId: number
  }
}

interface EventData {
  id: string
  title: string
  description?: string
  status: string
  startAt: string
  endAt?: string
  location?: string
  venue?: string
  type: string
  format: string
  visibility: string
  directors: Director[]
  teams: Team[]
  registrations: Registration[]
  _count: {
    registrations: number
    attendances: number
  }
}

export default function EventCommandDeck() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session } = useSession()
  
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showDirectorModal, setShowDirectorModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState<Registration | null>(null)
  const [allUsers, setAllUsers] = useState<{id: string, name: string, email: string}[]>([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (id) fetchEventData()
  }, [id])

  const fetchEventData = async () => {
    try {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) throw new Error("Telemetry Lost")
      const data = await res.json()
      setEvent(data)
    } catch (error) {
      toast.error("Failed to recover event data")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/event-directors")
      const data = await res.json()
      setAllUsers(data)
    } catch (e) {
      toast.error("User registry offline")
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Status: ${newStatus}`)
        fetchEventData()
        setShowStatusMenu(false)
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleDirector = async (userId: string) => {
    const isAlreadyDirector = event?.directors.some(d => d.user.id === userId)
    const currentDirectorIds = event?.directors.map(d => d.user.id) || []
    
    let newDirectorIds
    if (isAlreadyDirector) {
      newDirectorIds = currentDirectorIds.filter(id => id !== userId)
    } else {
      newDirectorIds = [...currentDirectorIds, userId]
    }

    try {
      const res = await fetch("/api/event-directors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, directorIds: newDirectorIds })
      })
      if (res.ok) {
        toast.success("Access updated")
        fetchEventData()
      }
    } catch (e) {
      toast.error("Permission override failed")
    }
  }

  const handleAssignToTeam = async (reg: Registration, teamId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: reg.userId, roleInTeam: "Member" })
      })
      
      if (res.ok) {
        toast.success(`${reg.user.name} added to the team.`)
        setShowAssignModal(null)
        fetchEventData()
      }
    } catch (e) {
      toast.error("Could not add to team")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <HRLayout orgName="Synchronizing...">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </HRLayout>
  )

  if (!event) return null

  const statusColors: any = {
    UPCOMING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    ONGOING: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 animate-pulse",
    COMPLETED: "text-white/40 bg-white/5 border-white/10",
    CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20"
  }

  return (
    <HRLayout orgName={session?.user.name || "Organization"}>
      <div className="relative z-10 max-w-7xl mx-auto pb-20">
        
        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between mb-12">
            <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard/hr/events")}
                className="text-white/40 hover:text-white transition-colors -ml-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
            </Button>

            <div className="flex gap-4">
               <div className="relative">
                  <Button 
                    variant="ghost"
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${statusColors[event.status]}`}
                  >
                     <Zap className="w-4 h-4 mr-2" /> {event.status}
                  </Button>
                  <AnimatePresence>
                    {showStatusMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0d0d15] border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] backdrop-blur-xl"
                      >
                        {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
               <Button 
                 onClick={() => router.push(`/dashboard/hr/events/${id}/edit`)}
                 className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 transition-all border border-blue-500/50"
               >
                  <Edit className="w-4 h-4 mr-2" /> Modify Blueprint
               </Button>
            </div>
        </div>

        {/* Tactical Mission Header */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-12 mb-12 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
           <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/10 to-transparent" />
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
           
           <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
              <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-blue-900/40 border border-blue-500/30 flex items-center justify-center p-8 backdrop-blur-xl shadow-inner relative group">
                 <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] blur-xl" />
                 <Calendar className="w-full h-full text-blue-400 relative z-10" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                 <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-6">
                    <Badge className="bg-white/5 text-white/40 border border-white/10 py-1.5 px-3 rounded-lg uppercase font-black tracking-[0.2em] text-[9px]">
                       EVT-{event.id.slice(-4).toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Event hub
                    </span>
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 max-w-4xl leading-[0.9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {event.title.toUpperCase()}
                 </h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-10 items-center border-t border-white/5 pt-10 mt-2">
                    <div className="flex items-center gap-3">
                       <MapPin className="w-5 h-5 text-blue-500" />
                       <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sector</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{event.location || "UNDEFINED"}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Clock className="w-5 h-5 text-blue-500" />
                       <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Timeline</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight">
                            {format(new Date(event.startAt), "dd MMM yyyy @ HH:mm").toUpperCase()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <TrendingUp className="w-5 h-5 text-emerald-500" />
                       <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Enrollment</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{event._count.registrations} people signed up</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left Column: Command & Force Structure */}
           <div className="lg:col-span-8 space-y-12">
              
              {/* Join requests Section (New Personnel Requests) */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 ml-2">
                    <Radio className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Join requests</h3>
                 </div>

                 <div className="space-y-4">
                    {event.registrations.filter(r => r.status !== "REJECTED" && r.status !== "CANCELLED").length > 0 ? (
                      event.registrations.filter(r => r.status !== "REJECTED" && r.status !== "CANCELLED").slice(0, 5).map((reg) => (
                        <Card key={reg.id} className="p-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.02] flex items-center justify-between group">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-black">
                                 {reg.user.name[0]}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <p className="text-lg font-black text-white uppercase tracking-tighter">{reg.user.name}</p>
                                    {reg.status === "APPROVED" && (
                                       <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black tracking-widest uppercase">Approved</Badge>
                                    )}
                                    {reg.status === "REGISTERED" && (
                                       <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] font-black tracking-widest uppercase">Pending</Badge>
                                    )}
                                    {reg.preferredTeamId && (
                                       <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black tracking-widest uppercase">Preferred team</Badge>
                                    )}
                                 </div>
                                 <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">Signal Detected @ {format(new Date(reg.appliedAt), "HH:mm")}</p>
                              </div>
                           </div>
                           <Button 
                             onClick={() => setShowAssignModal(reg)}
                             className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest transition-all"
                           >
                              <UserCheck className="w-3.5 h-3.5 mr-2" /> Approve
                           </Button>
                        </Card>
                      ))
                    ) : (
                      <div className="p-10 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                         <Radio className="w-10 h-10 text-white/5 mb-4" />
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No passive asset signals detected in current sector</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Event leads */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between ml-2">
                    <div className="flex items-center gap-3">
                       <Shield className="w-5 h-5 text-blue-400" />
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Event leads</h3>
                    </div>
                    <Button 
                       variant="ghost" 
                       onClick={() => { fetchUsers(); setShowDirectorModal(true); }}
                       className="h-10 px-4 rounded-xl border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                       <UserPlus className="w-3.5 h-3.5 mr-2" /> Appoint Director
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.directors.length > 0 ? (
                      event.directors.map((director) => (
                        <Card key={director.id} className="p-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.02] flex items-center justify-between group overflow-hidden relative">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
                           <div className="flex items-center gap-5 relative z-10">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-600/20">
                                 {director.user.name[0]}
                              </div>
                              <div>
                                 <p className="text-lg font-black text-white leading-tight uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{director.user.name}</p>
                                 <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1">Super Director</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleToggleDirector(director.user.id)}
                             className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all relative z-10"
                           >
                              <X className="w-4 h-4" />
                           </button>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 p-10 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                         <Shield className="w-10 h-10 text-white/5 mb-4" />
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No strategic directors authorized for this mission</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Teams */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 ml-2">
                    <LayoutGrid className="w-5 h-5 text-blue-400" />
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Teams</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.teams.length > 0 ? (
                      event.teams.map((team) => (
                        <Card 
                          key={team.id} 
                          onClick={() => router.push(`/dashboard/hr/teams/${team.id}/edit`)}
                          className="p-8 rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group cursor-pointer"
                        >
                           <div className="flex items-start justify-between mb-8">
                              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                 <Users className="w-8 h-8" />
                              </div>
                              <Badge className="bg-white/5 text-white/40 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">Active team</Badge>
                           </div>
                           <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{team.name}</h4>
                           <p className="text-xs text-white/30 font-medium mb-8 leading-relaxed italic">"{team.purpose || "No team description yet."}"</p>
                           
                           <div className="flex items-center border-t border-white/5 pt-6 gap-6">
                              <div className="flex items-center gap-2">
                                 <Users className="w-3.5 h-3.5 text-blue-500/40" />
                                 <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{team._count.members} ASSETS</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Target className="w-3.5 h-3.5 text-blue-500/40" />
                                 <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{team._count.tasks} MISSIONS</span>
                              </div>
                           </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 p-16 rounded-[3rem] bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                         <LayoutGrid className="w-12 h-12 text-white/5 mb-6" />
                         <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">No squads allocated to this operation</p>
                         <Button 
                           variant="link" 
                           onClick={() => router.push("/dashboard/hr/teams")}
                           className="mt-4 text-blue-500 font-bold uppercase text-[10px] tracking-widest hover:text-blue-400"
                         >
                            Set up teams <ChevronRight className="w-3 h-3 ml-1" />
                         </Button>
                      </div>
                    )}
                 </div>
              </section>

              {/* Registration/Intelligence Feed */}
              <section className="pt-12 border-t border-white/5">
                 <HREventRegistrations
                    eventId={id as string}
                    eventTitle={event.title}
                    eventStartAt={event.startAt}
                 />
              </section>
           </div>

           {/* Right Column: Mission Context & Intelligence */}
           <div className="lg:col-span-4 space-y-12">
              <div className="sticky top-12 space-y-8">
                 
                 <Card className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl space-y-10">
                    <div>
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <ClipboardList className="w-3.5 h-3.5" /> About this event
                       </h4>
                       <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                          {event.description || "No description yet."}
                       </p>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-white/5">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Type</p>
                          <p className="text-xs font-black text-blue-400 uppercase tracking-tighter">{event.type}</p>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Format</p>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">{event.format.replace('_', ' ')}</p>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Visibility</p>
                          <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black tracking-widest">{event.visibility.replace('_', ' ')}</Badge>
                       </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                             <Target className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Lead Strategist</p>
                             <p className="text-xs font-black text-white uppercase tracking-tight">{session?.user.name}</p>
                          </div>
                       </div>
                    </div>
                 </Card>

                 <div className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-6">
                       <Zap className="w-5 h-5 text-emerald-400" />
                       <h4 className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tips</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                           <p className="text-3xl font-black text-white tracking-tighter">{Math.round((event._count.attendances / (event._count.registrations || 1)) * 100)}%</p>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Attendance</p>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(event._count.attendances / (event._count.registrations || 1)) * 100}%` }}
                             className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                           />
                        </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>

      {/* Deployment Modal (Assign to Squad) */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-white">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
               onClick={() => setShowAssignModal(null)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-[#0a0a10] border border-white/10 rounded-[2.5rem] shadow-2xl p-10"
            >
               <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Deployment</h3>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-8">Select target squad for {showAssignModal.user.name}</p>
               
               <div className="space-y-3">
                  {event.teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => handleAssignToTeam(showAssignModal, team.id)}
                      disabled={processing}
                      className="w-full p-6 text-left rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all group flex items-center justify-between"
                    >
                       <div>
                          <p className="font-black text-lg uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{team.name}</p>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">{team._count.members} people active</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-blue-500 transition-all" />
                    </button>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Director Appointment Modal */}
      <AnimatePresence>
        {showDirectorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
               onClick={() => setShowDirectorModal(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-[#0a0a10] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-500" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Command Delegation</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Appoint Super Director</p>
                     </div>
                  </div>
                  <button onClick={() => setShowDirectorModal(false)} className="text-white/20 hover:text-white transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {allUsers.map((user) => {
                    const isAdded = event.directors.some(d => d.user.id === user.id)
                    return (
                      <div 
                        key={user.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isAdded ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-white/40">
                               {user.name[0]}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-black text-white truncate">{user.name}</p>
                               <p className="text-[10px] text-white/20 font-bold truncate uppercase tracking-widest">{user.email}</p>
                            </div>
                         </div>
                         <Button
                           size="sm"
                           variant={isAdded ? "ghost" : "outline"}
                           onClick={() => handleToggleDirector(user.id)}
                           className={`h-9 px-4 rounded-lg font-black uppercase text-[9px] tracking-widest ${
                             isAdded ? 'text-red-400 hover:text-red-500 hover:bg-red-500/10' : 'bg-blue-600 text-white hover:bg-blue-700'
                           }`}
                         >
                            {isAdded ? "Recall" : "Appoint"}
                         </Button>
                      </div>
                    )
                  })}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </HRLayout>
  )
}
