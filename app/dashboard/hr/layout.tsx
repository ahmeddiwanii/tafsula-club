import type { ReactNode } from "react"
import { getServerSession } from "next-auth/next"

import { HRLayout } from "@/components/layout/hr-layout"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getHRSessionUser } from "@/lib/hr-session-user"

export default async function HRRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  const sessionUser = getHRSessionUser(await getServerSession(authOptions))
  const organizationId = sessionUser?.organizationId
  const organization = organizationId
    ? await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      })
    : null

  return <HRLayout orgName={organization?.name}>{children}</HRLayout>
}
