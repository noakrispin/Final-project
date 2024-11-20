import React, { useEffect } from "react"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ allowedRoles = ["Student", "Supervisor"] }) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login while saving the attempted url
      navigate("/login", { state: { from: location.pathname } })
    }

    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // Redirect to home if user's role is not allowed
      navigate("/")
    }
  }, [user, isLoading, navigate, location, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <Outlet />
}