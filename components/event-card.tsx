"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, MapPin, Users, Zap, Check, Loader2 } from "lucide-react"
import Image from "next/image"

interface EventCardProps {
  id: string
  title: string
  description?: string
  startAt: Date | string
  location?: string
  organizationName: string
  organizationProfileImage?: string
  posterUrl?: string
  registrationCount?: number
  index?: number
  type?: string
  format?: string
  isRegistered?: boolean
  onRegistrationChange?: () => void
}

const eventTypeColors: Record<string, { bg: string; text: string; badge: string }> = {
  GENERAL: { bg: "from-blue-500 via-cyan-500 to-teal-500", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  TRAINING: { bg: "from-purple-500 via-pink-500 to-red-500", text: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  WORKSHOP: { bg: "from-green-500 via-emerald-500 to-teal-500", text: "text-green-600", badge: "bg-green-100 text-green-700" },
  CONFERENCE: { bg: "from-yellow-500 via-orange-500 to-red-500", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" },
}

const getEventColors = (type?: string) => {
  return eventTypeColors[type || "GENERAL"] || eventTypeColors.GENERAL
}

export function EventCard({
  id,
  title,
  description,
  startAt,
  location,
  organizationName,
  organizationProfileImage,
  posterUrl,
  registrationCount = 0,
  index = 0,
  type = "GENERAL",
  format = "IN_PERSON",
  isRegistered = false,
  onRegistrationChange,
}: EventCardProps) {
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const eventDate = new Date(startAt)
  const isUpcoming = eventDate > new Date()
  const colors = getEventColors(type)
  const daysUntilEvent = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRegistering(true)
    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: registered ? "DELETE" : "POST",
      })
      if (response.ok) {
        setRegistered(!registered)
        onRegistrationChange?.()
      }
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setRegistering(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden rounded-[1.5rem] border-[2.5px] border-soot bg-jasmine text-soot shadow-[4px_5px_0_0_#161210] group">
        <div className={`h-48 bg-gradient-to-br ${colors.bg} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

          {posterUrl || organizationProfileImage ? (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={posterUrl || organizationProfileImage || ""}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                priority={index < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    animate={{
                      x: [0, 20, -20, 0],
                      y: [0, 20, -20, 0],
                    }}
                    transition={{
                      duration: 8 + i * 0.3,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    style={{
                      width: Math.random() * 40 + 20,
                      height: Math.random() * 40 + 20,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {isUpcoming && daysUntilEvent <= 7 && (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                <Badge className="bg-red-500 text-white shadow-lg">In {daysUntilEvent} days</Badge>
              </motion.div>
            )}
            {isUpcoming && daysUntilEvent > 7 && (
              <Badge className="bg-green-500 text-white shadow-lg">Upcoming</Badge>
            )}
            {format && (
              <Badge variant="outline" className={`${colors.text} bg-white/90 backdrop-blur-sm shadow-lg border-2`}>
                {format.replace("_", " ")}
              </Badge>
            )}
          </div>

          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-white/95 text-gray-900 shadow-lg font-semibold">{organizationName}</Badge>
          </div>

          <div className="absolute bottom-4 left-4 z-10">
            <Badge className={`${colors.badge} shadow-lg font-medium`}>{type}</Badge>
          </div>
        </div>

        <CardHeader className="pb-3 pt-5">
          <div className="space-y-2">
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <CardTitle className="text-xl font-bold line-clamp-2 text-soot" style={{ fontFamily: "Fraunces, serif" }}>
                {title}
              </CardTitle>
            </motion.div>
            {description && <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors">{description}</p>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-grow">
          <div className="space-y-3 border-t pt-3">
            <motion.div className="flex items-center space-x-3 text-sm group/item" whileHover={{ x: 4 }}>
              <motion.div className="p-2 rounded-lg bg-blue-100 group-hover/item:bg-blue-200 transition-colors" whileHover={{ rotate: 10 }}>
                <Calendar className="w-4 h-4 text-blue-600" />
              </motion.div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-xs text-gray-500">
                  {eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>

            {location && (
              <motion.div className="flex items-center space-x-3 text-sm group/item" whileHover={{ x: 4 }}>
                <motion.div className="p-2 rounded-lg bg-red-100 group-hover/item:bg-red-200 transition-colors" whileHover={{ rotate: 10 }}>
                  <MapPin className="w-4 h-4 text-red-600" />
                </motion.div>
                <span className="text-gray-700 font-medium">{location}</span>
              </motion.div>
            )}

            <motion.div className="flex items-center space-x-3 text-sm group/item" whileHover={{ x: 4 }}>
              <motion.div className="p-2 rounded-lg bg-purple-100 group-hover/item:bg-purple-200 transition-colors" whileHover={{ rotate: 10 }}>
                <Users className="w-4 h-4 text-purple-600" />
              </motion.div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{registrationCount}</div>
                <div className="text-xs text-gray-500">Registered</div>
              </div>
            </motion.div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full space-y-2">
            <Link href={`/events/${id}`} className="w-full">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full rounded-full bg-soot font-semibold text-jasmine hover:bg-soot">
                  <span className="flex items-center justify-center gap-2">
                    View Event
                    <Zap className="w-4 h-4" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRegister}
                disabled={registering}
                variant={registered ? "secondary" : "default"}
                className={`w-full rounded-full font-semibold ${
                  registered ? "bg-tile text-jasmine hover:bg-tile" : "border-[2px] border-soot bg-jasmine text-soot hover:bg-plaster"
                }`}
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {registered ? "Unregistering..." : "Registering..."}
                  </>
                ) : (
                  <>
                    {registered ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Registered
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Register Now
                      </>
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
