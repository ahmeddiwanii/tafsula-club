"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  MessageSquare,
  Lightbulb,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Target
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"

interface DashboardStats {
  testsCompleted: boolean
  disc: {
    dominantType: string
    dScore: number
    iScore: number
    sScore: number
    cScore: number
  } | null
  upcomingEvents: Array<{
    id: string
    title: string
    startAt: string
    format: string
    description: string
  }>
  approvedProposals: number
  pendingProposals: number
  teamSize: number
  recentPosts: Array<{
    id: string
    title: string
    content: string
    author: string
    comments: number
    likes: number
    createdAt: string
  }>
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    blue: { border: "border-blue-500/20", text: "text-blue-400", bg: "bg-blue-600/10" },
    purple: { border: "border-purple-500/20", text: "text-purple-400", bg: "bg-purple-600/10" },
    emerald: { border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-600/10" },
    amber: { border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-600/10" },
  }
  const theme = themes[color]
  return (
    <div className={`bg-white/[0.02] border ${theme.border} backdrop-blur-xl p-6 rounded-2xl group hover:bg-white/[0.04] transition-all duration-500 shadow-2xl`}>
      <div className="flex items-center justify-between mb-4">
         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
         <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>
            <Icon className="w-4 h-4" />
         </div>
      </div>
      <p className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  )
}

export default function MemberDashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const onboardingRes = await fetch("/api/dashboard/member/onboarding-status", { cache: "no-store" })
        if (onboardingRes.ok) {
          const onboarding = await onboardingRes.json()
          if (onboarding.memberStatus === "ACCEPTED" && !onboarding.profileCompleted) {
            window.location.href = "/dashboard/member/profile"
            return
          }
        }

        const response = await fetch("/api/members/dashboard-stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 relative z-10 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          DASHBOARD <span className="text-blue-500">HOME</span>
        </h1>
        <p className="text-white/40 font-medium tracking-wide uppercase text-xs flex items-center gap-2">
           <Sparkles className="w-4 h-4" /> You’re signed in &bull; Welcome back
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard icon={Users} label="Team members" value={stats?.teamSize || 0} color="blue" />
        <StatCard icon={Calendar} label="Upcoming events" value={stats?.upcomingEvents?.length || 0} color="purple" />
        <StatCard icon={CheckCircle} label="Approved proposals" value={stats?.approvedProposals || 0} color="emerald" />
        <StatCard icon={Clock} label="Pending proposals" value={stats?.pendingProposals || 0} color="amber" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Events & Profile */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent posts */}
          <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg font-bold text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent posts</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                <Link href="/dashboard/member/posts">View all <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {(!stats?.recentPosts || stats.recentPosts.length === 0) ? (
                <div className="text-center py-12">
                   <p className="text-sm text-white/20 uppercase tracking-widest font-black">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentPosts.map((post) => (
                    <div key={post.id} className="group p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-lg">
                          POSTED BY {post.author.split(' ')[0]}
                        </p>
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{format(new Date(post.createdAt), "MMM d")}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-300 transition-colors">{post.title}</h4>
                      <p className="text-xs text-white/40 line-clamp-2 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"><MessageSquare className="w-3 h-3" /> {post.comments} comments</span>
                        <span className="flex items-center gap-1.5 hover:text-pink-400 transition-colors tracking-tighter">❤ {post.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-lg font-bold text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upcoming events</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {(!stats?.upcomingEvents || stats.upcomingEvents.length === 0) ? (
                <div className="text-center py-12">
                  <p className="text-sm text-white/20 uppercase tracking-widest font-black">No upcoming events</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.upcomingEvents.slice(0, 4).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}
                      className="group p-4 rounded-[1rem] border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-lg">
                          {format(new Date(event.startAt), "MMM d - h:mm a")}
                        </div>
                        <Badge className="bg-white/5 text-[8px] font-black tracking-widest uppercase border-0 text-white/60">{event.format}</Badge>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 mb-1">{event.title}</h4>
                      <p className="text-xs text-white/30 line-clamp-1 font-medium">{event.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-lg font-bold text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  How it works
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 text-sm text-white/55">
              <p>1. Join events your bureau publishes.</p>
              <p>2. Pick a team (welcome, logistics, comms…).</p>
              <p>3. Finish tasks and earn points.</p>
              <p>4. Share ideas and follow club news.</p>
              <Button asChild size="sm" className="mt-2 bg-[#e85d4c] hover:bg-[#d54d3d] text-white">
                <Link href="/dashboard/member/events">See events</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.06]">
              <CardTitle className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Target className="w-5 h-5 text-amber-400" /> Quick actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              {[
                { href: "/dashboard/member/proposals", icon: Lightbulb, label: "Submit proposal", color: "text-amber-400" },
                { href: "/dashboard/member/teams", icon: Users, label: "Teams", color: "text-blue-400" },
                { href: "/dashboard/member/tasks", icon: ClipboardList, label: "My tasks", color: "text-emerald-400" },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white/60 hover:bg-white/[0.06] hover:text-white transition-all duration-300 group">
                  <action.icon className={`w-4 h-4 ${action.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <span className="flex-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30" />
                </Link>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

