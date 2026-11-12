import NextAuth from "next-auth"
import { UserRole } from "../types/user"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role?: UserRole
      organizationId?: string | null
    }
  }

  interface User {
    id: string
    role?: UserRole
    organizationId?: string | null
  }
}
