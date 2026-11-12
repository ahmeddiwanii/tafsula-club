import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export function useSignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async (options?: {
    redirectTo?: string
    showConfirmation?: boolean
  }) => {
    try {
      setIsSigningOut(true)
      await signOut({
        redirect: true,
        callbackUrl: options?.redirectTo || "/auth/login?message=logged-out",
      })
      // Fallback: If not redirected after 1s (dev mode), force redirect
      setTimeout(() => {
        if (window.location.pathname !== "/auth/login") {
          window.location.href = options?.redirectTo || "/auth/login?message=logged-out"
        }
      }, 1000)
    } catch (error) {
      setIsSigningOut(false)
      alert("Sign out failed. Please try again or refresh the page.")
      router.push("/auth/logout?error=signout")
    }
  }

  return {
    signOut: handleSignOut,
    isSigningOut,
  }
}