"use client"

import { getAvatarById } from "../lib/avatar-data"

interface UserAvatarProps {
    avatarId?: number
    name?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

const sizes = {
    sm: { container: "w-8 h-8", emoji: "text-sm" },
    md: { container: "w-10 h-10", emoji: "text-lg" },
    lg: { container: "w-14 h-14", emoji: "text-2xl" },
}

export function UserAvatar({ avatarId, name, size = "md", className = "" }: UserAvatarProps) {
    const avatar = avatarId ? getAvatarById(avatarId) : undefined

    const initials = name
        ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "?"

    if (avatar) {
        return (
            <div
                className={`${sizes[size].container} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${className}`}
                style={{ backgroundColor: avatar.bgColor }}
                title={name || "User"}
            >
                <span className={`font-medium text-jasmine ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"}`}>
                    {initials}
                </span>
            </div>
        )
    }

    return (
        <div
            className={`${sizes[size].container} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}
            title={name || "User"}
        >
            <span className={`font-medium text-gray-600 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"}`}>
                {initials}
            </span>
        </div>
    )
}
