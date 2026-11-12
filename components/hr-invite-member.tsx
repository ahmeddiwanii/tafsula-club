"use client"
import { useState } from "react"
import { Button } from "./ui/button"

export function HRInviteMember() {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  return (
    <>
      <Button onClick={() => setShowInvite(true)}>Invite member</Button>
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Invite a member</h2>
            <p className="mb-4 text-sm text-gray-600">
              They will receive an email with login details.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setInviteLoading(true)
                setInviteError("")
                setInviteSuccess("")
                try {
                  const res = await fetch("/api/users/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: inviteEmail }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || "Failed to invite member")
                  setInviteSuccess("Invitation sent to " + inviteEmail)
                  setInviteEmail("")
                } catch (err: unknown) {
                  setInviteError(err instanceof Error ? err.message : "Failed to invite member")
                } finally {
                  setInviteLoading(false)
                }
              }}
              className="space-y-4"
            >
              <input
                type="email"
                className="w-full rounded border px-3 py-2"
                placeholder="member@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                disabled={inviteLoading}
              />
              {inviteError && <div className="text-sm font-medium text-red-500">{inviteError}</div>}
              {inviteSuccess && (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {inviteSuccess}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInvite(false)} disabled={inviteLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteLoading || !inviteEmail}>
                  {inviteLoading ? "Inviting…" : "Send invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
