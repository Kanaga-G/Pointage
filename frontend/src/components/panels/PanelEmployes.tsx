import React, { useState, useEffect } from 'react'
import { Employe, EmployeFormData, PaginatedResponse } from '../../types/dashboard'

// PanelEmployes : gestion complète des employés avec CRUD operations
interface PanelEmployesProps {
  data: Employe[]
  onEmployeUpdate?: () => void
}

export default function PanelEmployes({ data, onEmployeUpdate }: PanelEmployesProps) {
  const [employes, setEmployes] = useState<Employe[]>(data)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
  const [formData, setFormData] = useState<EmployeFormData>({
    prenom: '',
    nom: '',
    email: '',
    departement: '',
    poste: '',
    telephone: '',
    date_embauche: ''
  })

  // Synchroniser avec les props
  useEffect(() => {
    setEmployes(data)
  }, [data])

  // Filtrer les employés
  const filteredEmployes = employes.filter(employe =>
    `${employe.prenom} ${employe.nom} ${employe.email} ${employe.departement}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // Gérer le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Ajouter un employé
  const handleAddEmploye = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/employes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'employé')
      }

      const newEmploye = await response.json()
      setEmployes(prev => [...prev, newEmploye])
      setShowAddForm(false)
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        departement: '',
        poste: '',
        telephone: '',
        date_embauche: ''
      })
      onEmployeUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Modifier un employé
  const handleUpdateEmploye = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmploye) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/employes/${editingEmploye.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de l\'employé')
      }

      const updatedEmploye = await response.json()
      setEmployes(prev => prev.map(emp => 
        emp.id === updatedEmploye.id ? updatedEmploye : emp
      ))
      setEditingEmploye(null)
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        departement: '',
        poste: '',
        telephone: '',
        date_embauche: ''
      })
      onEmployeUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un employé
  const handleDeleteEmploye = async (employeId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/delete-employe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: employeId })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'employé')
      }

      setEmployes(prev => prev.filter(emp => emp.id !== employeId))
      onEmployeUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Commencer l'édition
  const startEdit = (employe: Employe) => {
    setEditingEmploye(employe)
    setFormData({
      prenom: employe.prenom,
      nom: employe.nom,
      email: employe.email,
      departement: employe.departement,
      poste: employe.poste || '',
      telephone: employe.telephone || '',
      date_embauche: employe.date_embauche || ''
    })
  }

  // Annuler le formulaire
  const cancelForm = () => {
    setShowAddForm(false)
    setEditingEmploye(null)
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      departement: '',
      poste: '',
      telephone: '',
      date_embauche: ''
    })
    setError(null)
  }

  return (
    <section id="employes" className="panel-section card bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestion des Employés</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary btn-sm"
          disabled={loading}
        >
          <i className="fas fa-plus mr-2" />
          Ajouter un employé
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle mr-2" />
          {error}
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {(showAddForm || editingEmploye) && (
        <div className="card border p-4 mb-4">
          <h4 className="mb-3">
            {editingEmploye ? 'Modifier l\'employé' : 'Ajouter un employé'}
          </h4>
          <form className="xp-form" onSubmit={editingEmploye ? handleUpdateEmploye : handleAddEmploye}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="xp-form-label">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="xp-form-input"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="xp-form-input"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="xp-form-input"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Département *</label>
                <select
                  name="departement"
                  value={formData.departement}
                  onChange={handleInputChange}
                  className="xp-form-input"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="IT">IT</option>
                  <option value="RH">RH</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Ventes">Ventes</option>
                  <option value="Production">Production</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Poste</label>
                <input
                  type="text"
                  name="poste"
                  value={formData.poste}
                  onChange={handleInputChange}
                  className="xp-form-input"
                />
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="xp-form-input"
                />
              </div>
              <div className="col-md-6">
                <label className="xp-form-label">Date d'embauche</label>
                <input
                  type="date"
                  name="date_embauche"
                  value={formData.date_embauche}
                  onChange={handleInputChange}
                  className="xp-form-input"
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2" />En cours...</>
                ) : (
                  <><i className="fas fa-save mr-2" />
                  {editingEmploye ? 'Modifier' : 'Ajouter'}</>
                )}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="btn btn-secondary"
                disabled={loading}
              >
                <i className="fas fa-times mr-2" />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des employés */}
      {filteredEmployes.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fas fa-users fa-3x mb-3" />
          <p>Aucun employé trouvé</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Employé</th>
                <th>Email</th>
                <th>Département</th>
                <th>Poste</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployes.map((employe) => (
                <tr key={employe.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                        {employe.prenom[0]}{employe.nom[0]}
                      </div>
                      <div>
                        <div className="fw-medium">
                          {employe.prenom} {employe.nom}
                        </div>
                        {employe.telephone && (
                          <small className="text-muted">{employe.telephone}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{employe.email}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {employe.departement}
                    </span>
                  </td>
                  <td>{employe.poste || '-'}</td>
                  <td>
                    <span className={`badge ${
                      employe.statut === 'actif' 
                        ? 'bg-success' 
                        : 'bg-secondary'
                    }`}>
                      {employe.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistiques */}
      <div className="mt-4 row text-center">
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title text-primary">{filteredEmployes.length}</h5>
              <p className="card-text small">Total employés</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title text-success">
                {filteredEmployes.filter(e => e.statut === 'actif').length}
              </h5>
              <p className="card-text small">Actifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title text-secondary">
                {filteredEmployes.filter(e => e.statut === 'inactif').length}
              </h5>
              <p className="card-text small">Inactifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title text-info">
                {new Set(filteredEmployes.map(e => e.departement)).size}
              </h5>
              <p className="card-text small">Départements</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
