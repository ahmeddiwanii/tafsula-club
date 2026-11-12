"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import MemberLayout from "@/components/layout/member-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserMinus, ShieldAlert, Key, ClipboardList, Target, Calendar, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"

export default function TeamWarRoomPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user && teamId) fetchTeam()
  }, [session, teamId])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/teams/${teamId}`)
      if (!res.ok) throw new Error("Not Found")
      const data = await res.json()
      setTeam(data)
    } catch (error) {
      console.error("Error fetching team:", error)
      toast.error("Could not load this team.")
      router.push("/dashboard/member/teams")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm("Leave this team?")) return
    if (!session?.user?.id) {
      toast.error("Please sign in again.")
      return
    }
    const toastId = toast.loading("Leaving team…")
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${session.user.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not leave team")
      toast.success("You have left the team.", { id: toastId })
      router.push("/dashboard/member/teams")
    } catch (e: any) {
      toast.error(e.message || "Could not leave team", { id: toastId })
    }
  }

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </MemberLayout>
    )
  }

  if (!team) return null

  // Process Members & Directors
  const acceptedMembers = (team.members || []).filter(
    (m: any) => !m.status || m.status === "ACCEPTED" || m.status === "accepted",
  )
  const isMember = (team.members || []).some(
    (m: any) =>
      (m.user?.id === session?.user?.id || m.userId === session?.user?.id) &&
      (!m.status || m.status === "ACCEPTED" || m.status === "accepted"),
  )
  
  const teamDirectors = team.directors || []
  const eventDirectors = team.event?.directors || []

  // Unique Leaders Array
  const combinedLeaders = [
    ...teamDirectors.map((d: any) => ({ ...d.user, auth: 'Team Director' })),
    ...eventDirectors.map((d: any) => ({ ...d.user, auth: 'Event Director' })),
    ...acceptedMembers.filter((m: any) => m.roleInTeam === "LEADER").map((m: any) => ({ ...m.user, auth: 'Team leader' }))
  ].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // Remove duplicates

  return (
    <MemberLayout>
      <div className="space-y-10 relative z-10 pb-20">
        
        {/* Top Header Module */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[3rem] border border-white/[0.08] bg-[#0a0a0f]/80 overflow-hidden backdrop-blur-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-3 h-full bg-violet-600 rounded-l-[3rem]" />

          <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
            <div className="max-w-2xl">
              <div className="flex gap-3 mb-4 flex-wrap">
                <Badge className="bg-white/5 text-white/50 border-white/10 font-black text-[10px] tracking-widest px-3 py-1 uppercase">
                  Status: <span className={team.status === "active" ? "text-emerald-400 ml-1" : "text-amber-400 ml-1"}>{team.status}</span>
                </Badge>
                {team.event && (
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 font-black text-[10px] tracking-widest px-3 py-1 uppercase">
                    <Calendar className="w-3 h-3 mr-2 inline" />
                    Mapped Event
                  </Badge>
                )}
                {team.project && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] tracking-widest px-3 py-1 uppercase">
                    <Target className="w-3 h-3 mr-2 inline" />
                    Mapped Project
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {team.name}
              </h1>

              {(team.event || team.project) && (
                 <div className="inline-block px-4 py-2 border border-white/10 bg-white/5 rounded-xl mb-6">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Attached Initiative</span>
                    <span className="text-sm font-bold text-white/80">{team.event?.title || team.project?.title}</span>
                 </div>
              )}

              <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-xl">
                {team.description || team.purpose || "No description for this team yet."}
              </p>
            </div>

            {isMember && (
              <div className="flex items-start w-full md:w-auto">
                  <Button 
                    onClick={handleLeaveTeam}
                    variant="destructive"
                    className="w-full md:w-auto bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl h-12 px-6 shadow-xl shadow-rose-500/0 hover:shadow-rose-500/20 text-[10px] uppercase font-black tracking-widest transition-all"
                  >
                     <UserMinus className="w-4 h-4 mr-2" />
                     Leave team
                  </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Command & Crew Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Team leads */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="col-span-1 border border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[2.5rem] p-8 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
               <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest mb-8 border-b border-white/5 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Key className="w-4 h-4" />
                  </div>
                  Team leads
               </h2>
               
               <div className="space-y-4">
                  {combinedLeaders.length === 0 ? (
                     <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center">
                        <ShieldAlert className="w-8 h-8 mx-auto text-white/20 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">No Assigned Leadership</p>
                     </div>
                  ) : (
                     combinedLeaders.map((lead: any, i) => (
                        <div key={lead.id + i} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                           <UserAvatar avatarId={lead.avatarId} name={lead.name} size="md" />
                           <div>
                              <p className="text-sm font-bold text-white">{lead.name}</p>
                              <p className="text-[9px] font-black tracking-[0.2em] text-amber-500 uppercase mt-0.5">{lead.auth}</p>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </motion.div>

            {/* The Crew */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="col-span-1 xl:col-span-2 border border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[2.5rem] p-8 relative overflow-hidden"
            >
               <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest mb-8 border-b border-white/5 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Users className="w-5 h-5" />
                  </div>
                  The Crew ({acceptedMembers.length})
               </h2>

               {acceptedMembers.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-white/10 rounded-[2rem]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40">No members yet</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {acceptedMembers.map((m: any) => (
                        <div key={m.user.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                           <div className="flex items-center gap-3 min-w-0">
                              <UserAvatar avatarId={m.user.avatarId} name={m.user.name} size="sm" />
                              <div className="truncate pr-2">
                                 <p className="text-xs font-bold text-white truncate">{m.user.name}</p>
                                 <p className="text-[9px] font-black tracking-widest text-white/40 uppercase mt-0.5 truncate">{m.user.email}</p>
                              </div>
                           </div>
                           {(m.roleInTeam && m.roleInTeam !== 'undefined') && (
                              <Badge className="bg-blue-500/10 text-blue-400 border-none px-2 rounded-xl text-[8px] uppercase tracking-widest shrink-0">
                                 {m.roleInTeam.replace("_", " ")}
                              </Badge>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </motion.div>
        </div>

        {/* Operational Tasks Module */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-emerald-500/20 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[2.5rem] p-8 relative overflow-hidden"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-8 gap-4">
               <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ClipboardList className="w-5 h-5" />
                  </div>
                  Tasks
               </h2>
               
               {isMember && (
                  <Link href={`/dashboard/member/tasks`}>
                     <Button variant="outline" className="h-10 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-black tracking-widest rounded-xl px-4">
                        View all tasks <ArrowRight className="w-3.5 h-3.5 ml-2" />
                     </Button>
                  </Link>
               )}
            </div>

            {(!team.tasks || team.tasks.length === 0) ? (
               <div className="p-16 text-center border border-dashed border-white/10 rounded-[2rem]">
                   <ClipboardList className="w-10 h-10 mx-auto text-white/10 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">No active tasks for this team.</p>
               </div>
            ) : (
               <div className="space-y-4">
                   {team.tasks.map((task: any) => (
                      <div key={task.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                          <div>
                             <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase">{task.title}</h4>
                             <Badge variant="outline" className="bg-white/5 text-white/50 border-none font-black text-[8px] tracking-[0.1em] px-2 py-0.5 mt-1 uppercase">
                                 {task.status}
                             </Badge>
                          </div>
                          
                          <div className="flex gap-2 items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 shrink-0 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                             <Target className="w-3.5 h-3.5"/> 
                             Assigned: {task.assignments ? task.assignments.length : 0} Members
                          </div>
                      </div>
                   ))}
               </div>
            )}
        </motion.div>

      </div>
    </MemberLayout>
  )
}
