"use client"

import Link from "next/link"
import { PublicShell } from "@/components/brand/public-shell"
import { LogoWordmark } from "@/components/brand/logo"
import { BrandFigure } from "@/components/brand/figures"

export default function ContactPage() {
  return (
    <PublicShell>
      <article className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <div className="mb-6">
            <LogoWordmark href={null} compact className="h-11" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-pomegranate">Contact</p>
          </div>
          <h1 className="font-display text-4xl text-soot" style={{ fontFamily: "Fraunces, serif" }}>
            A human on the other side of the door.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-soot/65">
            Listing a club, a partnership, or a stuck account — write{" "}
            <a href="mailto:hello@tafsula.app" className="font-semibold text-pomegranate">
              hello@tafsula.app
            </a>
            .
          </p>
          <p className="mt-4 text-sm text-soot/50">If you already have a bureau, start with them. They hold the keys to invites and nights.</p>
          <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-soot">
            ← Home
          </Link>
        </div>
        <BrandFigure id="peek" className="mx-auto max-w-sm" />
      </article>
    </PublicShell>
  )
}
