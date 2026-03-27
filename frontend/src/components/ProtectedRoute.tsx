import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/authService'

type AppRole =
  | 'admin'
  | 'super_admin'
  | 'manager'
  | 'hr'
  | 'chef_departement'
  | 'stagiaire'
  | 'employe'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: AppRole
  requiredRoles?: AppRole[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()
  const allowedRoles = requiredRoles?.length ? requiredRoles : requiredRole ? [requiredRole] : null
  const accessRole = (user?.role || null) as AppRole | null
  const metierRole = ((user as any)?.role_metier || null) as AppRole | null
  const userRoles = [accessRole, metierRole].filter(Boolean) as AppRole[]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && (userRoles.length === 0 || !allowedRoles.some((role) => userRoles.includes(role)))) {
    if (accessRole === 'admin' || accessRole === 'super_admin' || metierRole === 'manager' || metierRole === 'hr') {
      return <Navigate to="/admin" replace />
    }
    if (accessRole === 'employe') {
      return <Navigate to="/employee" replace />
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
