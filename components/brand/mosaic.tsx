/** Repeating zellige lattice — identity texture, not a stock gradient blob. */
export function MosaicFloor({ className = "", opacity = 0.18 }: { className?: string; opacity?: number }) {
  return (
    <svg className={className} aria-hidden viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="taf-zellige" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="transparent" />
          <path d="M20 0 L28 12 L20 20 L12 12 Z" fill="#9C1C28" opacity={opacity} />
          <path d="M40 20 L28 28 L20 20 L28 12 Z" fill="#C9891A" opacity={opacity * 0.85} />
          <path d="M20 40 L12 28 L20 20 L28 28 Z" fill="#1F5C57" opacity={opacity} />
          <path d="M0 20 L12 12 L20 20 L12 28 Z" fill="#243056" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#taf-zellige)" />
    </svg>
  )
}

export function OpportunityChart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 280" className={className} role="img" aria-label="How opportunity moves on Tafsula">
      <rect width="640" height="280" fill="#EFE6D6" rx="18" />
      <text x="32" y="36" fill="#1A1612" fontSize="13" fontFamily="Figtree, sans-serif" letterSpacing="2">
        OPPORTUNITY LOOP
      </text>
      {[
        { x: 70, label: "Youth", sub: "discovers" },
        { x: 210, label: "Club", sub: "opens doors" },
        { x: 350, label: "Event", sub: "you show up" },
        { x: 490, label: "Work", sub: "is seen" },
      ].map((n, i) => (
        <g key={n.label} transform={`translate(${n.x}, 90)`}>
          <polygon points="50,0 90,28 90,76 50,104 10,76 10,28" fill={i % 2 === 0 ? "#9C1C28" : "#243056"} />
          <text x="50" y="52" textAnchor="middle" fill="#F7F3EA" fontSize="13" fontFamily="Fraunces, serif">
            {n.label}
          </text>
          <text x="50" y="132" textAnchor="middle" fill="#1A1612" fontSize="11" fontFamily="Figtree, sans-serif">
            {n.sub}
          </text>
          {i < 3 && <path d={`M100 52 L130 52`} stroke="#A65D32" strokeWidth="2" markerEnd="url(#arr)" />}
        </g>
      ))}
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#A65D32" />
        </marker>
      </defs>
      <text x="32" y="250" fill="#1A1612" fontSize="12" opacity="0.7" fontFamily="Figtree, sans-serif">
        Clubs publish work. Youth joins. Teams form. Effort becomes a visible story.
      </text>
    </svg>
  )
}
