import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { RoleService } from '../services/roleService';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ 
  children, 
  permission, 
  resource, 
  action = 'view',
  fallback 
}: PermissionGuardProps) {
  const { user } = useAuth();
  const effectiveRole = (user?.role_metier || user?.role || 'employe') as string;

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier la permission spécifique
  if (permission && !RoleService.hasPermission(effectiveRole, permission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Rôle actuel: {effectiveRole} | Permission requise: {permission}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Vérifier l'accès à la ressource
  if (resource && !RoleService.canAccessResource(effectiveRole, resource, action)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les droits nécessaires pour {action} cette ressource.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Ressource: {resource} | Action: {action}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook personnalisé pour vérifier les permissions
export function usePermissions() {
  const { user } = useAuth();
  const effectiveRole = (user?.role_metier || user?.role || 'employe') as string;

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return RoleService.hasPermission(effectiveRole, permission);
  };

  const canAccess = (resource: string, action: string = 'view'): boolean => {
    if (!user) return false;
    return RoleService.canAccessResource(effectiveRole, resource, action);
  };

  const getAvailablePanels = () => {
    if (!user) return [];
    return RoleService.getAvailablePanels(effectiveRole);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isManager = (): boolean => {
    return user?.role_metier === 'manager' || user?.role === 'admin';
  };

  const isHR = (): boolean => {
    return user?.role_metier === 'hr' || user?.role === 'admin';
  };

  return {
    hasPermission,
    canAccess,
    getAvailablePanels,
    isAdmin,
    isManager,
    isHR,
    userRole: effectiveRole || 'guest'
  };
}
