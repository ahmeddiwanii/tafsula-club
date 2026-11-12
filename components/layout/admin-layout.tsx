"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminTopNav } from "./admin-top-navbar"
import { UserRole } from "../../types/user"

interface AdminLayoutProps {
  children: React.ReactNode
  role: UserRole
}

export function AdminLayout({ children, role }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-jasmine text-soot selection:bg-pomegranate/30">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-fuchsia-600/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-pink-600/5 blur-[100px] rounded-full" />
      </div>

      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="md:ml-64 min-h-screen relative z-10 flex flex-col">
        <AdminTopNav 
          onMenuAction={() => setIsSidebarOpen(true)} 
        />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
