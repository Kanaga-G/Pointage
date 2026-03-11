import React, { useState, useEffect } from 'react'
import { Demande } from '../../types/dashboard'

// PanelDemandes : gestion des demandes avec approbation/rejet
interface PanelDemandesProps {
  data: Demande[]
  stats: {
    total: number
    en_attente: number
    approuve: number
    rejete: number
  }
  onDemandeUpdate?: () => void
}

export default function PanelDemandes({ data, stats, onDemandeUpdate }: PanelDemandesProps) {
  const [demandes, setDemandes] = useState<Demande[]>(data)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'toutes' | 'en_attente' | 'approuve' | 'rejete'>('toutes')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null)
  const [actionToProcess, setActionToProcess] = useState<'approuve' | 'rejete' | null>(null)
  const [managerComment, setManagerComment] = useState('')

  // Synchroniser avec les props
  useEffect(() => {
    setDemandes(data)
  }, [data])

  // Filtrer les demandes
  const filteredDemandes = demandes.filter(demande => {
    if (filter === 'toutes') return true
    return demande.statut === filter
  })

  // Open modal to process a demande
  const openProcessModal = (demande: Demande, action: 'approuve' | 'rejete') => {
    setSelectedDemande(demande)
    setActionToProcess(action)
    setManagerComment('')
    setModalOpen(true)
  }

  // Confirm processing (call API)
  const confirmProcess = async () => {
    if (!selectedDemande || !actionToProcess) return
    setProcessingId(selectedDemande.id)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/traiter-demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDemande.id, action: actionToProcess, commentaire: managerComment })
      })
      if (!response.ok) throw new Error('Erreur lors du traitement')
      const result = await response.json()
      if (!result.success) throw new Error(result.message || 'Erreur')

      // update local list
      setDemandes(prev => prev.map(d => d.id === selectedDemande.id ? { ...d, statut: actionToProcess, date_traitement: new Date().toISOString() } : d))
      onDemandeUpdate?.()
      setModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
      setProcessingId(null)
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obtenir la couleur du badge de statut
  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-warning text-dark'
      case 'approuve':
        return 'bg-success'
      case 'rejete':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  // Obtenir l'icône du type de demande
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conge':
        return 'fa-calendar-alt'
      case 'absence':
        return 'fa-user-times'
      case 'retard':
        return 'fa-clock'
      default:
        return 'fa-file-alt'
    }
  }

  return (
    <section id="demandes" className="panel-section card bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestion des Demandes</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">
            {stats.en_attente} en attente
          </span>
          {stats.en_attente > 0 && (
            <span className="badge bg-warning text-dark pulse">
              <i className="fas fa-exclamation-triangle mr-1" />
              Nouvelles
            </span>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'toutes', label: 'Toutes', count: stats.total },
          { key: 'en_attente', label: 'En attente', count: stats.en_attente },
          { key: 'approuve', label: 'Approuvées', count: stats.approuve },
          { key: 'rejete', label: 'Rejetées', count: stats.rejete }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`btn btn-sm ${
              filter === key 
                ? 'btn-primary' 
                : 'btn-outline-secondary'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="card bg-light text-center">
          <div className="card-body p-3">
            <h6 className="card-title text-primary mb-1">{stats.total}</h6>
            <p className="card-text small mb-0">Total</p>
          </div>
        </div>
        <div className="card bg-light text-center">
          <div className="card-body p-3">
            <h6 className="card-title text-warning mb-1">{stats.en_attente}</h6>
            <p className="card-text small mb-0">En attente</p>
          </div>
        </div>
        <div className="card bg-light text-center">
          <div className="card-body p-3">
            <h6 className="card-title text-success mb-1">{stats.approuve}</h6>
            <p className="card-text small mb-0">Approuvées</p>
          </div>
        </div>
        <div className="card bg-light text-center">
          <div className="card-body p-3">
            <h6 className="card-title text-danger mb-1">{stats.rejete}</h6>
            <p className="card-text small mb-0">Rejetées</p>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle mr-2" />
          {error}
        </div>
      )}

      {/* Liste des demandes */}
      {filteredDemandes.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fas fa-inbox fa-3x mb-3" />
          <p>Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDemandes.map((demande) => (
            <div key={demande.id} className="card border hover-shadow" onClick={() => { if (demande.statut === 'en_attente') openProcessModal(demande, 'approuve') }}>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`fas ${getTypeIcon(demande.type)} text-primary me-2`} />
                      <h6 className="card-title mb-0 me-2">
                        {demande.type.replace('_', ' ').toUpperCase()}
                      </h6>
                      <span className={`badge ${getStatutBadgeClass(demande.statut)}`}>
                        {demande.statut.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="card-text text-muted mb-2">
                      <i className="fas fa-user me-1" />
                      {demande.employe} • 
                      <i className="fas fa-calendar ms-2 me-1" />
                      {formatDate(demande.date_debut)}
                      {demande.date_fin && demande.date_fin !== demande.date_debut && (
                        <> au {formatDate(demande.date_fin)}</>
                      )}
                    </p>
                    {demande.motif && (
                      <p className="card-text">
                        <small>
                          <i className="fas fa-comment me-1" />
                          {demande.motif}
                        </small>
                      </p>
                    )}
                    {demande.date_traitement && (
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="fas fa-check-circle me-1" />
                          Traité le {formatDate(demande.date_traitement)}
                          {demande.traite_par && ` par ${demande.traite_par}`}
                        </small>
                      </p>
                    )}
                  </div>
                  <div className="col-md-4 text-end">
                    {demande.statut === 'en_attente' ? (
                      <div className="btn-group">
                        <button
                          onClick={(e) => { e.stopPropagation(); openProcessModal(demande, 'approuve') }}
                          className="btn btn-success btn-sm"
                          disabled={loading && processingId === demande.id}
                        >
                          {loading && processingId === demande.id ? (
                            <><i className="fas fa-spinner fa-spin" /></>
                          ) : (
                            <><i className="fas fa-check me-1" />Approuver</>
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openProcessModal(demande, 'rejete') }}
                          className="btn btn-danger btn-sm"
                          disabled={loading && processingId === demande.id}
                        >
                          {loading && processingId === demande.id ? (
                            <><i className="fas fa-spinner fa-spin" /></>
                          ) : (
                            <><i className="fas fa-times me-1" />Rejeter</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-muted">
                        <i className={`fas ${
                          demande.statut === 'approuve' 
                            ? 'fa-check-circle text-success' 
                            : 'fa-times-circle text-danger'
                        } fa-2x`} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: traiter demande */}
      {modalOpen && selectedDemande && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Traiter la demande</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="modal-body">
                <p><strong>{selectedDemande.type.toUpperCase()}</strong> — {selectedDemande.employe}</p>
                {selectedDemande.motif && <p><em>{selectedDemande.motif}</em></p>}
                <div className="mb-3">
                  <label className="form-label">Commentaire du manager (optionnel)</label>
                  <textarea className="form-control" rows={4} value={managerComment} onChange={(e) => setManagerComment(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
                <button className="btn btn-danger" onClick={() => { setActionToProcess('rejete'); confirmProcess() }} disabled={loading && processingId === selectedDemande.id}>Rejeter</button>
                <button className="btn btn-success" onClick={() => { setActionToProcess('approuve'); confirmProcess() }} disabled={loading && processingId === selectedDemande.id}>Approuver</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions groupées pour les demandes en attente */}
      {filter === 'en_attente' && filteredDemandes.length > 1 && (
        <div className="mt-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-medium">
              {filteredDemandes.length} demandes en attente
            </span>
            <div className="btn-group">
              <button className="btn btn-success btn-sm">
                <i className="fas fa-check me-1" />
                Tout approuver
              </button>
              <button className="btn btn-danger btn-sm">
                <i className="fas fa-times me-1" />
                Tout rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
