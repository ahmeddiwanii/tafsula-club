import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequestWithAuth } from "next-auth/middleware"

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req })
  const isAuthenticated = !!token
  const path = req.nextUrl.pathname

  const publicAuthPaths = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"]
  const isPublicAuthPath = publicAuthPaths.some((p) => path.startsWith(p))

  if (!isAuthenticated && !isPublicAuthPath && path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (!isAuthenticated && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isAuthenticated && isPublicAuthPath) {
    return redirectBasedOnRole(token.role as string, req.url)
  }

  if (isAuthenticated) {
    const role = token.role as string
    const memberStatus = (token as { memberStatus?: string }).memberStatus

    if (path.startsWith("/dashboard/admin") && role !== "SUPERADMIN") {
      return redirectBasedOnRole(role, req.url)
    }

    if (path.startsWith("/dashboard/hr") && role !== "HR") {
      return redirectBasedOnRole(role, req.url)
    }

    if (path.startsWith("/dashboard/member") && role !== "MEMBER") {
      return redirectBasedOnRole(role, req.url)
    }

    if (role === "MEMBER" && path.startsWith("/dashboard/member")) {
      if (memberStatus === "REJECTED") {
        return NextResponse.redirect(new URL("/auth/login?message=rejected", req.url))
      }

      const isWaitingPage = path.startsWith("/dashboard/member/waiting")
      if (!isWaitingPage && memberStatus === "AWAITING_HR") {
        return NextResponse.redirect(new URL("/dashboard/member/waiting", req.url))
      }
    }
  }

  return NextResponse.next()
}

function redirectBasedOnRole(role: string, baseUrl: string) {
  if (role === "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard/admin", baseUrl))
  }
  if (role === "HR") {
    return NextResponse.redirect(new URL("/dashboard/hr", baseUrl))
  }
  if (role === "MEMBER") {
    return NextResponse.redirect(new URL("/dashboard/member", baseUrl))
  }
  return NextResponse.redirect(new URL("/organizations", baseUrl))
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
