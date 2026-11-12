export interface AvatarDefinition {
  id: number
  name: string
  emoji: string
  bgColor: string
  textColor: string
}

export const AVATARS: AvatarDefinition[] = [
  { id: 1, name: "", emoji: "", bgColor: "#9C1C28", textColor: "#F7F3EA" },
  { id: 2, name: "", emoji: "", bgColor: "#1F5C57", textColor: "#F7F3EA" },
  { id: 3, name: "", emoji: "", bgColor: "#A65D32", textColor: "#F7F3EA" },
  { id: 4, name: "", emoji: "", bgColor: "#243056", textColor: "#F7F3EA" },
]

export function getAvatarById(id: number): AvatarDefinition | undefined {
  return AVATARS.find((a) => a.id === id)
}
