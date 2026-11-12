"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, User, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"

import type { UserRole } from "@/types/user"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewOrganizationPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [name, setName] = useState("")
  const [hrName, setHrName] = useState("")
  const [hrEmail, setHrEmail] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hrName, hrEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create organization")
        return
      }

      setSuccess(true)
      setName("")
      setHrName("")
      setHrEmail("")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/admin/organizations")
      }, 2000)
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const userRole = (session?.user?.role || "SUPERADMIN") as UserRole

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  if (status === "authenticated" && session.user.role !== "SUPERADMIN") {
    router.push("/dashboard")
    return null
  }

  return (
    <AdminLayout role={userRole}>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              New Organization
            </h1>
            <p className="text-white/60">Manually provision an organization and its HR manager.</p>
          </div>
          <Button variant="outline" asChild className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Link href="/dashboard/admin/organizations">Back to List</Link>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-[#0f0f18] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500" />
          
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-400">Creation Failed</h4>
                  <p className="text-sm text-red-400/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-emerald-400">Success</h4>
                  <p className="text-sm text-emerald-400/80 mt-1">Organization and HR user created. Redirecting...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Organization Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white/90 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" /> Organization Details
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70">Organization Name *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="e.g. InnovaLab Club"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/50 h-12"
                  />
                </div>
              </div>

              <div className="w-full h-px bg-white/10" />

              {/* HR Manager Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white/90 flex items-center gap-2">
                    <User className="w-5 h-5 text-fuchsia-400" /> HR Manager (Optional)
                  </h3>
                  <p className="text-sm text-white/40 mt-1">If provided, an HR account will be created and an invite email will be sent automatically.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hrName" className="text-white/70">Manager Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-white/20" />
                      <Input 
                        id="hrName" 
                        value={hrName} 
                        onChange={(e) => setHrName(e.target.value)} 
                        placeholder="John Doe"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/50 h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hrEmail" className="text-white/70">Manager Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/20" />
                      <Input 
                        id="hrEmail" 
                        type="email"
                        value={hrEmail} 
                        onChange={(e) => setHrEmail(e.target.value)} 
                        placeholder="john@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/50 h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading || success} 
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white h-12 px-8 font-medium gap-2 border-0"
                >
                  {isLoading ? "Provisioning..." : (
                    <>Create Organization <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
