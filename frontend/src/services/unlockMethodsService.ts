import { apiClient } from './apiClient'

export interface UnlockMethod {
  id: number
  method: string
  value: string
  name: string
  type: string
  trusted: boolean
  createdAt: string
  lastSeen: string
}

export interface CreateUnlockMethodRequest {
  method: string
  value: string
  name: string
  type?: string
}

export interface UpdateUnlockMethodRequest {
  method: string
  value: string
  name: string
  type?: string
  trusted?: boolean
}

export interface UnlockRequest {
  method: string
  value: string
  deviceInfo: {
    fingerprint: string
    userAgent: string
    platform: string
    type: string
    name: string
  }
  timestamp: number
  deviceName?: string
  duration?: number
}

export interface UnlockResponse {
  success: boolean
  message: string
  session?: {
    id: number
    expiresAt: string
    method: string
  }
}

class UnlockMethodsService {
  // === GESTION DES MÉTHODES DE DÉVERROUILLAGE ===
  
  /**
   * Obtenir les méthodes de déverrouillage de l'admin connecté
   */
  async getUnlockMethods(): Promise<{ success: boolean; methods: UnlockMethod[] }> {
    try {
      const response = await apiClient.get('/scan/unlock-methods') as { data: { success: boolean; methods: UnlockMethod[] } }
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de déverrouillage:', error)
      throw error
    }
  }

  /**
   * Ajouter une nouvelle méthode de déverrouillage
   */
  async createUnlockMethod(data: CreateUnlockMethodRequest): Promise<{ success: boolean; method: UnlockMethod; message: string }> {
    try {
      const response = await apiClient.post('/scan/unlock-methods', data) as { data: { success: boolean; method: UnlockMethod; message: string } }
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de la méthode de déverrouillage:', error)
      throw error
    }
  }

  /**
   * Modifier une méthode de déverrouillage existante
   */
  async updateUnlockMethod(methodId: number, data: UpdateUnlockMethodRequest): Promise<{ success: boolean; method: UnlockMethod; message: string }> {
    try {
      const response = await apiClient.put(`/scan/unlock-methods/${methodId}`, data) as { data: { success: boolean; method: UnlockMethod; message: string } }
      return response.data
    } catch (error) {
      console.error('Erreur lors de la modification de la méthode de déverrouillage:', error)
      throw error
    }
  }

  /**
   * Supprimer une méthode de déverrouillage
   */
  async deleteUnlockMethod(methodId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/scan/unlock-methods/${methodId}`) as { data: { success: boolean; message: string } }
      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression de la méthode de déverrouillage:', error)
      throw error
    }
  }

  // === GESTION DU DÉVERROUILLAGE ===

  /**
   * Demander le déverrouillage de la zone de scan
   */
  async requestUnlock(data: UnlockRequest): Promise<UnlockResponse> {
    try {
      const response = await apiClient.post('/scan/unlock/request', data) as { data: UnlockResponse }
      return response.data
    } catch (error) {
      console.error('Erreur lors de la demande de déverrouillage:', error)
      throw error
    }
  }

  /**
   * Déverrouillage direct pour super_admin (sans code PIN ni token)
   */
  async adminOverrideUnlock(duration: number = 60): Promise<UnlockResponse> {
    try {
      const response = await apiClient.post('/scan/unlock/request', {
        method: 'admin_override',
        value: 'super_admin_override',
        deviceInfo: {
          fingerprint: 'admin_override',
          userAgent: 'Admin Dashboard',
          platform: 'dashboard',
          type: 'admin',
          name: 'Super Admin Override'
        },
        timestamp: Date.now(),
        deviceName: 'Super Admin Override',
        duration
      }) as { data: UnlockResponse }
      return response.data
    } catch (error) {
      console.error('Erreur lors du déverrouillage admin:', error)
      throw error
    }
  }

  // === UTILITAIRES ===

  /**
   * Formater le nom de la méthode pour l'affichage
   */
  formatMethodName(method: string): string {
    const methodNames: Record<string, string> = {
      'fingerprint': 'Empreinte digitale',
      'pin': 'Code PIN',
      'mac': 'Adresse MAC',
      'ip': 'Adresse IP',
      'token': 'Token de sécurité',
      'admin_override': 'Override Super Admin'
    }
    return methodNames[method] || method
  }

  /**
   * Formater la valeur pour l'affichage (masquer les informations sensibles)
   */
  formatMethodValue(method: string, value: string): string {
    switch (method) {
      case 'pin':
        return value.replace(/./g, '*') // Masquer complètement le PIN
      case 'mac':
        return value // Afficher l'adresse MAC complète
      case 'token':
        return value.substring(0, 8) + '...' // Afficher seulement le début du token
      default:
        return value.substring(0, 16) + '...' // Afficher le début pour les autres méthodes
    }
  }

  /**
   * Obtenir les types de méthodes disponibles
   */
  getAvailableMethods(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'pin',
        label: 'Code PIN',
        description: 'Code numérique à 4 chiffres pour déverrouiller rapiClientdement'
      },
      {
        value: 'mac',
        label: 'Adresse MAC',
        description: 'Adresse MAC de l\'appareil pour déverrouillage automatique'
      },
      {
        value: 'fingerprint',
        label: 'Empreinte digitale',
        description: 'Empreinte unique de l\'appareil navigateur'
      },
      {
        value: 'token',
        label: 'Token de sécurité',
        description: 'Token secret pour déverrouillage manuel'
      }
    ]
  }

  /**
   * Valider un code PIN (4 chiffres)
   */
  validatePin(pin: string): boolean {
    return /^\d{4}$/.test(pin)
  }

  /**
   * Valider une adresse MAC
   */
  validateMac(mac: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return macRegex.test(mac)
  }

  /**
   * Valider un token (longueur minimale)
   */
  validateToken(token: string): boolean {
    return token.length >= 8
  }
}

export const unlockMethodsService = new UnlockMethodsService()
export default unlockMethodsService
