"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import { Settings, Bell, Shield, LogOut, Save, Loader2, Check, User, Sparkles } from "lucide-react"
import { AvatarPicker } from "../../../../components/avatar-picker"
import { UserAvatar } from "../../../../components/user-avatar"

export default function HRSettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [email] = useState(session?.user?.email || "")

  // Notification states
  const [notifRegistrations, setNotifRegistrations] = useState(true)
  const [notifTeamUpdates, setNotifTeamUpdates] = useState(true)
  const [notifTraining, setNotifTraining] = useState(true)

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Avatar
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState((session?.user as any)?.avatarId || 1)

  const handleAvatarSelect = async (avatarId: number) => {
    setAvatarSaving(true)
    try {
      const res = await fetch("/api/users/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId }),
      })
      if (res.ok) {
        setCurrentAvatar(avatarId)
        // Small delay then reload to pick up new session data
        setTimeout(() => window.location.reload(), 300)
      }
    } catch { }
    setAvatarSaving(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profiles/" + session?.user?.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch { }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters"); return }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setPasswordSuccess("Password changed successfully!")
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
        setShowPasswordForm(false)
      } else {
        const data = await res.json()
        setPasswordError(data.error || "Failed to change password")
      }
    } catch { setPasswordError("Network error") }
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-5">
          {/* Avatar Selection */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Choose Your Avatar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <UserAvatar avatarId={currentAvatar} name={session?.user?.name} size="lg" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Pick your club buddy below</p>
                </div>
              </div>
              <AvatarPicker currentAvatarId={currentAvatar} onSelectAction={handleAvatarSelect} saving={avatarSaving} />
              {avatarSaving && <p className="text-xs text-blue-500 mt-2 text-center">Saving...</p>}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="h-9" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
                <Input value={email} disabled className="h-9 bg-gray-50 text-gray-500" />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed. Contact admin.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Role</label>
                <Badge className="bg-blue-50 text-blue-600 border-blue-200">{session?.user?.role || "HR"}</Badge>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                { label: "Event Registrations", desc: "When members register for events", value: notifRegistrations, set: setNotifRegistrations },
                { label: "Team Updates", desc: "Changes to team groups", value: notifTeamUpdates, set: setNotifTeamUpdates },
                { label: "Training Assignments", desc: "Training program updates", value: notifTraining, set: setNotifTraining },
              ].map((n, i) => (
                <div key={i} className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.label}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => n.set(!n.value)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${n.value ? "bg-blue-600" : "bg-gray-200"}`}
                    style={{ width: 40, height: 22 }}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${n.value ? "translate-x-[18px]" : ""}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500 mb-3">Update your account password regularly</p>
                  {!showPasswordForm ? (
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>Change Password</Button>
                  ) : (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <Input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9" />
                      <Input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9" />
                      <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9" />
                      {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                      {passwordSuccess && <p className="text-xs text-emerald-600">{passwordSuccess}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowPasswordForm(false); setPasswordError("") }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Sign out from your account on this device</p>
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  )
}
