"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import MemberLayout from "@/components/layout/member-layout"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Shield,
  Clock,
  Briefcase,
  MessageSquare,
  Paperclip,
  Send,
  UploadCloud,
  Check
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

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
  user: { id: string; name: string }
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
  user: { name: string; role: string }
}

export default function MemberTaskTerminalPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session } = useSession()
  
  const [task, setTask] = useState<Task | null>(null)
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [comments])
  
  const [memberDocName, setMemberDocName] = useState("")
  const [memberDocUrl, setMemberDocUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id && session?.user?.id) {
      fetchTask()
      fetchComments()
      
      const interval = setInterval(() => {
        fetchComments()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [id, session])

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/teams/tasks/${id}`)
      if (!res.ok) throw new Error("Task not found")
      const data = await res.json()
      setTask(data.task)
      
      const myAssignment = data.task.assignments.find((a: TaskAssignment) => a.userId === session?.user?.id)
      if (myAssignment) {
        setAssignment(myAssignment)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching task:", error)
      setLoading(false)
      toast.error("Could not load this task")
    }
  }

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

  const handleSubmitMission = async () => {
    if (!assignment) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/teams/tasks/assignment/${assignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          memberDocumentName: memberDocName || undefined,
          memberDocumentUrl: memberDocUrl || undefined
        })
      })

      if (res.ok) {
        toast.success("Submitted. Waiting for review.")
        fetchTask()
      } else {
        toast.error("Submission Failed")
      }
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const priorityStyle = (p: string) => {
    switch (p) {
        case "URGENT": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] text-white border-red-500"
        case "HIGH": return "bg-orange-500 text-white border-orange-500"
        case "MEDIUM": return "bg-blue-500 text-white border-blue-500"
        default: return "bg-white/10 text-white border-white/5"
    }
  }

  if (loading || !task) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </MemberLayout>
    )
  }

  return (
    <MemberLayout>
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <Button asChild variant="ghost" className="mb-6 -ml-4 text-white/40 hover:text-white transition-colors">
            <Link href="/dashboard/member/tasks">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to tasks
            </Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 Task: <span className="text-blue-500">{task.title}</span>
               </h1>
               <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className={`text-[9px] font-black tracking-widest uppercase border-none px-3 py-1 ${priorityStyle(task.priority)}`}>
                    {task.priority === "URGENT" ? "CRITICAL PRIORITY" : `${task.priority} PRIORITY`}
                  </Badge>
                  <Badge className="bg-white/[0.03] text-white/40 border-white/10 uppercase text-[9px] font-black tracking-widest px-3 py-1">
                    {task.team.name} team
                  </Badge>
                  {assignment && <Badge className={`text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 ${
                    assignment.status === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-500' :
                    assignment.status === 'APPROVED' || assignment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-600 border border-blue-500 shadow-lg shadow-blue-500/20 text-white'
                  }`}>
                    STATUS: {assignment.status}
                  </Badge>}
               </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Main Data Feed */}
           <div className="lg:col-span-8 space-y-8">
              
              <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-10 space-y-10">
                 <div className="flex items-center gap-3 mb-6">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What to do</h3>
                 </div>
                 <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]" />
                    <p className="text-sm font-medium leading-relaxed text-white/70 whitespace-pre-wrap relative z-10">
                       {task.description || "No description provided."}
                    </p>
                 </div>

                 {/* Submission Station */}
                 {assignment && assignment.status !== "APPROVED" && assignment.status !== "COMPLETED" && (
                    <div className="pt-10 border-t border-white/5 space-y-6">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <UploadCloud className="w-5 h-5 text-emerald-400" />
                          Submit your work
                       </h3>
                       
                       <div className="group">
                          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-3 ml-1">Upload your file</p>
                          <div className="relative overflow-hidden bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between hover:bg-emerald-500/10 transition-all">
                            <input
                              type="file"
                              disabled={assignment.status === "SUBMITTED"}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                      setMemberDocName(file.name);
                                      setMemberDocUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="flex items-center gap-3 w-full">
                              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                                 {memberDocName || assignment.memberDocumentName ? <CheckCircle2 className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white tracking-widest uppercase">
                                   {memberDocName || assignment.memberDocumentName || "Attach Document File"}
                                 </p>
                                 <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
                                   {memberDocName || assignment.memberDocumentName ? "File attached" : "Required to finish this task"}
                                 </p>
                              </div>
                            </div>
                          </div>
                       </div>
                       
                       <Button 
                         disabled={submitting || assignment.status === "SUBMITTED"}
                         onClick={handleSubmitMission}
                         className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xl shadow-emerald-500/20 border-emerald-400/50 uppercase font-black tracking-widest text-[10px] transition-all disabled:opacity-50"
                       >
                         {submitting ? "Sending..." : assignment.status === "SUBMITTED" ? "Awaiting HR review" : "Submit work"}
                       </Button>
                    </div>
                 )}
              </div>

              {/* Tactical Communications (Chat) */}
              <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 flex flex-col h-[500px]">
                 <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Messages</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                    {comments.length === 0 ? (
                       <p className="text-white/20 text-xs font-black uppercase text-center mt-20 tracking-widest">No messages yet.</p>
                    ) : (
                       comments.map(c => (
                          <div key={c.id} className={`flex ${c.user.name === session?.user?.name ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-4 rounded-2xl border ${
                               c.user.name === session?.user?.name ? 'bg-blue-600/10 border-blue-500/20 text-blue-50 rounded-tr-none' : 'bg-white/5 border-white/10 text-white rounded-tl-none'
                             }`}>
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{c.user.name}</span>
                                   <span className="text-[8px] font-bold opacity-30">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{c.content}</p>
                             </div>
                          </div>
                       ))
                    )}
                    <div ref={messagesEndRef} />
                 </div>
                 <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                    <Input 
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                       placeholder="Message the club lead..."
                       className="flex-1 bg-white/[0.03] border-white/10 focus:border-purple-500 h-14 rounded-xl px-6 text-sm transition-all"
                    />
                    <Button onClick={handlePostComment} className="h-14 w-full sm:w-14 bg-purple-600 hover:bg-purple-500 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
                       <Send className="w-5 h-5 text-white" />
                    </Button>
                 </div>
              </div>
           </div>

           {/* Metrics Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-8 space-y-8 sticky top-12">
                 
                 {/* HR Document */}
                 {task.hrDocumentUrl && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2"><Shield className="w-3 h-3 text-blue-400"/> Resources from bureau</h4>
                       <a href={task.hrDocumentUrl} download={task.hrDocumentName} className="group p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex flex-col gap-3 hover:bg-blue-600/20 transition-all cursor-pointer">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white truncate uppercase tracking-widest">{task.hrDocumentName}</p>
                            <p className="text-[9px] text-blue-400/60 font-bold uppercase tracking-wider mt-1">Download Material</p>
                          </div>
                       </a>
                    </div>
                 )}

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Due date</h4>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                       <Calendar className="w-5 h-5 text-white/40" />
                       <div>
                          <p className="text-[9px] text-white/20 font-black tracking-widest uppercase">Due</p>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">{task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "Not set"}</p>
                       </div>
                    </div>
                 </div>

                 {assignment?.approvalComment && (
                    <div className="space-y-4 pt-6 border-t border-white/5">
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-red-500/40">Feedback from club lead</h4>
                       <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-4">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-400/80 font-medium italic">"{assignment.approvalComment}"</p>
                       </div>
                    </div>
                 )}

              </div>
           </div>
        </div>
      </div>
    </MemberLayout>
  )
}
