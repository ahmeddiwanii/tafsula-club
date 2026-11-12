"use client"

import React from "react"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { TopNavbar } from "@/components/top-navbar"
import { usePathname } from "next/navigation"
import { LocaleProvider } from "@/lib/i18n/locale-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const publicPages = ["/", "/colors", "/events", "/organizations", "/about", "/privacy", "/terms", "/contact"]
  const isPublicPage =
    publicPages.includes(pathname) ||
    pathname.startsWith("/events/") ||
    pathname.startsWith("/organizations/") ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/check-in/")
  const isAuthPage = pathname.startsWith("/auth")
  const isHRDashboard = pathname.startsWith("/dashboard/hr")
  const isMemberDashboard = pathname.startsWith("/dashboard/member")
  const isAdminDashboard = pathname.startsWith("/dashboard/admin")
  const isFullBleedPage =
    isPublicPage || isAuthPage || isHRDashboard || isMemberDashboard || isAdminDashboard

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Tafsula — Your next opportunity is a door, not a rumor</title>
        <meta name="description" content="Tafsula helps Tunisian youth find real opportunities — clubs, events, teams, work they can show. Clubs keep the doors open." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600;1,9..144,700&family=Noto+Naskh+Arabic:wght@500;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-soot font-sans antialiased text-jasmine" style={{ fontFamily: "Figtree, 'Noto Sans Arabic', sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SessionProvider>
            <LocaleProvider>
              <Toaster richColors position="top-center" />
              {!isFullBleedPage && <TopNavbar />}
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">
                  {isFullBleedPage ? (
                    children
                  ) : (
                    <div className="container relative">{children}</div>
                  )}
                </main>
              </div>
            </LocaleProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
