"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import MemberLayout from "@/components/layout/member-layout"
import { 
  Shield, 
  Zap, 
  Target, 
  Users, 
  Calendar, 
  ChevronRight, 
  X, 
  Check, 
  Clock, 
  MapPin, 
  ArrowRight,
  LayoutGrid,
  Radio,
  FileText,
  Activity
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import { GuideBanner } from "@/components/dashboard/guide-banner"

interface TeamInvitation {
  id: string
  team: {
    id: string
    name: string
    purpose?: string
  }
}

interface TaskAssignment {
  id: string
  task: {
    id: string
    title: string
    description?: string
    priority: string
    dueDate?: string
    team?: {
      id: string
      name: string
      event?: {
        id: string
        title: string
        startAt: string
        location?: string | null
      } | null
      project?: {
        id: string
        title: string
        status?: string | null
      } | null
    } | null
  }
}

interface EventDiscovery {
  id: string
  title: string
  startAt: string
  location?: string
  type: string
  isRegistered?: boolean
}

type DirectorshipKind = "project" | "event" | "team"

interface DirectorshipItem {
  kind: DirectorshipKind
  role: string
  createdAt: string
  project?: { id: string; title: string; description?: string | null; status?: string | null } | null
  event?: { id: string; title: string; description?: string | null; status?: string | null; startAt?: string | null; location?: string | null } | null
  team?: { id: string; name: string; purpose?: string | null; status?: string | null } | null
}

export default function MemberDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [tasks, setTasks] = useState<TaskAssignment[]>([])
  const [events, setEvents] = useState<EventDiscovery[]>([])
  const [directorships, setDirectorships] = useState<DirectorshipItem[]>([])
  const [discResult, setDiscResult] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null)
  const [selectedDirectorship, setSelectedDirectorship] = useState<DirectorshipItem | null>(null)

  useEffect(() => {
    fetchDashboardTelemetry()
  }, [])

  const fetchDashboardTelemetry = async () => {
    try {
      // 1. Fetch Discovery & Logic Data
      const [invRes, taskRes, eventRes, profileRes, dirRes] = await Promise.all([
        fetch("/api/dashboard/member/invitations"),
        fetch("/api/dashboard/member/tasks"),
        fetch("/api/dashboard/member/events"),
        fetch("/api/dashboard/member/profile-status"),
        fetch("/api/directors/me")
      ])

      const [invData, taskData, eventData, profileData, dirData] = await Promise.all([
        invRes.json(),
        taskRes.json(),
        eventRes.json(),
        profileRes.json(),
        dirRes.json()
      ])

      setInvitations(invData.invitations || [])
      setTasks(taskData.assignments || [])
      setEvents(eventData.events || [])
      setDiscResult(profileData.discResult)
      setOrganization(profileData.organization)
      setDirectorships([
        ...(dirData.projects || []).map((d: any) => ({ kind: "project", role: d.role, createdAt: d.createdAt, project: d.project })),
        ...(dirData.events || []).map((d: any) => ({ kind: "event", role: d.role, createdAt: d.createdAt, event: d.event })),
        ...(dirData.teams || []).map((d: any) => ({ kind: "team", role: d.role, createdAt: d.createdAt, team: d.team })),
      ])
    } catch (e) {
      toast.error("Something went wrong while loading your dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationResponse = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    setProcessing(id)
    try {
      const res = await fetch("/api/teams/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: id, status })
      })
      if (res.ok) {
        toast.success(`Invitation ${status.toLowerCase()}`)
        fetchDashboardTelemetry()
      }
    } finally {
      setProcessing(null)
    }
  }

  const handleTaskResponse = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    setProcessing(id)
    try {
      const res = await fetch("/api/teams/tasks/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: id, status })
      })
      if (res.ok) {
        toast.success(`Task ${status.toLowerCase()}`)
        fetchDashboardTelemetry()
      }
    } finally {
      setProcessing(null)
    }
  }

  const handleEventRequest = async (eventId: string) => {
    setProcessing(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "I would like to register for this event." })
      })
      if (res.ok) {
        toast.success("Request sent")
        fetchDashboardTelemetry()
      }
    } finally {
      setProcessing(null)
    }
  }

  const recentActivity = [
    ...tasks.slice(0, 2).map((t) => ({
      key: `task-${t.id}`,
      title: `Task: ${t.task.title}`,
      subtitle: t.task.dueDate
        ? `Due ${format(new Date(t.task.dueDate), "MMM d, yyyy")}`
        : "No due date set",
      dot: "bg-emerald-500",
    })),
    ...invitations.slice(0, 2).map((inv) => ({
      key: `inv-${inv.id}`,
      title: `Team invite: ${inv.team.name}`,
      subtitle: "Awaiting your response",
      dot: "bg-blue-500",
    })),
  ].slice(0, 4)

  if (loading) return (
    <MemberLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </MemberLayout>
  )

  return (
    <MemberLayout>
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 pb-20 sm:space-y-12">
        <GuideBanner
          storageKey="tafsula_member_checklist_v2"
          title="Your first steps"
          body="Join an event, check team invites, open your tasks, then finish your profile."
          steps={[
            { id: "events", label: "See events", href: "/dashboard/member/events", done: events.some((e) => e.isRegistered) },
            { id: "teams", label: "Check team invites", href: "/dashboard/member/teams", done: invitations.length === 0 && tasks.length > 0 },
            { id: "tasks", label: "Open your tasks", href: "/dashboard/member/tasks", done: tasks.length > 0 },
            { id: "profile", label: "Finish your profile", href: "/dashboard/member/profile" },
          ]}
        />

        {/* Directorship Details Modal */}
        <AnimatePresence>
          {selectedDirectorship && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
              onClick={() => setSelectedDirectorship(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Director assignment
                    </h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">
                      {selectedDirectorship.kind.toUpperCase()} · {selectedDirectorship.role}
                    </p>
                  </div>
                  <button
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60"
                    onClick={() => setSelectedDirectorship(null)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  {selectedDirectorship.kind === "event" && selectedDirectorship.event && (
                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Event</div>
                      <div className="mt-1 text-white font-bold">{selectedDirectorship.event.title}</div>
                      {selectedDirectorship.event.startAt && (
                        <div className="mt-1 text-xs text-white/50">
                          {format(new Date(selectedDirectorship.event.startAt), "dd MMM @ HH:mm")}
                          {selectedDirectorship.event.location ? ` · ${selectedDirectorship.event.location}` : ""}
                        </div>
                      )}
                      {selectedDirectorship.event.description && (
                        <p className="mt-3 text-sm text-white/70">{selectedDirectorship.event.description}</p>
                      )}
                      <Button
                        variant="ghost"
                        className="mt-3 px-0 text-blue-300 hover:text-blue-200"
                        onClick={() => router.push(`/events/${selectedDirectorship.event!.id}`)}
                      >
                        View event <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {selectedDirectorship.kind === "project" && selectedDirectorship.project && (
                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Project</div>
                      <div className="mt-1 text-white font-bold">{selectedDirectorship.project.title}</div>
                      {selectedDirectorship.project.description && (
                        <p className="mt-3 text-sm text-white/70">{selectedDirectorship.project.description}</p>
                      )}
                    </div>
                  )}

                  {selectedDirectorship.kind === "team" && selectedDirectorship.team && (
                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Team</div>
                      <div className="mt-1 text-white font-bold">{selectedDirectorship.team.name}</div>
                      {selectedDirectorship.team.purpose && (
                        <p className="mt-3 text-sm text-white/70">{selectedDirectorship.team.purpose}</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Account status: Active</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 Dashboard
              </h1>
              {organization && <p className="text-blue-400/60 font-medium mt-2 uppercase tracking-widest text-[10px]">{organization.name}</p>}
           </div>
           
           <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-0 sm:gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl w-full md:w-auto">
              <div className="px-3 sm:px-6 py-3 text-center sm:border-r border-white/5">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Open tasks</p>
                 <p className="text-xl font-black text-white">{tasks.length}</p>
              </div>
              <div className="px-3 sm:px-6 py-3 text-center sm:border-r border-white/5">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Team invites</p>
                 <p className="text-xl font-black text-white">{invitations.length}</p>
              </div>
              <div className="px-3 sm:px-6 py-3 text-center">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Upcoming events</p>
                 <p className="text-xl font-black text-blue-400">{events.length}</p>
              </div>
           </div>
        </div>

        {/* Action needed */}
        {(invitations.length > 0 || tasks.length > 0) && (
          <section className="space-y-6">
             <div className="flex items-center gap-3 ml-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Action needed</h3>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {invitations.map(inv => (
                  <Card key={inv.id} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                           <Badge className="bg-blue-500/10 text-blue-400 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">Team invitation</Badge>
                           <Users className="w-6 h-6 text-blue-500/40" />
                        </div>
                        <h4 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">{inv.team.name}</h4>
                        <p className="text-sm text-white/40 mb-10 italic leading-relaxed">You’ve been invited to join this team.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                           <Button 
                             onClick={() => handleInvitationResponse(inv.id, "ACCEPTED")}
                             className="w-full sm:flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20"
                           >
                              Accept
                           </Button>
                           <Button 
                             variant="ghost"
                             onClick={() => handleInvitationResponse(inv.id, "REJECTED")}
                             className="w-full sm:w-auto h-12 px-6 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                           >
                              Decline
                           </Button>
                        </div>
                     </div>
                  </Card>
                ))}

                {tasks.map(t => (
                  <Card key={t.id} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                           <Badge className={`border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                              t.task.priority === "URGENT" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-400"
                           }`}>
                              New task
                           </Badge>
                           <Target className="w-6 h-6 text-emerald-500/40" />
                        </div>
                        <h4 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">{t.task.title}</h4>
                        <p className="text-xs text-white/30 mb-10 font-bold uppercase tracking-widest">
                           Due: {t.task.dueDate ? format(new Date(t.task.dueDate), "dd MMM yyyy") : "ASAP"}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                           <Button
                             variant="ghost"
                             onClick={() => router.push(`/dashboard/member/tasks/${t.task.id}`)}
                             className="w-full sm:w-auto h-12 px-6 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                           >
                             Open
                           </Button>
                           <Button 
                             onClick={() => handleTaskResponse(t.id, "ACCEPTED")}
                             className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20"
                           >
                              Accept
                           </Button>
                           <Button 
                             variant="ghost"
                             onClick={() => handleTaskResponse(t.id, "REJECTED")}
                             className="w-full sm:w-auto h-12 px-6 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                           >
                              Decline
                           </Button>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Left Column: Discovery */}
           <div className="lg:col-span-8 space-y-12">
              <section className="space-y-8">
                 <div className="flex items-center justify-between ml-2">
                    <div className="flex items-center gap-3">
                       <Radio className="w-5 h-5 text-blue-400" />
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Events you can join</h3>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((evt) => (
                      <Card 
                        key={evt.id} 
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 transition-all group overflow-hidden relative"
                      >
                         <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                               <Calendar className="w-8 h-8" />
                            </div>
                            <Badge className="bg-white/5 text-white/20 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">Event</Badge>
                         </div>
                         <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{evt.title}</h4>
                         <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                               <Clock className="w-3.5 h-3.5" /> {format(new Date(evt.startAt), "dd MMM @ HH:mm")}
                            </div>
                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                               <MapPin className="w-3.5 h-3.5" /> {evt.location || "Location TBD"}
                            </div>
                         </div>
                         
                         {evt.isRegistered ? (
                            <Button disabled className="w-full h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-widest text-[9px]">
                               <Check className="w-3.5 h-3.5 mr-2" /> Registered
                            </Button>
                         ) : (
                            <Button 
                              onClick={() => handleEventRequest(evt.id)}
                              className="w-full h-11 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-blue-600 transition-all border border-white/10 font-black uppercase tracking-widest text-[9px]"
                            >
                               Request to join <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                         )}
                      </Card>
                    ))}
                 </div>
              </section>
           </div>

           {/* Right Column: Asset Profile & Stats */}
           <div className="lg:col-span-4 space-y-12">
              <aside className="sticky top-12 space-y-8">
                 
                 <Card className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-white/[0.08] backdrop-blur-3xl overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#e85d4c] flex items-center justify-center text-white shadow-xl shadow-[#e85d4c]/20">
                             <Shield className="w-8 h-8" />
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Profile</h4>
                             <p className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: "Fraunces, serif" }}>
                                Your place in the club
                             </p>
                          </div>
                       </div>

                       <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center space-y-4">
                             <p className="text-sm text-white/50">Headline, skills, and the work you want people to see.</p>
                             <Button onClick={() => router.push("/dashboard/member/profile")} className="w-full h-10 bg-white/5 hover:bg-white/10 text-[#2a9d8f] font-bold text-xs rounded-xl">
                                Open profile
                             </Button>
                          </div>

                       <Button 
                         variant="ghost" 
                         onClick={() => router.push("/dashboard/member/profile")}
                         className="w-full text-white/20 hover:text-white uppercase font-black tracking-widest text-[9px] border border-white/5"
                       >
                          Edit profile <ChevronRight className="w-3 h-3 ml-2" />
                       </Button>
                    </div>
                 </Card>

                 {/* Operational Activity Mini-Feed */}
                 <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/[0.08] space-y-6">
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-emerald-400" />
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Recent activity</h4>
                    </div>
                    <div className="space-y-4">
                       {recentActivity.length === 0 ? (
                          <p className="text-xs text-white/30 font-medium px-1">You’re all caught up—no pending tasks or invites in this list.</p>
                       ) : (
                          recentActivity.map((item) => (
                             <div key={item.key} className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all">
                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                                <div className="min-w-0">
                                   <p className="text-[10px] font-black text-white uppercase tracking-tighter line-clamp-2">{item.title}</p>
                                   <p className="text-[8px] text-white/20 font-bold uppercase mt-0.5">{item.subtitle}</p>
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                 </div>

                 {/* Directorship Console */}
                 {directorships.length > 0 && (
                   <Card className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/[0.08] space-y-6">
                     <div className="flex items-center gap-3">
                       <FileText className="w-4 h-4 text-blue-400" />
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Director Assignments</h4>
                     </div>
                     <div className="space-y-3">
                       {directorships.slice(0, 4).map((d, idx) => {
                         const title =
                           d.kind === "event" ? d.event?.title :
                           d.kind === "project" ? d.project?.title :
                           d.team?.name
                         return (
                           <button
                             key={idx}
                             onClick={() => setSelectedDirectorship(d)}
                             className="w-full text-left p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all"
                           >
                             <div className="flex items-center justify-between gap-3">
                               <div className="min-w-0">
                                 <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                   {d.kind} · {d.role}
                                 </div>
                                 <div className="text-sm font-black text-white truncate">{title || "—"}</div>
                               </div>
                               <ChevronRight className="w-4 h-4 text-white/20" />
                             </div>
                           </button>
                         )
                       })}
                     </div>
                   </Card>
                 )}

              </aside>
           </div>

        </div>
      </div>
    </MemberLayout>
  )
}
