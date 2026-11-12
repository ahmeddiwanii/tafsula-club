import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { UserRole } from "../../../types/user"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"
import { AdminLayout } from "../../../components/layout/admin-layout"
import { Building2, Users, Calendar, ShieldAlert, TrendingUp, BarChart3, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPERADMIN") {
    return <div>Unauthorized</div>
  }

  // Get counts for dashboard
  const organizationCount = await prisma.organization.count()
  const userCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  })

  const hrCount = userCounts.find((count: any) => count.role === "HR")?._count.id || 0
  const memberCount = userCounts.find((count: any) => count.role === "MEMBER")?._count.id || 0
  const testCount = await prisma.result.count()
  const pendingRequestsCount = await prisma.organizationJoinRequest.count({
    where: { status: "PENDING" }
  })

  // Get recent join requests
  const recentRequests = await prisma.organizationJoinRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Get recent organizations
  const recentOrgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: { select: { user: true } }
    }
  })

  const userRole = (session.user.role || "SUPERADMIN") as UserRole

  return (
    <AdminLayout role={userRole}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              System Core
            </h1>
            <p className="text-white/50 text-sm">Welcome back, Administrator. Here's what's happening across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-bold text-sm tracking-wide">ROOT ACCESS</span>
             </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Organizations", value: organizationCount, icon: Building2, color: "from-blue-500 to-indigo-500", link: "/dashboard/admin/organizations" },
            { label: "HR Managers", value: hrCount, icon: Users, color: "from-emerald-500 to-teal-500", link: "/dashboard/admin/users" },
            { label: "Total Members", value: memberCount, icon: Users, color: "from-amber-500 to-orange-500", link: "/dashboard/admin/users" },
            { label: "Tests Completed", value: testCount, icon: Activity, color: "from-pink-500 to-rose-500", link: "#" },
            { label: "Pending Requests", value: pendingRequestsCount, icon: ShieldAlert, color: "from-purple-500 to-fuchsia-500", link: "/dashboard/admin/join-requests" },
          ].map((stat, i) => (
            <Link key={i} href={stat.link}>
              <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden h-full flex flex-col justify-between">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</h3>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organizations */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0a0f] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Organizations</h2>
              </div>
              <Link href="/dashboard/admin/organizations" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition">View All</Link>
            </div>
            
            <div className="space-y-3">
              {recentOrgs.length === 0 ? (
                 <p className="text-sm text-white/40 text-center py-4">No organizations found.</p>
              ) : (
                recentOrgs.map(org => (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition">
                    <div>
                      <p className="font-bold text-sm text-white/90">{org.name}</p>
                      <p className="text-xs text-white/40">Joined {formatDistanceToNow(new Date(org.createdAt))} ago</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <p className="text-xs font-medium text-white/60">{org._count?.user || 0} Users</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Join Requests */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0a0f] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Join Requests</h2>
              </div>
              <Link href="/dashboard/admin/join-requests" className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition">Manage All</Link>
            </div>
            
            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                 <p className="text-sm text-white/40 text-center py-4">No recent join requests.</p>
              ) : (
                recentRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition">
                    <div>
                      <p className="font-bold text-sm text-white/90">{req.orgName}</p>
                      <p className="text-xs text-white/40">{req.contactName} • {formatDistanceToNow(new Date(req.createdAt))} ago</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${
                       req.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                       req.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                       'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <p className="text-[10px] font-black uppercase tracking-wider">{req.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
