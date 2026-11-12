"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { UserNav } from "@/components/user-nav"
import { LocaleSwitcher, useLocale } from "@/lib/i18n/locale-context"
import { LogoWordmark } from "@/components/brand/logo"

export function PublicShell({
  children,
  dark = false,
  cinematic = false,
}: {
  children: ReactNode
  dark?: boolean
  cinematic?: boolean
}) {
  const { data: session, status } = useSession()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])
  const showAccount = mounted && status !== "loading"
  const lightNav = dark

  const links = [
    { href: "/organizations", label: t("nav.clubs") },
    { href: "/events", label: t("nav.events") },
    { href: "/about", label: t("nav.about") },
  ]

  return (
    <div className={`relative min-h-screen ${cinematic || dark ? "bg-[#07080c] text-jasmine" : "bg-jasmine text-soot"}`}>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b-[3px] transition-shadow duration-300 ${
          lightNav ? "border-white/10 bg-soot text-jasmine" : "border-soot bg-jasmine text-soot"
        } ${scrolled ? "shadow-[0_10px_30px_rgba(22,18,16,0.16)]" : ""}`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6">
          <LogoWordmark compact />
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[15px] font-medium no-underline ${
                  lightNav ? "text-jasmine/75 hover:text-jasmine" : "text-soot/70 hover:text-soot"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher inverted={lightNav} className="hidden sm:inline-flex" />
            {showAccount && session ? (
              <UserNav variant={lightNav ? "dark" : "light"} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`hidden text-[14px] font-medium no-underline sm:block ${lightNav ? "text-jasmine/80 hover:text-jasmine" : "text-soot/70 hover:text-soot"}`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/organizations"
                  className={
                    lightNav
                      ? "hidden rounded-full bg-jasmine px-5 py-2.5 text-[13px] font-semibold text-soot no-underline sm:inline-flex"
                      : "hidden rounded-full bg-soot px-5 py-2.5 text-[13px] font-semibold text-jasmine no-underline shadow-[3px_4px_0_0_#9C1C28] sm:inline-flex"
                  }
                >
                  {t("cta.exploreClubs")}
                </Link>
              </>
            )}
            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-[2px] md:hidden ${
                lightNav ? "border-white/20" : "border-soot"
              }`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div
            className={`border-t-[2px] px-4 py-4 md:hidden ${
              lightNav ? "border-white/10 bg-soot" : "border-soot/10 bg-jasmine"
            }`}
          >
            <div className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-xl px-3 py-3 text-[15px] font-medium no-underline"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-soot/10 pt-4">
              <LocaleSwitcher inverted={lightNav} />
              {!session && (
                <>
                  <Link
                    href="/auth/login"
                    className={`text-sm font-medium no-underline ${lightNav ? "text-jasmine/80" : "text-soot/70"}`}
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/organizations"
                    className={
                      lightNav
                        ? "rounded-full bg-jasmine px-4 py-2 text-[13px] font-semibold text-soot no-underline"
                        : "rounded-full bg-soot px-4 py-2 text-[13px] font-semibold text-jasmine no-underline"
                    }
                    onClick={() => setOpen(false)}
                  >
                    {t("cta.exploreClubs")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="pt-16 sm:pt-20">{children}</div>
    </div>
  )
}
