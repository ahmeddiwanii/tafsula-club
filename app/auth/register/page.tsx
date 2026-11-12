"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react"
import { LogoWordmark } from "@/components/brand/logo"
import { BrandFigure } from "@/components/brand/figures"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const passwordChecks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Passwords match", valid: password.length > 0 && password === confirmPassword },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "REGULAR_USER" }),
      })

      let data = null
      try {
        data = await response.json()
      } catch {
        data = { error: "Registration failed. (Invalid server response)" }
      }

      if (!response.ok) {
        setError(data.error || `Registration failed. [${response.status}]`)
        setIsLoading(false)
        return
      }

      router.push("/auth/login?message=registered")
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-jasmine text-soot">

      {/* Animated DISC Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)", top: "10%", right: "-10%" }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(241,178,74,0.1) 0%, transparent 70%)", bottom: "10%", left: "-5%" }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,167,125,0.1) 0%, transparent 70%)", top: "-5%", left: "20%" }}
          animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(31,119,180,0.12) 0%, transparent 70%)", bottom: "-5%", right: "20%" }}
          animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left Side — Branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <LogoWordmark href="/" className="h-12 sm:h-14" />
            </div>
            <h1 className="mb-4 font-display text-4xl leading-tight text-soot" style={{ fontFamily: "Fraunces, serif" }}>
              Start looking.{" "}
              <em className="italic" style={{ color: "#C45C4A" }}>A door is waiting.</em>
            </h1>
            <p className="mb-8 text-base leading-relaxed text-soot/60">
              Create an account to find clubs, nights, and work you can actually show.
            </p>
            <BrandFigure id="seek" className="max-w-[240px]" />
          </motion.div>
        </div>
      </div>

      {/* Right Side — Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <LogoWordmark href="/" compact />
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create your account</h2>
              <p className="text-sm text-white/40">Start your journey with Tafsula</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="flex gap-3">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 ${check.valid ? "text-emerald-400" : "text-white/15"}`} />
                      <span className={`text-[11px] ${check.valid ? "text-emerald-400/70" : "text-white/25"}`}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-3 rounded-xl font-semibold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-opacity group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm text-white/30">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
