import { headers } from "next/headers"
import { getServerSession } from "next-auth/next"
import { decode } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import type { UserRole } from "@/lib/auth"

export type AuthUser = {
  id: string
  email?: string | null
  name?: string | null
  role?: UserRole | string
  organizationId?: string | null
  avatarId?: number
  memberStatus?: string
}

export type AuthSession = { user: AuthUser }

/**
 * Cookie session (web) or Authorization: Bearer (native).
 * Native tokens are signed with NEXTAUTH_SECRET.
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const secret = process.env.NEXTAUTH_SECRET
  try {
    const headerList = await headers()
    const authorization = headerList.get("authorization")
    if (authorization?.startsWith("Bearer ") && secret) {
      const token = await decode({ token: authorization.slice(7), secret })
      if (token?.id) {
        return {
          user: {
            id: String(token.id),
            email: (token.email as string) ?? null,
            name: (token.name as string) ?? null,
            role: token.role as UserRole | undefined,
            organizationId: (token.organizationId as string) ?? null,
            avatarId: (token.avatarId as number) ?? 1,
            memberStatus: (token.memberStatus as string) ?? "ACCEPTED",
          },
        }
      }
    }
  } catch {
    // headers() is unavailable outside a request — fall through to cookies
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session as AuthSession
}
