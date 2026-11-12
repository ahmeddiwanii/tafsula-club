import type React from "react"
import { getServerSession } from "next-auth/next"
import { UserRole } from "../../../../../types/user"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import { HRLayout } from "../../../../../components/layout/hr-layout"
import { getHRSessionUser } from "../../../../../lib/hr-session-user"
import TeamGroupsClient from "../../../../../components/team-groups-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Alert, AlertDescription } from "../../../../../components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function TeamGroupsPage() {
  const user = getHRSessionUser(await getServerSession(authOptions))

  if (!user) {
    return <div className="p-8 text-center text-red-500">Not authenticated</div>
  }
  if (user.role !== UserRole.HR) {
    return <div className="p-8 text-center text-red-500">Not authorized</div>
  }
  if (!user.organizationId) {
    return <div className="p-8 text-center text-red-500">No organization assigned</div>
  }

  let organization = null
  let members: any[] = []

  try {
    organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    members = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        role: "MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            headline: true,
            bio: true,
          },
        },
        result: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            dominantType: true,
          },
        },
      },
    })
  } catch (err: any) {
    return <div className="p-8 text-center text-red-500">Error loading data: {err.message}</div>
  }

  return (
    <HRLayout orgName={organization?.name || "Your workspace"}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Team Groups & Divisions
            </h1>
            <p className="text-gray-600">Organize your team into groups with drag-and-drop functionality</p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Drag and drop members between groups. Each group needs at least one <strong>Chef d'équipe</strong> (team leader).
            </AlertDescription>
          </Alert>

          {/* Team Groups Component */}
          <TeamGroupsClient members={members} organizationId={user.organizationId} />
        </div>
    </HRLayout>
  )
}
