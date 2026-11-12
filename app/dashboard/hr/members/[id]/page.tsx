"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "../../../../../components/layout/hr-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Button } from "../../../../../components/ui/button"
import { Badge } from "../../../../../components/ui/badge"
import { Input } from "../../../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs"
import { UserAvatar } from "../../../../../components/user-avatar"
import {
  ArrowLeft, User, BarChart2, BookOpen, Mail, Calendar, Clock,
  CheckCircle2, Users, Shield, Contact, Plus, ExternalLink, Star,
  ClipboardList, AlertCircle, Briefcase, Phone, Building2
} from "lucide-react"
import { format } from "date-fns"

interface MemberDetailsProps {
  params: Promise<{ id: string }>
}

export default function MemberDetailsPage({ params }: MemberDetailsProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [member, setMember] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [featureAccess, setFeatureAccess] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [importingContacts, setImportingContacts] = useState(false)

  // Delegation toggles
  const [delegating, setDelegating] = useState<string | null>(null)
  const [deciding, setDeciding] = useState<"ACCEPTED" | "REJECTED" | null>(null)

  useEffect(() => {
    fetchAll()
  }, [resolvedParams.id])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [empRes, resultRes, contactsRes, delegationRes] = await Promise.all([
        fetch(`/api/users?userId=${resolvedParams.id}`),
        fetch(`/api/results/${resolvedParams.id}`),
        fetch(`/api/contacts?addedById=${resolvedParams.id}`),
        fetch(`/api/delegation?userId=${resolvedParams.id}`),
      ])

      if (empRes.ok) {
        const empData = await empRes.json()
        setMember(Array.isArray(empData) ? empData[0] : empData)
      }
      if (resultRes.ok) {
        const resultData = await resultRes.json()
        setResult(resultData.result)
      }
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json()
        setContacts(contactsData.contacts || [])
      }
      if (delegationRes.ok) {
        const delData = await delegationRes.json()
        setFeatureAccess(delData.accesses || [])
      }
    } catch (err) {
      setError("Failed to load member data")
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (decision: "ACCEPTED" | "REJECTED") => {
    setDeciding(decision)
    try {
      const res = await fetch(`/api/hr/members/${resolvedParams.id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      if (res.ok) {
        await fetchAll()
      }
    } finally {
      setDeciding(null)
    }
  }

  const handleImportContacts = async () => {
    if (selectedContacts.length === 0) return
    setImportingContacts(true)
    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: selectedContacts }),
      })
      if (res.ok) {
        setContacts(contacts.map(c =>
          selectedContacts.includes(c.id) ? { ...c, isGeneral: true } : c
        ))
        setSelectedContacts([])
      }
    } catch { } finally {
      setImportingContacts(false)
    }
  }

  const handleToggleDelegation = async (feature: string) => {
    setDelegating(feature)
    const existing = featureAccess.find(a => a.feature === feature)
    try {
      if (existing) {
        await fetch(`/api/delegation?userId=${resolvedParams.id}&feature=${feature}`, { method: "DELETE" })
        setFeatureAccess(featureAccess.filter(a => a.feature !== feature))
      } else {
        const res = await fetch("/api/delegation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: resolvedParams.id, feature }),
        })
        if (res.ok) {
          const data = await res.json()
          setFeatureAccess([...featureAccess, data.access])
        }
      }
    } catch { } finally {
      setDelegating(null)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "D": return "from-red-500 to-red-600"
      case "I": return "from-amber-500 to-yellow-500"
      case "S": return "from-emerald-500 to-green-500"
      case "C": return "from-blue-500 to-blue-600"
      default: return "from-gray-400 to-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "D": return "Dominant"
      case "I": return "Influencer"
      case "S": return "Steadiness"
      case "C": return "Conscientious"
      default: return "Unknown"
    }
  }

  if (loading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex justify-center items-center py-24">
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
            <p className="text-gray-500">Loading member profile...</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  if (error || !member) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="p-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <p className="text-red-600">{error || "Member not found"}</p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    )
  }

  const features = ["EVENTS", "TASKS", "TEAMS", "PROPOSALS"]

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Button>

        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 md:p-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <UserAvatar avatarId={member.avatarId} name={member.name} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {member.name}
              </h1>
              <p className="text-white/60 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {member.email}
              </p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Badge className="bg-white/10 text-white/80 border-white/20">{member.role}</Badge>
                {member.memberStatus && (
                  <Badge className="bg-white/10 text-white/60 border-white/20">
                    Status: {member.memberStatus}
                  </Badge>
                )}
                {result && (
                  <Badge className={`bg-gradient-to-r ${getTypeColor(result.dominantType)} text-white border-0`}>
                    Type {result.dominantType} — {getTypeLabel(result.dominantType)}
                  </Badge>
                )}
                <Badge className="bg-white/10 text-white/60 border-white/20">
                  <Calendar className="w-3 h-3 mr-1" />
                  Joined {format(new Date(member.createdAt), "MMM yyyy")}
                </Badge>
              </div>
            </div>

            {member.memberStatus === "AWAITING_HR" && (
              <div className="flex gap-2 md:flex-col">
                <Button
                  onClick={() => handleDecision("ACCEPTED")}
                  disabled={!!deciding}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {deciding === "ACCEPTED" ? "Accepting..." : "Accept"}
                </Button>
                <Button
                  onClick={() => handleDecision("REJECTED")}
                  disabled={!!deciding}
                  variant="destructive"
                >
                  {deciding === "REJECTED" ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <BarChart2 className="w-4 h-4 hidden sm:block" /> Overview
            </TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <Contact className="w-4 h-4 hidden sm:block" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="delegation" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <Shield className="w-4 h-4 hidden sm:block" /> Access
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <Clock className="w-4 h-4 hidden sm:block" /> Activity
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {result ? (
              <>
                {/* DISC Scores */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-blue-600" /> DISC Assessment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Dominance", score: result.dScore, color: "red", key: "D" },
                        { label: "Influence", score: result.iScore, color: "amber", key: "I" },
                        { label: "Steadiness", score: result.sScore, color: "emerald", key: "S" },
                        { label: "Conscientiousness", score: result.cScore, color: "blue", key: "C" },
                      ].map(dim => (
                        <div key={dim.key} className={`p-4 rounded-xl border-2 transition-all ${result.dominantType === dim.key ? 'border-opacity-100 shadow-md' : 'border-opacity-20'}`}
                          style={{ borderColor: dim.color === 'red' ? '#ef4444' : dim.color === 'amber' ? '#f59e0b' : dim.color === 'emerald' ? '#10b981' : '#3b82f6' }}>
                          <div className="text-xs font-medium text-gray-500 mb-1">{dim.label} ({dim.key})</div>
                          <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: dim.color === 'red' ? '#dc2626' : dim.color === 'amber' ? '#d97706' : dim.color === 'emerald' ? '#059669' : '#2563eb' }}>
                            {dim.score.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                            <div className="h-2 rounded-full transition-all duration-500" style={{
                              width: `${dim.score}%`,
                              backgroundColor: dim.color === 'red' ? '#ef4444' : dim.color === 'amber' ? '#f59e0b' : dim.color === 'emerald' ? '#10b981' : '#3b82f6'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Personality Insights */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" /> Personality Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <h4 className="font-semibold text-blue-900 mb-2">💪 Strengths</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {result.dominantType === "D" && <><li>• Decisive leadership</li><li>• Results-oriented approach</li><li>• Direct communication</li></>}
                          {result.dominantType === "I" && <><li>• Excellent communication</li><li>• Enthusiastic team player</li><li>• Creative problem solver</li></>}
                          {result.dominantType === "S" && <><li>• Patient and supportive</li><li>• Reliable team member</li><li>• Strong listener</li></>}
                          {result.dominantType === "C" && <><li>• Analytical thinking</li><li>• Attention to detail</li><li>• Quality-focused work</li></>}
                        </ul>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <h4 className="font-semibold text-amber-900 mb-2">🌱 Growth Areas</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          {result.dominantType === "D" && <><li>• Practice active listening</li><li>• Consider others' feelings</li><li>• Allow time for analysis</li></>}
                          {result.dominantType === "I" && <><li>• Follow through on commitments</li><li>• Focus on details</li><li>• Structure and planning</li></>}
                          {result.dominantType === "S" && <><li>• Embrace change</li><li>• Assert boundaries</li><li>• Take initiative</li></>}
                          {result.dominantType === "C" && <><li>• Accept imperfection</li><li>• Take more risks</li><li>• Share opinions openly</li></>}
                        </ul>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <h4 className="font-semibold text-emerald-900 mb-2">🤝 Communication Style</h4>
                        <p className="text-sm text-emerald-800">
                          {result.dominantType === "D" && "Prefers direct, concise communication. Gets straight to the point and values efficiency."}
                          {result.dominantType === "I" && "Warm and expressive communicator. Uses stories and enthusiasm to convey ideas."}
                          {result.dominantType === "S" && "Calm and thoughtful communicator. Values harmony and asks clarifying questions."}
                          {result.dominantType === "C" && "Precise and data-driven communicator. Prefers written communication with facts."}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <h4 className="font-semibold text-purple-900 mb-2">🎯 Ideal Role Fit</h4>
                        <p className="text-sm text-purple-800">
                          {result.dominantType === "D" && "Best suited for leadership, project management, and strategic decision-making roles."}
                          {result.dominantType === "I" && "Thrives in public relations, sales, creative direction, and team motivation roles."}
                          {result.dominantType === "S" && "Excels in support, human resources, customer service, and team coordination roles."}
                          {result.dominantType === "C" && "Ideal for quality assurance, research, finance, and process improvement roles."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <BarChart2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-medium text-gray-500">Assessment not completed yet</p>
                  <p className="text-sm text-gray-400 mt-1">This member hasn't taken the DISC assessment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CONTACTS TAB */}
          <TabsContent value="contacts" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}'s Contacts</h3>
                <p className="text-sm text-gray-500">{contacts.length} contacts added by this member</p>
              </div>
              {selectedContacts.length > 0 && (
                <Button
                  onClick={handleImportContacts}
                  disabled={importingContacts}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Import {selectedContacts.length} to Org List
                </Button>
              )}
            </div>

            {contacts.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Contact className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-medium text-gray-500">No contacts yet</p>
                  <p className="text-sm text-gray-400 mt-1">This member hasn't added any contacts</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {contacts.map((contact: any) => (
                  <Card key={contact.id} className={`border shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedContacts.includes(contact.id) ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200' : 'border-gray-200'}`}
                    onClick={() => {
                      if (contact.isGeneral) return
                      setSelectedContacts(prev =>
                        prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id]
                      )
                    }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">{contact.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{contact.name}</h4>
                            {contact.isGeneral && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                In Org List
                              </Badge>
                            )}
                          </div>
                          {contact.organization && <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3" />{contact.organization}</p>}
                          {contact.role && <p className="text-xs text-gray-400">{contact.role}</p>}
                          {contact.email && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{contact.email}</p>}
                          {contact.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</p>}
                          {contact.howMet && <p className="text-xs text-blue-500 mt-1 italic">Met: {contact.howMet}</p>}
                          {contact.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{contact.description}</p>}
                        </div>
                        {!contact.isGeneral && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedContacts.includes(contact.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {selectedContacts.includes(contact.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* DELEGATION TAB */}
          <TabsContent value="delegation" className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Feature Access</h3>
              <p className="text-sm text-gray-500">Grant or revoke access to specific dashboard features for this member</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {features.map(feature => {
                const hasAccess = featureAccess.some(a => a.feature === feature)
                const isLoading = delegating === feature
                return (
                  <Card key={feature} className={`border shadow-sm transition-all ${hasAccess ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasAccess ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                            {feature === "EVENTS" && <Calendar className={`w-5 h-5 ${hasAccess ? 'text-emerald-600' : 'text-gray-400'}`} />}
                            {feature === "TASKS" && <ClipboardList className={`w-5 h-5 ${hasAccess ? 'text-emerald-600' : 'text-gray-400'}`} />}
                            {feature === "TEAMS" && <Users className={`w-5 h-5 ${hasAccess ? 'text-emerald-600' : 'text-gray-400'}`} />}
                            {feature === "PROPOSALS" && <Briefcase className={`w-5 h-5 ${hasAccess ? 'text-emerald-600' : 'text-gray-400'}`} />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900">{feature.charAt(0) + feature.slice(1).toLowerCase()} Management</h4>
                            <p className="text-xs text-gray-500">
                              {hasAccess ? "Access granted" : "No access"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleDelegation(feature)}
                          disabled={isLoading}
                          className={`relative w-12 h-6 rounded-full transition-all duration-200 ${hasAccess ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${hasAccess ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <Card className="border-0 bg-blue-50/50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-700">
                  <Shield className="w-4 h-4 inline mr-1.5" />
                  <strong>Note:</strong> Granting access allows this member to manage the corresponding feature in their dashboard as if they were an HR manager for that specific area.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY TAB */}
          <TabsContent value="activity" className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Overview of this member's platform activity</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Contact className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{contacts.length}</div>
                  <p className="text-xs text-gray-500">Contacts Added</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{featureAccess.length}</div>
                  <p className="text-xs text-gray-500">Features Delegated</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {result ? `${Math.max(result.dScore, result.iScore, result.sScore, result.cScore).toFixed(0)}%` : "—"}
                  </div>
                  <p className="text-xs text-gray-500">Peak DISC Score</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Activity timeline coming soon</p>
                <p className="text-xs mt-1">Task completions, event attendance, and more will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HRLayout>
  )
}
