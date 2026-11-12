"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, Mail, User, Phone, Globe, FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function JoinOrganizationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      orgName: formData.get("orgName"),
      orgType: formData.get("orgType"),
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      description: formData.get("description"),
      websiteUrl: formData.get("websiteUrl"),
    }

    try {
      const response = await fetch("/api/organizations/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Request submitted successfully!")
      } else {
        toast.error("Failed to submit request. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-jasmine p-4 text-soot">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 font-space">Application Received!</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Thank you for your interest in joining Tafsula. Our team will review your application and reach out to the provided contact email within 1-2 business days.
          </p>
          <Link href="/">
            <Button className="w-full bg-white text-black hover:bg-white/90 rounded-xl py-6 font-medium">
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-jasmine text-soot">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition mb-12">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column: Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Organizations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-space">
              Join the Network of <br />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Tunisian Youth</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-10">
              Tafsula is the ultimate platform for Tunisian clubs, associations, and NGOs. Discover talent based on personality, host events, and collaborate on a national scale.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "Team Compatibility Analytics",
                  desc: "Invite members, build teams for events, and keep everyone in sync.",
                  icon: User,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10"
                },
                {
                  title: "Event Management",
                  desc: "Host workshops, trainings, and conferences with built-in QR code attendance.",
                  icon: Globe,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10"
                },
                {
                  title: "Cross-Club Collaboration",
                  desc: "Connect with other organizations across Tunisia to co-host events and projects.",
                  icon: Building2,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10"
                }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/50">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md"
          >
            <h2 className="text-2xl font-semibold mb-6">Partner Application</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-white/70">Organization Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input id="orgName" name="orgName" required className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="e.g. AIESEC Tunisia" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgType" className="text-white/70">Organization Type</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input id="orgType" name="orgType" className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="e.g. NGO, University Club, Enterprise" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-white/70">Contact Person *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input id="contactName" name="contactName" required className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="Full Name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-white/70">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input id="contactPhone" name="contactPhone" className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="+216 XX XXX XXX" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-white/70">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input id="contactEmail" name="contactEmail" type="email" required className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="contact@organization.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/70">Why do you want to join Tafsula? *</Label>
                <div className="relative">
                  <Textarea 
                    id="description" 
                    name="description" 
                    required 
                    className="min-h-[120px] bg-black/20 border-white/10 text-white focus:border-emerald-500/50 resize-y" 
                    placeholder="Tell us a bit about your organization and what you hope to achieve on the platform..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl" className="text-white/70">Website / Social Media Link</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input id="websiteUrl" name="websiteUrl" className="pl-10 bg-black/20 border-white/10 text-white focus:border-emerald-500/50" placeholder="https://..." />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-xl py-6 font-medium text-base shadow-lg shadow-emerald-500/20 group"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    Submit Application
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
