import type { ReactNode } from "react"

export function PictureFrame({
  children,
  className = "",
  tone = "peach",
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

function Blob({
  x,
  y,
  fill,
  scale = 1,
  tilt = 0,
}: {
  x: number
  y: number
  fill: string
  scale?: number
  tilt?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} 40 70) scale(${scale})`}>
      <ellipse cx="40" cy="118" rx="34" ry="9" fill="#161210" opacity="0.1" />
      <ellipse cx="40" cy="86" rx="32" ry="36" fill={fill} stroke="#161210" strokeWidth="2.6" />
      <ellipse cx="40" cy="42" rx="26" ry="28" fill="#F4D2B6" stroke="#161210" strokeWidth="2.6" />
      <circle cx="31" cy="40" r="3.2" fill="#161210" />
      <circle cx="49" cy="40" r="3.2" fill="#161210" />
      <circle cx="32.4" cy="41.2" r="1" fill="#F7F3EA" />
      <circle cx="50.4" cy="41.2" r="1" fill="#F7F3EA" />
      <ellipse cx="24" cy="48" rx="5" ry="3.2" fill="#E8A090" opacity="0.85" />
      <ellipse cx="56" cy="48" rx="5" ry="3.2" fill="#E8A090" opacity="0.85" />
      <path d="M32 52 Q40 58 48 52" fill="none" stroke="#161210" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

export function HeroClubScene() {
  return (
    <svg viewBox="0 0 520 400" className="h-auto w-full" aria-hidden>
      <rect width="520" height="400" fill="#F7F3EA" />
      <rect x="36" y="36" width="292" height="196" rx="22" fill="#FFF8EE" stroke="#161210" strokeWidth="3" />
      <rect x="56" y="58" width="148" height="16" rx="8" fill="#9C1C28" />
      <rect x="56" y="90" width="210" height="9" rx="4.5" fill="#161210" opacity="0.12" />
      <rect x="56" y="110" width="168" height="9" rx="4.5" fill="#161210" opacity="0.1" />
      <rect x="56" y="140" width="72" height="56" rx="14" fill="#1F5C57" stroke="#161210" strokeWidth="2.2" />
      <rect x="140" y="140" width="72" height="56" rx="14" fill="#C9891A" stroke="#161210" strokeWidth="2.2" />
      <rect x="224" y="140" width="72" height="56" rx="14" fill="#F7F3EA" stroke="#161210" strokeWidth="2.2" />
      <text x="74" y="174" fontSize="18" fontWeight="700" fill="#F7F3EA" fontFamily="Fraunces, serif">
        48
      </text>
      <text x="162" y="174" fontSize="18" fontWeight="700" fill="#161210" fontFamily="Fraunces, serif">
        3
      </text>
      <text x="244" y="174" fontSize="18" fontWeight="700" fill="#161210" fontFamily="Fraunces, serif">
        12
      </text>
      <g transform="translate(372 28)">
        <path d="M32 0 L40 16 L32 24 L24 16 Z" fill="#9C1C28" />
        <path d="M64 32 L48 40 L40 32 L48 24 Z" fill="#C9891A" />
        <path d="M32 64 L24 48 L32 40 L40 48 Z" fill="#1F5C57" />
        <path d="M0 32 L16 24 L24 32 L16 40 Z" fill="#243056" />
        <path d="M32 24 L40 32 L32 40 L24 32 Z" fill="#A65D32" />
      </g>
      <Blob x={48} y={210} fill="#9C1C28" scale={1.05} tilt={-4} />
      <Blob x={178} y={198} fill="#1F5C57" scale={1.12} />
      <Blob x={310} y={218} fill="#C9891A" scale={0.95} tilt={6} />
      <g transform="translate(400 268)">
        <rect x="0" y="28" width="92" height="58" rx="12" fill="#161210" />
        <rect x="8" y="36" width="76" height="34" rx="6" fill="#F7F3EA" />
        <rect x="18" y="46" width="32" height="7" rx="3.5" fill="#9C1C28" />
      </g>
    </svg>
  )
}

export function SceneInvite() {
  return (
    <svg viewBox="0 0 360 280" className="h-auto w-full" aria-hidden>
      <rect x="28" y="36" width="148" height="200" rx="26" fill="#FFF8EE" stroke="#161210" strokeWidth="3" />
      <rect x="46" y="58" width="112" height="14" rx="7" fill="#9C1C28" />
      <rect x="46" y="88" width="88" height="8" rx="4" fill="#161210" opacity="0.12" />
      <rect x="46" y="108" width="68" height="8" rx="4" fill="#161210" opacity="0.1" />
      <rect x="46" y="142" width="112" height="52" rx="14" fill="#EFE6D6" stroke="#161210" strokeWidth="2.2" />
      <text x="62" y="174" fontSize="16" fontWeight="700" fill="#161210" fontFamily="Fraunces, serif">
        You’re in
      </text>
      <Blob x={188} y={78} fill="#243056" scale={1.15} tilt={8} />
    </svg>
  )
}

export function SceneEvent() {
  return (
    <svg viewBox="0 0 360 280" className="h-auto w-full" aria-hidden>
      <rect x="24" y="28" width="312" height="150" rx="22" fill="#FFF8EE" stroke="#161210" strokeWidth="3" />
      <rect x="44" y="48" width="128" height="14" rx="7" fill="#C9891A" />
      <circle cx="268" cy="86" r="32" fill="#9C1C28" stroke="#161210" strokeWidth="2.6" />
      <text x="250" y="94" fontSize="18" fill="#F7F3EA" fontWeight="700" fontFamily="Fraunces, serif">
        18h
      </text>
      <Blob x={28} y={128} fill="#1F5C57" scale={0.78} tilt={-6} />
      <Blob x={118} y={118} fill="#9C1C28" scale={0.9} />
      <Blob x={214} y={132} fill="#C9891A" scale={0.72} tilt={7} />
    </svg>
  )
}

export function SceneTeam() {
  return (
    <svg viewBox="0 0 360 280" className="h-auto w-full" aria-hidden>
      <rect x="36" y="22" width="288" height="78" rx="18" fill="#FFF8EE" stroke="#161210" strokeWidth="3" />
      <rect x="56" y="42" width="170" height="10" rx="5" fill="#161210" opacity="0.16" />
      <rect x="56" y="62" width="92" height="20" rx="10" fill="#1F5C57" />
      <Blob x={18} y={108} fill="#A65D32" scale={0.88} tilt={-5} />
      <Blob x={128} y={96} fill="#9C1C28" scale={1} />
      <Blob x={232} y={114} fill="#1F5C57" scale={0.8} tilt={6} />
    </svg>
  )
}

export function SceneJump() {
  return (
    <svg viewBox="0 0 280 170" className="h-auto w-full" aria-hidden>
      <ellipse cx="140" cy="154" rx="64" ry="9" fill="#161210" opacity="0.1" />
      <g transform="translate(70 4) rotate(-12 50 80)">
        <ellipse cx="50" cy="100" rx="34" ry="38" fill="#9C1C28" stroke="#161210" strokeWidth="2.8" />
        <ellipse cx="50" cy="48" rx="28" ry="30" fill="#F4D2B6" stroke="#161210" strokeWidth="2.8" />
        <circle cx="40" cy="46" r="3.4" fill="#161210" />
        <circle cx="60" cy="46" r="3.4" fill="#161210" />
        <ellipse cx="32" cy="54" rx="5.5" ry="3.4" fill="#E8A090" />
        <ellipse cx="68" cy="54" rx="5.5" ry="3.4" fill="#E8A090" />
        <path d="M40 58 Q50 66 60 58" fill="none" stroke="#161210" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M84 88 L118 62" stroke="#161210" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="126" cy="56" r="12" fill="#C9891A" stroke="#161210" strokeWidth="2.4" />
      </g>
    </svg>
  )
}
