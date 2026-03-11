// Interfaces TypeScript pour le dashboard Xpert Pro
// Basées sur la structure des données PHP existantes

export interface Employe {
  id: number
  prenom: string
  nom: string
  email: string
  departement: string
  poste?: string
  telephone?: string
  date_embauche?: string
  statut: 'actif' | 'inactif'
  photo_url?: string
  badge_id?: string
}

export interface Admin {
  id: number
  nom: string
  email: string
  role: 'super_admin' | 'admin'
  statut: 'actif' | 'inactif'
  date_creation?: string
}

export interface Pointage {
  id: number
  employe_id: number
  prenom: string
  nom: string
  time_in: string
  time_out?: string
  date: string
  statut: 'present' | 'retard' | 'absent'
  departement?: string
  minutes_retard?: number
}

export interface Demande {
  id: number
  employe_id: number
  employe: string
  type: 'conge' | 'absence' | 'retard' | 'autre'
  motif: string
  date_debut: string
  date_fin?: string
  statut: 'en_attente' | 'approuve' | 'rejete'
  date_demande: string
  traite_par?: string
  date_traitement?: string
  commentaire?: string
}

export interface Retard {
  id: number
  employe_id: number
  prenom: string
  nom: string
  date: string
  minutes_retard: number
  motif?: string
  justifie: boolean
}

export interface TempsTotal {
  id: number
  employe_id: number
  prenom: string
  nom: string
  email: string
  total_travail: string // Format "HH:MM:SS"
  total_pause?: string
  periode: {
    debut: string
    fin: string
  }
}

export interface StatsDashboard {
  total_employes: number
  present_today: number
  absents_today: number
  retards_today: number
  en_conge_today: number
}

export interface HeuresMensuelles {
  [mois: string]: number // Jan: 120, Feb: 98, etc.
}

export interface DashboardData {
  stats: StatsDashboard
  heures_mensuelles: HeuresMensuelles
  employes: Employe[]
  admins: Admin[]
  demandes: Demande[]
  retards: Retard[]
  temps_totaux: TempsTotal[]
  pointages: Pointage[]
  is_super_admin?: boolean
  stats_demandes?: {
    total: number
    en_attente: number
    approuve: number
    rejete: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  departement?: string
  statut?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Types pour les formulaires
export interface EmployeFormData {
  prenom: string
  nom: string
  email: string
  departement: string
  poste?: string
  telephone?: string
  date_embauche?: string
}

export interface DemandeFormData {
  employe_id: number
  type: 'conge' | 'absence' | 'retard' | 'autre'
  motif: string
  date_debut: string
  date_fin?: string
}

export interface AdminFormData {
  nom: string
  email: string
  role: 'super_admin' | 'admin'
}

// Types pour l'authentification
export interface User {
  id: number
  nom: string
  email: string
  role: 'admin' | 'super_admin' | 'employe'
  permissions: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  type: 'admin' | 'employe'
}

// Types pour les événements du calendrier
export interface CalendarEvent {
  id: number
  title: string
  start: string // ISO datetime
  end?: string // ISO datetime
  type: 'conge' | 'absence' | 'retard' | 'meeting' | 'formation'
  description?: string
  employe_id?: number
  couleur?: string
}

// Types pour les notifications
export interface Notification {
  id: number
  titre: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  date: string
  lue: boolean
  destinataire_id: number
}
