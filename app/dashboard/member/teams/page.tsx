"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import MemberLayout from "@/components/layout/member-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Zap, Shield, ArrowRight, Target, Clock, Activity, Calendar, ChevronDown, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  purpose?: string
  description?: string
  status: string
  memberCount: number
  members: { status: string; roleInTeam?: string; user: { id: string; name: string; avatarId?: number } }[]
  directors: { user: { id: string; name: string } }[]
  createdById: string
  event?: { id: string; title: string; directors: { user: { id: string; name: string } }[] }
  project?: { id: string; title: string; status: string }
}

export default function MemberTeamsPage() {
  const { data: session } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [session])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/teams")
      const data = await res.json()
      setTeams(data.teams || [])
      setMyTeams(data.myTeams || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast.error("Failed to load teams.")
    } finally {
      setLoading(false)
    }
  }

  const joinTeam = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, { method: "POST" })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || "Failed to join team")
      }
      toast.success("Request sent successfully! Pending Lead/HR approval.")
      await fetchTeams()
    } catch (error: any) {
      console.error("Error joining team:", error)
      toast.error(error.message || "Failed to request access.")
    }
  }

  const updateTeamStatus = async (teamId: string, status: string) => {
    try {
        const toastId = toast.loading("Updating status...")
        const res = await fetch(`/api/teams/${teamId}/status`, { 
            method: "PATCH", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        })
        if (!res.ok) throw new Error("Could not update status")
        toast.success(`Team marked as ${status}`, { id: toastId })
        fetchTeams()
    } catch(e) {
        toast.error("Failed to update status. Are you a director/leader?")
    }
  }

  // Group helpers
  const groupTeamsByEvent = (teamList: Team[]) => {
    const groups: Record<string, { event: any, teams: Team[] }> = {}
    const standalone: Team[] = []

    teamList.forEach(t => {
      if (t.event) {
        if (!groups[t.event.id]) groups[t.event.id] = { event: t.event, teams: [] }
        groups[t.event.id].teams.push(t)
      } else {
        standalone.push(t)
      }
    })
    return { groups: Object.values(groups), standalone }
  }

  const myGrouped = groupTeamsByEvent(myTeams)
  // Get available teams (teams where user is NOT a member)
  const availableTeams = teams.filter(t => !myTeams.find(mt => mt.id === t.id))
  const availableGrouped = groupTeamsByEvent(availableTeams)

  const getMembershipStatus = (team: Team) => {
    if (!session?.user?.id) return "NONE"
    const member = team.members.find((m) => m.user.id === session.user.id)
    return member ? member.status : "NONE"
  }

  const canModifyTeam = (team: Team) => {
    if (!session?.user?.id) return false
    const u = session.user as any
    if (u.role === "SUPERADMIN" || u.role === "HR") return true
    if (team.createdById === u.id) return true
    if (team.directors?.some(d => d.user.id === u.id)) return true
    if (team.event?.directors?.some(d => d.user.id === u.id)) return true
    if (team.members?.some(m => m.user.id === u.id && m.roleInTeam === "LEADER")) return true
    return false
  }

  const TeamCard = ({ team, isAvailable }: { team: Team, isAvailable?: boolean }) => {
    const isPending = getMembershipStatus(team) === "PENDING"
    const canMod = !isAvailable && canModifyTeam(team)

    return (
        <div className={`p-6 rounded-[2rem] border ${isPending ? "border-amber-500/30 bg-amber-500/[0.03]" : "border-white/[0.06] bg-[#0a0a0f]/60 hover:bg-[#101016]"} transition-all relative overflow-hidden backdrop-blur-xl shadow-xl group`}>
            {isPending && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none animate-pulse" />}
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-white mix-blend-plus-lighter tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {team.name}
                  </h3>
                  <div className="text-[9px] font-black tracking-widest uppercase text-white/30 mt-1 flex gap-2">
                     <span className={team.status === "active" ? "text-emerald-400" : "text-amber-400"}>{team.status}</span>
                  </div>
                </div>
                <Badge className="bg-white/5 text-white/50 border-white/10 font-black text-[9px] tracking-widest px-2 py-1">
                {team.members.filter(m => m.status === "ACCEPTED").length} member{team.members.filter(m => m.status === "ACCEPTED").length !== 1 ? 's' : ''}
                </Badge>
            </div>
            
            {team.purpose && (
                <p className="text-sm font-medium text-white/40 mb-4 line-clamp-2 leading-relaxed relative z-10">{team.purpose}</p>
            )}

            {/* Members Preview */}
            <div className="mb-6 relative z-10">
                <div className="text-[9px] font-black tracking-[0.2em] uppercase text-white/30 mb-2 flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-400" /> Crew ({team.members.filter(m => m.status === "ACCEPTED").length})
                </div>
                <div className="flex flex-wrap gap-1">
                {team.members.filter(m => m.status === "ACCEPTED").slice(0, 5).map(m => (
                    <div key={m.user.id} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/70" title={m.user.name}>
                    {m.user.name.substring(0, 2).toUpperCase()}
                    </div>
                ))}
                {team.members.filter(m => m.status === "ACCEPTED").length > 5 && (
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/40">
                    +{team.members.filter(m => m.status === "ACCEPTED").length - 5}
                    </div>
                )}
                </div>
            </div>

            {/* Controls */}
            <div className="pt-6 border-t border-white/5 mt-auto relative z-10 flex flex-col gap-3">
                {isAvailable ? (
                    isPending ? (
                        <div className="w-full h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl font-black tracking-widest uppercase text-[10px] gap-2">
                        <Clock className="w-4 h-4" /> Request Pending
                        </div>
                    ) : (
                        <Button type="button" onClick={() => joinTeam(team.id)} className="w-full h-10 bg-white/[0.03] hover:bg-violet-600 text-white/70 hover:text-white border border-white/10 hover:border-violet-500 text-[10px] font-black tracking-widest uppercase transition-all rounded-xl">
                        Request to join
                        </Button>
                    )
                ) : (
                    <div className="flex gap-2 w-full">
                        <Link href={`/dashboard/member/teams/${team.id}`} className="flex-1">
                            <Button size="sm" className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] uppercase font-black tracking-widest h-10">
                            Enter <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Modifier Commands */}
                {canMod && (
                    <div className="flex gap-2">
                         {team.status !== "finished" && (
                            <Button variant="outline" size="sm" onClick={() => updateTeamStatus(team.id, "finished")} className="flex-1 bg-transparent hover:bg-emerald-500/10 border-white/10 text-white/50 hover:text-emerald-400 h-8 text-[9px] uppercase font-black tracking-widest">
                                <CheckCircle className="w-3 h-3 mr-1"/> Finish
                            </Button>
                         )}
                         {team.status !== "canceled" && (
                            <Button variant="outline" size="sm" onClick={() => updateTeamStatus(team.id, "canceled")} className="flex-1 bg-transparent hover:bg-red-500/10 border-white/10 text-white/50 hover:text-red-400 h-8 text-[9px] uppercase font-black tracking-widest">
                                <XCircle className="w-3 h-3 mr-1"/> Cancel
                            </Button>
                         )}
                    </div>
                )}
            </div>
        </div>
    )
  }

  const EventBlock = ({ eventGroup, isAvailable }: { eventGroup: { event: any, teams: Team[] }, isAvailable?: boolean }) => {
     const isExpanded = expandedEventId === eventGroup.event.id
     const toggle = () => isAvailable && setExpandedEventId(isExpanded ? null : eventGroup.event.id)
     const eventDirectors = eventGroup.event.directors || []

     return (
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.01] overflow-hidden mb-6 backdrop-blur-sm">
            {/* Event Header */}
            <div 
               onClick={toggle}
               className={`p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isAvailable ? "cursor-pointer hover:bg-white/[0.02]" : ""}`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                        <Calendar className="w-5 h-5"/>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-2">
                           Mapped Event 
                           {eventDirectors.length > 0 && (
                             <span className="bg-white/5 px-2 py-0.5 rounded text-white/30 hidden sm:inline-block">
                               Dir: {eventDirectors.map((d: any) => d.user.name).join(", ")}
                             </span>
                           )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {eventGroup.event.title}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-white/5 text-white/50 border-white/10 font-black text-[10px] tracking-widest px-3 py-1.5 rounded-xl">
                        {eventGroup.teams.length} Team{eventGroup.teams.length !== 1 ? 's' : ''}
                    </Badge>
                    {isAvailable && (
                        <div className={`p-2 rounded-xl bg-white/5 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            {/* Teams inside Event */}
            <AnimatePresence>
                {(!isAvailable || isExpanded) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eventGroup.teams.map(team => (
                                <TeamCard key={team.id} team={team} isAvailable={isAvailable} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
     )
  }

  return (
    <MemberLayout>
      <div className="space-y-10 relative z-10 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-3">
              <Zap className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Organization Teams</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              My <span className="text-violet-500">Teams</span>
            </h1>
          </div>
        </motion.div>

        {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
        ) : (
            <div className="space-y-16">
                
                {/* Active Squadrons (My Teams) */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-widest border-b border-white/5 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Users className="w-5 h-5" />
                    </div>
                    Active Teams
                  </h2>
                  
                  {myTeams.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
                      <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 uppercase tracking-widest font-black text-sm">No teams yet</p>
                      <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">Join a team below when one is available.</p>
                    </div>
                  ) : (
                    <div>
                        {/* Render Active Event Groups */}
                        {myGrouped.groups.map(group => (
                            <EventBlock key={group.event.id} eventGroup={group} />
                        ))}
                        
                        {/* Render Independent Teams (No event) */}
                        {myGrouped.standalone.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myGrouped.standalone.map(t => (
                                    <TeamCard key={t.id} team={t} />
                                ))}
                            </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Available Events & Teams */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-widest border-b border-white/5 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Target className="w-5 h-5" />
                    </div>
                    Available Events & Teams
                  </h2>
                  
                  {availableTeams.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
                        <p className="text-white/40 uppercase tracking-widest font-black text-sm">No openings available</p>
                    </div>
                  ) : (
                    <div>
                       {/* Render Expandable Event Groups */}
                       {availableGrouped.groups.map(group => (
                            <EventBlock key={group.event.id} eventGroup={group} isAvailable={true} />
                        ))}

                       {/* Independent Open Teams */}
                       {availableGrouped.standalone.length > 0 && (
                           <>
                           <h3 className="text-sm font-black text-white/50 uppercase tracking-widest mb-6 mt-10">Independent Projects</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableGrouped.standalone.map(t => (
                                    <TeamCard key={t.id} team={t} isAvailable={true} />
                                ))}
                            </div>
                           </>
                       )}
                    </div>
                  )}
                </div>
            </div>
        )}
      </div>
    </MemberLayout>
  )
}
