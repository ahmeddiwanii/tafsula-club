"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Target, 
  Zap,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Rocket,
  ChevronRight,
  Edit3
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TeamMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    avatarId: number
    role: string
  }
}

interface TeamDirector {
  userId: string
  user: { id: string, name: string }
}

interface TeamTask {
  id: string
  title: string
  status: string
  priority: string
  assignments: { userId: string, acceptanceStatus: string, status: string, user: { name: string } }[]
  description?: string
  dueDate?: string
}

interface Team {
  id: string
  name: string
  purpose?: string
  status: string
  eventId?: string
  members: TeamMember[]
  directors: TeamDirector[]
  tasks: TeamTask[]
  project?: { title: string }
}

export default function SquadronIntelPage() {
  const router = useRouter()
  const { id: teamId } = useParams()
  const { data: session } = useSession()
  
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [isUpdatingTask, setIsUpdatingTask] = useState<string | null>(null)

  useEffect(() => {
    if (teamId) fetchData()
  }, [teamId])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`)
      const teamData = await res.json()
      setTeam(teamData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching squad intel:", error)
      setLoading(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    setIsUpdatingTask(taskId)
    try {
      const res = await fetch(`/api/teams/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      
      setTeam(prev => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        }
      })
      toast.success(`Task status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to sync status update")
    } finally {
      setIsUpdatingTask(null)
    }
  }

  const handleAlarm = async (taskId: string, userId: string, userName: string) => {
    // In a real system, this would call an API like POST /api/teams/tasks/${taskId}/alarm
    // For now, we simulate the notification dispatch
    toast.success(`Priority updated to ${userName}`, {
      description: "will receive an immediate ping regarding their objectives.",
      icon: <Zap className="w-4 h-4 text-amber-500" />
    })
  }

  if (loading || !team) return (
     <HRLayout orgName="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
     </HRLayout>
  )

  return (
    <HRLayout orgName={session?.user.name || "Organization"}>
      <div className="max-w-7xl mx-auto pb-20 relative z-10">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard/hr/teams")}
            className="text-white/40 hover:text-white transition-colors -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to teams
          </Button>
          
          <Button 
            onClick={() => router.push(`/dashboard/hr/teams/${teamId}/edit`)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <Edit3 className="w-4 h-4 mr-2 text-blue-400" /> Modify Parameters
          </Button>
        </div>

        {/* Squad Signature Header */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-12 mb-12 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/5 to-transparent" />
           <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px]" />
           
           <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 border-4 border-white/5">
                 <Rocket className="w-16 h-16" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                    <h1 className="text-6xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                       {team.name.toUpperCase()}
                    </h1>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1.5 px-3 rounded-lg uppercase font-black tracking-widest text-[10px]">
                       Operational
                    </Badge>
                 </div>
                 <p className="text-xl text-white/40 font-medium italic max-w-2xl leading-relaxed">
                    "{team.purpose || "No operational summary defined for this squad signature."}"
                 </p>
                 
                 <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8 border-t border-white/5 pt-8">
                    <div className="flex items-center gap-3">
                       <Users className="w-4 h-4 text-white/20" />
                       <span className="text-sm font-black text-white tracking-widest uppercase">{team.members.length} Units</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Target className="w-4 h-4 text-white/20" />
                       <span className="text-sm font-black text-white tracking-widest uppercase">{team.tasks.length} Objectives</span>
                    </div>
                    {team.eventId && (
                      <div className="flex items-center gap-3">
                         <Calendar className="w-4 h-4 text-purple-400" />
                         <span className="text-sm font-black text-purple-400 tracking-widest uppercase">Event Linked</span>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Command Structure */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2rem] p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Team leads</h3>
                    <Shield className="w-4 h-4 text-blue-500" />
                 </div>
                 <div className="space-y-4">
                    {team.directors.map(dir => (
                       <div key={dir.userId} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-600/5 border border-blue-500/20">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                             {dir.user.name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-black text-white">{dir.user.name}</p>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Team lead</p>
                          </div>
                       </div>
                    ))}
                    {team.directors.length === 0 && (
                       <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">De-centralized Unit</p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2rem] p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Members</h3>
                    <Users className="w-4 h-4 text-white/10" />
                 </div>
                 <div className="space-y-3">
                    {team.members.map(member => (
                       <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-[10px] text-white/40 font-black">
                                {member.user.name[0]}
                             </div>
                             <span className="text-xs font-black text-white/80">{member.user.name}</span>
                          </div>
                          {team.directors.some(d => d.userId === member.userId) && (
                             <Shield className="w-3 h-3 text-blue-500" />
                          )}
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Objective Matrix */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 min-h-[500px]">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tasks</h2>
                       <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-emerald-400/60">Team is active</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                       <Zap className="w-6 h-6" />
                    </div>
                 </div>

                 <div className="grid gap-4">
                    {team.tasks.map(task => (
                       <div key={task.id} className={`group rounded-[2rem] bg-white/[0.02] border transition-all duration-500 overflow-hidden ${expandedTaskId === task.id ? 'border-blue-500/50 bg-white/[0.04]' : 'border-white/5 hover:bg-white/[0.04] hover:border-blue-500/30'}`}>
                          <div 
                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                          >
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <div className={`w-2 h-2 rounded-full ${
                                      task.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                      task.status === 'IN_PROGRESS' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                      task.status === 'CANCELED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                      'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                   }`} />
                                   <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{task.title}</h4>
                                </div>
                                <div className="flex items-center gap-4">
                                   <Badge className={`bg-white/5 text-white/40 text-[8px] font-black tracking-widest border-none`}>{task.priority}</Badge>
                                   <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{task.status.replace("_", " ")}</span>
                                </div>
                             </div>

                             <div className="flex items-center gap-8">
                                <div className="text-right hidden md:block">
                                   <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">Deployment</p>
                                   <div className="flex -space-x-2 justify-end">
                                      {task.assignments.map((as, i) => (
                                         <div key={i} className="w-8 h-8 rounded-xl bg-blue-600 border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-black text-white" title={as.user.name}>
                                            {as.user.name[0]}
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                <button className={`p-3 rounded-xl bg-white/5 text-white/20 transition-all shadow-xl shadow-blue-600/0 ${expandedTaskId === task.id ? 'bg-blue-600 text-white shadow-blue-600/20' : 'group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-600/20'}`}>
                                   <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedTaskId === task.id ? 'rotate-90' : ''}`} />
                                </button>
                             </div>
                          </div>
                          
                          {/* Expanded Details */}
                          <AnimatePresence>
                             {expandedTaskId === task.id && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/10 bg-black/20"
                                >
                                   <div className="p-6 space-y-8">
                                      {task.description && (
                                         <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Objective Directive</p>
                                            <p className="text-sm text-white/60 leading-relaxed font-medium">{task.description}</p>
                                         </div>
                                      )}

                                      <div>
                                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Members</p>
                                         <div className="space-y-3">
                                            {task.assignments.map((as, i) => (
                                               <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                  <div className="flex items-center gap-4">
                                                     <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
                                                        {as.user.name[0]}
                                                     </div>
                                                     <div>
                                                        <p className="text-sm font-black text-white">{as.user.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                           {as.acceptanceStatus === "ACCEPTED" && <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] uppercase tracking-widest font-black shrink-0">Accepted</Badge>}
                                                           {as.acceptanceStatus === "REJECTED" && <Badge className="bg-red-500/10 text-red-400 border-none text-[8px] uppercase tracking-widest font-black shrink-0">Rejected</Badge>}
                                                           {as.acceptanceStatus === "PENDING" && <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] uppercase tracking-widest font-black shrink-0">Pending</Badge>}
                                                           <span className="text-[9px] text-white/30 uppercase tracking-widest">{as.status.replace("_", " ")}</span>
                                                        </div>
                                                     </div>
                                                  </div>
                                                  
                                                  <Button 
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={as.acceptanceStatus === "ACCEPTED" && as.status === "COMPLETED"}
                                                    onClick={(e) => { e.stopPropagation(); handleAlarm(task.id, as.userId, as.user.name); }}
                                                    className="h-10 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all"
                                                  >
                                                     <AlertCircle className="w-3.5 h-3.5 mr-2" /> Alarm
                                                  </Button>
                                               </div>
                                            ))}
                                         </div>
                                      </div>

                                      <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-4">
                                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Override Status:</p>
                                         <div className="flex gap-2">
                                            {["TODO", "IN_PROGRESS", "COMPLETED", "CANCELED"].map(status => (
                                               <Button
                                                 key={status}
                                                 disabled={isUpdatingTask === task.id || task.status === status}
                                                 onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, status); }}
                                                 className={`h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                                   task.status === status 
                                                   ? 'bg-white/10 text-white cursor-default' 
                                                   : 'bg-white/5 hover:bg-blue-600 hover:text-white border-none'
                                                 }`}
                                               >
                                                  {isUpdatingTask === task.id && task.status !== status ? '...' : status.replace("_", " ")}
                                               </Button>
                                            ))}
                                         </div>
                                      </div>
                                   </div>
                                </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                    ))}
                    {team.tasks.length === 0 && (
                      <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                         <Target className="w-12 h-12 text-white/5 mx-auto mb-4" />
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">No tasks yet</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </HRLayout>
  )
}
