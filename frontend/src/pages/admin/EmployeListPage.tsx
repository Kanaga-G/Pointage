import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, Employe } from '../../services/adminService'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  manager: 'Manager',
  hr: 'RH',
  chef_departement: 'Chef departement',
  comptable: 'Comptable',
  stagiaire: 'Stagiaire',
  employe: 'Employe'
}

const formatRoleLabel = (role?: string) => {
  const normalized = (role || 'employe').toLowerCase().trim()
  return ROLE_LABELS[normalized] || normalized.replace(/_/g, ' ')
}

const EmployeListPage: React.FC = () => {
  const navigate = useNavigate()
  const [employes, setEmployes] = useState<Employe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadEmployes = async () => {
    try {
      setLoading(true)
      setError(null)
      const perPage = 100
      const firstPage = await adminService.getEmployes({ page: 1, per_page: perPage })
      let allEmployes = Array.isArray(firstPage.items) ? [...firstPage.items] : []

      const totalPages = Math.max(1, Number(firstPage.total_pages || 1))
      if (totalPages > 1) {
        const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
          adminService.getEmployes({ page: index + 2, per_page: perPage })
        )
        const pageResults = await Promise.all(pageRequests)
        pageResults.forEach((result) => {
          if (Array.isArray(result.items)) {
            allEmployes = allEmployes.concat(result.items)
          }
        })
      }

      const uniqueEmployes = Array.from(new Map(allEmployes.map((employe) => [employe.id, employe])).values())
      setEmployes(uniqueEmployes)
    } catch (err) {
      console.error('Erreur chargement employes:', err)
      setError('Impossible de charger la liste des employes.')
      setEmployes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEmployes()
  }, [])

  const filteredEmployes = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return employes

    return employes.filter((employe) => {
      return (
        `${employe.prenom || ''} ${employe.nom || ''}`.toLowerCase().includes(query) ||
        (employe.email || '').toLowerCase().includes(query) ||
        (employe.role || '').toLowerCase().includes(query) ||
        (employe.poste || '').toLowerCase().includes(query) ||
        (employe.departement || '').toLowerCase().includes(query)
      )
    })
  }, [employes, search])

  const openEmployeDetail = (employeId: number) => {
    navigate(`/admin/employes/${employeId}`)
  }

  return (
    <section className="php-card">
      <div className="php-card-header">
        <h2 className="php-card-title">Employes ({filteredEmployes.length})</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadEmployes()}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Rafraichir
          </button>
          <button
            onClick={() => navigate('/admin/employes/new')}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Nouvel employe
          </button>
        </div>
      </div>

      <div className="php-card-body">
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom, email, poste ou departement"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading ? <p>Chargement des employes...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="php-table-wrap">
            <table className="php-table">
              <thead>
                <tr>
                  <th>Employe</th>
                  <th>Matricule</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Departement</th>
                  <th>Poste</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployes.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Aucun employe trouve.</td>
                  </tr>
                ) : (
                  filteredEmployes.map((employe) => (
                    <tr
                      key={employe.id}
                      onClick={() => openEmployeDetail(employe.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openEmployeDetail(employe.id)
                        }
                      }}
                      tabIndex={0}
                      className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <td>{employe.prenom} {employe.nom}</td>
                      <td>{employe.matricule || '-'}</td>
                      <td>{employe.email}</td>
                      <td>
                        <span className="php-pill is-primary">{formatRoleLabel(employe.role)}</span>
                      </td>
                      <td>{employe.departement || '-'}</td>
                      <td>{employe.poste || '-'}</td>
                      <td>
                        <span className={`php-pill ${employe.statut === 'actif' ? 'is-success' : 'is-warning'}`}>
                          {employe.statut || 'inconnu'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default EmployeListPage
