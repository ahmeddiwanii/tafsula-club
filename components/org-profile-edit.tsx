"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { useToast } from "./../hooks/use-toast"
import { Loader2, Upload, Save, X } from "lucide-react"
import Image from "next/image"

interface OrgProfileEditProps {
  organizationId: string
  initialData?: {
    profileImageUrl?: string
    coverImageUrl?: string
    bio?: string
    contactEmail?: string
    contactPhone?: string
    location?: string
    website?: string
    isPublic?: boolean
  }
}

export function OrgProfileEdit({ organizationId, initialData }: OrgProfileEditProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState(initialData?.profileImageUrl || "")
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "")
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [bio, setBio] = useState(initialData?.bio || "")
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "")
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [website, setWebsite] = useState(initialData?.website || "")
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await handleImageUpload(file)
        setProfileImageUrl(base64)
        setProfileImagePreview(base64)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload profile image",
          variant: "destructive",
        })
      }
    }
  }

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await handleImageUpload(file)
        setCoverImageUrl(base64)
        setCoverImagePreview(base64)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload cover image",
          variant: "destructive",
        })
      }
    }
  }

  const clearProfileImage = () => {
    setProfileImageUrl("")
    setProfileImagePreview(null)
  }

  const clearCoverImage = () => {
    setCoverImageUrl("")
    setCoverImagePreview(null)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImageUrl,
          coverImageUrl,
          bio,
          contactEmail,
          contactPhone,
          location,
          website,
          isPublic,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast({
        title: "Success",
        description: "Organization profile updated successfully!",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Cover Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Build your organization's professional brand</span>
          </CardTitle>
          <CardDescription>Upload a cover image for your organization profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {coverImageUrl && (
            <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden group">
              <Image
                src={coverImageUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
              <button
                onClick={clearCoverImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Profile Image</span>
          </CardTitle>
          <CardDescription>Your organization's logo or profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileImageUrl && (
            <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden group">
              <Image
                src={profileImageUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
              <button
                onClick={clearProfileImage}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="profile-image">Profile Image</Label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Basic details about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell people about your organization..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-32 border-gray-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yoursite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@org.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Control who can see your organization profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Public Profile</p>
              <p className="text-sm text-gray-600">Make your organization visible in the directory</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Organization Profile
          </>
        )}
      </Button>
    </motion.div>
  )
}
