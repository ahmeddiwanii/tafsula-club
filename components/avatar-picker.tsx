"use client"

import { useState } from "react"
import { AVATARS, getAvatarById } from "../lib/avatar-data"
import { UserAvatar } from "./user-avatar"

interface AvatarPickerProps {
    currentAvatarId: number
    onSelectAction: (avatarId: number) => void
    saving?: boolean
}

export function AvatarPicker({ currentAvatarId, onSelectAction, saving }: AvatarPickerProps) {
    const [selected, setSelected] = useState(currentAvatarId)

    const handleSelect = (id: number) => {
        setSelected(id)
        onSelectAction(id)
    }

    return (
        <div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {AVATARS.map(avatar => (
                    <button
                        key={avatar.id}
                        onClick={() => handleSelect(avatar.id)}
                        disabled={saving}
                        className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${selected === avatar.id
                                ? "bg-blue-50 ring-2 ring-blue-500 shadow-md scale-105"
                                : "hover:bg-gray-50 hover:scale-105"
                            } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: avatar.bgColor }}
                        >
                            <span className="text-xl">{avatar.emoji}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">{avatar.name}</span>
                        {selected === avatar.id && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
