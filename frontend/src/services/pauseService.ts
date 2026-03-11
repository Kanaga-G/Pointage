// Service de gestion des pauses pour Xpert Pro
// Gère l'état de pause, le minuteur et la durée des pauses

interface PauseState {
  isPaused: boolean
  pauseStartTime: string | null
  pauseDuration: number // en minutes
  pauseReason?: string
}

class PauseService {
  private readonly PAUSE_KEY = 'xpert_pause_state'
  private pauseState: PauseState = {
    isPaused: false,
    pauseStartTime: null,
    pauseDuration: 0
  }

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.PAUSE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.pauseState = { ...this.pauseState, ...parsed }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état de pause:', error)
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.PAUSE_KEY, JSON.stringify(this.pauseState))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état de pause:', error)
    }
  }

  // Démarrer une pause
  startPause(duration: number, reason?: string): void {
    this.pauseState = {
      isPaused: true,
      pauseStartTime: new Date().toISOString(),
      pauseDuration: duration,
      pauseReason: reason
    }
    this.saveToStorage()
  }

  // Arrêter la pause
  endPause(): void {
    this.pauseState = {
      isPaused: false,
      pauseStartTime: null,
      pauseDuration: 0,
      pauseReason: undefined
    }
    this.saveToStorage()
  }

  // Obtenir l'état actuel de pause
  getPauseState(): PauseState {
    return { ...this.pauseState }
  }

  // Obtenir le temps écoulé depuis le début de la pause (en secondes)
  getElapsedTime(): number {
    if (!this.pauseState.isPaused || !this.pauseState.pauseStartTime) {
      return 0
    }
    
    const startTime = new Date(this.pauseState.pauseStartTime).getTime()
    const now = new Date().getTime()
    return Math.floor((now - startTime) / 1000)
  }

  // Obtenir le temps restant (en secondes)
  getRemainingTime(): number {
    if (!this.pauseState.isPaused) {
      return 0
    }
    
    const totalSeconds = this.pauseState.pauseDuration * 60
    const elapsed = this.getElapsedTime()
    return Math.max(0, totalSeconds - elapsed)
  }

  // Vérifier si la pause est terminée
  isPauseExpired(): boolean {
    return this.getRemainingTime() <= 0
  }

  // Formater le temps en MM:SS
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Obtenir le temps restant formaté
  getFormattedRemainingTime(): string {
    return this.formatTime(this.getRemainingTime())
  }

  // Obtenir le temps écoulé formaté
  getFormattedElapsedTime(): string {
    return this.formatTime(this.getElapsedTime())
  }

  // Mettre à jour la durée de la pause
  updatePauseDuration(duration: number): void {
    if (this.pauseState.isPaused) {
      this.pauseState.pauseDuration = duration
      this.saveToStorage()
    }
  }

  // Réinitialiser le service
  reset(): void {
    this.pauseState = {
      isPaused: false,
      pauseStartTime: null,
      pauseDuration: 0,
      pauseReason: undefined
    }
    this.saveToStorage()
  }
}

export const pauseService = new PauseService()
export type { PauseState }
