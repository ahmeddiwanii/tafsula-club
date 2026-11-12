"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { OrganizationCard } from "../../components/organization-card"
import { PublicShell } from "@/components/brand/public-shell"
import { BrandFigure } from "@/components/brand/figures"
import { LogoWordmark } from "@/components/brand/logo"
import { landingCopy } from "@/lib/landing-copy"
import { useLocale } from "@/lib/i18n/locale-context"

interface OrganizationData {
  id: string
  name: string
  organizationProfile?: { profileImageUrl?: string; bio?: string; location?: string; isPublic: boolean }
  _count?: { user: number; event: number; project: number }
}

export default function OrganizationsPage() {
  const { locale, t } = useLocale()
  const copy = landingCopy[locale]
  const display = { fontFamily: "Fraunces, serif" }
  const [organizations, setOrganizations] = useState<OrganizationData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/organizations?page=${page}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        setOrganizations(d.organizations || [])
        setPages(d.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const filtered = organizations.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-8 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border-[2.5px] border-soot bg-[#F3DFA0] px-3.5 py-1 text-[12px] font-bold text-soot shadow-[2px_3px_0_0_#161210]">
            {copy.clubsKicker}
          </p>
          <h1 className="font-display text-4xl leading-tight text-soot sm:text-5xl" style={display}>
            {copy.clubsTitle}
            <em className="italic" style={{ color: "#C45C4A" }}>
              {copy.clubsAccent}
            </em>
          </h1>
          <p className="mt-4 max-w-lg text-soot/65">{copy.clubsSub}</p>
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soot/35" />
            <input
              placeholder={copy.clubsSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-full border-[2.5px] border-soot bg-jasmine pl-11 pr-4 text-soot placeholder:text-soot/35 focus:outline-none"
            />
          </div>
        </div>
        <BrandFigure id="seek" className="mx-auto max-w-sm" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[1.6rem] border-[2.5px] border-soot/20 bg-plaster" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-soot/50">
              {filtered.length} {locale === "fr" ? "portes ouvertes" : locale === "ar" ? "أبواب مفتوحة" : "open doors"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((organization, i) => (
                <OrganizationCard
                  key={organization.id}
                  id={organization.id}
                  name={organization.name}
                  profile={organization.organizationProfile}
                  _count={organization._count}
                  index={i}
                />
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: Math.min(5, pages) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-10 w-10 rounded-full border-[2px] border-soot text-sm font-semibold ${
                      page === i + 1 ? "bg-soot text-jasmine" : "bg-jasmine text-soot"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <BrandFigure id="peek" className="mx-auto mb-4 max-w-[180px]" />
            <p className="font-display text-xl text-soot" style={display}>
              {locale === "fr" ? "Pas encore cette porte." : locale === "ar" ? "لا باب بعد." : "That door isn’t here yet."}
            </p>
          </div>
        )}
      </section>

      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 rounded-[2rem] border-[3px] border-soot bg-[#C9E4D8] px-6 py-12 text-center shadow-[5px_7px_0_0_#161210] sm:flex-row sm:text-left">
          <BrandFigure id="work" className="max-w-[160px] shrink-0" />
          <div className="flex-1">
            <h2 className="font-display text-2xl text-soot" style={display}>
              {locale === "fr" ? "Tu tiens un club ? Tiens la porte ouverte." : locale === "ar" ? "تدير ناديًا؟ أبقِ الباب مفتوحًا." : "You run a club? Keep the door open."}
            </h2>
            <p className="mt-2 text-sm text-soot/65">
              {locale === "fr"
                ? "Pour que la jeunesse ait où atterrir — pas pour remplir un tableau de bord."
                : "So youth have somewhere to land — not so a dashboard looks full."}
            </p>
          </div>
          <Link href="/organizations/join" className="rounded-full bg-soot px-5 py-2.5 text-sm font-semibold text-jasmine no-underline">
            {t("cta.joinClub")}
          </Link>
        </div>
      </section>

      <footer className="border-t-[3px] border-soot/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6">
          <LogoWordmark href={null} compact className="h-8" />
          <p className="text-sm text-soot/45">{copy.footer}</p>
        </div>
      </footer>
    </PublicShell>
  )
}
