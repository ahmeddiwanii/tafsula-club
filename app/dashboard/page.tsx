import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  if (session.user.role === "SUPERADMIN") {
    redirect("/dashboard/admin")
  } else if (session.user.role === "HR") {
    redirect("/dashboard/hr")
  } else if (session.user.role === "REGULAR_USER") {
    redirect("/organizations")
  } else {
    redirect("/dashboard/member")
  }

  return null
}
