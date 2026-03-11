import { apiClient } from './apiClient'
import { Employe } from './adminService'

export interface CreateEmployeRequest {
  prenom: string
  nom: string
  email: string
  telephone?: string
  poste: string
  departement: string
  statut: string
  date_embauche?: string
  contrat_type?: string
  contrat_duree?: string
  salaire?: number
  adresse?: string
  manager_id?: number
  taux_horaire?: number
  password?: string
}

export interface UpdateEmployeRequest extends Partial<CreateEmployeRequest> {
  id: number
}

export interface EmployeFilters {
  search?: string
  departement?: string
  statut?: string
  page?: number
  per_page?: number
}

class EmployeCrudService {
  private baseUrl = '/api/admin/employes'

  // ============================================
  // CRUD EMPLOYÉS
  // ============================================

  // Récupérer tous les employés avec pagination et filtres
  async getAllEmployes(filters: EmployeFilters = {}): Promise<{
    items: Employe[]
    total: number
    total_pages: number
    current_page: number
    per_page: number
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.departement) params.append('departement', filters.departement)
      if (filters.statut) params.append('statut', filters.statut)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`)
      return response as {
        items: Employe[]
        total: number
        total_pages: number
        current_page: number
        per_page: number
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error)
      throw error
    }
  }

  // Récupérer un employé par son ID
  async getEmployeById(id: number): Promise<Employe> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`)
      return response as Employe
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'employé ${id}:`, error)
      throw error
    }
  }

  // Créer un nouvel employé
  async createEmploye(employeData: CreateEmployeRequest): Promise<Employe> {
    try {
      const response = await apiClient.post(this.baseUrl, employeData)
      return response as Employe
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error)
      throw error
    }
  }

  // Mettre à jour un employé
  async updateEmploye(id: number, employeData: UpdateEmployeRequest): Promise<Employe> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, employeData)
      return response as Employe
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error)
      throw error
    }
  }

  // Supprimer un employé
  async deleteEmploye(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  // Exporter les employés en CSV/Excel
  async exportEmployes(format: 'csv' | 'excel' = 'excel', filters?: EmployeFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      
      if (filters?.search) params.append('search', filters.search)
      if (filters?.departement) params.append('departement', filters.departement)
      if (filters?.statut) params.append('statut', filters.statut)

      const response = await fetch(`/api${this.baseUrl}/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response.blob()
    } catch (error) {
      console.error('Erreur lors de l\'export des employés:', error)
      throw error
    }
  }

  // Importer des employés depuis un fichier
  async importEmployes(file: File): Promise<{
    success: number
    errors: number
    details: any[]
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }) as {
        success: number
        errors: number
        details: any[]
      }
      return response
    } catch (error) {
      console.error('Erreur lors de l\'import des employés:', error)
      throw error
    }
  }

  // Valider un email unique
  async validateEmail(email: string, excludeId?: number): Promise<{
    is_valid: boolean
    message?: string
  }> {
    try {
      const params = new URLSearchParams()
      params.append('email', email)
      if (excludeId) params.append('exclude_id', excludeId.toString())

      const response = await apiClient.get(`${this.baseUrl}/validate-email?${params.toString()}`) as {
        is_valid: boolean
        message?: string
      }
      return response
    } catch (error) {
      console.error('Erreur lors de la validation de l\'email:', error)
      throw error
    }
  }

  // Récupérer les départements disponibles
  async getDepartements(): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/departements`) as string[]
      return response
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error)
      throw error
    }
  }

  // Récupérer les postes par département
  async getPostesByDepartement(departement: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/postes?departement=${departement}`) as string[]
      return response
    } catch (error) {
      console.error('Erreur lors de la récupération des postes:', error)
      throw error
    }
  }
}

export const employeCrudService = new EmployeCrudService()
export default employeCrudService
