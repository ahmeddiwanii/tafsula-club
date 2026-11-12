import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-jasmine text-soot">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-soot/50 hover:text-soot">
          ← Tafsula
        </Link>
        <h1 className="mt-8 font-display text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
          Privacy
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-soot/65">
          <p>
            Tafsula stores the account data you provide (name, email, club membership, event
            registrations, tasks, and posts) to run the platform for Tunisian youth clubs.
          </p>
          <p>
            We do not sell personal data. Access is limited to your club bureau where relevant, and
            to platform admins for safety and support.
          </p>
          <p>
            You can request account deactivation by contacting your club bureau or writing to the
            address on the Contact page.
          </p>
          <p className="text-white/40">Last updated: 2026</p>
        </div>
      </div>
    </div>
  )
}
