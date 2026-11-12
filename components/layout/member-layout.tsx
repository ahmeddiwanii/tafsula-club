"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MemberSidebar } from "@/components/layout/member-sidebar"
import { MemberTopNav } from "@/components/layout/member-top-navbar"
import { OnboardingTour } from "@/components/onboarding-tour"

interface MemberLayoutProps {
  children: React.ReactNode
  orgName?: string
}

export default function MemberLayout({ children, orgName = "Organization" }: MemberLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [displayOrg, setDisplayOrg] = useState(orgName)
  const { status } = useSession()

  useEffect(() => {
    setDisplayOrg(orgName)
  }, [orgName])

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    fetch("/api/dashboard/member/profile-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.organization?.name) setDisplayOrg(data.organization.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [status])

  return (
    <div className="min-h-screen bg-[#07080c] text-[#F7F3EA] selection:bg-pomegranate/30">
      <OnboardingTour role="member" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#e85d4c]/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[35%] w-[35%] rounded-full bg-[#2a9d8f]/8 blur-[100px]" />
      </div>

      <MemberSidebar
        organizationName={displayOrg}
        isOpen={isSidebarOpen}
        setIsOpenAction={setIsSidebarOpen}
      />

      <main className="relative z-10 flex min-h-screen flex-col md:ml-64">
        <MemberTopNav
          organizationName={displayOrg}
          onMenuAction={() => setIsSidebarOpen(true)}
        />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
