"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Users, Calendar, FolderKanban, Mail, Globe, Phone, ExternalLink, ShieldCheck, ArrowLeft } from "lucide-react"

import type { UserRole } from "@/types/user"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"

interface Organization {
  id: string
  name: string
  createdAt: string
  organizationProfile?: {
    contactEmail?: string
    contactPhone?: string
    website?: string
    bio?: string
  }
  user: {
    id: string
    name: string
    email: string
  }[]
  _count: {
    user: number
    event: number
    project: number
  }
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const organizationId = params?.id

  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizationId) return

    async function fetchOrganization() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/organizations/${organizationId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch organization")
        }
        const data = await res.json()
        setOrg(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [organizationId])

  const userRole = (session?.user?.role || "SUPERADMIN") as UserRole

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  if (status === "authenticated" && session.user.role !== "SUPERADMIN") {
    router.push("/dashboard")
    return null
  }

  if (loading) {
    return (
      <AdminLayout role={userRole}>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !org) {
    return (
      <AdminLayout role={userRole}>
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-red-400 font-medium">{error || "Organization not found"}</p>
          <Button variant="outline" asChild className="mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <Link href="/dashboard/admin/organizations">Back to List</Link>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout role={userRole}>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/organizations" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {org.name}
            </h1>
            <p className="text-white/40 mt-1">ID: {org.id}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-white/60 font-medium">Total Members</h3>
            </div>
            <p className="text-4xl font-bold text-white">{org._count.user}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white/60 font-medium">Total Events</h3>
            </div>
            <p className="text-4xl font-bold text-white">{org._count.event}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban className="w-5 h-5 text-amber-400" />
              <h3 className="text-white/60 font-medium">Total Projects</h3>
            </div>
            <p className="text-4xl font-bold text-white">{org._count.project}</p>
          </motion.div>
        </div>

        {/* Organization Details & HR Managers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-white/10 bg-[#0f0f18] p-6">
            <h3 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-fuchsia-400" /> Organization Profile
            </h3>
            
            <div className="space-y-4">
              {org.organizationProfile?.bio && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-white/70 leading-relaxed">{org.organizationProfile.bio}</p>
                </div>
              )}
              
              <div className="space-y-3">
                {org.organizationProfile?.contactEmail ? (
                  <div className="flex items-center gap-3 text-white/70">
                    <Mail className="w-4 h-4 text-white/30" />
                    <a href={`mailto:${org.organizationProfile.contactEmail}`} className="hover:text-blue-400 transition">{org.organizationProfile.contactEmail}</a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-white/30 italic"><Mail className="w-4 h-4" /> No email provided</div>
                )}
                
                {org.organizationProfile?.contactPhone && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone className="w-4 h-4 text-white/30" />
                    <span>{org.organizationProfile.contactPhone}</span>
                  </div>
                )}
                
                {org.organizationProfile?.website && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Globe className="w-4 h-4 text-white/30" />
                    <a href={org.organizationProfile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition">
                      {org.organizationProfile.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* HR Managers Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-white/10 bg-[#0f0f18] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> HR Leadership
              </h3>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {org.user.length} Manager{org.user.length !== 1 && 's'}
              </span>
            </div>
            
            {org.user.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-white/5 bg-white/[0.02]">
                <ShieldCheck className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">No HR managers assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {org.user.map(hr => (
                  <div key={hr.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <span className="text-emerald-400 font-medium">{hr.name?.charAt(0) || "H"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white/90">{hr.name || "Unknown Name"}</p>
                        <p className="text-xs text-white/50">{hr.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
