import React, { forwardRef } from "react"
import { CheckCircle, Clock, X, LayoutTemplate, Activity } from "lucide-react"

export const ProposalPdfTemplate = forwardRef<HTMLDivElement, { proposal: any }>(
  ({ proposal }, ref) => {
    if (!proposal) return null
    
    const pickSwot = (proposal: any) => {
      const c = proposal?.canvasJson?.swot
      if (c && typeof c === "object") return c
      const s = proposal?.swotJson
      if (s && typeof s === "object") return s
      return {}
    }

    const swot = pickSwot(proposal)
    const authorInitials = proposal.submittedBy?.name?.slice(0, 2).toUpperCase() || "UN"
    const writeUp = proposal.expectedImpact || proposal.canvasJson?.description || "No description provided."
    
    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : ""

    return (
      <div 
        ref={ref} 
        dir="auto" 
        className="bg-white text-black p-12 mx-auto" 
        style={{ width: "800px", minHeight: "1120px", fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2">
              Proposal Document
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight max-w-[500px]" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              {proposal.title}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
              {proposal.status}
            </span>
          </div>
        </div>

        {/* Metadata section */}
        <div className="grid grid-cols-2 gap-4 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Author</div>
            <div className="font-bold">{proposal.submittedBy?.name || "Unknown"}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Date Submitted</div>
            <div className="font-bold">{formatDate(proposal.createdAt) || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Type</div>
            <div className="font-bold uppercase text-xs">{proposal.type || "Idea"}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ref ID</div>
            <div className="font-mono text-xs text-gray-600">{proposal.id.slice(-8).toUpperCase()}</div>
          </div>
        </div>

        {/* Main Writeup */}
        <div className="mb-10">
          <div className="text-[10px] text-blue-600 uppercase font-black tracking-[0.2em] mb-4 border-b border-blue-200 pb-2">
            Main Write-up / Expected Impact
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 bg-blue-50/50 p-6 rounded-xl border border-blue-100/50" dir="auto">
            {writeUp}
          </div>
        </div>

        {/* SWOT Analysis */}
        <div className="mb-10 page-break-inside-avoid">
          <div className="text-[10px] text-purple-600 uppercase font-black tracking-[0.2em] mb-4 border-b border-purple-200 pb-2">
            SWOT Analysis
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
              <div className="text-emerald-700 text-xs font-black uppercase tracking-widest mb-2">Strengths</div>
              <div className="text-sm text-emerald-950 whitespace-pre-wrap" dir="auto">{swot.strengths || "—"}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <div className="text-amber-700 text-xs font-black uppercase tracking-widest mb-2">Weaknesses</div>
              <div className="text-sm text-amber-950 whitespace-pre-wrap" dir="auto">{swot.weaknesses || "—"}</div>
            </div>
            <div className="bg-sky-50 rounded-xl p-5 border border-sky-200">
              <div className="text-sky-700 text-xs font-black uppercase tracking-widest mb-2">Opportunities</div>
              <div className="text-sm text-sky-950 whitespace-pre-wrap" dir="auto">{swot.opportunities || "—"}</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-200">
              <div className="text-rose-700 text-xs font-black uppercase tracking-widest mb-2">Threats</div>
              <div className="text-sm text-rose-950 whitespace-pre-wrap" dir="auto">{swot.threats || "—"}</div>
            </div>
          </div>
        </div>

        {/* Comments Section (Optional) */}
        {proposal.comments?.length > 0 && (
          <div className="mb-10 page-break-inside-avoid">
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">
              HR Feedback
            </div>
            <div className="space-y-4">
              {proposal.comments.map((comment: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-700">{comment.author?.name || "HR Reviewer"}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap" dir="auto">{comment.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Tafsula OS</span>
          <span>Generated {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    )
  }
)
ProposalPdfTemplate.displayName = "ProposalPdfTemplate"
