"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, BarChart3 } from "lucide-react"

export interface HRTrendPoint {
  month: string
  members: number
  registrations: number
}

export interface DISCPoint {
  type: string
  count: number
}

export function HRAnalytics({
  trend,
}: {
  trend: HRTrendPoint[]
  disc?: DISCPoint[]
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity className="h-4 w-4 text-indigo-600" />
              Growth
            </div>
            <p className="mt-1 text-xs text-slate-500">New members and event sign-ups</p>
          </div>
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="membersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="members" stroke="#6366f1" fill="url(#membersFill)" name="New members" />
              <Area type="monotone" dataKey="registrations" stroke="#14b8a6" fill="url(#regFill)" name="Event sign-ups" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            New members
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Event sign-ups
          </span>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          Club tip
        </div>
        <p className="mt-1 text-xs text-slate-500">Keep your members moving</p>
        <div className="mt-5 flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
          <p className="text-sm font-medium text-slate-700">Events → Teams → Tasks</p>
          <p className="mt-2 max-w-[240px] text-xs leading-5 text-slate-500">
            Create an event, add teams (logistics, welcome, comms…), then assign simple tasks. Members earn points when work is approved.
          </p>
        </div>
      </article>
    </section>
  )
}
