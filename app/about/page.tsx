"use client"

import Link from "next/link"
import { PublicShell } from "@/components/brand/public-shell"
import { LogoWordmark } from "@/components/brand/logo"
import { BRAND } from "@/lib/brand"
import { landingCopy } from "@/lib/landing-copy"
import { useLocale } from "@/lib/i18n/locale-context"

export default function About() {
  const { locale, t } = useLocale()
  const copy = landingCopy[locale]
  const display = { fontFamily: "Fraunces, serif" }

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-6">
          <LogoWordmark href={null} compact className="h-11" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-pomegranate">About</p>
        </div>
        <h1 className="font-display text-4xl text-soot sm:text-5xl" style={display}>
          {BRAND.name}
        </h1>
        <p className="mt-4 font-display text-xl text-soot/80" style={display}>
          {BRAND.tagline[locale]}
        </p>
        <p className="mt-6 text-base leading-relaxed text-soot/65">{BRAND.mission[locale]}</p>
        <p className="mt-4 text-base leading-relaxed text-soot/65">{copy.manifesto}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/organizations/join" className="rounded-full bg-soot px-5 py-3 text-sm font-semibold text-jasmine no-underline">
            {t("cta.joinClub")}
          </Link>
          <Link href="/organizations" className="rounded-full border-[2.5px] border-soot px-5 py-3 text-sm font-semibold text-soot no-underline">
            {t("cta.exploreClubs")}
          </Link>
        </div>
      </article>
    </PublicShell>
  )
}
