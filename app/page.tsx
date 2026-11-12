"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight, DoorOpen, Heart, Play, Sparkles, Users } from "lucide-react"
import { PublicShell } from "@/components/brand/public-shell"
import { LogoWordmark } from "@/components/brand/logo"
import { BureauMock, MemberMock } from "@/components/brand/device-mocks"
import { BrandFigure } from "@/components/brand/figures"
import { InviteMascot } from "@/components/brand/invite-mascot"
import { landingCopy } from "@/lib/landing-copy"
import { useLocale } from "@/lib/i18n/locale-context"

export default function Home() {
  const { locale, t } = useLocale()
  const copy = landingCopy[locale]
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const display = { fontFamily: "Fraunces, serif" }

  return (
    <PublicShell cinematic>
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden text-white sm:min-h-[calc(100svh-5rem)]">
        {/* Mobile vertical portal — sky on top, scene below */}
        <img
          src="/brand/hero-portal-mobile.jpg"
          alt=""
          width={576}
          height={1024}
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none select-none object-cover object-[center_20%] md:hidden"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
        {/* Desktop wide portal */}
        <img
          src="/brand/hero-portal.png"
          alt=""
          width={3344}
          height={1882}
          className="pointer-events-none absolute inset-0 hidden h-full w-full max-w-none select-none object-cover object-center md:block"
          decoding="async"
          draggable={false}
        />

        {/* Readability scrims: keep copy in the dark sky on phones */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07080c]/80 via-[#07080c]/35 to-transparent md:from-black/25 md:via-transparent md:to-black/45" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#0a1020]/55 to-transparent md:hidden" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1280px] flex-col px-4 pb-6 pt-5 sm:min-h-[calc(100svh-5rem)] sm:px-8 sm:pb-6 sm:pt-10 lg:px-10 lg:pt-12">
          <motion.div
            className="w-full max-w-[22rem] sm:max-w-[32rem] lg:max-w-[34rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:mb-5 sm:text-[12px]">
              <span aria-hidden>🚀</span>
              <span className="truncate">{copy.kicker}</span>
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E31C23] text-[9px] leading-none" aria-hidden>
                🇹🇳
              </span>
            </p>

            <h1 className="text-white" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
              <span
                className="block text-[2.05rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-[3.35rem] lg:text-[3.85rem]"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {copy.heroLine1}
              </span>
              <span className="relative inline-block">
                <span
                  className="block text-[2.05rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-[3.35rem] lg:text-[3.85rem]"
                  style={{ fontFamily: "Figtree, sans-serif" }}
                >
                  {copy.heroLine2}
                </span>
                <svg
                  className="absolute -right-6 top-0.5 hidden h-5 w-5 sm:block sm:h-6 sm:w-6 lg:-right-8 lg:top-2"
                  viewBox="0 0 24 24"
                  fill="#E8B84A"
                  aria-hidden
                >
                  <path d="M12 0 13.8 8.6 22 12 13.8 15.4 12 24 10.2 15.4 2 12l8.2-3.4Z" />
                </svg>
              </span>
              <span
                className="mt-1 block text-[1.55rem] italic leading-[1.05] sm:text-[2.7rem] lg:text-[3.15rem]"
                style={{ fontFamily: "Fraunces, serif", color: "#E07A6A" }}
              >
                {copy.heroAccent}
              </span>
              <span
                className="block text-[1.55rem] italic leading-[1.05] text-white sm:text-[2.7rem] lg:text-[3.15rem]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {copy.heroAfter}
              </span>
            </h1>

            <p
              className="mt-3 hidden max-w-[26.5rem] text-[13.5px] leading-[1.55] text-white/85 sm:mt-5 sm:block sm:text-[14.5px]"
              style={{ textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
            >
              {copy.heroSub}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href="/organizations"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-pomegranate py-3 pl-3 pr-5 text-sm font-semibold text-white no-underline shadow-[0_0_28px_rgba(196,60,50,0.5)] sm:py-2.5 sm:pl-2.5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/25">
                  <ArrowRight className="h-4 w-4" />
                </span>
                {copy.ctaPrimary}
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-black/70 py-3 pl-3 pr-5 text-sm font-semibold text-white no-underline ring-1 ring-white/15 backdrop-blur-sm sm:bg-black/75 sm:py-2.5 sm:pl-2.5 sm:ring-white/10"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Play className="h-3 w-3 fill-white" />
                </span>
                {copy.ctaWatch}
              </a>
            </div>
          </motion.div>

          {/* Desktop / tablet stats stay in-hero; phones get them after the scene */}
          <div className="mt-auto hidden pb-2 pt-8 sm:block sm:pb-6">
            <div className="grid grid-cols-2 overflow-hidden rounded-[1.7rem] border border-white/12 bg-black/40 sm:grid-cols-4 sm:rounded-full">
              {copy.stats.map((s, i) => {
                const Icon = [Users, DoorOpen, Sparkles, Heart][i] ?? Users
                return (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.45 }}
                    className={`group flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-[1.15rem] ${
                      i > 0 ? "sm:border-l sm:border-white/10" : ""
                    }`}
                  >
                    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition group-hover:bg-amber-200/10 group-hover:ring-amber-200/30">
                      <Icon className="h-4 w-4 text-white/75 transition group-hover:text-amber-200" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[1.15rem] leading-none text-white" style={display}>
                        {s.n}
                      </p>
                      <p className="mt-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
                        {s.l}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-only stats strip — sits on cream, not over the portal characters */}
      <div className="bg-jasmine px-4 py-5 sm:hidden">
        <div className="grid grid-cols-2 gap-2.5">
          {copy.stats.map((s, i) => {
            const Icon = [Users, DoorOpen, Sparkles, Heart][i] ?? Users
            return (
              <div
                key={s.n}
                className="flex items-center gap-2.5 rounded-2xl border-[2px] border-soot bg-jasmine px-3 py-3 shadow-[3px_4px_0_0_#161210]"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soot/5 ring-1 ring-soot/15">
                  <Icon className="h-3.5 w-3.5 text-soot/70" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base leading-none text-soot" style={display}>
                    {s.n}
                  </p>
                  <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-soot/45">
                    {s.l}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative overflow-hidden bg-jasmine text-soot">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)", top: "-2%", left: "-8%" }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(241,178,74,0.16) 0%, transparent 70%)", top: "22%", right: "-6%" }}
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[450px] w-[450px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,167,125,0.12) 0%, transparent 70%)", top: "52%", left: "18%" }}
            animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[350px] w-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(31,119,180,0.14) 0%, transparent 70%)", bottom: "6%", right: "8%" }}
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex rounded-full border-[2px] border-soot px-3.5 py-1.5 text-[12px] font-semibold text-soot sm:mb-5">
            {copy.roomsKicker}
          </p>
          <h2 className="max-w-2xl font-display text-[1.85rem] leading-tight text-soot sm:text-5xl" style={display}>
            {copy.roomsTitle}
            <em className="italic" style={{ color: "#C45C4A" }}>
              {copy.roomsAccent}
            </em>
          </h2>
          <div className="mt-8 grid gap-5 sm:mt-14 sm:gap-8 lg:grid-cols-2">
            {copy.rooms.map((room, i) => (
              <article
                key={room.title}
                className="overflow-hidden rounded-[1.5rem] border-[3px] border-soot bg-jasmine shadow-[5px_7px_0_0_#161210] sm:rounded-[1.8rem]"
              >
                <div className={i === 0 ? "bg-[#F3C4B0]" : "bg-[#C9E4D8]"}>
                  <BrandFigure id={i === 0 ? "seek" : "work"} className="mx-auto max-w-[200px] px-5 py-3 sm:max-w-[240px] sm:px-6 sm:py-4" delay={i * 0.3} />
                </div>
                <div className="border-t-[3px] border-soot p-5 sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-soot/45">{room.kicker}</p>
                  <h3 className="mt-2 font-display text-xl text-soot sm:text-2xl" style={display}>
                    {room.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-soot/60">{room.body}</p>
                  <ul className="mt-4 space-y-2 text-sm text-soot/80 sm:mt-5">
                    {room.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-soot text-[9px] text-jasmine">
                          ✓
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={room.href}
                    className="mt-5 inline-flex rounded-full bg-soot px-5 py-2.5 text-sm font-semibold text-jasmine no-underline sm:mt-7"
                  >
                    {room.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pomegranate">{copy.howKicker}</p>
          <h2 className="mt-3 font-display text-[1.85rem] text-soot sm:text-4xl" style={display}>
            {copy.howTitle}
          </h2>
          <div className="mt-10 space-y-12 sm:mt-16 sm:space-y-20">
            {copy.howSteps.map((s, i) => {
              const fig = (["seek", "join", "work", "leap"] as const)[i]
              const reverse = i % 2 === 1
              return (
                <div
                  key={s.t}
                  className={`grid items-center gap-6 sm:gap-10 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <div>
                    <p className="font-display text-5xl leading-none text-soot/15 sm:text-6xl" style={display}>
                      0{i + 1}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-soot sm:text-3xl" style={display}>
                      {s.t}
                    </h3>
                    <p className="mt-3 max-w-md text-[14px] leading-relaxed text-soot/60 sm:text-[15px]">{s.d}</p>
                    <p className="mt-3 italic sm:mt-4" style={{ color: "#C45C4A", fontFamily: "Fraunces, serif" }}>
                      {copy.howAside[i] ?? copy.howAside[0]}
                    </p>
                  </div>
                  <div>
                    {i === 1 ? (
                      <InviteMascot className="mx-auto w-full max-w-[340px] sm:max-w-[460px]" />
                    ) : (
                      <BrandFigure id={fig} className="mx-auto max-w-[220px] sm:max-w-[280px]" delay={i * 0.2} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <h2 className="font-display text-[1.85rem] text-soot sm:text-4xl" style={display}>
            {copy.mockCaption}
          </h2>
          <div className="mt-8 grid items-start gap-8 sm:mt-12 sm:gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-soot/45">{copy.mockBureau}</p>
              <div className="overflow-hidden rounded-[1.6rem] border-[3px] border-soot shadow-[5px_7px_0_0_#161210]">
                <BureauMock />
              </div>
            </div>
            <div className="lg:mt-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-soot/45">{copy.mockMember}</p>
              <div className="overflow-hidden rounded-[1.6rem] border-[3px] border-soot shadow-[5px_7px_0_0_#161210]">
                <MemberMock />
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-14 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-[1.85rem] text-soot sm:text-3xl" style={display}>
              {copy.featuresTitle}
            </h2>
            <div className="mt-7 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {copy.features.map((f, i) => (
                <div
                  key={f.t}
                  className={`rounded-[1.4rem] border-[3px] border-soot bg-jasmine p-5 shadow-[4px_5px_0_0_#161210] ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <h3 className="font-display text-lg text-soot" style={display}>
                    {f.t}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-soot/60">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <h2 className="font-display text-[1.85rem] text-soot sm:text-3xl" style={display}>
            {copy.faqTitle}
          </h2>
          <div className="mt-6 divide-y divide-soot/10 rounded-[1.5rem] border-[3px] border-soot bg-jasmine px-4 shadow-[5px_7px_0_0_#161210] sm:mt-8 sm:rounded-[1.8rem] sm:px-5">
            {copy.faq.map((item, i) => (
              <button key={item.q} type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="block w-full py-4 text-left sm:py-5">
                <p className="font-display text-base text-soot sm:text-lg" style={display}>
                  {item.q}
                </p>
                {openFaq === i && <p className="mt-2 text-sm leading-relaxed text-soot/60">{item.a}</p>}
              </button>
            ))}
          </div>
        </section>

        <section className="relative px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.5rem] border-[3px] border-soot bg-jasmine px-5 py-12 text-center shadow-[5px_7px_0_0_#161210] sm:rounded-[1.8rem] sm:px-12 sm:py-16">
            <div className="relative mx-auto mb-2 max-w-[160px] sm:max-w-[200px]">
              <BrandFigure id="leap" delay={0.2} />
            </div>
            <h2 className="relative font-display text-[1.75rem] text-soot sm:text-4xl" style={display}>
              {copy.closeTitle}
              <em className="italic" style={{ color: "#C45C4A" }}>
                {copy.closeAccent}
              </em>
            </h2>
            <p className="relative mt-3 text-sm text-soot/60 sm:mt-4 sm:text-base">{copy.closeSub}</p>
            <div className="relative mt-6 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <Link
                href="/organizations"
                className="rounded-full bg-soot px-6 py-3 text-sm font-semibold text-jasmine no-underline"
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                href="/organizations/join"
                className="rounded-full border-[2px] border-soot bg-jasmine px-6 py-3 text-sm font-semibold text-soot no-underline"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        <footer className="relative border-t-[3px] border-soot/10 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <LogoWordmark href={null} compact className="h-9" />
              <p className="mt-2 max-w-sm text-sm text-soot/50">{copy.footer}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.privacy")}
              </Link>
              <Link href="/terms" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.terms")}
              </Link>
              <Link href="/contact" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.contact")}
              </Link>
              <Link href="/about" className="text-soot/50 no-underline hover:text-soot">
                {t("nav.about")}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PublicShell>
  )
}

