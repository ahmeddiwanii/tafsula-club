"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import MemberLayout from "../../../../components/layout/member-layout"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import {
  Lightbulb,
  Plus,
  CheckCircle,
  Clock,
  X,
  Eye,
  Lock,
  MessageSquare,
  AlertCircle,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  Target,
} from "lucide-react"

// Interactive Guide Component - Book Design
const ProposalGuide = ({ onClose }: { onClose: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  const pages = [
    {
      title: "Welcome to Proposal Studio",
      subtitle: "✨ Turn Your Ideas Into Impact",
      icon: "📖",
      bgGradient: "from-blue-600 to-indigo-600",
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-gray-700">
            You're about to create something amazing. This guide will help you structure your proposal like a pro – no business jargon, just smart thinking.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-bold text-gray-700">Clear Thinking</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💪</div>
              <p className="text-sm font-bold text-gray-700">Strong Ideas</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm font-bold text-gray-700">Real Impact</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-bold text-gray-700">Get Approved</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic text-center mt-6">
            You have 4 pages of guidance ahead. Let's make your idea shine! ⭐
          </p>
        </div>
      ),
    },
    {
      title: "Understanding SWOT",
      subtitle: "🎯 Know Your Landscape",
      icon: "🎯",
      bgGradient: "from-green-600 to-emerald-600",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💪</span>
              <div className="flex-1">
                <h4 className="font-black text-lg text-gray-900">Strengths 💚</h4>
                <p className="text-xs text-gray-600 mt-1 font-semibold italic">"What are we GOOD at?"</p>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                  Write down your superpowers! Skills, resources, experience, or talents that help your idea succeed.
                </p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-green-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Easy Example:</p>
                  <p className="text-xs text-gray-600">"Our team has 5 years of event experience" or "We have great social media skills"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-black text-lg text-gray-900">Weaknesses 💛</h4>
                <p className="text-xs text-gray-600 mt-1 font-semibold italic">"What needs HELP?"</p>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                  Be honest about gaps. What do you need more of? Budget, team, tools, or knowledge? It's SMART!
                </p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-yellow-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Easy Example:</p>
                  <p className="text-xs text-gray-600">"We need bigger budget" or "Our team is small - only 2 people"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-5 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🌟</span>
              <div className="flex-1">
                <h4 className="font-black text-lg text-gray-900">Opportunities 💙</h4>
                <p className="text-xs text-gray-600 mt-1 font-semibold italic">"What LUCK do we have?"</p>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                  Look around! Trends, partnerships, timing, or things in the world that could help your idea WIN.
                </p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-blue-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Easy Example:</p>
                  <p className="text-xs text-gray-600">"People care more about environment now" or "We could partner with Company X"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div className="flex-1">
                <h4 className="font-black text-lg text-gray-900">Threats ❤️</h4>
                <p className="text-xs text-gray-600 mt-1 font-semibold italic">"What COULD GO WRONG?"</p>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                  Plan ahead! What problems or obstacles might stop you? Money issues, competition, or timing?
                </p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-red-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Easy Example:</p>
                  <p className="text-xs text-gray-600">"Tight deadline" or "Another group is doing something similar"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl mt-2">
            <p className="text-xs font-bold text-gray-800">💡 Remember:</p>
            <p className="text-xs text-gray-700 mt-1">SWOT helps HR understand if your idea is REAL and DOABLE. Be honest!</p>
          </div>
        </div>
      ),
    },
    {
      title: "Mastering SMART",
      subtitle: "🎪 Create Achievable Goals",
      icon: "🎪",
      bgGradient: "from-purple-600 to-pink-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-sm font-bold mb-2">
            💡 SMART = Goals that are CLEAR, DOABLE & TRACKABLE!
          </p>

          <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Specific</h4>
                <p className="text-xs text-gray-600 font-semibold italic mt-1">"Be CLEAR & DETAILED"</p>
                <p className="text-sm text-gray-700 mt-2">Don't say "do something." Say EXACTLY what you'll do.</p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-indigo-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">❌ Too Vague:</p>
                  <p className="text-xs text-gray-600 mb-2">"Improve community"</p>
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Perfect:</p>
                  <p className="text-xs text-gray-600">"Organize 2 community clean-up events"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Measurable</h4>
                <p className="text-xs text-gray-600 font-semibold italic mt-1">"Add NUMBERS & PROOF"</p>
                <p className="text-sm text-gray-700 mt-2">How will you KNOW it worked? Use numbers, dates, or stats!</p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-blue-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">❌ Too Soft:</p>
                  <p className="text-xs text-gray-600 mb-2">"Reach many people"</p>
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Perfect:</p>
                  <p className="text-xs text-gray-600">"Reach 500 people in the first month"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 p-5 rounded-lg border-l-4 border-cyan-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Achievable</h4>
                <p className="text-xs text-gray-600 font-semibold italic mt-1">"BE REALISTIC"</p>
                <p className="text-sm text-gray-700 mt-2">Dream big BUT be real. Can you actually DO this with your resources?</p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-cyan-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">❌ Too Crazy:</p>
                  <p className="text-xs text-gray-600 mb-2">"Become world famous in 1 week"</p>
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Perfect:</p>
                  <p className="text-xs text-gray-600">"Get 100 followers on our social media in 2 months"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎪</span>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Relevant</h4>
                <p className="text-xs text-gray-600 font-semibold italic mt-1">"DOES IT MATTER?"</p>
                <p className="text-sm text-gray-700 mt-2">Does this goal connect to your MAIN IDEA? Stay on track!</p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-purple-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">❌ Not Relevant:</p>
                  <p className="text-xs text-gray-600 mb-2">If your idea is "teach math" but goal is "paint the building"</p>
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Perfect:</p>
                  <p className="text-xs text-gray-600">Your goal directly supports your main idea</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 p-5 rounded-lg border-l-4 border-pink-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Time-bound</h4>
                <p className="text-xs text-gray-600 font-semibold italic mt-1">"SET A DEADLINE"</p>
                <p className="text-sm text-gray-700 mt-2">When will this happen? A deadline keeps you FOCUSED!</p>
                <div className="bg-white p-3 rounded-lg mt-3 border border-pink-200">
                  <p className="text-xs font-bold text-gray-700 mb-1">❌ No Deadline:</p>
                  <p className="text-xs text-gray-600 mb-2">"Eventually reach 100 people"</p>
                  <p className="text-xs font-bold text-gray-700 mb-1">✅ Perfect:</p>
                  <p className="text-xs text-gray-600">"Reach 100 people by end of March 2026"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-300">
            <p className="text-sm font-black text-gray-900">🏆 Full SMART Example:</p>
            <p className="text-xs text-gray-700 mt-2 leading-relaxed font-semibold">
              "Teach coding to <strong>50 high school students</strong> (Specific), measuring progress with <strong>quiz scores</strong> (Measurable), using our <strong>existing volunteers</strong> (Achievable), which supports <strong>our education mission</strong> (Relevant), <strong>completed by June 2026</strong> (Time-bound)"
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Create?",
      subtitle: "💫 Let's Make Magic",
      icon: "✨",
      bgGradient: "from-amber-600 to-orange-600",
      content: (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">🎨 Form Tips & Tricks</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lg">✍️</span>
                <span className="text-gray-700">
                  <strong>Write naturally</strong> – Imagine explaining your idea to a friend
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-gray-700">
                  <strong>Keep it short</strong> – 2-3 sentences per box is perfect
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🔄</span>
                <span className="text-gray-700">
                  <strong>Be honest</strong> – Weaknesses and threats are strengths in disguise
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <span className="text-gray-700">
                  <strong>Own your vision</strong> – Let your passion shine through
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center">
            <p className="text-lg font-bold mb-2">You've Got This! 💪</p>
            <p className="text-sm opacity-90">
              Your idea matters. Let's show the world what you can do.
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center italic">
            Questions? Wondering if you missed something? Go back and re-read any page anytime.
          </p>
        </div>
      ),
    },
  ]

  const handlePageChange = (newPage: number) => {
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentPage(newPage)
      setIsFlipping(false)
    }, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-gradient-to-br from-black/50 to-black/30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Book Container with 3D effect */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-2xl"
        style={{ perspective: 1200 }}
      >
        {/* Book wrapper with shadow */}
        <div className="relative">
          {/* Book Shadow */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full h-4 bg-black/20 blur-2xl rounded-full" />

          {/* Actual Book */}
          <motion.div
            animate={{ rotateZ: isFlipping ? 5 : 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Book Header with gradient */}
            <motion.div
              animate={{ backgroundPosition: isFlipping ? "100% 0" : "0% 0" }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-r ${pages[currentPage].bgGradient} text-white p-8 relative overflow-hidden`}
            >
              {/* Animated background pattern */}
              <motion.div
                animate={{ rotate: isFlipping ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"
              />
              <motion.div
                animate={{ rotate: isFlipping ? -360 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"
              />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-5xl mb-3"
                >
                  {pages[currentPage].icon}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-black"
                >
                  {pages[currentPage].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/80 text-sm mt-2 font-semibold"
                >
                  {pages[currentPage].subtitle}
                </motion.p>
              </div>

              {/* Page indicator */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                {currentPage + 1} / {pages.length}
              </div>
            </motion.div>

            {/* Book Content */}
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-8 min-h-96 bg-gradient-to-br from-white to-gray-50 overflow-y-auto max-h-96"
            >
              {pages[currentPage].content}
            </motion.div>

            {/* Book Footer Navigation */}
            <div className="bg-white border-t border-gray-200 p-6 flex items-center justify-between">
              {/* Progress bar */}
              <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }} />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                ← Back
              </motion.button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {pages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handlePageChange(idx)}
                    animate={{
                      scale: idx === currentPage ? 1.2 : 1,
                      backgroundColor: idx === currentPage ? "#3b82f6" : "#e5e7eb",
                    }}
                    className="w-2 h-2 rounded-full transition-all cursor-pointer"
                  />
                ))}
              </div>

              {currentPage < pages.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Next →
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all"
                >
                  Start Creating 🚀
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProposalsPage() {
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [hasOpenedFormBefore, setHasOpenedFormBefore] = useState(false)
  const [formData, setFormData] = useState({
    type: "idea",
    title: "",
    summary: "",
    visibility: "ORG",
    swot: {
      strengths: "",
      weaknesses: "",
      opportunities: "",
      threats: "",
    },
    smart: {
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
    },
  })

  const handleOpenForm = () => {
    setShowForm(true)
    // Auto-show guide on first form open
    if (!hasOpenedFormBefore) {
      setShowGuide(true)
      setHasOpenedFormBefore(true)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      const data = await response.json()
      setProposals(Array.isArray(data) ? data : [])
      if (!response.ok) toast.error(data?.error || "Could not load proposals")
    } catch (error) {
      console.error("Failed to fetch proposals:", error)
      toast.error("Could not load proposals")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title.trim(),
          visibility: formData.visibility,
          expectedImpact: formData.summary.trim() || undefined,
          canvasJson: {
            description: formData.summary.trim() || undefined,
            swot: formData.swot,
            smart: formData.smart,
          },
          swotJson: formData.swot,
        }),
      })
      if (response.ok) {
        toast.success("Proposal submitted. HR will review it soon.")
        setFormData({
          type: "idea",
          title: "",
          summary: "",
          visibility: "ORG",
          swot: {
            strengths: "",
            weaknesses: "",
            opportunities: "",
            threats: "",
          },
          smart: {
            specific: "",
            measurable: "",
            achievable: "",
            relevant: "",
            timeBound: "",
          },
        })
        setShowForm(false)
        fetchProposals()
      } else {
        const err = await response.json().catch(() => ({}))
        toast.error(err.error || "Could not submit proposal")
      }
    } catch (error) {
      console.error("Failed to submit proposal:", error)
      toast.error("Something went wrong. Try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
      case "submitted":
        return "bg-blue-500/15 text-blue-300 border-blue-500/35"
      case "rejected":
        return "bg-red-500/15 text-red-300 border-red-500/35"
      case "in_review":
        return "bg-amber-500/15 text-amber-200 border-amber-500/35"
      default:
        return "bg-white/10 text-white/60 border-white/15"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "submitted":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <X className="w-4 h-4" />
      case "in_review":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "idea":
        return <Lightbulb className="w-5 h-5" />
      case "event":
        return <Calendar className="w-5 h-5" />
      case "project":
        return <Target className="w-5 h-5" />
      case "initiative":
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    return visibility === "PRIVATE" ? (
      <Lock className="w-4 h-4" />
    ) : (
      <Eye className="w-4 h-4" />
    )
  }

  return (
    <MemberLayout>
      <div className="relative z-10 w-full max-w-5xl mx-auto pb-20 space-y-12 mt-4 md:mt-6">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Ideas</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                 <Lightbulb className="w-10 h-10 text-amber-500" />
                 My <span className="text-amber-500">ideas</span>
              </h1>
              <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Share your ideas, events, and initiatives with the team</p>
           </div>
           
           <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenForm}
              className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 flex items-center gap-2"
           >
              <Plus className="w-4 h-4" /> New idea
           </motion.button>
        </motion.div>

            {/* Form Modal */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[min(96vw,56rem)] my-6 rounded-2xl border border-white/10 bg-[#08080c] shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    <div className="border-b border-white/[0.08] px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-transparent to-blue-500/10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400/90 mb-1">New submission</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Proposal
                        </h2>
                        <p className="text-white/45 text-sm mt-1 max-w-xl">
                          Explain your idea in your own words, then add SWOT and SMART so HR can review fairly.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowGuide(true)}
                          className="text-xs px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition-colors font-bold uppercase tracking-wider"
                        >
                          How it works
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          aria-label="Close"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="px-6 py-6 sm:px-8 sm:py-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <form onSubmit={handleSubmitProposal} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                          >
                            <option value="idea" className="bg-[#111]">Idea</option>
                            <option value="event" className="bg-[#111]">Event</option>
                            <option value="project" className="bg-[#111]">Project</option>
                            <option value="initiative" className="bg-[#111]">Initiative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Short, clear title"
                            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                          Your idea (main write-up)
                        </label>
                        <p className="text-xs text-white/35 mb-3">
                          Use as much space as you need—paragraphs are welcome. This is what HR reads first.
                        </p>
                        <textarea
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          placeholder="Describe the problem, your idea, who it helps, and what you need from the organization…"
                          rows={12}
                          className="w-full min-h-[14rem] max-h-[50vh] rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4 text-sm leading-relaxed text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-y"
                        />
                      </div>

                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                          <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">SWOT</h3>
                            <p className="text-xs text-white/40 mt-1">Strengths, gaps, opportunities, and risks.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowGuide(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-300/90 border border-emerald-500/30 rounded-lg px-3 py-2 hover:bg-emerald-500/10"
                          >
                            SWOT tips
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-emerald-300/90 mb-2">Strengths</label>
                            <textarea
                              value={formData.swot.strengths}
                              onChange={(e) =>
                                setFormData({ ...formData, swot: { ...formData.swot, strengths: e.target.value } })
                              }
                              placeholder="What you are already good at, assets, experience…"
                              rows={8}
                              className="w-full min-h-[7rem] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-emerald-500/40 focus:outline-none resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-amber-200/90 mb-2">Weaknesses</label>
                            <textarea
                              value={formData.swot.weaknesses}
                              onChange={(e) =>
                                setFormData({ ...formData, swot: { ...formData.swot, weaknesses: e.target.value } })
                              }
                              placeholder="Budget, time, skills, or support you are missing…"
                              rows={8}
                              className="w-full min-h-[7rem] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-amber-500/40 focus:outline-none resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-300/90 mb-2">Opportunities</label>
                            <textarea
                              value={formData.swot.opportunities}
                              onChange={(e) =>
                                setFormData({ ...formData, swot: { ...formData.swot, opportunities: e.target.value } })
                              }
                              placeholder="Timing, partners, trends, or demand in your favor…"
                              rows={8}
                              className="w-full min-h-[7rem] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-sky-500/40 focus:outline-none resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-rose-300/90 mb-2">Threats</label>
                            <textarea
                              value={formData.swot.threats}
                              onChange={(e) =>
                                setFormData({ ...formData, swot: { ...formData.swot, threats: e.target.value } })
                              }
                              placeholder="Deadlines, competition, dependencies, or things that could block you…"
                              rows={8}
                              className="w-full min-h-[7rem] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-rose-500/40 focus:outline-none resize-y"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                          <div>
                            <h3 className="text-lg font-black text-white">SMART goal</h3>
                            <p className="text-xs text-white/40 mt-1">One concrete outcome. Write a sentence or two per field.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowGuide(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-violet-300/90 border border-violet-500/30 rounded-lg px-3 py-2 hover:bg-violet-500/10"
                          >
                            SMART tips
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                          {[
                            { key: "specific" as const, label: "Specific", ph: "Exactly what will you do?" },
                            { key: "measurable" as const, label: "Measurable", ph: "How will you measure success?" },
                            { key: "achievable" as const, label: "Achievable", ph: "Why is this realistic with your resources?" },
                            { key: "relevant" as const, label: "Relevant", ph: "How does this fit the club or mission?" },
                            { key: "timeBound" as const, label: "Time-bound", ph: "By when? Milestones?" },
                          ].map((row) => (
                            <div key={row.key}>
                              <label className="block text-xs font-bold text-white/50 mb-2">{row.label}</label>
                              <textarea
                                value={formData.smart[row.key]}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    smart: { ...formData.smart, [row.key]: e.target.value },
                                  })
                                }
                                placeholder={row.ph}
                                rows={5}
                                className="w-full min-h-[5.5rem] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-violet-500/40 focus:outline-none resize-y"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                        <label className="block text-sm font-black text-white mb-3">Who can see this?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { value: "ORG", label: "Organization", desc: "Visible to members if approved" },
                            { value: "HR_ONLY", label: "HR only", desc: "Only HR reviewers" },
                            { value: "PRIVATE", label: "Private", desc: "Only you (still stored for HR if policy requires)" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, visibility: opt.value })}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                formData.visibility === opt.value
                                  ? "border-amber-500/60 bg-amber-500/15 text-white"
                                  : "border-white/10 bg-black/20 text-white/70 hover:border-white/20"
                              }`}
                            >
                              <div className="text-sm font-black mb-1">{opt.label}</div>
                              <div className="text-[11px] text-white/40 leading-snug">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-white/10 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowForm(false)}
                          className="border-white/15 bg-transparent text-white hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black uppercase tracking-widest text-[10px] hover:from-amber-400 hover:to-amber-500"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit idea
                        </Button>
                      </div>
                    </form>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guide Modal */}
            <AnimatePresence>{showGuide && <ProposalGuide onClose={() => setShowGuide(false)} />}</AnimatePresence>

            {/* Proposals Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-10 h-10 text-amber-500" />
                </motion.div>
              </div>
            ) : proposals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Lightbulb className="w-16 h-16 text-amber-500/40 mx-auto mb-4" />
                <p className="text-xl text-white/70 mb-2 font-bold">No ideas yet</p>
                <p className="text-sm text-white/35 mb-8 max-w-md mx-auto">
                  When you have an idea for the club or org, submit it here—HR can review and respond.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px]"
                >
                  Write your first idea
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {proposals.map((proposal, index) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border border-white/10 bg-white/[0.02] shadow-2xl hover:border-amber-500/30 transition-shadow overflow-hidden group">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Left accent bar */}
                            <div
                              className="w-1 md:w-2 bg-gradient-to-b from-amber-500 to-red-600"
                            />

                            {/* Main content */}
                            <div className="flex-1 p-6 md:p-8">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
                                    {getTypeIcon(proposal.type)}
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-amber-500 transition-colors">
                                      {proposal.title}
                                    </h3>
                                    <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
                                      {proposal.submittedBy?.name || "Unknown"}
                                    </p>
                                  </div>
                                </div>

                                <Badge
                                  className={`flex items-center gap-1 px-3 py-1.5 border ${getStatusColor(proposal.status)}`}
                                >
                                  {getStatusIcon(proposal.status)}
                                  {proposal.status.replace("_", " ").toUpperCase()}
                                </Badge>
                              </div>

                              {(proposal.expectedImpact || proposal.canvasJson?.description) && (
                                <p className="text-white/45 mb-4 line-clamp-3 text-sm leading-relaxed">
                                  {proposal.expectedImpact || proposal.canvasJson?.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-white/45">
                                  {getVisibilityIcon(proposal.visibility)}
                                  <span>
                                    {proposal.visibility === "PRIVATE"
                                      ? "Private"
                                      : proposal.visibility === "HR_ONLY"
                                        ? "HR only"
                                        : "Organization"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-white/45">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{proposal._count?.comments ?? proposal.comments?.length ?? 0} comments</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/45">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action button */}
                            <div className="p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-white/10 bg-black/20">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedProposal(proposal)
                                  setShowDetails(true)
                                }}
                                className="bg-amber-500/90 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] py-3 px-5 rounded-xl transition-shadow"
                              >
                                Open
                              </motion.button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetails && selectedProposal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#08080c] border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
                        {getTypeIcon(selectedProposal.type)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-black text-white break-words">{selectedProposal.title}</h2>
                        <p className="text-white/40 font-bold tracking-widest uppercase text-xs mt-1">
                          Submitted by {selectedProposal.submittedBy?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="text-white/40 hover:text-white shrink-0"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge
                      className={`flex items-center gap-1 px-3 py-1.5 border-none font-bold text-[10px] uppercase tracking-widest ${
                        selectedProposal.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                        selectedProposal.status === "rejected" ? "bg-red-500/10 text-red-500" :
                        "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {getStatusIcon(selectedProposal.status)}
                      {selectedProposal.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className="flex items-center gap-1 px-3 py-1.5 border-none bg-blue-500/10 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                      {getVisibilityIcon(selectedProposal.visibility)}
                      {selectedProposal.visibility === "PRIVATE"
                        ? "Private"
                        : selectedProposal.visibility === "HR_ONLY"
                          ? "HR only"
                          : "Organization"}
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Your write-up</p>
                    <div className="bg-white/[0.04] border border-white/10 p-5 rounded-xl">
                      <p className="text-white/75 whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedProposal.expectedImpact ||
                          selectedProposal.canvasJson?.description ||
                          "No main description was provided for this proposal."}
                      </p>
                    </div>
                    {selectedProposal.canvasJson?.swot && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {["strengths", "weaknesses", "opportunities", "threats"].map((k) => (
                          <div key={k} className="rounded-lg border border-white/10 bg-black/30 p-3">
                            <p className="font-black text-white/40 uppercase tracking-wider mb-1">{k}</p>
                            <p className="text-white/70 whitespace-pre-wrap">
                              {(selectedProposal.canvasJson.swot as any)?.[k] || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedProposal.canvasJson?.smart && (
                      <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-xs space-y-2">
                        <p className="font-black text-white/40 uppercase tracking-wider mb-2">SMART</p>
                        {Object.entries(selectedProposal.canvasJson.smart as Record<string, string>).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-white/35 w-28 shrink-0 uppercase">{k}</span>
                            <span className="text-white/70 whitespace-pre-wrap">{v || "—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedProposal.reviewer && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-6">
                      <p className="font-bold text-emerald-500 mb-2 uppercase tracking-widest text-xs">Review</p>
                      <p className="text-emerald-400/80 font-medium">Reviewed by {selectedProposal.reviewer?.name}</p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end mt-4">
                    <Button
                      onClick={() => setShowDetails(false)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px]"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer spacing */}
        <div className="h-12" />
    </MemberLayout>
  )
}
