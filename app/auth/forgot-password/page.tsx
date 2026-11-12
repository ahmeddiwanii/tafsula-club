"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong")
      } else {
        setDone(true)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1c2e] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          We will email you a temporary password if an account exists.
        </p>
        {done ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#2a9d8f]">Check your inbox, then log in and change your password.</p>
            <Link href="/auth/login" className="text-sm text-white underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 text-white"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-[#e85d4c] hover:bg-[#d54d3d]">
              {loading ? "Sending…" : "Send reset"}
            </Button>
            <Link href="/auth/login" className="block text-center text-sm text-white/50 hover:text-white">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
