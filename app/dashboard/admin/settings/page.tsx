import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@/types/user"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login")
  }

  return (
    <AdminLayout role={UserRole.SUPERADMIN}>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Platform settings
        </h1>
        <p className="text-sm text-white/50">
          Minimal admin controls for launch. Manage clubs and users from the sidebar. Email and database are configured via environment variables on the host (Vercel).
        </p>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <Link href="/dashboard/admin/join-requests" className="text-[#2a9d8f] underline">
              Review club requests
            </Link>
          </li>
          <li>
            <Link href="/dashboard/admin/organizations" className="text-[#2a9d8f] underline">
              Manage clubs
            </Link>
          </li>
          <li>
            <Link href="/dashboard/admin/users" className="text-[#2a9d8f] underline">
              Manage users
            </Link>
          </li>
        </ul>
      </div>
    </AdminLayout>
  )
}
