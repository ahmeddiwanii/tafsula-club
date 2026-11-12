"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { UserRole } from "../../../../types/user"
import { AdminLayout } from "../../../../components/layout/admin-layout"
import { Building2, Search, Users, ExternalLink, ChevronRight, Activity, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OrganizationData } from "../../../../lib/types"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

export default function OrganizationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    if (status === "authenticated" && session.user.role === "SUPERADMIN") {
      fetchOrganizations()
    }
  }, [status, router, session])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrganizations(organizations)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredOrganizations(organizations.filter((organization) => organization.name.toLowerCase().includes(query)))
    }
  }, [searchQuery, organizations])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations")
      if (!response.ok) throw new Error("Failed to fetch organizations")
      const data = await response.json()

      // We'll calculate HR counts simply by hitting the users endpoint or assuming data is there
      // For this refactor, we use the raw data if available
      const formattedOrganizations = data.organizations || data
      setOrganizations(formattedOrganizations)
      setFilteredOrganizations(formattedOrganizations)
      setIsLoading(false)
    } catch (error) {
      setError("Failed to load organizations. Please try again.")
      setIsLoading(false)
    }
  }

  const userRole = (session?.user?.role || "SUPERADMIN") as UserRole

  if (isLoading) {
    return (
      <AdminLayout role={userRole}>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout role={userRole}>
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout role={userRole}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Organizations
            </h1>
            <p className="text-white/50 text-sm">Manage all clubs, NGOs, and teams on the platform.</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white border-0">
            <Link href="/dashboard/admin/organizations/new">
              <Plus className="w-4 h-4 mr-2" /> Add Organization
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>

        {filteredOrganizations.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/5 bg-[#0a0a0f] text-center">
            <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No organizations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrganizations.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-2xl border border-white/5 bg-[#0a0a0f] hover:border-purple-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px] group-hover:bg-purple-500/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {org.organizationProfile?.profileImageUrl ? (
                          <img src={org.organizationProfile.profileImageUrl} alt={org.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide truncate max-w-[150px]">{org.name}</h3>
                        <p className="text-xs text-white/40">Joined {formatDistanceToNow(new Date(org.createdAt || Date.now()))} ago</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/admin/organizations/${org.id}`}>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/40 hover:text-purple-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Members</span>
                      </div>
                      <span className="font-bold text-white">{org._count?.users || org.memberCount || 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Events</span>
                      </div>
                      <span className="font-bold text-white">{org._count?.events || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
