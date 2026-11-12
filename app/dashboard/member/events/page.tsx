"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import MemberLayout from "../../../../components/layout/member-layout"
import { Badge } from "../../../../components/ui/badge"
import { Calendar, MapPin, Clock, CheckCircle2, Users, Star, Activity, Hexagon, Crosshair } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export default function MemberEventsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/users/me/events")
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const getStatusStyle = (s: string) => {
        switch (s) {
            case "APPROVED": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            case "REGISTERED": return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            case "REJECTED": return "bg-red-500/20 text-red-400 border border-red-500/30"
            case "CANCELLED": return "bg-white/5 text-white/40 border border-white/10"
            default: return "bg-white/5 text-white/40 border border-white/10"
        }
    }

    return (
        <MemberLayout>
            <div className="space-y-6 relative z-10 pb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        MY <span className="text-blue-500">EVENTS</span>
                    </h1>
                    <p className="text-white/40 font-medium tracking-widest uppercase text-xs flex items-center gap-2">
                       <Crosshair className="w-4 h-4" /> See your registered events and attendance
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Registrations", value: data?.totalRegistered || 0, icon: Hexagon, color: "text-blue-400", bg: "bg-blue-600/10", border: "border-blue-500/20" },
                        { label: "Attended", value: data?.attendedCount || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-600/10", border: "border-emerald-500/20" },
                        { label: "Feedback sent", value: data?.feedbackGiven || 0, icon: Star, color: "text-amber-400", bg: "bg-amber-600/10", border: "border-amber-500/20" },
                    ].map(s => (
                        <div key={s.label} className={`border ${s.border} bg-white/[0.02] backdrop-blur-xl p-4 rounded-2xl group hover:bg-white/[0.04] transition-all relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{s.label}</span>
                                <div className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>
                                    <s.icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-white relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Events List */}
                <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
                    <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" /> Your events
                    </h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />)}
                        </div>
                    ) : !data?.registrations?.length ? (
                        <div className="py-20 text-center">
                            <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest">No Events Connected</p>
                            <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">You haven’t registered for any events yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {data.registrations.map((reg: any, idx: number) => (
                                    <motion.div 
                                        key={reg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative"
                                    >
                                    <Link
                                        href={`/events/${reg.event.id}`}
                                        className="flex p-5 rounded-2xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex-col md:flex-row items-start gap-5 relative overflow-hidden"
                                    >
                                        {reg.event.posterUrl ? (
                                            <img src={reg.event.posterUrl} alt="" className="w-full md:w-24 h-32 md:h-24 rounded-xl object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full md:w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-blue-500/20 transition-colors">
                                                <Calendar className="w-8 h-8 text-blue-500/50" />
                                            </div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                                        {reg.event.title}
                                                    </h3>
                                                    <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">{reg.event.organization?.name}</p>
                                                </div>
                                                <Badge className={`text-[9px] font-black uppercase tracking-widest ${getStatusStyle(reg.status)}`}>
                                                    {reg.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/5 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">
                                                        {format(new Date(reg.event.startAt), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                                
                                                {reg.event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase line-clamp-1">
                                                            {reg.event.location}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 ml-auto">
                                                    <Badge className="bg-white/5 text-white/40 border-none px-2 py-0.5 text-[9px] uppercase tracking-widest font-black">
                                                        {reg.event.type}
                                                    </Badge>
                                                    <span className="text-[9px] font-black text-white/30 tracking-widest uppercase border-l border-white/10 pl-2">
                                                        Joined {format(new Date(reg.appliedAt), "MMM d")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </MemberLayout>
    )
}
