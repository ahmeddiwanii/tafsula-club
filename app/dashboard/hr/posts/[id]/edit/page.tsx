"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { HRLayout } from "@/components/layout/hr-layout"
import { toast } from "sonner"

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/posts/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Could not load post")
        if (cancelled) return
        setTitle(data.post.title || "")
        setContent(data.post.content || "")
        setImageUrl(data.post.imageUrl || "")
      } catch (error: any) {
        toast.error(error.message || "Failed to load post")
        router.push("/dashboard/hr/home")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl: imageUrl || null, status: "published" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      toast.success("Post updated")
      router.push("/dashboard/hr/home")
    } catch (error: any) {
      toast.error(error.message || "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Delete failed")
      toast.success("Post deleted")
      router.push("/dashboard/hr/home")
    } catch (error: any) {
      toast.error(error.message || "Could not delete")
      setSaving(false)
    }
  }

  return (
    <HRLayout>
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard/hr/home" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#53635a] no-underline hover:text-[#1e302d]">
          <ArrowLeft className="h-4 w-4" />
          Back to club news
        </Link>

        <div className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1e302d]">Edit post</h1>
          <p className="mt-1 text-sm text-[#737c74]">Change anything — title, body, or image — even after it was published.</p>

          {loading ? (
            <div className="flex items-center gap-2 py-16 text-sm text-[#737c74]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading post…
            </div>
          ) : (
            <form onSubmit={onSave} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#737c74]">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#deddd3] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#1e302d] outline-none focus:border-[#203b36]"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#737c74]">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-[#deddd3] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#1e302d] outline-none focus:border-[#203b36]"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#737c74]">Image URL (optional)</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#deddd3] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#1e302d] outline-none focus:border-[#203b36]"
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#203b36] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete post
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </HRLayout>
  )
}
