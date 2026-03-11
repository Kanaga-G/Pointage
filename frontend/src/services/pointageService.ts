// Service de gestion des pointages pour Xpert Pro
// Gère les pointages quotidiens, les états et la régénération de badges

interface PointageQuotidien {
  date: string // format YYYY-MM-DD
  arrivee?: {
    heure: string
    timestamp: string
    statut: 'en_cours' | 'termine'
  }
  depart?: {
    heure: string
    timestamp: string
  }
  pauses: Array<{
    debut: string
    fin?: string
    duree: number // en minutes
    raison?: string
  }>
  badgeUtilise: string
  peutPointer: boolean
}

interface DemandeRegeneration {
  id: string
  employeId: string
  employeNom: string
  employeEmail: string
  raison: string
  dateDemande: string
  statut: 'en_attente' | 'approuve' | 'refuse'
  adminId?: string
  adminNom?: string
  dateReponse?: string
  raisonRefus?: string
}

interface ParametresSysteme {
  heureReinitialisation: string // format HH:MM
  delaiRegeneration: number // en heures
  notificationsEmail: boolean
  notificationsDashboard: boolean
}

class PointageService {
  private readonly POINTAGE_KEY = 'xpert_pointage_quotidien'
  private readonly DEMANDES_KEY = 'xpert_demandes_regeneration'
  private readonly PARAMETRES_KEY = 'xpert_parametres_systeme'
  
  private pointageActuel: PointageQuotidien | null = null
  private demandes: DemandeRegeneration[] = []
  private parametres: ParametresSysteme = {
    heureReinitialisation: '00:00',
    delaiRegeneration: 24,
    notificationsEmail: true,
    notificationsDashboard: true
  }

  constructor() {
    this.chargerDonnees()
    this.verifierReinitialisation()
  }

  private chargerDonnees(): void {
    try {
      // Charger le pointage du jour
      const pointageStocke = localStorage.getItem(this.POINTAGE_KEY)
      if (pointageStocke) {
        const pointage = JSON.parse(pointageStocke)
        const today = new Date().toISOString().split('T')[0]
        
        if (pointage.date === today) {
          this.pointageActuel = pointage
        } else {
          // Nouveau jour, réinitialiser
          this.pointageActuel = this.creerNouveauPointage()
          this.sauvegarderPointage()
        }
      } else {
        this.pointageActuel = this.creerNouveauPointage()
      }

      // Charger les demandes
      const demandesStockees = localStorage.getItem(this.DEMANDES_KEY)
      if (demandesStockees) {
        this.demandes = JSON.parse(demandesStockees)
      }

      // Charger les paramètres
      const parametresStockes = localStorage.getItem(this.PARAMETRES_KEY)
      if (parametresStockes) {
        this.parametres = { ...this.parametres, ...JSON.parse(parametresStockes) }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      this.pointageActuel = this.creerNouveauPointage()
    }
  }

  private creerNouveauPointage(): PointageQuotidien {
    return {
      date: new Date().toISOString().split('T')[0],
      pauses: [],
      badgeUtilise: '',
      peutPointer: true
    }
  }

  private sauvegarderPointage(): void {
    if (this.pointageActuel) {
      localStorage.setItem(this.POINTAGE_KEY, JSON.stringify(this.pointageActuel))
    }
  }

  private sauvegarderDemandes(): void {
    localStorage.setItem(this.DEMANDES_KEY, JSON.stringify(this.demandes))
  }

  private sauvegarderParametres(): void {
    localStorage.setItem(this.PARAMETRES_KEY, JSON.stringify(this.parametres))
  }

  private verifierReinitialisation(): void {
    const maintenant = new Date()
    const heureActuelle = maintenant.toTimeString().slice(0, 5) // HH:MM
    
    if (heureActuelle === this.parametres.heureReinitialisation) {
      const derniereReinitialisation = localStorage.getItem('xpert_derniere_reinitialisation')
      const today = maintenant.toISOString().split('T')[0]
      
      if (derniereReinitialisation !== today) {
        this.reinitialiserPointages()
        localStorage.setItem('xpert_derniere_reinitialisation', today)
      }
    }
  }

  private reinitialiserPointages(): void {
    // Réinitialiser tous les pointages et générer de nouveaux badges
    this.pointageActuel = this.creerNouveauPointage()
    this.sauvegarderPointage()
    
    // Notifier le système de réinitialisation
    this.notifierReinitialisation()
  }

  // Vérifier si l'employé peut pointer
  peutPointer(badgeId: string): { peut: boolean; raison?: string } {
    if (!this.pointageActuel) {
      return { peut: false, raison: 'Pointage non initialisé' }
    }

    const today = new Date().toISOString().split('T')[0]
    if (this.pointageActuel.date !== today) {
      return { peut: false, raison: 'Nouvelle journée, réinitialisation en cours' }
    }

    if (!this.pointageActuel.peutPointer) {
      return { peut: false, raison: 'Pointage terminé pour aujourd\'hui' }
    }

    // Vérifier si le badge a déjà été utilisé aujourd'hui
    if (this.pointageActuel.badgeUtilise && this.pointageActuel.badgeUtilise !== badgeId) {
      return { peut: false, raison: 'Badge différent utilisé aujourd\'hui' }
    }

    // Vérifier si l'arrivée est déjà enregistrée
    if (this.pointageActuel.arrivee && !this.pointageActuel.depart) {
      // Arrivée en cours, vérifier si c'est une pause ou un départ
      const maintenant = new Date()
      const heureActuelle = maintenant.getHours()
      
      if (heureActuelle < 18) {
        return { peut: true, raison: 'Pause possible' }
      } else {
        return { peut: true, raison: 'Départ possible' }
      }
    }

    // Vérifier si le départ est déjà enregistré
    if (this.pointageActuel.depart) {
      return { peut: false, raison: 'Départ déjà enregistré aujourd\'hui' }
    }

    return { peut: true }
  }

  // Enregistrer une arrivée
  enregistrerArrivee(badgeId: string, heure: string, timestamp: string): boolean {
    if (!this.pointageActuel || !this.peutPointer(badgeId).peut) {
      return false
    }

    this.pointageActuel.arrivee = {
      heure,
      timestamp,
      statut: 'en_cours'
    }
    this.pointageActuel.badgeUtilise = badgeId
    this.sauvegarderPointage()
    return true
  }

  // Enregistrer un départ
  enregistrerDepart(heure: string, timestamp: string): boolean {
    if (!this.pointageActuel || !this.pointageActuel.arrivee) {
      return false
    }

    this.pointageActuel.depart = {
      heure,
      timestamp
    }
    
    // Marquer l'arrivée comme terminée
    if (this.pointageActuel.arrivee) {
      this.pointageActuel.arrivee.statut = 'termine'
    }
    
    // Interdire les pointages supplémentaires pour aujourd'hui
    this.pointageActuel.peutPointer = false
    
    this.sauvegarderPointage()
    return true
  }

  // Enregistrer une pause
  enregistrerPause(debut: string, duree: number, raison?: string): boolean {
    if (!this.pointageActuel || !this.pointageActuel.arrivee || this.pointageActuel.depart) {
      return false
    }

    this.pointageActuel.pauses.push({
      debut,
      duree,
      raison
    })
    
    this.sauvegarderPointage()
    return true
  }

  // Terminer une pause
  terminerPause(fin: string): boolean {
    if (!this.pointageActuel || this.pointageActuel.pauses.length === 0) {
      return false
    }

    const dernierePause = this.pointageActuel.pauses[this.pointageActuel.pauses.length - 1]
    if (!dernierePause.fin) {
      dernierePause.fin = fin
      this.sauvegarderPointage()
    }
    
    return true
  }

  // Demander une régénération de badge
  demanderRegeneration(employeId: string, employeNom: string, employeEmail: string, raison: string): string {
    const demande: DemandeRegeneration = {
      id: Date.now().toString(),
      employeId,
      employeNom,
      employeEmail,
      raison,
      dateDemande: new Date().toISOString(),
      statut: 'en_attente'
    }

    this.demandes.push(demande)
    this.sauvegarderDemandes()
    
    // Notifier les admins
    this.notifierAdmins(demande)
    
    return demande.id
  }

  // Approuver une demande de régénération
  approuverRegeneration(demandeId: string, adminId: string, adminNom: string): boolean {
    const demande = this.demandes.find(d => d.id === demandeId)
    if (!demande || demande.statut !== 'en_attente') {
      return false
    }

    demande.statut = 'approuve'
    demande.adminId = adminId
    demande.adminNom = adminNom
    demande.dateReponse = new Date().toISOString()
    
    this.sauvegarderDemandes()
    
    // Réinitialiser le pointage de l'employé
    this.reinitialiserPointageEmploye(demande.employeId)
    
    // Notifier l'employé
    this.notifierApprobation(demande)
    
    return true
  }

  // Refuser une demande de régénération
  refuserRegeneration(demandeId: string, adminId: string, adminNom: string, raisonRefus: string): boolean {
    const demande = this.demandes.find(d => d.id === demandeId)
    if (!demande || demande.statut !== 'en_attente') {
      return false
    }

    demande.statut = 'refuse'
    demande.adminId = adminId
    demande.adminNom = adminNom
    demande.dateReponse = new Date().toISOString()
    demande.raisonRefus = raisonRefus
    
    this.sauvegarderDemandes()
    
    // Notifier le refus à l'employé
    this.notifierRefus(demande)
    
    return true
  }

  private reinitialiserPointageEmploye(employeId: string): void {
    // Réinitialiser uniquement le pointage de cet employé
    if (this.pointageActuel) {
      this.pointageActuel.badgeUtilise = ''
      this.pointageActuel.peutPointer = true
      this.sauvegarderPointage()
    }
  }

  // Getters
  getPointageActuel(): PointageQuotidien | null {
    return this.pointageActuel ? { ...this.pointageActuel } : null
  }

  getDemandes(): DemandeRegeneration[] {
    return [...this.demandes]
  }

  getDemandesEnAttente(): DemandeRegeneration[] {
    return this.demandes.filter(d => d.statut === 'en_attente')
  }

  getParametres(): ParametresSysteme {
    return { ...this.parametres }
  }

  updateParametres(nouveauxParametres: Partial<ParametresSysteme>): void {
    this.parametres = { ...this.parametres, ...nouveauxParametres }
    this.sauvegarderParametres()
  }

  // Notifications (à implémenter avec le système de notification)
  private notifierReinitialisation(): void {
    console.log('🔄 Réinitialisation quotidienne des pointages')
    // TODO: Implémenter la notification système
  }

  private notifierAdmins(demande: DemandeRegeneration): void {
    console.log('📧 Notification admin - Nouvelle demande de régénération:', demande)
    // TODO: Implémenter l'email aux admins
  }

  private notifierApprobation(demande: DemandeRegeneration): void {
    console.log('✅ Notification employé - Demande approuvée:', demande)
    // TODO: Implémenter l'email à l'employé
  }

  private notifierRefus(demande: DemandeRegeneration): void {
    console.log('❌ Notification employé - Demande refusée:', demande)
    // TODO: Implémenter l'email et notification dashboard
  }
}

export const pointageService = new PointageService()
export type { PointageQuotidien, DemandeRegeneration, ParametresSysteme }
