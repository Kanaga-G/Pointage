import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/authService'

type AppRole =
  | 'admin'
  | 'super_admin'
  | 'manager'
  | 'hr'
  | 'chef_departement'
  | 'comptable'
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

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role as AppRole))) {
    if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'hr') {
      return <Navigate to="/admin" replace />
    }
    if (user?.role === 'employe' || user?.role === 'chef_departement' || user?.role === 'comptable' || user?.role === 'stagiaire') {
      return <Navigate to="/employee" replace />
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
