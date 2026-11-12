"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Loader2, AlertCircle, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Post {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  _count?: {
    comments: number
    likes: number
  }
  liked?: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
  }
}

export function PostsFeed() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({})
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPosts()
  }, [session])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data || [])
      }
    } catch (err) {
      setError("Failed to load posts")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments((prev) => ({
          ...prev,
          [postId]: data,
        }))
      }
    } catch (err) {
      console.error("Failed to load comments:", err)
    }
  }

  const handleCommentSubmit = async (postId: string) => {
    const text = commentText[postId]?.trim()
    if (!text) return

    try {
      setSubmittingComment((prev) => ({
        ...prev,
        [postId]: true,
      }))

      const response = await fetch("/api/posts/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text }),
      })

      if (response.ok) {
        const newComment = await response.json()
        setComments((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }))
        setCommentText((prev) => ({
          ...prev,
          [postId]: "",
        }))
      }
    } catch (err) {
      console.error("Failed to submit comment:", err)
    } finally {
      setSubmittingComment((prev) => ({
        ...prev,
        [postId]: false,
      }))
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch("/api/posts/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.liked) {
          setLikedPosts((prev) => new Set([...prev, postId]))
        } else {
          setLikedPosts((prev) => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }

  const handleExpandPost = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId)
    if (expandedPost !== postId && !comments[postId]) {
      fetchComments(postId)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Team Feed</h2>
        <p className="text-gray-600 mt-2">Connect with your team, share updates, and engage</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No posts yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <span className="font-medium text-gray-700">{post.author.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </CardDescription>
                </div>
                {post.author.id === session?.user.id && (
                  <Badge variant="outline" className="ml-2">
                    Your Post
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-700 leading-relaxed">{post.content}</p>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    likedPosts.has(post.id)
                      ? "text-red-600"
                      : "text-gray-500 hover:text-red-600"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                  />
                  <span className="text-sm">{post._count?.likes || 0}</span>
                </button>

                <button
                  onClick={() => handleExpandPost(post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">{post._count?.comments || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-900">
                            {comment.author.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2 pt-4">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      className="resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={
                        !commentText[post.id]?.trim() ||
                        submittingComment[post.id]
                      }
                      size="sm"
                      className="self-end"
                    >
                      {submittingComment[post.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
