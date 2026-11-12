"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card"
import { Button } from "../../../../../../components/ui/button"
import { Badge } from "../../../../../../components/ui/badge"
import { Input } from "../../../../../../components/ui/input"
import { UserRole } from "../../../../../../types/user"
import { DashboardLayout } from "../../../../../../components/layout/dashboard-layout"
import { ArrowLeft, Loader2, Upload, Trash2, Download, ChevronLeft, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface GalleryImage {
  url: string
  uploadedAt: string
}

export default function EventGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [images, setImages] = useState<GalleryImage[]>([])
  const [eventTitle, setEventTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEventTitle(eventData.title)
        setImages(Array.isArray(eventData.galleryImagesJson) ? eventData.galleryImagesJson : [])
      } else {
        router.push("/dashboard/hr/events")
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
      router.push("/dashboard/hr/events")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append("files", file)
      })

      // Note: You'll need to implement the upload endpoint
      const response = await fetch(`/api/events/${eventId}/gallery`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await fetchEvent()
      }
    } catch (error) {
      console.error("Failed to upload images:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (url: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/gallery`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (response.ok) {
        await fetchEvent()
        setSelectedImageIndex(null)
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }

  const handlePrevious = () => {
    setCarouselIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <DashboardLayout role={UserRole.HR}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={UserRole.HR}>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hr/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Event Gallery</h1>
            <p className="text-muted-foreground">{eventTitle}</p>
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImageIndex(null)}
            >
              <motion.div
                className="relative max-w-5xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {/* Close Button */}
                <motion.button
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors z-10"
                  onClick={() => setSelectedImageIndex(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>

                {/* Image Display */}
                <div className="relative flex-grow flex items-center justify-center bg-black rounded-lg overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImageIndex}
                      src={images[selectedImageIndex].url}
                      alt={`Gallery ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <motion.button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
                        onClick={() => setSelectedImageIndex((prev) => prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : 0)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
                        onClick={() => setSelectedImageIndex((prev) => prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : 0)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Image Counter and Actions */}
                <div className="bg-gray-900 px-4 py-4 rounded-b-lg flex items-center justify-between">
                  <div className="text-white font-semibold">
                    {selectedImageIndex + 1} of {images.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      asChild
                    >
                      <a href={images[selectedImageIndex].url} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleDeleteImage(images[selectedImageIndex].url)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gallery Images</CardTitle>
              <Badge variant="outline">{images.length} images</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Section */}
            <motion.div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <div className="space-y-2">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Upload className="w-8 h-8 mx-auto text-blue-500" />
                  </motion.div>
                  <div className="text-sm font-medium text-gray-700">
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      "Click to upload or drag and drop"
                    )}
                  </div>
                  <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</div>
                </div>
              </label>
            </motion.div>

            {/* Gallery Grid with Carousel */}
            {images.length > 0 ? (
              <div className="space-y-6">
                {/* Featured Carousel */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden h-96">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={carouselIndex}
                      src={images[carouselIndex].url}
                      alt={`Featured ${carouselIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>

                  {/* Carousel Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                  {/* Carousel Controls */}
                  {images.length > 1 && (
                    <>
                      <motion.button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 transition-colors"
                        onClick={handlePrevious}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 transition-colors"
                        onClick={handleNext}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </motion.button>
                    </>
                  )}

                  {/* Carousel Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <Badge className="bg-white/30 text-white backdrop-blur-sm">
                      {carouselIndex + 1} / {images.length}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setSelectedImageIndex(carouselIndex)}
                    >
                      View Full Size
                    </Button>
                  </div>
                </div>

                {/* Thumbnail Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {images.map((image, idx) => (
                      <motion.div
                        key={idx}
                        className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          carouselIndex === idx ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCarouselIndex(idx)}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImageIndex(idx)
                            }}
                            className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded hover:bg-black/75"
                          >
                            Expand
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Upload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No images in gallery yet</p>
                <p className="text-gray-500 text-sm">Upload images to get started</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
