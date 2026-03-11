// Service de gestion des informations complémentaires des employés pour Xpert Pro

interface EmployeInfo {
  email_pro: string
  id: string
  nom: string
  prenom: string
  matricule: string
  email: string
  telephone?: string
  dateEmbauche: string
  salaire: number
  typeContrat: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE' | 'APPRENTISSAGE'
  adresse: {
    rue: string
    // codePostal: string
    ville: string
    pays: string
  }
  poste: string
  departement: string
  manager?: {
    nom: string
    email: string
    telephone: string
  }
  avantages: Array<{
    type: string
    description: string
    valeur: string
  }>
  documents: Array<{
    type: string
    nom: string
    dateUpload: string
    url?: string
  }>
  dateCreation: string
  dateModification: string
}

class EmployeInfoService {
  private readonly EMPLOYE_INFO_KEY = 'xpert_employe_info'
  private employeInfo: EmployeInfo | null = null

  constructor() {
    this.chargerInfos()
  }

  private chargerInfos(): void {
    try {
      const infoStockees = localStorage.getItem(this.EMPLOYE_INFO_KEY)
      if (infoStockees) {
        this.employeInfo = JSON.parse(infoStockees)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des infos employé:', error)
    }
  }

  private sauvegarderInfos(): void {
    if (this.employeInfo) {
      localStorage.setItem(this.EMPLOYE_INFO_KEY, JSON.stringify(this.employeInfo))
    }
  }

  // Définir les informations complètes de l'employé
  setEmployeInfo(info: Partial<EmployeInfo>): void {
    const now = new Date().toISOString()
    
    this.employeInfo = {
      id: info.id || this.employeInfo?.id || '',
      nom: info.nom || this.employeInfo?.nom || '',
      prenom: info.prenom || this.employeInfo?.prenom || '',
      matricule: info.matricule || this.employeInfo?.matricule || '',
      email: info.email || this.employeInfo?.email || '',
      email_pro: info.email_pro || this.employeInfo?.email_pro || '',
      telephone: info.telephone || this.employeInfo?.telephone,
      dateEmbauche: info.dateEmbauche || this.employeInfo?.dateEmbauche || '',
      salaire: info.salaire || this.employeInfo?.salaire || 0,
      typeContrat: info.typeContrat || this.employeInfo?.typeContrat || 'CDI',
      adresse: info.adresse || this.employeInfo?.adresse || {
        rue: '',
        // codePostal: '',
        ville: '',
        pays: ''
      },
      poste: info.poste || this.employeInfo?.poste || '',
      departement: info.departement || this.employeInfo?.departement || '',
      manager: info.manager || this.employeInfo?.manager,
      avantages: info.avantages || this.employeInfo?.avantages || [],
      documents: info.documents || this.employeInfo?.documents || [],
      dateCreation: this.employeInfo?.dateCreation || now,
      dateModification: now
    }
    
    this.sauvegarderInfos()
  }

  // Obtenir les informations de l'employé
  getEmployeInfo(): EmployeInfo | null {
    return this.employeInfo ? { ...this.employeInfo } : null
  }

  // Formater le nom complet
  getNomComplet(): string {
    if (!this.employeInfo) return ''
    return `${this.employeInfo.prenom} ${this.employeInfo.nom}`.trim()
  }

  // Formater le salaire
  getSalaireFormate(): string {
    if (!this.employeInfo) return '0,00 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.employeInfo.salaire)
  }

  // Formater la date d'embauche
  getDateEmbaucheFormatee(): string {
    if (!this.employeInfo?.dateEmbauche) return ''
    try {
      const date = new Date(this.employeInfo.dateEmbauche)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return this.employeInfo.dateEmbauche
    }
  }

  // Formater l'adresse complète
  getAdresseComplete(): string {
    if (!this.employeInfo?.adresse) return ''
    const { rue,  ville, pays } = this.employeInfo.adresse
    const parties = [rue, ville, pays].filter(Boolean)
    return parties.join(', ')
  }

  // Obtenir l'ancienneté en années
  getAnciennete(): { annees: number; mois: number; texte: string } {
    if (!this.employeInfo?.dateEmbauche) {
      return { annees: 0, mois: 0, texte: '0 mois' }
    }
    
    try {
      const dateEmbauche = new Date(this.employeInfo.dateEmbauche)
      const maintenant = new Date()
      
      let annees = maintenant.getFullYear() - dateEmbauche.getFullYear()
      let mois = maintenant.getMonth() - dateEmbauche.getMonth()
      
      if (mois < 0) {
        annees--
        mois += 12
      }
      
      let texte = ''
      if (annees > 0) {
        texte += `${annees} an${annees > 1 ? 's' : ''}`
        if (mois > 0) texte += ' '
      }
      if (mois > 0) {
        texte += `${mois} mois`
      }
      
      return { annees, mois, texte: texte || '0 mois' }
    } catch {
      return { annees: 0, mois: 0, texte: '0 mois' }
    }
  }

  // Obtenir le libellé du type de contrat
  getLibelleTypeContrat(): string {
    if (!this.employeInfo) return ''
    
    const libelles: Record<string, string> = {
      'CDI': 'Contrat à Durée Indéterminée',
      'CDD': 'Contrat à Durée Déterminée',
      'INTERIM': 'Intérimaire',
      'STAGE': 'Stage',
      'APPRENTISSAGE': 'Contrat d\'Apprentissage'
    }
    
    return libelles[this.employeInfo.typeContrat] || this.employeInfo.typeContrat
  }

  // Mettre à jour un champ spécifique
  updateField<K extends keyof EmployeInfo>(champ: K, valeur: EmployeInfo[K]): void {
    if (this.employeInfo) {
      this.employeInfo[champ] = valeur
      this.employeInfo.dateModification = new Date().toISOString()
      this.sauvegarderInfos()
    }
  }

  // Ajouter un document
  ajouterDocument(document: Omit<EmployeInfo['documents'][0], 'dateUpload'>): void {
    if (this.employeInfo) {
      this.employeInfo.documents.push({
        ...document,
        dateUpload: new Date().toISOString()
      })
      this.sauvegarderInfos()
    }
  }

  // Supprimer un document
  supprimerDocument(index: number): void {
    if (this.employeInfo && this.employeInfo.documents[index]) {
      this.employeInfo.documents.splice(index, 1)
      this.sauvegarderInfos()
    }
  }

  // Réinitialiser les informations
  reinitialiser(): void {
    this.employeInfo = null
    localStorage.removeItem(this.EMPLOYE_INFO_KEY)
  }

  // Simuler des données de démonstration
  chargerDemoData(): void {
    const demoData: EmployeInfo = {
      id: 'EMP001',
      nom: 'Doe',
      prenom: 'John',
      matricule: 'SA-00254-MO',
      email: 'john.doe@entreprise.com',
      telephone: '+33 6 12 34 56 78',
      dateEmbauche: '2022-03-15',
      salaire: 35000,
      typeContrat: 'CDI',
      adresse: {
        rue: '123 Avenue des Champs-Élysées',
        // codePostal: '75008',
        ville: 'Paris',
        pays: 'France'
      },
      poste: 'Développeur Senior',
      departement: 'Direction Technique',
      manager: {
        nom: 'Martin Manager',
        email: 'martin.manager@entreprise.com',
        telephone: '+33 6 98 76 54 32'
      },
      avantages: [
        {
          type: 'Transport',
          description: 'Remboursement transport en commun',
          valeur: '50% du pass Navigo'
        },
        {
          type: 'Télétravail',
          description: 'Jours de télétravail',
          valeur: '2 jours par semaine'
        },
        {
          type: 'RTT',
          description: 'Jours RTT',
          valeur: '12 jours par an'
        }
      ],
      documents: [
        {
          type: 'Contrat',
          nom: 'contrat_cdi_2022.pdf',
          dateUpload: '2022-03-15T10:00:00Z'
        },
        {
          type: 'Carte d\'identité',
          nom: 'carte_identite_john_doe.jpg',
          dateUpload: '2022-03-10T14:30:00Z'
        }
      ],
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
      email_pro: ""
    }
    
    this.setEmployeInfo(demoData)
  }
}

export const employeInfoService = new EmployeInfoService()
export type { EmployeInfo }
