"use client"

import Link from "next/link"
import Image from "next/image"

const LOGO_SRC = "/brand/logo-nav.png"

/** Compact brand mark — always the latest Tafsula wordmark + mascot */
export function LogoMark({
  className = "h-10",
  title = "Tafsula",
  animated = false,
}: {
  className?: string
  title?: string
  /** kept for API compat; spin removed for the wordmark */
  animated?: boolean
}) {
  void animated
  return (
    <span className={`relative inline-flex items-center ${className}`} title={title}>
      <Image
        src={LOGO_SRC}
        alt={title}
        width={888}
        height={341}
        priority
        className="h-full w-auto max-w-none object-contain"
      />
    </span>
  )
}

/** Full wordmark for navbars and sidebars */
export function LogoWordmark({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string | null
  light?: boolean
  compact?: boolean
  className?: string
}) {
  const sizeClass = className.includes("h-")
    ? ""
    : compact
      ? "h-9 sm:h-11"
      : "h-11 sm:h-14"
  const word = (
    <Image
      src={LOGO_SRC}
      alt="Tafsula"
      width={888}
      height={341}
      priority
      className={`w-auto object-contain ${sizeClass} ${className}`.trim()}
    />
  )
  if (!href) return word
  return (
    <Link href={href} className="inline-flex shrink-0 no-underline hover:opacity-90">
      {word}
    </Link>
  )
}
