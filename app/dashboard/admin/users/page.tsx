"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { UserRole } from "../../../../types/user"
import { AdminLayout } from "../../../../components/layout/admin-layout"
import { Search, Users, ExternalLink, Shield, Mail, Building2 } from "lucide-react"
import { motion } from "framer-motion"

export default function UsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    if (status === "authenticated" && session.user.role === "SUPERADMIN") {
      fetchUsers()
    }
  }, [status, router, session])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.organization?.name && user.organization.name.toLowerCase().includes(query)),
        ),
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
      setIsLoading(false)
    } catch (error) {
      setError("Failed to load users. Please try again.")
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN": return "text-purple-400 bg-purple-500/10 border-purple-500/20"
      case "HR": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      case "MEMBER": return "text-blue-400 bg-blue-500/10 border-blue-500/20"
      default: return "text-white/60 bg-white/5 border-white/10"
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
              Global Users
            </h1>
            <p className="text-white/50 text-sm">Manage all users across the platform.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            placeholder="Search users by name, email, or org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/5 bg-[#0a0a0f] text-center">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No users found.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#0a0a0f] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Organization</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white/90">{user.name}</span>
                          <span className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.organization ? (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Building2 className="w-4 h-4 text-white/20" />
                            {user.organization.name}
                          </div>
                        ) : (
                          <span className="text-sm text-white/20 italic">No Organization</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/40 hover:text-purple-400 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
