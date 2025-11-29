import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "STUDENT" | "PROFESSOR"
}
// Nota: el rol ADMIN fue removido; solo STUDENT y PROFESSOR existen
// Mantener compatibilidad con el frontend como fuente de la verdad.

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await apiClient.authApi.me()
        setUser(currentUser)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem("auth_token")
        setIsAuthenticated(false)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }

  return { user, isLoading, isAuthenticated, logout }
}
