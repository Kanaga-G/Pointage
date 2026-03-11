// Service Supabase pour le frontend
// Gère l'authentification et les opérations CRUD

import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { Employe, Admin, Demande, Pointage } from '../types/dashboard'

class SupabaseFrontendService {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  // Authentification
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      user: this.transformUser(data.user),
      token: data.session?.access_token
    }
  }

  async signUp(userData: {
    email: string
    password: string
    nom: string
    prenom?: string
    role?: 'admin' | 'employe'
    telephone?: string
    departement?: string
  }) {
    const { data, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role || 'employe',
          telephone: userData.telephone,
          departement: userData.departement
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      user: this.transformUser(data.user)
    }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user ? this.transformUser(user) : null
  }

  async onAuthStateChange(callback: (user: any) => void) {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user ? this.transformUser(session.user) : null
        callback(user)
      }
    )

    return subscription
  }

  // Gestion des employés
  async getEmployes(): Promise<Employe[]> {
    const { data, error } = await this.supabase
      .from('employes')
      .select('*')
      .order('nom', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async createEmploye(employe: any): Promise<Employe> {
    const { data, error } = await this.supabase
      .from('employes')
      .insert(employe)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async updateEmploye(id: number, updates: any): Promise<Employe> {
    const { data, error } = await this.supabase
      .from('employes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async deleteEmploye(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('employes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  // Gestion des demandes
  async getDemandes(): Promise<Demande[]> {
    const { data, error } = await this.supabase
      .from('demandes')
      .select('*')
      .order('date_demande', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async createDemande(demande: any): Promise<Demande> {
    const { data, error } = await this.supabase
      .from('demandes')
      .insert(demande)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async updateDemande(id: number, updates: any): Promise<Demande> {
    const { data, error } = await this.supabase
      .from('demandes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Gestion des pointages
  async getPointages(date?: string, range?: string): Promise<Pointage[]> {
    let query = this.supabase
      .from('pointages')
      .select('*')

    if (date) {
      query = query.eq('date', date)
    }

    if (range === 'week') {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      query = query
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
    } else if (range === 'month') {
      const monthStart = new Date()
      monthStart.setDate(1)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      
      query = query
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  // Dashboard data
  async getDashboardData() {
    const [employes, demandes, pointages] = await Promise.all([
      this.getEmployes(),
      this.getDemandes(),
      this.getPointages()
    ])

    // Calcul des statistiques
    const totalEmployes = employes.length
    const presentToday = pointages.filter(p => p.date === new Date().toISOString().split('T')[0]).length
    const demandesEnAttente = demandes.filter(d => d.statut === 'en_attente').length

    return {
      stats: {
        total_employes: totalEmployes,
        present_today: presentToday,
        absents_today: totalEmployes - presentToday,
        retards_today: 0,
        en_conge_today: 0
      },
      employes,
      demandes,
      pointages,
      stats_demandes: {
        total: demandes.length,
        en_attente: demandesEnAttente,
        approuve: demandes.filter(d => d.statut === 'approuve').length,
        rejete: demandes.filter(d => d.statut === 'rejete').length
      }
    }
  }

  // Transformer les données utilisateur
  private transformUser(user: any): any {
    return {
      id: user.id,
      email: user.email,
      nom: user.user_metadata?.nom || user.user_metadata?.name || '',
      prenom: user.user_metadata?.prenom || '',
      role: user.user_metadata?.role || 'employe',
      telephone: user.user_metadata?.telephone,
      departement: user.user_metadata?.departement,
      statut: 'actif'
    }
  }

  // Obtenir le client Supabase
  getClient(): SupabaseClient {
    return this.supabase
  }
}

export const supabaseFrontendService = new SupabaseFrontendService()
