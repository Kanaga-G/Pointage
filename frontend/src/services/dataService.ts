// Service pour les données des employés
import { apiClient } from './apiClient';

export interface Employe {
  id: number;
  matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  date_embauche?: string;
  poste?: string;
  telephone?: string;
  adresse?: string;
  departement?: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: number;
  token: string;
  token_hash: string;
  user_id: number;
  user_matricule?: string;
  user_type?: 'employe' | 'admin';
  user_name: string;
  user_email: string;
  user_role: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'inactive' | 'expired';
  last_used?: string;
  usage_count: number;
}

class DataService {
  // Récupérer tous les employés
  async getEmployes(filters?: {
    role?: string;
    statut?: string;
    search?: string;
  }): Promise<Employe[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.statut) params.append('statut', filters.statut);
      if (filters?.search) params.append('search', filters.search);
      
      const url = params.toString() ? `/api/employes?${params.toString()}` : '/api/employes';
      const response = await apiClient.get<{ success: boolean; employes: Employe[]; total: number }>(url);
      
      if (response.success) {
        return response.employes;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  // Récupérer un employé par ID
  async getEmployeById(id: number): Promise<Employe | null> {
    try {
      const response = await apiClient.get<{ success: boolean; employe: Employe }>(`/api/employes/${id}`);
      
      if (response.success) {
        return response.employe;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  }

  // Créer un employé
  async createEmploye(employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'>): Promise<Employe> {
    try {
      const response = await apiClient.post<typeof employeData, { success: boolean; employe: Employe; message: string }>('/api/employes', employeData);
      
      if (response.success) {
        return response.employe;
      }
      throw new Error(response.message || 'Erreur lors de la création de l\'employé');
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      throw error;
    }
  }

  // Mettre à jour un employé
  async updateEmploye(id: number, updates: Partial<Employe>): Promise<Employe> {
    try {
      const response = await apiClient.put<typeof updates, { success: boolean; employe: Employe; message: string }>(`/api/employes/${id}`, updates);
      
      if (response.success) {
        return response.employe;
      }
      throw new Error(response.message || 'Erreur lors de la mise à jour de l\'employé');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }
  }

  // Supprimer un employé
  async deleteEmploye(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/employes/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'employé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer tous les badges
  async getBadges(filters?: {
    status?: string;
    user_role?: string;
    search?: string;
  }): Promise<Badge[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.user_role) params.append('user_role', filters.user_role);
      if (filters?.search) params.append('search', filters.search);
      
      const url = params.toString() ? `/api/badges?${params.toString()}` : '/api/badges';
      const response = await apiClient.get<{ success: boolean; badges: Badge[]; total: number }>(url);
      
      if (response.success) {
        return response.badges;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des badges:', error);
      throw error;
    }
  }

  // Régénérer un badge
  async regenerateBadge(badgeId: number): Promise<Badge> {
    try {
      const response = await apiClient.post<{}, { success: boolean; badge: Badge; message: string }>(`/api/badges/${badgeId}/regenerate`, {});
      
      if (response.success) {
        return response.badge;
      }
      throw new Error(response.message || 'Erreur lors de la régénération du badge');
    } catch (error) {
      console.error('Erreur lors de la régénération du badge:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un badge
  async updateBadgeStatus(badgeId: number, status: 'active' | 'inactive' | 'expired'): Promise<Badge> {
    try {
      const response = await apiClient.put<{ status: string }, { success: boolean; badge: Badge; message: string }>(`/api/badges/${badgeId}/status`, { status });
      
      if (response.success) {
        return response.badge;
      }
      throw new Error(response.message || 'Erreur lors de la mise à jour du statut');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Régénérer tous les badges
  async regenerateAllBadges(): Promise<Badge[]> {
    try {
      const response = await apiClient.post<{}, { success: boolean; badges: Badge[]; message: string }>('/api/badges/regenerate-all', {});
      
      if (response.success) {
        return response.badges;
      }
      throw new Error(response.message || 'Erreur lors de la régénération des badges');
    } catch (error) {
      console.error('Erreur lors de la régénération des badges:', error);
      throw error;
    }
  }

  async updateAllBadgesStatus(status: 'active' | 'inactive'): Promise<Badge[]> {
    try {
      const response = await apiClient.put<{ status: 'active' | 'inactive' }, { success: boolean; badges: Badge[]; message: string }>(
        '/api/badges/status-all',
        { status }
      );

      if (response.success) {
        return response.badges;
      }
      throw new Error(response.message || 'Erreur lors de la mise a jour globale des badges');
    } catch (error) {
      console.error('Erreur lors de la mise a jour globale des badges:', error);
      throw error;
    }
  }

  // Obtenir les initiales
  getInitials(nom: string, prenom: string): string {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  }

  // Obtenir la couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Obtenir le texte du statut
  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'expired':
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  }

  // Formater la date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Formater la date et heure
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export const dataService = new DataService();
export default dataService;
