"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Shield, 
  Plus, 
  Target, 
  Trash2,
  Zap,
  MoreVertical,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Save,
  Rocket,
  UserPlus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Resource {
  id: string
  name: string
  email: string
  role: string
  avatarId: number
}

interface TeamMember {
  id: string
  teamId: string
  userId: string
  user: Resource
}

interface TeamDirector {
  id: string
  userId: string
  user: {
    id: string
    name: string
  }
}

interface TeamTask {
  id: string
  title: string
  status: string
  priority: string
  assignments: { userId: string, user: { name: string } }[]
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
}

export default function SquadCommandPage() {
  const router = useRouter()
  const { id: teamId } = useParams()
  const { data: session } = useSession()
  
  const [team, setTeam] = useState<Team | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ name: "", purpose: "", status: "" })

  useEffect(() => {
    if (teamId) fetchData()
  }, [teamId])

  const fetchData = async () => {
    try {
      const [teamRes, usersRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/users?organizationId=${session?.user.organizationId}`)
      ])
      
      const teamData = await teamRes.json()
      const usersData = await usersRes.json()
      
      setTeam(teamData)
      setResources(usersData)
      setFormData({
        name: teamData.name,
        purpose: teamData.purpose || "",
        status: teamData.status
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching squad intel:", error)
      setLoading(false)
    }
  }

  const handleUpdateTeam = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success("Command Parameters Updated")
        setEditMode(false)
        fetchData()
      }
    } catch (e) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleAssignMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        toast.success("Member added")
        fetchData()
      }
    } catch (e) {
      toast.error("Deployment Error")
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Member removed")
        fetchData()
      }
    } catch (e) {
      toast.error("Recall Error")
    }
  }

  const handleToggleDirector = async (userId: string, isCurrentlyDirector: boolean) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/directors`, {
        method: isCurrentlyDirector ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        toast.success(isCurrentlyDirector ? "Lead removed" : "Set as team lead")
        fetchData()
      }
    } catch (e) {
      toast.error("Authority Update Failed")
    }
  }

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [showAssignModal, setShowAssignModal] = useState<{ userId: string, userName: string } | null>(null)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM" })
  const [creatingTask, setCreatingTask] = useState(false)

  const handleDeployTask = async () => {
    if (!showAssignModal) return
    setCreatingTask(true)
    try {
      const res = await fetch("/api/teams/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskForm,
          teamId,
          assignedUserIds: [showAssignModal.userId]
        })
      })
      if (res.ok) {
        toast.success(`Task given to ${showAssignModal.userName.split(' ')[0]}`)
        setShowAssignModal(null)
        setTaskForm({ title: "", description: "", priority: "MEDIUM" })
        fetchData()
      }
    } catch (e) {
      toast.error("Deployment Interrupted")
    } finally {
      setCreatingTask(false)
    }
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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div className="flex-1 w-full">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/dashboard/hr/teams")}
              className="mb-8 -ml-4 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to teams
            </Button>
            
            <div className="flex items-start gap-6">
               <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/5">
                  <Rocket className="w-12 h-12" />
               </div>
               <div className="flex-1">
                  {!editMode ? (
                    <div className="group relative">
                      <h1 className="text-6xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {team.name}
                      </h1>
                      <div className="flex items-center gap-4">
                         <p className="text-white/40 font-medium tracking-wide italic">{team.purpose || "No stated purpose"}</p>
                         <button onClick={() => setEditMode(true)} className="p-2 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-all">
                            <Zap className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-xl">
                       <Input 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="h-16 bg-white/[0.05] border-blue-500/30 text-3xl font-black rounded-2xl"
                       />
                       <Input 
                         value={formData.purpose}
                         onChange={e => setFormData({...formData, purpose: e.target.value})}
                         className="h-12 bg-white/[0.03] border-white/10 text-white/60 rounded-xl"
                       />
                       <div className="flex gap-2">
                          <Button onClick={handleUpdateTeam} disabled={saving} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-black uppercase text-[10px] tracking-widest rounded-xl">Commit Changes</Button>
                          <Button onClick={() => setEditMode(false)} variant="ghost" className="text-white/40 h-10 px-6 font-black uppercase text-[10px] tracking-widest">Abort</Button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-right">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Team status</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className={`w-2 h-2 rounded-full ${team.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                   <span className="text-xs font-black text-white uppercase tracking-widest">{team.status}</span>
                </div>
             </div>
             {team.eventId && (
               <div className="px-6 py-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-right">
                  <p className="text-[10px] font-black text-purple-400/40 uppercase tracking-[0.2em] mb-1">Event Linked</p>
                  <div className="flex items-center gap-2 justify-end">
                     <Calendar className="w-4 h-4 text-purple-400" />
                     <span className="text-xs font-black text-purple-400 uppercase tracking-widest leading-none">Bound</span>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Main Orchestrator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Pool (Source) */}
          <div className="lg:col-span-4 flex flex-col bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] backdrop-blur-xl overflow-hidden min-h-[600px]">
             <div className="p-8 border-b border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>People</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">Organization Resources</p>
                   </div>
                   <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{filteredResources.length} people</Badge>
                </div>
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                   <input 
                     type="text"
                     placeholder="Filter resources..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full h-12 pl-12 pr-4 bg-white/[0.03] border-white/5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
                   />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredResources.map(res => {
                  const isAssigned = team.members.some(m => m.userId === res.id)
                  return (
                    <div 
                      key={res.id} 
                      className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between group/res hover:bg-white/[0.05] transition-all ${isAssigned ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white/40 font-black text-xs">
                             {res.name[0]}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-black text-white truncate">{res.name}</p>
                             <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{res.role}</p>
                          </div>
                       </div>
                       {!isAssigned && (
                         <button 
                           onClick={() => handleAssignMember(res.id)}
                           className="p-2 rounded-xl bg-blue-500/10 text-blue-400 opacity-0 group-hover/res:opacity-100 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/20"
                         >
                            <UserPlus className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  )
                })}
             </div>
          </div>

          {/* Deployment Zone (Squad Setup) */}
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] backdrop-blur-xl p-10 min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]" />
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                         Team members
                         <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[9px] font-black tracking-widest">{team.members.length} Members</Badge>
                      </h3>
                      <p className="text-white/20 text-xs font-medium mt-1 uppercase tracking-widest">Who is on this team</p>
                   </div>
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/20">
                      <Users className="w-6 h-6" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                   <AnimatePresence>
                      {team.members.map(member => {
                        const isDirector = team.directors.some(d => d.userId === member.userId)
                        return (
                          <motion.div 
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group/card ${
                              isDirector 
                              ? 'bg-blue-600/5 border-blue-500/30' 
                              : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl transition-all ${
                                     isDirector ? 'bg-blue-600 shadow-blue-500/30' : 'bg-slate-700'
                                   }`}>
                                      {member.user.name[0]}
                                   </div>
                                   <div>
                                      <p className="text-md font-black text-white">{member.user.name}</p>
                                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{member.user.role}</p>
                                   </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => setShowAssignModal({ userId: member.userId, userName: member.user.name })}
                                      className="p-2 rounded-xl text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                      title="Give task to person"
                                   >
                                      <Target className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => handleToggleDirector(member.userId, isDirector)}
                                      className={`p-2 rounded-xl transition-all ${isDirector ? 'text-blue-400 bg-blue-500/10' : 'text-white/20 hover:text-blue-400 hover:bg-white/5'}`}
                                      title={isDirector ? "Remove lead" : "Appoint Director"}
                                   >
                                      <Shield className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => handleRemoveMember(member.userId)}
                                      className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                      title="Remove member"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>

                             <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDirector ? 'text-blue-400' : 'text-white/10'}`}>
                                   {isDirector ? "Team leads" : "Assigned Asset"}
                                </span>
                                {isDirector && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                             </div>
                          </motion.div>
                        )
                      })}
                   </AnimatePresence>
                   
                   {team.members.length === 0 && (
                      <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20">
                         <UserPlus className="w-12 h-12 mb-4 opacity-10" />
                         <p className="text-xs font-black uppercase tracking-[0.3em] text-center leading-loose">No members yet<br/>Approves from the Pool</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Tactical Intel Section (Tasks) */}
        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-4 ml-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                 <Target className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tips</h3>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
              {/* Squad Level Tasks */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 backdrop-blur-xl">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Team tasks</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none">{team.tasks.length} Active</Badge>
                 </div>
                 <div className="space-y-4">
                    {team.tasks.map(task => (
                      <div key={task.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                         <div>
                            <p className="text-sm font-black text-white mb-1">{task.title}</p>
                            <div className="flex items-center gap-3">
                               <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                                 task.priority === 'HIGH' || task.priority === 'URGENT' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-white/10 text-white/20'
                               }`}>{task.priority}</span>
                               <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{task.status}</span>
                            </div>
                         </div>
                         <div className="flex -space-x-2">
                            {task.assignments.slice(0, 3).map((as, i) => (
                               <div key={i} className="w-7 h-7 rounded-lg bg-blue-600 border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] font-black text-white" title={as.user.name}>
                                  {as.user.name[0]}
                               </div>
                            ))}
                            {task.assignments.length > 3 && (
                               <div className="w-7 h-7 rounded-lg bg-white/10 border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] font-black text-white/40">
                                  +{task.assignments.length - 3}
                               </div>
                            )}
                         </div>
                      </div>
                    ))}
                    {team.tasks.length === 0 && <p className="text-xs text-white/10 italic text-center py-10 border border-dashed border-white/5 rounded-2xl uppercase tracking-widest">No primary objectives assigned</p>}
                 </div>
              </div>

              {/* Personnel Performance Metrics */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 backdrop-blur-xl">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">People</p>
                    <span className="text-[10px] text-white/10 font-black tracking-widest uppercase">Overview</span>
                 </div>
                 <div className="space-y-4">
                    {team.members.map(member => {
                      const memberTasks = team.tasks.filter(t => t.assignments.some(a => a.userId === member.userId))
                      return (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-white/20">
                                 {member.user.name[0]}
                              </div>
                              <span className="text-xs font-bold text-white/60">{member.user.name}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-white/10 uppercase mb-0.5">Assigned tasks</p>
                                 <p className="text-xs font-black text-blue-400">{memberTasks.length}</p>
                              </div>
                              <button className="p-2 text-white/10 hover:text-white transition-colors">
                                 <ChevronRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      )
                    })}
                    {team.members.length === 0 && <p className="text-xs text-white/10 italic text-center py-10 border border-dashed border-white/5 rounded-2xl uppercase tracking-widest">Awaiting personnel deployment</p>}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Direct Mission Deployment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
               className="relative w-full max-w-lg bg-[#0a0a10] border border-emerald-500/20 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                     <Target className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Give a task</h3>
                     <p className="text-emerald-400/40 text-[10px] font-black uppercase tracking-widest mt-0.5 mt-1">Target: {showAssignModal.userName}</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Task title</label>
                     <Input 
                        placeholder="e.g., Conduct Security Audit"
                        value={taskForm.title}
                        onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                        className="h-14 bg-white/5 border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Details</label>
                     <Input 
                        placeholder="Detailed instructions for the asset..."
                        value={taskForm.description}
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        className="h-14 bg-white/5 border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Priority Level</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                          <button 
                            key={p}
                            onClick={() => setTaskForm({...taskForm, priority: p})}
                            className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              taskForm.priority === p 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
                              : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10'
                            }`}
                          >
                             {p}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                     <Button 
                        onClick={() => setShowAssignModal(null)}
                        variant="ghost" 
                        className="flex-1 h-16 rounded-2xl text-white/20 hover:text-white uppercase font-black text-[10px] tracking-widest"
                     >
                        Abort
                     </Button>
                     <Button 
                        onClick={handleDeployTask}
                        disabled={creatingTask || !taskForm.title}
                        className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-black text-[10px] tracking-widest shadow-xl shadow-emerald-600/20"
                     >
                        {creatingTask ? "Saving…" : "Create task"}
                     </Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HRLayout>
  )
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
