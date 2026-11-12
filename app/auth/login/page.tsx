"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react"
import { LogoWordmark } from "@/components/brand/logo"
import { BrandFigure } from "@/components/brand/figures"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "logged-out") {
      setSuccess("You have been successfully signed out.")
    } else if (message === "registered") {
      setSuccess("Registration successful! Please sign in with your new account.")
    } else if (message === "rejected") {
      setError("Your request was not accepted. Please check your email for details.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
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
          style={{ background: "radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)", top: "-10%", left: "-10%" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(241,178,74,0.12) 0%, transparent 70%)", top: "20%", right: "-5%" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,167,125,0.12) 0%, transparent 70%)", bottom: "-10%", left: "30%" }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(31,119,180,0.15) 0%, transparent 70%)", bottom: "10%", right: "10%" }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left Side — Branding (desktop only) */}
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
              Walk back in.{" "}
              <em className="italic" style={{ color: "#C45C4A" }}>Your door is still here.</em>
            </h1>
            <p className="mb-8 text-base leading-relaxed text-soot/60">
              Clubs, nights, teams, and the work you can show — one house for Tunisian youth.
            </p>
            <BrandFigure id="leap" className="max-w-[240px]" />
          </motion.div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <LogoWordmark href="/" compact />
          </div>

          <div className="rounded-[1.8rem] border-[3px] border-soot bg-jasmine p-8 shadow-[5px_7px_0_0_#161210]">
            <div className="mb-6">
              <h2 className="mb-1 font-display text-2xl text-soot" style={{ fontFamily: "Fraunces, serif" }}>Welcome back</h2>
              <p className="text-sm text-soot/50">Sign in — your next night is waiting.</p>
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-soot/50">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soot/30" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-full border-[2px] border-soot bg-jasmine py-3 pl-10 pr-4 text-sm text-soot placeholder:text-soot/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-soot/50">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-pomegranate hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soot/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-full border-[2px] border-soot bg-jasmine py-3 pl-10 pr-11 text-sm text-soot placeholder:text-soot/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-soot/30 hover:text-soot"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-3 rounded-xl font-semibold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <div className="absolute inset-0 rounded-full bg-soot" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 border-t-[2px] border-soot/10 pt-6 text-center">
              <p className="text-sm text-soot/50">
                New here?{" "}
                <Link href="/auth/register" className="font-semibold text-pomegranate">
                  Create a door
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-soot/40 hover:text-soot">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-jasmine">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-white/30 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
