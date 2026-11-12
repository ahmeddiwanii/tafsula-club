import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { getHRSessionUser } from "../../../../lib/hr-session-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import Link from "next/link"
import { Calendar, Heart, MessageCircle, Share2, Plus, Pencil } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function HomePageFeed() {
  const user = getHRSessionUser(await getServerSession(authOptions))

  if (!user) {
    return <div className="p-8 text-center text-red-500">Not authenticated</div>
  }

  if (!user.organizationId) {
    return <div className="p-8 text-center text-red-500">No organization assigned</div>
  }

  let organization = null
  let posts: any[] = []

  try {
    organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    posts = await prisma.organizationPost.findMany({
      where: {
        organizationId: user.organizationId,
        status: "published",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (err: any) {
    return <div className="p-8 text-center text-red-500">Error loading feed: {err.message}</div>
  }

  // Fetch upcoming events for the home feed
  let upcomingEvents: any[] = []

  try {
    upcomingEvents = await prisma.event.findMany({
      where: {
        organizationId: user.organizationId,
        status: "UPCOMING",
      },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        format: true,
        type: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startAt: "asc" },
      take: 5,
    })
  } catch (err: any) {
    console.error("Error loading events:", err)
  }

  return (
    <HRLayout orgName={organization?.name || "Your workspace"}>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d] sm:text-3xl">
              Club news
            </h1>
            <p className="mt-1 text-sm text-[#737c74]">Share updates, then edit them anytime if something changes.</p>
          </div>

          {/* Create Post / Event Section */}
          {user.role === "HR" && (
            <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">What's new?</p>
                    <Button asChild className="mr-2 gap-2 bg-blue-600 hover:bg-blue-700">
                      <Link href="/dashboard/hr/posts/new">
                        <Plus className="w-4 h-4" />
                        Create Post
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href="/dashboard/hr/events/new">
                        <Calendar className="w-4 h-4" />
                        Create Event
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/dashboard/hr/events/${event.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(event.startAt).toLocaleDateString()}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {event.format.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{event._count.registrations}</p>
                            <p className="text-xs text-gray-500">registered</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Posts</h2>

            {posts.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="pt-12 text-center pb-12">
                  <p className="text-gray-500 font-medium mb-3">No posts yet</p>
                  <p className="text-sm text-gray-400 mb-4">Be the first to share an update</p>
                  {user.role === "HR" && (
                    <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Link href="/dashboard/hr/posts/new">
                        <Plus className="w-4 h-4" />
                        Create Post
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#203b36] text-sm font-bold text-white">
                          {post.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{post.author?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/hr/posts/${post.id}/edit`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#deddd3] px-2.5 py-1.5 text-xs font-semibold text-[#53635a] no-underline hover:bg-[#f5f4ef]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{post.title}</h3>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {post.imageUrl && (
                      <div className="rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm">
                        <Heart className="w-4 h-4" />
                        Like
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                        <MessageCircle className="w-4 h-4" />
                        Comment
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors text-sm">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
    </HRLayout>
  )
}
