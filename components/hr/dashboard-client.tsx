"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

import { 
  Users, CheckCircle2, Calendar, Zap, ClipboardList, Lightbulb, BookOpen, TrendingUp 
} from "lucide-react"

const iconMap: Record<string, any> = {
  users: Users,
  check: CheckCircle2,
  calendar: Calendar,
  zap: Zap,
  list: ClipboardList,
  idea: Lightbulb,
  book: BookOpen,
  trend: TrendingUp
}

export function KPICard({ iconName, label, value, sub, color }: { iconName: string; label: string; value: number; sub: string; color: string }) {
  const themes: Record<string, { icon: string; border: string; glow: string; bar: string }> = {
    blue: { icon: "text-indigo-600", border: "border-indigo-100", glow: "from-indigo-50 to-white", bar: "bg-indigo-500" },
    emerald: { icon: "text-teal-600", border: "border-teal-100", glow: "from-teal-50 to-white", bar: "bg-teal-500" },
    purple: { icon: "text-violet-600", border: "border-violet-100", glow: "from-violet-50 to-white", bar: "bg-violet-500" },
    amber: { icon: "text-amber-600", border: "border-amber-100", glow: "from-amber-50 to-white", bar: "bg-amber-500" },
  }
  const theme = themes[color] || themes.blue
  const Icon = iconMap[iconName] || Users

  return (
    <Card className={`group relative overflow-hidden rounded-2xl border ${theme.border} bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-0 transition-opacity group-hover:opacity-100`} />
      <CardContent className="relative z-10 p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
          <div className={`rounded-xl border ${theme.border} bg-white p-2.5`}>
            <Icon className={`w-4 h-4 ${theme.icon}`} />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
        <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>
        <div className={`mt-4 h-1 w-9 rounded-full ${theme.bar} opacity-70 transition-all duration-300 group-hover:w-14`} />
      </CardContent>
    </Card>
  )
}

export function DISCBar({ letter, label, count, total, color }: { letter: string; label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold tracking-wider text-slate-500">{letter} <span className="ml-2 font-sans font-medium uppercase tracking-wide text-slate-500">{label}</span></span>
        <span className="text-xs font-semibold text-slate-700">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct || 1}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`} 
        />
      </div>
    </div>
  )
}
