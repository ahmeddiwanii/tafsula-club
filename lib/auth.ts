import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "../lib/db"
import { getMemberStatus } from "./member-status-db"

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  HR = "HR",
  MEMBER = "MEMBER",
  REGULAR_USER = "REGULAR_USER",
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) return null

          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as unknown as UserRole,
            organizationId: user.organizationId,
            avatarId: user.avatarId ?? 1,
            memberStatus: (user as { memberStatus?: string }).memberStatus ?? "ACCEPTED",
          }
        } catch (error) {
          console.error("[auth] authorize failed")
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as UserRole | undefined
        session.user.organizationId = token.organizationId as string | null
        ;(session.user as { avatarId?: number }).avatarId = (token as { avatarId?: number }).avatarId ?? 1
        ;(session.user as { memberStatus?: string }).memberStatus = (
          token as { memberStatus?: string }
        ).memberStatus
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.avatarId = user.avatarId ?? 1
        ;(token as { memberStatus?: string }).memberStatus =
          (user as { memberStatus?: string }).memberStatus ?? "ACCEPTED"
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatarId: true, organizationId: true, role: true },
        })
        if (dbUser) {
          token.avatarId = dbUser.avatarId ?? 1
          token.organizationId = dbUser.organizationId
          token.role = dbUser.role as UserRole
        }
        ;(token as { memberStatus?: string }).memberStatus = await getMemberStatus(token.id as string)
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === "development",
}
