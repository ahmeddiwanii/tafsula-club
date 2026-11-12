"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import {
    Search, Plus, Trash2, Edit, Users, Mail, Phone, Building2,
    Contact, X, CheckCircle2, ExternalLink, Filter
} from "lucide-react"

interface ContactItem {
    id: string
    name: string
    email?: string
    phone?: string
    organization?: string
    role?: string
    description?: string
    howMet?: string
    tags?: string[]
    isGeneral: boolean
    addedBy: { id: string; name: string; email: string }
    createdAt: string
}

export default function HRContactsPage() {
    const { data: session } = useSession()
    const [contacts, setContacts] = useState<ContactItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<"all" | "general" | "personal">("all")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", organization: "",
        role: "", description: "", howMet: "", isGeneral: true,
    })

    const fetchContacts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/contacts?search=${search}`)
            if (res.ok) {
                const data = await res.json()
                setContacts(data.contacts || [])
            }
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { fetchContacts() }, [])

    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 300)
        return () => clearTimeout(timer)
    }, [search])

    const handleSubmit = async () => {
        if (!formData.name.trim()) return
        try {
            if (editingId) {
                const res = await fetch("/api/contacts", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...formData }),
                })
                if (res.ok) {
                    const data = await res.json()
                    setContacts(contacts.map(c => c.id === editingId ? data.contact : c))
                }
            } else {
                const res = await fetch("/api/contacts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                })
                if (res.ok) {
                    const data = await res.json()
                    setContacts([data.contact, ...contacts])
                }
            }
            resetForm()
        } catch { }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/contacts?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setContacts(contacts.filter(c => c.id !== id))
                setDeleteConfirm(null)
            }
        } catch { }
    }

    const startEdit = (contact: ContactItem) => {
        setEditingId(contact.id)
        setFormData({
            name: contact.name, email: contact.email || "", phone: contact.phone || "",
            organization: contact.organization || "", role: contact.role || "",
            description: contact.description || "", howMet: contact.howMet || "",
            isGeneral: contact.isGeneral,
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: "", email: "", phone: "", organization: "", role: "", description: "", howMet: "", isGeneral: true })
    }

    const filtered = contacts.filter(c => {
        if (filterType === "general") return c.isGeneral
        if (filterType === "personal") return !c.isGeneral
        return true
    })

    const stats = {
        total: contacts.length,
        general: contacts.filter(c => c.isGeneral).length,
        personal: contacts.filter(c => !c.isGeneral).length,
    }

    return (
        <HRLayout orgName={session?.user?.name || "Organization"}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Contacts</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your organization's network</p>
                    </div>
                    <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-blue-600 hover:bg-blue-700 gap-1.5" size="sm">
                        <Plus className="w-4 h-4" /> Add Contact
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total", value: stats.total, icon: Contact, color: "blue" },
                        { label: "Organization", value: stats.general, icon: Building2, color: "emerald" },
                        { label: "Personal", value: stats.personal, icon: Users, color: "amber" },
                    ].map(s => (
                        <Card key={s.label} className="border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500">{s.label}</span>
                                    <s.icon className={`w-4 h-4 text-${s.color}-500`} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white" />
                    </div>
                    <div className="flex gap-1.5">
                        {(["all", "general", "personal"] as const).map(f => (
                            <button key={f} onClick={() => setFilterType(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                                {f === "all" ? "All" : f === "general" ? "Org List" : "Personal"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">{editingId ? "Edit Contact" : "Add New Contact"}</h3>
                                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium">Name *</Label>
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contact name" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 890" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Organization</Label>
                                        <Input value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} placeholder="Company name" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Role/Title</Label>
                                        <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. CEO, Sponsor" className="mt-1" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium">How did you meet?</Label>
                                        <Input value={formData.howMet} onChange={e => setFormData({ ...formData, howMet: e.target.value })} placeholder="e.g. Tech conference 2025, LinkedIn" className="mt-1" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium">Description / Notes</Label>
                                        <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What can this contact help with? Any important details..." rows={3} className="mt-1" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.isGeneral} onChange={e => setFormData({ ...formData, isGeneral: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Add to organization-wide contact list</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 ml-6">General contacts are visible to all HR managers, even future ones</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" disabled={!formData.name.trim()}>
                                    {editingId ? "Save Changes" : "Add Contact"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts Grid */}
                {loading ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="py-16 text-center">
                            <Contact className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">No contacts found</p>
                            <p className="text-xs text-gray-400 mt-1">{search ? "Try adjusting your search" : "Add your first contact"}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(contact => (
                            <Card key={contact.id} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white group">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-blue-600">{contact.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">{contact.name}</h4>
                                                {contact.isGeneral && (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Org</Badge>
                                                )}
                                            </div>
                                            {contact.organization && <p className="text-xs text-gray-600 flex items-center gap-1"><Building2 className="w-3 h-3" />{contact.organization}</p>}
                                            {contact.role && <p className="text-xs text-gray-400">{contact.role}</p>}
                                            <div className="flex flex-col gap-0.5 mt-1.5">
                                                {contact.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{contact.email}</p>}
                                                {contact.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{contact.phone}</p>}
                                            </div>
                                            {contact.howMet && <p className="text-xs text-blue-500 mt-1.5 italic">🤝 {contact.howMet}</p>}
                                            {contact.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{contact.description}</p>}
                                            <p className="text-[10px] text-gray-300 mt-2">Added by {contact.addedBy.name}</p>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex gap-1.5 mt-3 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs text-gray-500 hover:text-blue-600" onClick={() => startEdit(contact)}>
                                            <Edit className="w-3 h-3 mr-1" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs text-gray-500 hover:text-red-600" onClick={() => setDeleteConfirm(contact.id)}>
                                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delete confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Contact?</h3>
                            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirm)} className="gap-1.5">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HRLayout>
    )
}
