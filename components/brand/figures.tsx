"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

/** One chill dumpling character — same face, same line, every pose. Not people. */

const INK = "#161210"
const CREAM = "#FFF6E8"
const BODY = "#F6E3C4"
const BLUSH = "#F0B7A4"
const POM = "#9C1C28"
const TEAL = "#1F5C57"
const GOLD = "#C9891A"
const NIGHT = "#243056"

function Face({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <ellipse cx="-9" cy="-2" rx="3.2" ry="4" fill={INK} />
      <ellipse cx="9" cy="-2" rx="3.2" ry="4" fill={INK} />
      <ellipse cx="-16" cy="6" rx="6" ry="3.4" fill={BLUSH} opacity="0.85" />
      <ellipse cx="16" cy="6" rx="6" ry="3.4" fill={BLUSH} opacity="0.85" />
      <path d="M-7 10 Q0 16 7 10" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  )
}

function Star({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M16 0 L20 8 L16 12 L12 8 Z" fill={POM} />
      <path d="M32 16 L24 20 L20 16 L24 12 Z" fill={GOLD} />
      <path d="M16 32 L12 24 L16 20 L20 24 Z" fill={TEAL} />
      <path d="M0 16 L8 12 L12 16 L8 20 Z" fill={NIGHT} />
      <path d="M16 12 L20 16 L16 20 L12 16 Z" fill="#A65D32" />
    </g>
  )
}

/** Idle dumpling — used as peek / default. */
export function IlluPeek() {
  return (
    <svg viewBox="0 0 360 360" className="h-auto w-full" aria-hidden>
      <ellipse cx="180" cy="318" rx="78" ry="14" fill={INK} opacity="0.08" />
      <ellipse cx="180" cy="210" rx="92" ry="98" fill={BODY} stroke={INK} strokeWidth="5" />
      <ellipse cx="180" cy="128" rx="78" ry="80" fill={BODY} stroke={INK} strokeWidth="5" />
      <Face cx={180} cy={124} s={1.15} />
      <path d="M250 188 Q292 168 308 128" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <circle cx="318" cy="112" r="16" fill={GOLD} stroke={INK} strokeWidth="4" />
    </svg>
  )
}

export function IlluSeek() {
  return (
    <svg viewBox="0 0 360 360" className="h-auto w-full" aria-hidden>
      <ellipse cx="176" cy="322" rx="80" ry="14" fill={INK} opacity="0.08" />
      <ellipse cx="168" cy="214" rx="90" ry="96" fill={BODY} stroke={INK} strokeWidth="5" />
      <ellipse cx="168" cy="128" rx="76" ry="78" fill={BODY} stroke={INK} strokeWidth="5" />
      <Face cx={168} cy={122} />
      <path d="M248 200 Q300 176 318 132" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(286 88)">
        <Star x={0} y={0} s={1.15} />
      </g>
      <path d="M92 214 Q58 236 48 278" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function IlluJoin() {
  return (
    <svg viewBox="0 0 360 360" className="h-auto w-full" aria-hidden>
      <ellipse cx="186" cy="322" rx="78" ry="14" fill={INK} opacity="0.08" />
      <rect x="42" y="86" width="108" height="148" rx="22" fill={CREAM} stroke={INK} strokeWidth="4.5" />
      <rect x="58" y="108" width="76" height="12" rx="6" fill={POM} />
      <rect x="58" y="134" width="58" height="8" rx="4" fill={INK} opacity="0.12" />
      <rect x="58" y="154" width="44" height="8" rx="4" fill={INK} opacity="0.1" />
      <rect x="58" y="180" width="76" height="28" rx="10" fill={TEAL} stroke={INK} strokeWidth="3" />
      <ellipse cx="230" cy="210" rx="86" ry="92" fill={BODY} stroke={INK} strokeWidth="5" />
      <ellipse cx="230" cy="128" rx="72" ry="74" fill={BODY} stroke={INK} strokeWidth="5" />
      <Face cx={230} cy={122} />
      <path d="M300 176 Q332 150 338 112" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function IlluWork() {
  return (
    <svg viewBox="0 0 360 360" className="h-auto w-full" aria-hidden>
      <rect x="48" y="248" width="264" height="28" rx="10" fill="#E8D7B8" stroke={INK} strokeWidth="4" />
      <rect x="118" y="198" width="124" height="58" rx="12" fill={NIGHT} stroke={INK} strokeWidth="4" />
      <rect x="128" y="208" width="104" height="36" rx="6" fill={CREAM} />
      <rect x="142" y="220" width="40" height="8" rx="4" fill={POM} />
      <g transform="translate(40 78)">
        <ellipse cx="70" cy="118" rx="58" ry="62" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <ellipse cx="70" cy="62" rx="50" ry="52" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <Face cx={70} cy={58} s={0.85} />
      </g>
      <g transform="translate(188 62)">
        <ellipse cx="72" cy="124" rx="62" ry="66" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <ellipse cx="72" cy="64" rx="52" ry="54" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <Face cx={72} cy={60} s={0.9} />
      </g>
    </svg>
  )
}

export function IlluLeap() {
  return (
    <svg viewBox="0 0 360 360" className="h-auto w-full" aria-hidden>
      <ellipse cx="180" cy="328" rx="70" ry="12" fill={INK} opacity="0.08" />
      <g transform="rotate(-14 180 180)">
        <ellipse cx="176" cy="210" rx="86" ry="92" fill={BODY} stroke={INK} strokeWidth="5" />
        <ellipse cx="176" cy="124" rx="74" ry="76" fill={BODY} stroke={INK} strokeWidth="5" />
        <Face cx={176} cy={118} />
        <path d="M250 176 L318 128" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <circle cx="332" cy="116" r="18" fill={GOLD} stroke={INK} strokeWidth="4" />
        <path d="M108 230 Q78 268 92 304" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d="M232 236 Q268 274 292 292" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function IlluDoor() {
  return (
    <svg viewBox="0 0 520 400" className="h-auto w-full" aria-hidden>
      <rect width="520" height="400" fill={CREAM} />
      <rect x="168" y="36" width="184" height="248" rx="28" fill="#E8D7B8" stroke={INK} strokeWidth="5" />
      <rect x="188" y="56" width="144" height="208" rx="18" fill="#F3DFA0" stroke={INK} strokeWidth="4" />
      <circle cx="304" cy="168" r="10" fill={INK} />
      <g transform="translate(214 88)">
        <Star x={0} y={0} s={1.4} />
      </g>
      <g transform="translate(48 168)">
        <ellipse cx="70" cy="150" rx="62" ry="66" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <ellipse cx="70" cy="86" rx="52" ry="54" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <Face cx={70} cy={82} s={0.9} />
      </g>
      <g transform="translate(318 176)">
        <ellipse cx="74" cy="146" rx="64" ry="68" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <ellipse cx="74" cy="84" rx="54" ry="56" fill={BODY} stroke={INK} strokeWidth="4.5" />
        <Face cx={74} cy={80} s={0.92} />
        <path d="M128 110 Q168 92 176 58" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="184" cy="46" r="14" fill={POM} stroke={INK} strokeWidth="3.5" />
      </g>
    </svg>
  )
}

export function IlluCircle() {
  return (
    <svg viewBox="0 0 520 360" className="h-auto w-full" aria-hidden>
      <rect x="40" y="28" width="440" height="200" rx="28" fill={CREAM} stroke={INK} strokeWidth="5" />
      <rect x="68" y="56" width="140" height="14" rx="7" fill={GOLD} />
      <rect x="68" y="86" width="220" height="10" rx="5" fill={INK} opacity="0.12" />
      <g transform="translate(40 168) scale(0.72)">
        <ellipse cx="70" cy="118" rx="58" ry="62" fill={BODY} stroke={INK} strokeWidth="6" />
        <ellipse cx="70" cy="58" rx="48" ry="50" fill={BODY} stroke={INK} strokeWidth="6" />
        <Face cx={70} cy={56} s={0.9} />
      </g>
      <g transform="translate(168 148) scale(0.82)">
        <ellipse cx="70" cy="118" rx="58" ry="62" fill={BODY} stroke={INK} strokeWidth="6" />
        <ellipse cx="70" cy="58" rx="48" ry="50" fill={BODY} stroke={INK} strokeWidth="6" />
        <Face cx={70} cy={56} s={0.9} />
      </g>
      <g transform="translate(310 172) scale(0.7)">
        <ellipse cx="70" cy="118" rx="58" ry="62" fill={BODY} stroke={INK} strokeWidth="6" />
        <ellipse cx="70" cy="58" rx="48" ry="50" fill={BODY} stroke={INK} strokeWidth="6" />
        <Face cx={70} cy={56} s={0.9} />
      </g>
    </svg>
  )
}

const FIGURES = {
  door: IlluDoor,
  seek: IlluSeek,
  join: IlluJoin,
  work: IlluWork,
  leap: IlluLeap,
  circle: IlluCircle,
  peek: IlluPeek,
} as const

export type FigureId = keyof typeof FIGURES

export function PictureFrame({
  children,
  className = "",
  tone = "cream",
}: {
  children: ReactNode
  className?: string
  tone?: "peach" | "mint" | "gold" | "cream"
}) {
  const bg =
    tone === "peach"
      ? "bg-[#F3C4B0]"
      : tone === "mint"
        ? "bg-[#C9E4D8]"
        : tone === "gold"
          ? "bg-[#F3DFA0]"
          : "bg-[#F7F3EA]"
  return (
    <div className={`relative ${className}`}>
      <div className={`overflow-hidden rounded-[1.65rem] border-[3px] border-soot ${bg} shadow-[5px_7px_0_0_#161210]`}>
        {children}
      </div>
    </div>
  )
}

export function BrandFigure({
  id,
  className = "",
  float = true,
  delay = 0,
}: {
  id: FigureId
  className?: string
  float?: boolean
  delay?: number
  alt?: string
}) {
  const Fig = FIGURES[id]
  return (
    <motion.div
      className={`relative ${className}`}
      animate={float ? { y: [0, -10, 0], rotate: [-1.4, 1.6, -1.4] } : undefined}
      transition={float ? { duration: 3.8 + delay, repeat: Infinity, ease: "easeInOut", delay } : undefined}
    >
      <Fig />
    </motion.div>
  )
}

export function HeroDoorScene() {
  return (
    <div className="relative">
      <PictureFrame tone="cream">
        <IlluDoor />
      </PictureFrame>
      <motion.div
        className="absolute -bottom-6 -left-5 w-28 sm:w-32"
        animate={{ y: [0, -12, 0], rotate: [-8, 5, -8] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-full bg-[#F3C4B0] p-1 shadow-[4px_5px_0_0_#161210] ring-[3px] ring-soot">
          <IlluLeap />
        </div>
      </motion.div>
      <motion.div
        className="absolute -right-3 -top-5 hidden w-24 sm:block"
        animate={{ y: [0, 9, 0], rotate: [5, -6, 5] }}
        transition={{ duration: 3.9, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
      >
        <div className="rounded-full bg-[#C9E4D8] p-1 shadow-[4px_5px_0_0_#161210] ring-[3px] ring-soot">
          <IlluPeek />
        </div>
      </motion.div>
    </div>
  )
}
