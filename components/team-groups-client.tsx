"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Plus, Trash2, Save, Crown, User, Mail, Award } from "lucide-react"
import { useToast } from "./ui/use-toast"

interface Member {
  id: string
  name: string
  email: string
  profile?: {
    headline?: string
    bio?: string
  }
  result?: Array<{
    dominantType: string
  }>
}

interface TeamGroup {
  id: string
  name: string
  chef?: Member
  members: Member[]
}

const INITIAL_GROUPS: TeamGroup[] = [
  { id: "1", name: "Group 1", members: [], chef: undefined },
  { id: "2", name: "Group 2", members: [], chef: undefined },
  { id: "3", name: "Group 3", members: [], chef: undefined },
]

interface TeamGroupsClientProps {
  members: Member[]
  organizationId: string
}

export default function TeamGroupsClient({ members: initialMembers, organizationId }: TeamGroupsClientProps) {
  const [groups, setGroups] = useState<TeamGroup[]>(INITIAL_GROUPS)
  const [unassignedMembers, setUnassignedMembers] = useState<Member[]>(initialMembers)
  const [draggedMember, setDraggedMember] = useState<Member | null>(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Drag & Drop Handlers
  const handleDragStart = (member: Member, source: string) => {
    setDraggedMember(member)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnGroup = (groupId: string) => {
    if (!draggedMember) return

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          // Check if member is already in this group
          if (group.members.some((m) => m.id === draggedMember.id)) {
            return group
          }
          return {
            ...group,
            members: [...group.members, draggedMember],
          }
        }
        // Remove from other groups
        return {
          ...group,
          members: group.members.filter((m) => m.id !== draggedMember.id),
          chef: group.chef?.id === draggedMember.id ? undefined : group.chef,
        }
      })
    )

    // Remove from unassigned
    setUnassignedMembers((prev) => prev.filter((e) => e.id !== draggedMember.id))
    setDraggedMember(null)
  }

  const handleDropOnUnassigned = () => {
    if (!draggedMember) return

    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        members: group.members.filter((m) => m.id !== draggedMember.id),
        chef: group.chef?.id === draggedMember.id ? undefined : group.chef,
      }))
    )

    if (!unassignedMembers.some((e) => e.id === draggedMember.id)) {
      setUnassignedMembers((prev) => [...prev, draggedMember])
    }
    setDraggedMember(null)
  }

  const setChef = (groupId: string, member: Member) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, chef: group.chef?.id === member.id ? undefined : member }
          : group
      )
    )
  }

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((m) => m.id !== memberId),
              chef: group.chef?.id === memberId ? undefined : group.chef,
            }
          : group
      )
    )

    const member = initialMembers.find((e) => e.id === memberId)
    if (member && !unassignedMembers.some((e) => e.id === memberId)) {
      setUnassignedMembers((prev) => [...prev, member])
    }
  }

  const addNewGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: TeamGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      members: [],
      chef: undefined,
    }

    setGroups((prev) => [...prev, newGroup])
    setNewGroupName("")
    setShowNewGroupDialog(false)
  }

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => {
      const groupToDelete = prev.find((g) => g.id === groupId)
      if (groupToDelete) {
        // Move members back to unassigned
        setUnassignedMembers((current) => [...current, ...groupToDelete.members])
      }
      return prev.filter((g) => g.id !== groupId)
    })
  }

  const saveGroupConfiguration = async () => {
    // Validate that each group with members has a chef
    const invalidGroups = groups.filter((g) => g.members.length > 0 && !g.chef)
    if (invalidGroups.length > 0) {
      toast({
        title: "Validation Error",
        description: `Groups "${invalidGroups.map((g) => g.name).join(", ")}" need at least one Chef d'équipe`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/teams/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          groups: groups.map((g) => ({
            id: g.id,
            name: g.name,
            chefId: g.chef?.id,
            memberIds: g.members.map((m) => m.id),
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to save groups")

      toast({
        title: "Success",
        description: "Team groups saved successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save groups",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Unassigned Members */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent">
          <CardTitle className="text-lg">Unassigned Members</CardTitle>
          <CardDescription>Drag members from here to groups below</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnUnassigned}
            className="min-h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:bg-gray-100"
          >
            {unassignedMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">All members assigned!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {unassignedMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onDragStart={handleDragStart}
                    isUnassigned
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Team Groups</h2>
          <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Enter a name for the new team group</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="e.g., Marketing Team, Product Team"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNewGroup()}
                  autoFocus
                />
                <Button onClick={addNewGroup} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnGroup(group.id)}
              onDragStart={handleDragStart}
              onSetChef={(emp) => setChef(group.id, emp)}
              onRemoveMember={(empId) => removeMemberFromGroup(group.id, empId)}
              onDelete={() => deleteGroup(group.id)}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-6">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Discard Changes
        </Button>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={saveGroupConfiguration}
          disabled={isSaving}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  )
}

function MemberCard({
  member,
  onDragStart,
  isUnassigned,
}: {
  member: Member
  onDragStart: (emp: Member, source: string) => void
  isUnassigned?: boolean
}) {
  const discType = member.result?.[0]?.dominantType

  return (
    <div
      draggable
      onDragStart={() => onDragStart(member, isUnassigned ? "unassigned" : "group")}
      className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{member.name}</p>
          <p className="text-xs text-gray-500 truncate">{member.email}</p>
          {member.profile?.headline && (
            <p className="text-xs text-gray-600 mt-1 truncate">{member.profile.headline}</p>
          )}
        </div>
        {discType && (
          <Badge className="bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
            {discType}
          </Badge>
        )}
      </div>
    </div>
  )
}

function GroupCard({
  group,
  onDragOver,
  onDrop,
  onDragStart,
  onSetChef,
  onRemoveMember,
  onDelete,
}: {
  group: TeamGroup
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragStart: (emp: Member, source: string) => void
  onSetChef: (emp: Member) => void
  onRemoveMember: (empId: string) => void
  onDelete: () => void
}) {
  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription>{group.members.length} members</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="min-h-32 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-dashed border-blue-200 p-4 transition-colors hover:border-blue-400"
        >
          {group.members.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-blue-200 mx-auto mb-2" />
              <p className="text-blue-600 font-medium text-sm">Drag members here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-start justify-between group/member hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900">{member.name}</p>
                      {group.chef?.id === member.id && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs gap-1">
                          <Crown className="w-3 h-3" />
                          Chef
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                    {group.chef?.id !== member.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetChef(member)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Crown className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {group.members.length > 0 && !group.chef && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  ⚠️ This group needs a Chef d'équipe (team leader)
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
