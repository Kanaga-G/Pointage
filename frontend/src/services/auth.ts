// Service d'authentification pour Xpert Pro
// Gère la connexion, déconnexion et la session utilisateur avec Supabase

import React from 'react'
import { LoginCredentials, User, AuthState } from '../types/dashboard'
import { supabaseFrontendService } from './supabaseService'

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }

  // Stockage local de l'utilisateur
  private readonly USER_KEY = 'xpert_user'

  constructor() {
    this.initializeFromStorage()
    this.setupAuthListener()
  }

  // Initialiser l'état depuis le localStorage
  private initializeFromStorage(): void {
    try {
      const userStr = localStorage.getItem(this.USER_KEY)
      
      if (userStr) {
        const user = JSON.parse(userStr) as User
        this.authState = {
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error)
      this.clearStorage()
    }
  }

  // Configurer l'écouteur d'état d'authentification
  private setupAuthListener(): void {
    supabaseFrontendService.onAuthStateChange((user) => {
      if (user) {
        this.authState = {
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        }
        this.saveToStorage(user)
      } else {
        this.authState = {
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        }
        this.clearStorage()
      }
    })
  }

  // Sauvegarder dans localStorage
  private saveToStorage(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Nettoyer le localStorage
  private clearStorage(): void {
    localStorage.removeItem(this.USER_KEY)
  }

  // Obtenir l'état actuel
  getAuthState(): AuthState {
    return { ...this.authState }
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.user
  }

  // Obtenir l'utilisateur courant
  getCurrentUser(): User | null {
    return this.authState.user
  }

  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthState> {
    this.authState.loading = true
    this.authState.error = null

    try {
      const result = await supabaseFrontendService.signIn(
        credentials.email,
        credentials.password
      )

      if (result.success && result.user) {
        this.authState = {
          user: result.user,
          isAuthenticated: true,
          loading: false,
          error: null
        }
        this.saveToStorage(result.user)
      } else {
        throw new Error('Échec de la connexion')
      }

      return this.authState
    } catch (error) {
      this.authState = {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      }
      return this.authState
    }
  }

  // Inscription
  async register(userData: {
    nom: string
    prenom: string
    email: string
    password: string
    role?: 'admin' | 'employe'
    telephone?: string
    departement?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    this.authState.loading = true
    this.authState.error = null

    try {
      const result = await supabaseFrontendService.signUp(userData)

      if (result.success && result.user) {
        return {
          success: true,
          user: result.user
        }
      } else {
        throw new Error('Échec de l\'inscription')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'inscription'
      }
    } finally {
      this.authState.loading = false
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await supabaseFrontendService.signOut()
      this.authState = {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
      this.clearStorage()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Vérifier le rôle de l'utilisateur
  hasRole(role: string): boolean {
    return this.authState.user?.role === role
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('super_admin')
  }

  // Vérifier si l'utilisateur est employé
  isEmploye(): boolean {
    return this.hasRole('employe')
  }

  // Rafraîchir la session
  async refreshSession(): Promise<void> {
    try {
      const user = await supabaseFrontendService.getCurrentUser()
      if (user) {
        this.authState = {
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        }
        this.saveToStorage(user)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    }
  }
}

// Instance singleton
const authService = new AuthService()

// Hook React pour l'authentification
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(authService.getAuthState())

  React.useEffect(() => {
    // Écouter les changements d'état
    const checkAuth = () => {
      const newState = authService.getAuthState()
      setAuthState(newState)
    }

    // Vérifier périodiquement
    const interval = setInterval(checkAuth, 1000)

    return () => clearInterval(interval)
  }, [])

  const login = React.useCallback(
    (credentials: LoginCredentials) => authService.login(credentials),
    []
  )

  const register = React.useCallback(
    (userData: any) => authService.register(userData),
    []
  )

  const logout = React.useCallback(() => authService.logout(), [])

  const refreshSession = React.useCallback(
    () => authService.refreshSession(),
    []
  )

  return {
    ...authState,
    login,
    register,
    logout,
    refreshSession,
    isAdmin: authService.isAdmin(),
    isEmploye: authService.isEmploye(),
    hasRole: authService.hasRole
  }
}

export default authService
