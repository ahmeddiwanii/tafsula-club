'use client'

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Star, Trash2, AlertCircle, Plus, Search } from "lucide-react"
import Link from "next/link"

interface OrganizationMember {
  id: string
  name: string
  email: string
}

interface Team {
  id: string
  name: string
  members: string[]
  leadId?: string
}

interface SetupData {
  directors: string[]
  teams: Team[]
}

export default function SetupTeamsAndDirectorsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")

  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [setupData, setSetupData] = useState<SetupData>({
    directors: [],
    teams: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [draggingMember, setDraggingMember] = useState<string | null>(null)
  const [dragSource, setDragSource] = useState<string | null>(null)

  // Fetch organization members
  useEffect(() => {
    if (session?.user?.email) {
      fetchMembers()
    }
  }, [session])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/event-directors")
      if (!response.ok) throw new Error("Failed to load members")
      const data = await response.json()
      setMembers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get members not assigned to any team
  const unassignedMembers = filteredMembers.filter(
    member => !setupData.directors.includes(member.id) &&
      !setupData.teams.some(team => team.members.includes(member.id))
  )

  // Toggle director
  const toggleDirector = (memberId: string) => {
    setSetupData(prev => ({
      ...prev,
      directors: prev.directors.includes(memberId)
        ? prev.directors.filter(id => id !== memberId)
        : [...prev.directors, memberId],
    }))
  }

  // Create new team
  const createTeam = () => {
    if (!newTeamName.trim()) {
      setError("Team name is required")
      return
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      members: [],
    }

    setSetupData(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
    }))
    setNewTeamName("")
  }

  // Delete team
  const deleteTeam = (teamId: string) => {
    setSetupData(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== teamId),
    }))
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, memberId: string, source: string) => {
    setDraggingMember(memberId)
    setDragSource(source)
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  // Handle drop on team
  const handleDropOnTeam = (e: React.DragEvent, teamId: string) => {
    e.preventDefault()
    if (!draggingMember) return

    setSetupData(prev => {
      const newSetupData = { ...prev }

      // Remove from directors if it was there
      newSetupData.directors = newSetupData.directors.filter(id => id !== draggingMember)

      // Remove from other teams
      newSetupData.teams = newSetupData.teams.map(team => ({
        ...team,
        members: team.members.filter(id => id !== draggingMember),
      }))

      // Add to target team
      newSetupData.teams = newSetupData.teams.map(team =>
        team.id === teamId
          ? { ...team, members: [...team.members, draggingMember] }
          : team
      )

      return newSetupData
    })

    setDraggingMember(null)
    setDragSource(null)
  }

  // Handle drop on unassigned
  const handleDropOnUnassigned = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggingMember) return

    setSetupData(prev => {
      const newSetupData = { ...prev }

      // Remove from directors
      newSetupData.directors = newSetupData.directors.filter(id => id !== draggingMember)

      // Remove from teams
      newSetupData.teams = newSetupData.teams.map(team => ({
        ...team,
        members: team.members.filter(id => id !== draggingMember),
      }))

      return newSetupData
    })

    setDraggingMember(null)
    setDragSource(null)
  }

  // Set team lead
  const setTeamLead = (teamId: string, memberId: string) => {
    setSetupData(prev => ({
      ...prev,
      teams: prev.teams.map(team =>
        team.id === teamId
          ? { ...team, leadId: team.leadId === memberId ? undefined : memberId }
          : team
      ),
    }))
  }

  // Get member name by ID
  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || "Unknown"
  }

  // Handle confirm
  const handleConfirm = async () => {
    if (!eventId) {
      setError("Event ID is missing")
      return
    }

    try {
      setSaving(true)

      // Save directors
      if (setupData.directors.length > 0) {
        const directorRes = await fetch("/api/event-directors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            directorIds: setupData.directors,
          }),
        })
        if (!directorRes.ok) throw new Error("Failed to save directors")
      }

      // Save teams
      for (const team of setupData.teams) {
        const teamRes = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: team.name,
            purpose: `Team for event`,
            organizationId: session?.user.organizationId,
            eventId,
          }),
        })

        if (!teamRes.ok) throw new Error("Failed to save team")

        const createdTeam = await teamRes.json()

        // Add team members
        for (const memberId of team.members) {
          await fetch(`/api/teams/${createdTeam.id}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: memberId,
              role: team.leadId === memberId ? "LEAD" : "MEMBER",
            }),
          })
        }
      }

      // Redirect back to event creation page
      router.push(`/dashboard/hr/events/new?eventId=${eventId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto text-center py-24">
          <p className="text-lg text-gray-600 font-medium">⏳ Loading organization members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/hr/events/new?eventId=${eventId}`}>
            <Button variant="ghost" size="icon" className="hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900">
              👥 Set Up Teams & Directors
            </h1>
            <p className="text-gray-600 mt-2">
              Select directors, create teams, and assign members using drag & drop
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Unassigned Members */}
          <div className="lg:col-span-1">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnUnassigned}
              className="bg-white rounded-2xl border-2 border-blue-200 p-6 sticky top-8 space-y-4"
            >
              <h2 className="text-xl font-black text-gray-900">📋 Available Members</h2>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    All members assigned ✅
                  </p>
                ) : (
                  unassignedMembers.map(member => (
                    <div
                      key={member.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, member.id, "unassigned")}
                      className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md cursor-move transition-all"
                    >
                      <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center: Directors & Teams */}
          <div className="lg:col-span-2 space-y-8">
            {/* Directors Section */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">⭐</span> Event Directors
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                Click on members to mark them as directors, or drag from the left panel
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {members
                  .filter(m => setupData.directors.includes(m.id))
                  .map(member => (
                    <div
                      key={member.id}
                      className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                          <p className="text-xs text-gray-600 truncate">{member.email}</p>
                        </div>
                        <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}

                {setupData.directors.length === 0 && (
                  <p className="col-span-full text-sm text-gray-500 text-center py-6">
                    No directors selected yet
                  </p>
                )}
              </div>

              {/* Add Directors by Clicking */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Or click members to add as directors:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members
                    .filter(m => !setupData.directors.includes(m.id))
                    .map(member => (
                      <button
                        key={member.id}
                        onClick={() => toggleDirector(member.id)}
                        className="p-2 text-left bg-gray-100 hover:bg-purple-100 rounded-lg transition-all border-2 border-transparent hover:border-purple-400"
                      >
                        <p className="text-xs font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Teams Section */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">🏢 Teams & Groups</h2>

              {/* Create New Team */}
              <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Create a New Team
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter team name..."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && createTeam()}
                    className="flex-1 h-11"
                  />
                  <Button
                    onClick={createTeam}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </Button>
                </div>
              </div>

              {/* Teams List */}
              <div className="space-y-4">
                {setupData.teams.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No teams created yet</p>
                ) : (
                  setupData.teams.map(team => (
                    <div
                      key={team.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTeam(e, team.id)}
                      className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTeam(team.id)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-gray-600 mb-4">
                        Drag members here or click to assign team lead (⭐)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.members.length === 0 ? (
                          <p className="col-span-full text-sm text-gray-500 text-center py-6">
                            Drag members here
                          </p>
                        ) : (
                          team.members.map(memberId => {
                            const member = members.find(m => m.id === memberId)
                            const isLead = team.leadId === memberId
                            return (
                              <button
                                key={memberId}
                                onClick={() => setTeamLead(team.id, memberId)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  isLead
                                    ? "bg-yellow-100 border-yellow-400"
                                    : "bg-white border-gray-300 hover:border-yellow-400"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900">
                                      {member?.name}
                                    </p>
                                    <p className="text-xs text-gray-600">{member?.email}</p>
                                  </div>
                                  {isLead && (
                                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Confirm Button */}
        <div className="sticky bottom-0 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-gray-900">
              ✅ {setupData.directors.length} director{setupData.directors.length !== 1 ? "s" : ""} •{" "}
              {setupData.teams.length} team{setupData.teams.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-gray-600">Ready to create your event structure?</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/hr/events/new?eventId=${eventId}`}>
              <Button variant="outline" className="border-2">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold gap-2 disabled:opacity-50"
            >
              {saving ? "✨ Saving..." : "✨ Confirm & Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
