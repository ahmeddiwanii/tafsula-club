"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { UserNav } from "./user-nav"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { LogoWordmark } from "@/components/brand/logo"

export function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <LogoWordmark href="/" compact className="h-10" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/about">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              About
            </Button>
          </Link>
          <Link href="/organizations">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              Organizations
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              Pricing
            </Button>
          </Link>
        </nav>

        {/* User Navigation & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <UserNav />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-2">
          <Link href="/about">
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              About
            </Button>
          </Link>
          <Link href="/organizations">
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              Organizations
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              Pricing
            </Button>
          </Link>
          <div className="pt-2 border-t">
            <UserNav />
          </div>
        </div>
      )}
    </header>
  )
}
