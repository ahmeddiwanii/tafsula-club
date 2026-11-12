"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MemberLayout from "../../../../components/layout/member-layout"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Plus, Trash2, Edit, Mail, Phone, Building2,
    Contact, X, Users, Network, Activity, Globe, Zap
} from "lucide-react"

export default function MemberContactsPage() {
    const { data: session } = useSession()
    const [contacts, setContacts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", organization: "",
        role: "", description: "", howMet: "",
    })

    const fetchContacts = async () => {
        try {
            setLoading(true)
            // Fetch only contacts added by the current user
            const res = await fetch(`/api/contacts?search=${search}`)
            if (res.ok) {
                const data = await res.json()
                // Filter to only show contacts added by the current user
                const myContacts = (data.contacts || []).filter(
                    (c: any) => c.addedBy?.id === session?.user?.id
                )
                setContacts(myContacts)
            }
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { if (session?.user?.id) fetchContacts() }, [session?.user?.id])

    useEffect(() => {
        if (!session?.user?.id) return
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
                    body: JSON.stringify({ ...formData, isGeneral: false }),
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
            if (res.ok) { setContacts(contacts.filter(c => c.id !== id)); setDeleteConfirm(null) }
        } catch { }
    }

    const startEdit = (contact: any) => {
        setEditingId(contact.id)
        setFormData({
            name: contact.name, email: contact.email || "", phone: contact.phone || "",
            organization: contact.organization || "", role: contact.role || "",
            description: contact.description || "", howMet: contact.howMet || "",
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false); setEditingId(null)
        setFormData({ name: "", email: "", phone: "", organization: "", role: "", description: "", howMet: "" })
    }

    return (
        <MemberLayout>
            <div className="space-y-6 relative z-10 pb-12 w-full max-w-6xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            My <span className="text-blue-500">contacts</span>
                        </h1>
                        <p className="text-white/40 font-medium tracking-widest uppercase text-xs flex items-center gap-2">
                            <Network className="w-4 h-4" /> People you&apos;ve met
                        </p>
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setShowForm(true) }} 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border border-blue-500/30 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add contact
                    </Button>
                </motion.div>

                <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input 
                            placeholder="Search contacts..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl" 
                        />
                    </div>

                    {/* Contacts Grid */}
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-40 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                            <Globe className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest">No contacts yet</p>
                            <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Add a contact to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <AnimatePresence>
                                {contacts.map((contact: any, idx: number) => (
                                    <motion.div 
                                        key={contact.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-5 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all relative overflow-hidden backdrop-blur-xl flex flex-col"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <span className="text-lg font-black text-blue-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-bold text-white text-base truncate pr-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                                            {contact.name}
                                                        </h4>
                                                        {contact.isGeneral && (
                                                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-black tracking-widest w-max mt-1">
                                                                Shared list
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 relative z-10 flex-1">
                                            {(contact.organization || contact.role) && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                                    <span className="text-white/60 font-medium truncate">
                                                        {contact.role && <span className="text-white mr-1">{contact.role}</span>}
                                                        {<>{contact.role && contact.organization && "at "}{contact.organization}</>}
                                                    </span>
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                                    <span className="text-white/50 truncate">{contact.email}</span>
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                                    <span className="text-white/50">{contact.phone}</span>
                                                </div>
                                            )}
                                            {contact.howMet && (
                                                <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-white/5">
                                                    <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                    <span className="text-amber-500/80 italic font-medium line-clamp-1 truncate">
                                                        {contact.howMet}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="flex-1 h-10 sm:h-8 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 text-[10px] font-black uppercase tracking-widest" onClick={() => startEdit(contact)}>
                                                <Edit className="w-3 h-3 mr-1.5" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex-1 h-10 sm:h-8 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest" onClick={() => setDeleteConfirm(contact.id)}>
                                                <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Add/Edit Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-md z-10">
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {editingId ? "Edit contact" : "Add contact"}
                                    </h3>
                                    <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-white/40" />
                                    </button>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Name *</Label>
                                            <Input 
                                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                                placeholder="Contact Name" 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email</Label>
                                            <Input 
                                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                                placeholder="target@domain.net" 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone</Label>
                                            <Input 
                                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                                placeholder="+00 (00) 000-0000" 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Company</Label>
                                            <Input 
                                                value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} 
                                                placeholder="Megacorp Inc." 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Role</Label>
                                            <Input 
                                                value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                                placeholder="Director" 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">How you met</Label>
                                            <Input 
                                                value={formData.howMet} onChange={e => setFormData({ ...formData, howMet: e.target.value })} 
                                                placeholder="e.g. club event, conference" 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 h-12 rounded-xl" 
                                            />
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Notes</Label>
                                            <Textarea 
                                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Notes about this person..." 
                                                rows={4} 
                                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 rounded-xl resize-none" 
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <p className="text-[10px] text-blue-300/80 uppercase font-bold tracking-widest">
                                            Note: HR can move this contact to the company list.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="px-8 py-6 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end bg-black/20">
                                    <Button variant="ghost" onClick={resetForm} className="w-full sm:w-auto text-white/40 hover:text-white uppercase font-black tracking-widest text-[10px]">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white uppercase font-black tracking-widest text-[10px] h-10 px-8" disabled={!formData.name.trim()}>
                                        {editingId ? "Save changes" : "Add contact"}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete confirm */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                className="bg-[#0a0a0f] border border-red-500/30 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Delete contact?</h3>
                                <p className="text-sm text-white/40 mb-8">This cannot be undone.</p>
                                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto text-white/40 hover:text-white uppercase font-black tracking-widest text-[10px]">
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 uppercase font-black tracking-widest text-[10px]">
                                        Delete
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MemberLayout>
    )
}
