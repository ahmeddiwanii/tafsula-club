"use client"

import { useEffect, useState } from "react"
import MemberLayout from "@/components/layout/member-layout"
import { PostsComponent } from "@/components/posts-component"
import { MessageSquare } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  imageUrl?: string
  status: string
  author: { id: string; name: string; email: string }
  createdAt: string
  taggedUserIds?: string
  comments?: { id: string; content: string; author: { id: string; name: string } }[]
  likes?: { userId: string }[]
}

export default function MemberPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/posts?approved=true&limit=20`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <MemberLayout>
      <div className="mx-auto w-full max-w-4xl space-y-5 pb-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Club feed</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">News</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/50">
            <MessageSquare className="h-4 w-4" />
            Updates from your bureau — clear, current, and easy to follow.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
            <p className="text-sm text-white/45">Loading news…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
            <p className="text-base font-semibold text-white">No news yet</p>
            <p className="mt-1 text-sm text-white/45">When the bureau posts, it will show up here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <PostsComponent posts={posts as any} onRefreshAction={fetchPosts} canApprove={false} />
          </div>
        )}
      </div>
    </MemberLayout>
  )
}
