import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRSessionUser } from "@/lib/hr-session-user"
import { UserRole } from "@/types/user"
import { StoryStudioClient } from "@/components/story-studio/studio-client"

export default async function StoryStudioPage() {
  const user = getHRSessionUser(await getServerSession(authOptions))

  if (!user || user.role !== UserRole.HR) {
    return <div className="p-8 text-center text-rose-600">Only the bureau can open Story Studio.</div>
  }
  if (!user.organizationId) {
    return <div className="p-8 text-center text-rose-600">No organization is assigned to this account.</div>
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <StoryStudioClient />
    </div>
  )
}
