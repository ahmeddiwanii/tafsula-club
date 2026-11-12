"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useRef } from "react"
import { HRLayout } from "@/components/layout/hr-layout"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  Shield,
  Clock,
  ChevronRight,
  ClipboardCheck,
  XCircle,
  ExternalLink,
  Briefcase,
  MessageSquare,
  Paperclip,
  Send
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface TaskAssignment {
  id: string
  userId: string
  status: string
  approvalStatus: string
  submittedAt?: string
  approvedAt?: string
  creditsAwarded: number
  approvalComment?: string
  memberDocumentName?: string
  memberDocumentUrl?: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  hrDocumentName?: string
  hrDocumentUrl?: string
  team: { id: string, name: string, purpose: string }
  createdBy: { name: string }
  assignments: TaskAssignment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    role: string
    avatarId: string
  }
}

export default function MissionIntelligencePage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session } = useSession()
  
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [comments])
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: ""
  })

  useEffect(() => {
    if (id) {
      fetchTask()
      fetchComments()
      
      const interval = setInterval(() => {
        fetchComments()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [id])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/teams/tasks/${id}/comments`)
      const data = await res.json()
      if (data.comments) setComments(data.comments)
    } catch {}
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    try {
      const res = await fetch(`/api/teams/tasks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment })
      })
      if (res.ok) {
        setNewComment("")
        fetchComments()
      }
    } catch {}
  }

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/teams/tasks/${id}`)
      if (!res.ok) throw new Error("Task not found")
      const data = await res.json()
      setTask(data.task)
      setFormData({
        title: data.task.title,
        description: data.task.description || "",
        priority: data.task.priority,
        status: data.task.status,
        dueDate: data.task.dueDate ? data.task.dueDate.split('T')[0] : ""
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching task:", error)
      setLoading(false)
      toast.error("Telemetry Interrupted")
    }
  }

  const handleUpdate = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/teams/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Task saved")
        fetchTask()
      } else {
        toast.error("Transmission Error")
      }
    } catch (error) {
      toast.error("System Override Detected")
    } finally {
      setSaving(false)
    }
  }

  const handleReviewAssignment = async (assignmentId: string, action: "approve" | "reject", comment?: string) => {
    setReviewingId(assignmentId)
    try {
      const res = await fetch(`/api/teams/tasks/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment })
      })

      if (res.ok) {
        toast.success(action === "approve" ? "Approveion Complete" : "Sent back for changes")
        fetchTask()
      } else {
        toast.error("Audit Protocol Failed")
      }
    } catch (e) {
      toast.error("Could not update")
    } finally {
      setReviewingId(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to terminate this objective? All associated telemetry will be purged.")) return
    try {
      const res = await fetch(`/api/teams/tasks/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Task deleted")
        router.push("/dashboard/hr/tasks")
      }
    } catch (error) {
      toast.error("Deauthorization Protocol Failed")
    }
  }

  if (loading) return (
    <HRLayout orgName="Synchronizing...">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </HRLayout>
  )

  if (!task) return (
    <HRLayout orgName="Task">
      <div className="text-center py-32 bg-white/[0.02] border border-white/[0.08] rounded-[3rem] max-w-2xl mx-auto">
        <AlertCircle className="w-20 h-20 text-white/5 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SIGNAL LOST</h2>
        <p className="text-white/20 mb-10 font-medium italic">The requested objective identifier does not exist in the primary registry.</p>
        <Button onClick={() => router.push("/dashboard/hr/tasks")} className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest text-white">Return to Sector Alpha</Button>
      </div>
    </HRLayout>
  )

  return (
    <HRLayout orgName={session?.user.name || "Organization"}>
      <div className="relative z-10 max-w-7xl mx-auto pb-20">
        
        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between mb-12">
           <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard/hr/tasks")}
                className="text-white/40 hover:text-white transition-colors -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to tasks
            </Button>

            <div className="flex gap-4">
               <Button 
                 variant="ghost"
                 onClick={handleDelete}
                 className="h-11 px-6 border border-red-500/10 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
               >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete task
               </Button>
               <Button 
                 onClick={handleUpdate}
                 disabled={saving}
                 className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 transition-all border border-blue-500/50"
               >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  ) : <Save className="w-4 h-4 mr-2" />}
                  {saving ? "Saving…" : "Save changes"}
               </Button>
            </div>
        </div>

        {/* Global Objective Banner */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-12 mb-12 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/5 to-transparent" />
           
           <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/10">
                 <Target className="w-12 h-12" />
              </div>
              
              <div className="flex-1">
                 <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-white/5 text-white/40 border-none py-1.5 px-3 rounded-lg uppercase font-black tracking-widest text-[9px]">
                       OBJ-{task.id.slice(-4).toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">Task details</span>
                 </div>
                 <h1 className="text-6xl font-black text-white tracking-tighter mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {task.title.toUpperCase()}
                 </h1>
                 <div className="flex flex-wrap gap-8 items-center border-t border-white/5 pt-8 mt-4">
                    <div className="flex items-center gap-2">
                       <Shield className="w-4 h-4 text-blue-400" />
                       <span className="text-xs font-black text-white tracking-widest uppercase">{task.team.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/20">
                       <Clock className="w-4 h-4" />
                       <span className="text-xs font-black tracking-widest uppercase leading-none">
                          Goal: {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy").toUpperCase() : "NO HORIZON"}
                       </span>
                    </div>
                    <Badge className={`border-none text-[9px] font-black tracking-widest px-3 py-1 rounded-full ${
                      task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'
                    }`}>{task.priority}</Badge>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Tactical Editor Panel */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 backdrop-blur-xl space-y-10">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Edit task</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Editing</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="group">
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Designation</p>
                       <Input 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="h-16 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-2xl font-black rounded-2xl transition-all"
                       />
                    </div>
                    
                    <div className="group">
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-1">Details</p>
                       <Textarea 
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="min-h-[220px] bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-base font-medium leading-relaxed rounded-2xl transition-all resize-none p-8"
                          placeholder="Add clear steps for the team…"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Status</p>
                          <div className="relative">
                             <select 
                               value={formData.status}
                               onChange={e => setFormData({...formData, status: e.target.value})}
                               className="w-full h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 appearance-none transition-all hover:bg-white/[0.05]"
                             >
                                {["PENDING", "ACTIVE", "FINALIZED"].map(s => (
                                  <option key={s} value={s} className="bg-slate-900 border-none py-4">{s.replace('_', ' ')}</option>
                                ))}
                             </select>
                             <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 rotate-90 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Due date</p>
                          <Input 
                             type="date"
                             value={formData.dueDate}
                             onChange={e => setFormData({...formData, dueDate: e.target.value})}
                             className="h-16 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-xs font-black uppercase tracking-widest rounded-2xl [color-scheme:dark] px-6 transition-all hover:bg-white/[0.05]"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Personnel Hub (Assignments) */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between ml-2">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <Users className="w-5 h-5" />
                       </div>
                       <h3 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>PERSONNEL AUDIT</h3>
                    </div>
                    <Badge className="bg-white/5 text-white/20 border-none uppercase text-[9px] font-black tracking-widest">{task.assignments.length} people assigned</Badge>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                       {task.assignments.map((as) => (
                         <motion.div 
                           key={as.id}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className={`p-6 rounded-[2rem] border transition-all duration-500 group/asset ${
                             as.status === "SUBMITTED" ? "bg-amber-500/5 border-amber-500/20 shadow-2xl shadow-amber-500/5" : 
                             as.status === "APPROVED" || as.status === "COMPLETED" ? "bg-emerald-500/5 border-emerald-500/20" :
                             "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                           }`}
                         >
                            <div className="flex items-start justify-between mb-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white/80 font-black text-sm">
                                     {as.user.name[0]}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-sm font-black text-white truncate">{as.user.name}</p>
                                     <p className="text-[10px] text-white/20 font-bold truncate tracking-widest uppercase">{as.user.email}</p>
                                  </div>
                               </div>
                               <Badge className={`text-[8px] font-black uppercase tracking-widest border-none px-2 py-1 rounded ${
                                 as.status === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-500 animate-pulse' :
                                 as.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                 'bg-white/5 text-white/20'
                               }`}>
                                 {as.status}
                               </Badge>
                            </div>

                            {as.status === "SUBMITTED" && (
                                <div className="pt-6 border-t border-white/5 space-y-4">
                                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic mb-1">Their note:</p>
                                  <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 mb-4">
                                     <p className="text-xs text-amber-500/60 font-medium italic">"{as.approvalComment || "No submission intelligence provided by asset."}"</p>
                                  </div>
                                  
                                  {as.memberDocumentUrl && (
                                     <a href={as.memberDocumentUrl} download={as.memberDocumentName} className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit hover:bg-blue-500/20 transition-all">
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{as.memberDocumentName || "Download file"}</span>
                                     </a>
                                  )}

                                  <div className="flex gap-2">
                                     <Button 
                                       onClick={() => handleReviewAssignment(as.id, "approve")}
                                       disabled={reviewingId === as.id}
                                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl font-black uppercase text-[9px] tracking-widest text-white transition-all shadow-lg shadow-emerald-600/10"
                                     >
                                        <ClipboardCheck className="w-3.5 h-3.5 mr-2" /> Approve
                                     </Button>
                                     <Button 
                                       onClick={() => handleReviewAssignment(as.id, "reject")}
                                       disabled={reviewingId === as.id}
                                       variant="ghost"
                                       className="flex-1 border border-red-500/20 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 h-10 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all"
                                     >
                                        <XCircle className="w-3.5 h-3.5 mr-2" /> Revise
                                     </Button>
                                  </div>
                               </div>
                            )}

                            {as.status === "APPROVED" && (
                               <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Target Secured</span>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                               </div>
                            )}
                         </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </div>
           </div>

           {/* Tactical Communications (Chat) */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-4 ml-2">
                 <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <h3 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Messages</h3>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 flex flex-col h-[500px]">
                 <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                    {comments.length === 0 ? (
                       <p className="text-white/20 text-xs font-black uppercase text-center mt-20 tracking-widest">No transmissions active.</p>
                    ) : (
                       comments.map(c => (
                          <div key={c.id} className={`flex ${c.user.role === 'HR' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-4 rounded-2xl border ${
                               c.user.role === 'HR' ? 'bg-blue-600/10 border-blue-500/20 text-blue-50 rounded-tr-none' : 'bg-white/5 border-white/10 text-white rounded-tl-none'
                             }`}>
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{c.user.name} ({c.user.role})</span>
                                   <span className="text-[8px] font-bold opacity-30">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{c.content}</p>
                             </div>
                          </div>
                       ))
                    )}
                    <div ref={messagesEndRef} />
                 </div>
                 <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                    <Input 
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                       placeholder="Write a message to the team…"
                       className="flex-1 bg-white/[0.03] border-white/10 focus:border-blue-500 h-14 rounded-xl px-6 text-sm transition-all"
                    />
                    <Button onClick={handlePostComment} className="h-14 w-14 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
                       <Send className="w-5 h-5 text-white" />
                    </Button>
                 </div>
              </div>
           </div>

           {/* Tactical Information (Sidebar) */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-8 space-y-10 sticky top-12">
                 
                 {/* Team Link */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Team</h4>
                       <Shield className="w-4 h-4 text-white/10" />
                    </div>
                    <div 
                      key={task.team.id}
                      onClick={() => router.push(`/dashboard/hr/teams/${task.team.id}`)}
                      className="group p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 cursor-pointer hover:bg-blue-600/20 transition-all shadow-2xl shadow-blue-500/5"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <p className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{task.team.name}</p>
                          <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                       </div>
                       <p className="text-[10px] text-white/30 font-medium italic line-clamp-2 leading-relaxed">
                          "{task.team.purpose || "No team description yet."}"
                       </p>
                    </div>
                 </div>

                 {/* System Metadata & Attachments */}
                 <div className="pt-10 border-t border-white/5 space-y-6">
                    {task.hrDocumentUrl && (
                       <div className="mb-6">
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Linked file</p>
                           <a href={task.hrDocumentUrl} download={task.hrDocumentName} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all group/doc">
                              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                 <Paperclip className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-white truncate max-w-[200px]">{task.hrDocumentName}</span>
                           </a>
                       </div>
                    )}

                    <div>
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Created by</p>
                       <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
                             {task.createdBy.name[0]}
                          </div>
                          <span className="text-xs font-bold text-white/60">{task.createdBy.name}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <div>
                          <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Points</p>
                          <p className="text-md font-black text-blue-400">10 Credits</p>
                       </div>
                       <Zap className="w-5 h-5 text-amber-500/40" />
                    </div>

                    <div className="pt-4 space-y-2 opacity-20 hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Protocol ID: {task.id.toUpperCase()}</span>
                       </div>
                       <Button variant="link" className="p-0 h-auto text-[8px] font-black text-blue-400 uppercase tracking-widest">
                          <ExternalLink className="w-2.5 h-2.5 mr-1" /> View System Log
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </HRLayout>
  )
}
