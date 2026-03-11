import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'

const ADMIN_ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  manager: 'Manager',
  hr: 'RH',
  chef_departement: 'Chef departement',
  comptable: 'Comptable',
  stagiaire: 'Stagiaire'
}

const formatAdminRoleLabel = (role?: string) => {
  const normalized = (role || 'admin').toLowerCase().trim()
  return ADMIN_ROLE_LABELS[normalized] || normalized.replace(/_/g, ' ')
}

interface Admin {
  id: number
  nom: string
  prenom: string
  email: string
  role?: string
  departement?: string
  poste?: string
  statut?: string
  telephone?: string
  date_creation?: string
  photo?: string
  dernier_connexion?: string
}

const AdminListPage: React.FC = () => {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.get<{ success: boolean; admins: Admin[] }>('/admins')
      setAdmins(response.admins || [])
    } catch (err) {
      console.error('Erreur chargement admins:', err)
      setError('Impossible de charger la liste des administrateurs.')
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdmins()
  }, [])

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return admins

    return admins.filter((admin) => {
      return (
        `${admin.prenom || ''} ${admin.nom || ''}`.toLowerCase().includes(query) ||
        (admin.email || '').toLowerCase().includes(query) ||
        (admin.role || '').toLowerCase().includes(query) ||
        (admin.poste || '').toLowerCase().includes(query) ||
        (admin.departement || '').toLowerCase().includes(query)
      )
    })
  }, [admins, search])

  const openAdminDetail = (adminId: number) => {
    navigate(`/admin/admins/${adminId}`)
  }

  const getStatutBadge = (statut?: string) => {
    switch (statut?.toLowerCase()) {
      case 'actif':
        return 'php-badge php-badge-success'
      case 'inactif':
        return 'php-badge php-badge-secondary'
      default:
        return 'php-badge php-badge-primary'
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return 'php-badge php-badge-danger'
      case 'admin':
        return 'php-badge php-badge-warning'
      case 'manager':
        return 'php-badge php-badge-info'
      case 'hr':
        return 'php-badge php-badge-primary'
      default:
        return 'php-badge php-badge-secondary'
    }
  }

  return (
    <section className="php-card">
      <div className="php-card-header">
        <h2 className="php-card-title">Administrateurs ({filteredAdmins.length})</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadAdmins()}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Rafraichir
          </button>
          <button
            onClick={() => navigate('/admin/admins/new')}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Nouvel admin
          </button>
        </div>
      </div>

      <div className="php-card-body">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => void loadAdmins()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Aucun administrateur trouvé' : 'Aucun administrateur'}
            </h3>
            <p className="text-gray-500 mb-4">
              {search 
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter votre premier administrateur'
              }
            </p>
            {!search && (
              <button
                onClick={() => navigate('/admin/admins/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter un administrateur
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher un administrateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="php-table-wrap">
              <table className="php-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Email</th>
                    <th>Poste</th>
                    <th>Rôle</th>
                    <th>Département</th>
                    <th>Statut</th>
                    <th>Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr 
                      key={admin.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openAdminDetail(admin.id)}
                    >
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {admin.photo ? (
                              <img src={admin.photo} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {`${admin.prenom?.[0] || ''}${admin.nom?.[0] || ''}`.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {`${admin.prenom || ''} ${admin.nom || ''}`.trim()}
                            </div>
                            {admin.poste && (
                              <div className="text-sm text-gray-500">{admin.poste}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-600">{admin.email}</td>
                      <td className="text-gray-600">{admin.poste || '-'}</td>
                      <td>
                        <span className={getRoleBadge(admin.role)}>
                          {formatAdminRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td className="text-gray-600">{admin.departement || '-'}</td>
                      <td>
                        <span className={getStatutBadge(admin.statut)}>
                          {admin.statut || 'Inconnu'}
                        </span>
                      </td>
                      <td className="text-gray-600">
                        {admin.dernier_connexion 
                          ? new Date(admin.dernier_connexion).toLocaleDateString('fr-FR')
                          : 'Jamais'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default AdminListPage
