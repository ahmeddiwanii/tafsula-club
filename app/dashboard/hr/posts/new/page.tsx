"use client"

import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Button } from "../../../../../components/ui/button"
import { Input } from "../../../../../components/ui/input"
import { Textarea } from "../../../../../components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, Loader } from "lucide-react"
import { useToast } from "../../../../../components/ui/use-toast"

export default function CreatePostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl: imageUrl || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: "Post created and shared with your team!",
      })

      router.push("/dashboard/hr/home")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-6"
          asChild
        >
          <Link href="/dashboard/hr/home" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-2xl">Create a New Post</CardTitle>
            <CardDescription>Share an update, announcement, or important information with your team</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Post Title
                </label>
                <Input
                  placeholder="e.g., Team Lunch Announcement, New Project Kickoff"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  className="border-gray-300"
                  disabled={isLoading}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Content
                </label>
                <Textarea
                  placeholder="Write your post here... You can add details, schedule information, or any important updates."
                  value={content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  rows={8}
                  className="border-gray-300 font-normal"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Image URL (Optional)
                </label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  type="url"
                  className="border-gray-300"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Add a cover image to make your post more engaging</p>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                    onError={() => setImageUrl("")}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/hr/home")}
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
