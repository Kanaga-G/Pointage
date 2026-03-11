import { apiClient } from './apiClient'
import { PointageEntry } from './adminService'

interface SystemSettings {
  work_start_time: string
  work_end_time: string
  auto_depart_enabled: boolean
  auto_depart_time?: string
}

interface AutoDepartRequest {
  userId: number
  userType: 'admin' | 'employe'
  date: string
  departTime: string
  reason?: string
}

class PointageAutoService {
  /**
   * Récupère les paramètres système pour le remplissage automatique
   */
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get<any>('/api/system/settings')
      return {
        work_start_time: response.data?.work_start_time || '09:00',
        work_end_time: response.data?.work_end_time || '18:00',
        auto_depart_enabled: response.data?.auto_depart_enabled || false,
        auto_depart_time: response.data?.auto_depart_time
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres système:', error)
      // Valeurs par défaut
      return {
        work_start_time: '09:00',
        work_end_time: '18:00',
        auto_depart_enabled: false
      }
    }
  }

  /**
   * Vérifie si un utilisateur a une arrivée mais pas de départ pour une date donnée
   */
  hasArriveeButNoDepart(pointages: PointageEntry[], userId: number, date: string): boolean {
    const userPointages = pointages.filter(p => 
      (p.admin_id === userId || p.employe_id === userId) && p.date === date
    )
    
    const hasArrivee = userPointages.some(p => p.type === 'arrivee')
    const hasDepart = userPointages.some(p => p.type === 'depart')
    
    return hasArrivee && !hasDepart
  }

  /**
   * Génère un départ automatique basé sur les paramètres système
   */
  generateAutoDepart(settings: SystemSettings): string {
    if (settings.auto_depart_time) {
      return settings.auto_depart_time
    }
    return settings.work_end_time
  }

  /**
   * Enregistre un départ automatique pour un utilisateur
   */
  async recordAutoDepart(request: AutoDepartRequest): Promise<any> {
    try {
      const payload = {
        user_id: request.userId,
        user_type: request.userType,
        date: request.date,
        type: 'depart',
        heure: request.departTime,
        auto_generated: true,
        reason: request.reason || 'Départ automatique généré par le système'
      }

      const response = await apiClient.post<any, any>('/api/pointages/auto-depart', payload)
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du départ automatique:', error)
      throw error
    }
  }

  /**
   * Traite tous les utilisateurs pour générer les départs manquants
   */
  async processMissingDeparts(pointages: PointageEntry[], settings: SystemSettings): Promise<{
    processed: number
    errors: Array<{ userId: number, error: string }>
  }> {
    const errors: Array<{ userId: number, error: string }> = []
    let processed = 0

    // Grouper les pointages par utilisateur et date
    const userDateGroups = pointages.reduce((acc, pointage) => {
      const userId = pointage.admin_id || pointage.employe_id
      if (!userId) return acc

      const date = pointage.date
      const key = `${userId}-${date}`

      if (!acc[key]) {
        acc[key] = {
          userId,
          userType: pointage.user_type || 'employe',
          date,
          pointages: []
        }
      }

      acc[key].pointages.push(pointage)
      return acc
    }, {} as Record<string, any>)

    // Traiter chaque groupe utilisateur-date
    for (const group of Object.values(userDateGroups)) {
      try {
        if (this.hasArriveeButNoDepart(pointages, group.userId, group.date)) {
          const autoDepartTime = this.generateAutoDepart(settings)
          
          await this.recordAutoDepart({
            userId: group.userId,
            userType: group.userType,
            date: group.date,
            departTime: autoDepartTime,
            reason: `Départ automatique à ${autoDepartTime} (arrivée détectée, pas de départ enregistré)`
          })
          
          processed++
        }
      } catch (error) {
        errors.push({
          userId: group.userId,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    return { processed, errors }
  }

  /**
   * Vérifie si le remplissage automatique est activé
   */
  isAutoDepartEnabled(settings: SystemSettings): boolean {
    return settings.auto_depart_enabled === true
  }
}

export const pointageAutoService = new PointageAutoService()
export default pointageAutoService
