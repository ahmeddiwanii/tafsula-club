"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin } from "lucide-react"
import Image from "next/image"

interface OrganizationCardProps {
  id: string
  name: string
  profile?: {
    profileImageUrl?: string
    bio?: string
    location?: string
  }
  _count?: {
    user: number
    event: number
    project: number
  }
  index?: number
}

export function OrganizationCard({ id, name, profile, _count, index = 0 }: OrganizationCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
      <Link
        href={`/organizations/${id}`}
        className="block h-full overflow-hidden rounded-[1.5rem] border-[2.5px] border-soot bg-jasmine text-soot no-underline shadow-[4px_5px_0_0_#161210] transition hover:-translate-y-0.5"
      >
        <div className="relative h-28 bg-[#F3C4B0]">
          {profile?.profileImageUrl ? (
            <Image src={profile.profileImageUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#9C1C28_0%,#C9891A_50%,#1F5C57_100%)] opacity-80" />
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl" style={{ fontFamily: "Fraunces, serif" }}>
            {name}
          </h3>
          {profile?.bio && <p className="mt-2 line-clamp-2 text-sm text-soot/60">{profile.bio}</p>}
          {profile?.location && (
            <p className="mt-3 flex items-center gap-1 text-xs text-soot/50">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </p>
          )}
          {_count && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-soot/40">
              {_count.user} youth · {_count.event} nights
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
