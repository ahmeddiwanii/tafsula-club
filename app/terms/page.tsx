import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-jasmine text-soot">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-soot/50 hover:text-soot">
          ← Tafsula
        </Link>
        <h1 className="mt-8 font-display text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
          Terms
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-soot/65">
          <p>
            Tafsula is a community tool for clubs, associations, and NGOs. By creating an account
            you agree to use the platform respectfully and lawfully.
          </p>
          <p>
            Club bureaus are responsible for the content they publish and for how they invite and
            manage members. Do not share login credentials.
          </p>
          <p>
            The service is provided as-is on free infrastructure tiers. Features may change as we
            improve the product with youth organizations in Tunisia.
          </p>
          <p className="text-white/40">Last updated: 2026</p>
        </div>
      </div>
    </div>
  )
}
