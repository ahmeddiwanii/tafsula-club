/** CSS product frames — dashboard language without screenshots. */
export function BureauMock() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-copper/30 bg-soot shadow-[0_30px_80px_rgba(22,18,16,0.45)]">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-pomegranate/80" />
        <span className="h-2 w-2 rounded-full bg-saffron/80" />
        <span className="h-2 w-2 rounded-full bg-tile/80" />
        <span className="ml-3 font-display text-xs text-jasmine/70">Bureau · Club house</span>
      </div>
      <div className="grid grid-cols-[88px_1fr] min-h-[280px]">
        <aside className="space-y-2 border-r border-white/5 bg-black/30 p-3">
          {["Home", "Members", "Events", "Teams", "Ideas"].map((l, i) => (
            <div
              key={l}
              className={`rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? "bg-pomegranate text-jasmine" : "text-jasmine/45"}`}
            >
              {l}
            </div>
          ))}
        </aside>
        <div className="space-y-3 bg-[#1c1814] p-4">
          <div className="flex gap-2">
            {[
              { n: "48", l: "Members" },
              { n: "3", l: "Events" },
              { n: "12", l: "Open tasks" },
            ].map((c) => (
              <div key={c.l} className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <p className="font-display text-xl text-jasmine">{c.n}</p>
                <p className="text-[10px] uppercase tracking-wider text-jasmine/40">{c.l}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-saffron">This week</p>
            <div className="space-y-2">
              {["Welcome desk · 4 people", "Workshop Friday · 62 sign-ups", "Idea: campus radio"].map((row) => (
                <div key={row} className="flex items-center justify-between text-xs text-jasmine/70">
                  <span>{row}</span>
                  <span className="h-1.5 w-16 rounded-full bg-tile/50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MemberMock() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#12141a] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-display text-sm text-white/85">Member · My club</span>
        <span className="rounded-full bg-pomegranate/20 px-2 py-0.5 text-[10px] font-semibold text-[#F4C7BE]">Member</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 text-[#F4EDE0]">
          <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Next event</p>
          <p className="mt-1 font-display text-lg text-white">Open night · Tunis</p>
          <p className="mt-2 text-xs text-white/45">Saturday · register in one tap</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#E07A6A]">Your team</p>
          <p className="mt-1 font-display text-lg text-white">Welcome desk</p>
          <p className="mt-2 text-xs text-white/45">2 tasks · 40 points</p>
        </div>
        <div className="sm:col-span-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs text-white/50">
          Club news · “We need 6 people for the radio booth.”
        </div>
      </div>
    </div>
  )
}
