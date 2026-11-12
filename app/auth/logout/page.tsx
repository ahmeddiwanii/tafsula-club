"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Alert, AlertDescription } from "../../../components/ui/alert"

export default function LogoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      setError(null)
      await signOut({
        redirect: true,
        callbackUrl: "/auth/login?message=logged-out",
      })
      // Fallback: If not redirected after 1s (dev mode), force redirect
      setTimeout(() => {
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login?message=logged-out"
        }
      }, 1000)
    } catch (error) {
      setError("An unexpected error occurred during sign out.")
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You are currently signed in as: <strong>{session?.user?.email}</strong>
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoggingOut}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex-1"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}