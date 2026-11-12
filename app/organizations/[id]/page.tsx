"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { UserNav } from "../../../components/user-nav"
import { Mail, MapPin, Globe, Phone, Users, Zap, ArrowRight } from "lucide-react"

interface Profile {
  profileImageUrl?: string
  coverImageUrl?: string
  bio?: string
  contactEmail?: string
  contactPhone?: string
  location?: string
  website?: string
}

interface Organization {
  id: string
  name: string
  organizationProfile?: Profile
  recruiting?: boolean
  _count?: {
    user: number
    event: number
    project: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  author: {
    name: string
  }
}

interface Event {
  id: string
  title: string
  description?: string
  startAt: string
  location?: string
}

export default function OrganizationProfilePage() {
  const params = useParams()
  const organizationId = params.id as string

  const [org, setOrg] = useState<Organization | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"about" | "posts" | "events">("about")
  const [recruiting, setRecruiting] = useState(false)

  useEffect(() => {
    fetchOrgData()
  }, [organizationId])

  const fetchOrgData = async () => {
    setLoading(true)
    try {
      const [orgRes, postsRes, eventsRes, recruitRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}`),
        fetch(`/api/organizations/${organizationId}/posts`),
        fetch(`/api/events?organizationId=${organizationId}`),
        fetch(`/api/organizations/${organizationId}/recruitment`),
      ])

      if (orgRes.ok) {
        setOrg(await orgRes.json())
      }
      if (postsRes.ok) {
        setPosts(await postsRes.json())
      }
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData.events || eventsData)
      }
      if (recruitRes.ok) {
        const r = await recruitRes.json()
        setRecruiting(Boolean(r.form?.isOpen))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Organization not found</h2>
          <p className="text-gray-600 mt-2">This organization profile doesn't exist.</p>
          <Link href="/organizations">
            <Button className="mt-4">Back to Organizations</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const profile = org.organizationProfile

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/organizations" className="text-gray-600 hover:text-gray-900 font-medium">
            ← Back to Organizations
          </Link>
          <UserNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-80 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 overflow-hidden"
        >
          {profile?.coverImageUrl && (
            <img
              src={profile.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Profile Section */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              {/* Profile Image */}
              {profile?.profileImageUrl && (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl shadow-md overflow-hidden flex-shrink-0">
                  <img
                    src={profile.profileImageUrl}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Organization Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{org.name}</h1>
                    <p className="text-gray-600 mt-2">{profile?.bio}</p>
                  </div>
                  {recruiting ? (
                    <Link href={`/organizations/${organizationId}/join`} className="shrink-0">
                      <Button className="h-12 w-full rounded-full bg-[#161210] px-8 text-base font-semibold text-[#F7F3EA] hover:bg-[#161210]/90 sm:w-auto">
                        Join this club
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="secondary" className="self-start bg-slate-100 text-slate-600">
                      Not recruiting
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                {org._count && (
                  <div className="flex gap-4 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      <Users className="w-3 h-3 mr-1" />
                      {org._count.user} Members
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      <Zap className="w-3 h-3 mr-1" />
                      {org._count.event} Events
                    </Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {org._count.project} Projects
                    </Badge>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.contactEmail && (
                    <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4" />
                      <span>{profile.contactEmail}</span>
                    </a>
                  )}
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {profile?.contactPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{profile.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <div className="flex gap-8">
              {["about", "posts", "events"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "posts" && ` (${posts.length})`}
                  {tab === "events" && ` (${events.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pb-16"
          >
            {activeTab === "about" && profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{profile.bio}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.contactEmail && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${profile.contactEmail}`} className="text-blue-600 hover:text-blue-700">
                          {profile.contactEmail}
                        </a>
                      </div>
                    )}
                    {profile.contactPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900">{profile.contactPhone}</p>
                      </div>
                    )}
                    {profile.location && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-900">{profile.location}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          {post.imageUrl && (
                            <div className="relative h-48 rounded-lg overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">By {post.author.name}</p>
                            <p className="text-gray-700 mt-4">{post.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-600">
                      No posts yet
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-6">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="text-gray-600 mt-2">{event.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            {event.startAt && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-sm">
                                  {new Date(event.startAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                            )}
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm" className="mt-4 w-full">
                              View Event
                              <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-600">
                      No events yet
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
