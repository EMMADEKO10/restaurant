"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
      } else {
        // Rediriger en fonction du rôle
        if (role === "admin" || role === "super_admin") {
          router.push("/admin-dashboard")
        } else if (role === "server") {
          router.push("/server-dashboard")
        } else {
          // Utilisateur normal (client)
          router.push("/")
        }
      }
    }
  }, [user, role, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-restaurant-500" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Redirection en cours...
        </p>
            <p className="text-gray-600 dark:text-gray-400">
          Vous allez être redirigé vers votre espace approprié.
                  </p>
                </div>
              </div>
  )
}
