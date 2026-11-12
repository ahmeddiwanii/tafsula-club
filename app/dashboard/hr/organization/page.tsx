import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { UserRole } from "../../../../types/user"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { getHRSessionUser } from "../../../../lib/hr-session-user"
import { OrgProfileEdit } from "../../../../components/org-profile-edit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function OrgProfilePage() {
  const user = getHRSessionUser(await getServerSession(authOptions))

  if (!user || user.role !== UserRole.HR) {
    return <div className="p-8 text-center text-red-500">Not authorized</div>
  }

  if (!user.organizationId) {
    return <div className="p-8 text-center text-red-500">No organization assigned</div>
  }

  const profile = await prisma.organizationProfile.findUnique({
    where: { organizationId: user.organizationId },
  })

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  })


  return (
    <HRLayout orgName={organization?.name || "Your workspace"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Club profile</h1>
            <p className="text-gray-600">Manage your organization&apos;s public profile</p>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">Why Update Your Profile?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Appear in the public organizations directory</li>
                <li>✓ Showcase your events and training programs</li>
                <li>✓ Attract talented professionals to your events</li>
                <li>✓ Build your organization&apos;s professional brand</li>
              </ul>
            </CardContent>
          </Card>

          <OrgProfileEdit
            organizationId={user.organizationId}
            initialData={{
              profileImageUrl: profile?.profileImageUrl || "",
              coverImageUrl: profile?.coverImageUrl || "",
              bio: profile?.bio || "",
              contactEmail: profile?.contactEmail || "",
              contactPhone: profile?.contactPhone || "",
              location: profile?.location || "",
              website: profile?.website || "",
              isPublic: profile?.isPublic ?? true,
            }}
          />

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Profile</CardTitle>
                <CardDescription>
                  Your profile will appear like this to other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/organizations/${user.organizationId}`}>
                  <Button variant="outline" className="w-full">
                    View Public Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
    </HRLayout>
  )
}
