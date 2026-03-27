import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LayoutFix from '../../components/LayoutFix'
import { useAuth } from '../../services/authService'
import { dataService } from '../../services/dataService'

interface Badge {
  id: number
  token: string
  token_hash: string
  user_id: number
  user_type?: 'employe' | 'admin'
  user_matricule?: string
  user_name: string
  user_email: string
  user_role: string
  created_at: string
  expires_at: string
  status: 'active' | 'inactive' | 'expired'
  last_used?: string
  usage_count: number
}

interface User {
  id: number
  matricule?: string
  nom: string
  prenom: string
  email: string
  role: string
  statut: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  manager: 'Manager',
  hr: 'RH',
  chef_departement: 'Chef departement',
  stagiaire: 'Stagiaire',
  employe: 'Employe'
}

const ROLE_BADGE_PRIVILEGES: Record<string, string[]> = {
  super_admin: [
    'Acces complet administration et parametres sensibles',
    'Validation globale des pointages et demandes',
    'Gestion de tous les roles et badges'
  ],
  admin: [
    'Acces complet a l espace admin',
    'Gestion des employes, badges, roles et calendrier',
    'Validation des demandes et suivi pointage'
  ],
  manager: [
    'Acces equipe et suivi operationnel',
    'Consultation des pointages et demandes de son perimetre',
    'Edition des infos professionnelles selon droits'
  ],
  chef_departement: [
    'Acces pilotage departement',
    'Suivi des presences du departement',
    'Validation de premier niveau'
  ],
  stagiaire: [
    'Pointage personnel arrivee/depart',
    'Acces limite au profil personnel',
    'Aucune action de gestion globale'
  ],
  employe: [
    'Pointage personnel arrivee/depart',
    'Consultation historique personnel',
    'Soumission de demandes'
  ]
}

const getRoleLabel = (role?: string) => {
  const key = String(role || 'employe').trim().toLowerCase()
  return ROLE_LABELS[key] || key.replace(/_/g, ' ')
}

const getRoleBadgePrivileges = (role?: string) => {
  const key = String(role || 'employe').trim().toLowerCase()
  return ROLE_BADGE_PRIVILEGES[key] || ROLE_BADGE_PRIVILEGES.employe
}

const getStatusClasses = (status: Badge['status']) => {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

const getStatusLabel = (status: Badge['status']) => {
  if (status === 'active') return 'Actif'
  if (status === 'inactive') return 'Inactif'
  return 'Expire'
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('fr-FR')
}

const buildBadgeQrUrl = (token?: string, size = 120) => {
  const safeToken = String(token || '').trim()
  if (!safeToken) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safeToken)}`
}

const buildUserKey = (badge: Pick<Badge, 'user_type' | 'user_id'>) => `${badge.user_type || 'employe'}-${badge.user_id}`

export default function BadgeManagementPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [badges, setBadges] = useState<Badge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Badge['status']>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null)
  const [zoomedBadgeToken, setZoomedBadgeToken] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [badgesData, usersData] = await Promise.all([
        dataService.getBadges(),
        dataService.getEmployes()
      ])

      setBadges(badgesData as Badge[])
      setUsers(usersData as User[])
    } catch (loadError) {
      console.error('Erreur chargement badges:', loadError)
      setError('Erreur lors du chargement des donnees badges.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      navigate('/admin')
      return
    }

    void loadData()
  }, [navigate, user])

  const selectedBadge = useMemo(
    () => badges.find((badge) => badge.id === selectedBadgeId) || null,
    [badges, selectedBadgeId]
  )

  const handleRegenerateBadge = async (badgeId: number) => {
    try {
      setRegenerating(true)
      setError(null)
      setSuccess(null)

      const updatedBadge = await dataService.regenerateBadge(badgeId)
      const merged = [updatedBadge as Badge, ...badges.filter((badge) => buildUserKey(badge) !== buildUserKey(updatedBadge as Badge))]
      setBadges(merged)
      setSelectedBadgeId((updatedBadge as Badge).id)
      setSuccess('Badge regenere avec succes.')
    } catch (operationError) {
      console.error('Erreur regeneration badge:', operationError)
      setError('Erreur lors de la regeneration du badge.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleRegenerateAllBadges = async () => {
    try {
      setRegenerating(true)
      setError(null)
      setSuccess(null)

      const updatedBadges = await dataService.regenerateAllBadges()
      setBadges(updatedBadges as Badge[])
      setSelectedBadgeId(null)
      setSuccess('Tous les badges ont ete regeneres.')
    } catch (operationError) {
      console.error('Erreur regeneration globale badges:', operationError)
      setError('Erreur lors de la regeneration globale des badges.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleUpdateStatus = async (badgeId: number, nextStatus: 'active' | 'inactive') => {
    try {
      setUpdatingStatus(true)
      setError(null)
      setSuccess(null)

      const updated = await dataService.updateBadgeStatus(badgeId, nextStatus)
      setBadges((prev) => prev.map((badge) => (badge.id === badgeId ? (updated as Badge) : badge)))
      setSuccess(`Statut mis a jour: ${nextStatus === 'active' ? 'Actif' : 'Inactif'}.`)
    } catch (operationError) {
      console.error('Erreur changement statut badge:', operationError)
      setError('Erreur lors de la mise a jour du statut.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleUpdateAllStatus = async (status: 'active' | 'inactive') => {
    const confirmed = window.confirm(
      status === 'active'
        ? 'Activer tous les badges visibles ?'
        : 'Desactiver tous les badges visibles ?'
    )
    if (!confirmed) return

    try {
      setUpdatingStatus(true)
      setError(null)
      setSuccess(null)
      const updatedBadges = await dataService.updateAllBadgesStatus(status)
      setBadges(updatedBadges as Badge[])
      setSelectedBadgeId((currentId) => {
        if (!currentId) return currentId
        const exists = (updatedBadges as Badge[]).some((badge) => badge.id === currentId)
        return exists ? currentId : null
      })
      setSuccess(status === 'active' ? 'Tous les badges ont ete actives.' : 'Tous les badges ont ete desactives.')
    } catch (operationError) {
      console.error('Erreur mise a jour globale badges:', operationError)
      setError('Erreur lors de la mise a jour globale des badges.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        badge.user_name.toLowerCase().includes(q) ||
        badge.user_email.toLowerCase().includes(q) ||
        String(badge.user_matricule || '').toLowerCase().includes(q) ||
        badge.token.toLowerCase().includes(q)

      const matchesStatus = filterStatus === 'all' || badge.status === filterStatus
      const matchesUser = selectedUser === null || badge.user_id === selectedUser

      return matchesSearch && matchesStatus && matchesUser
    })
  }, [badges, filterStatus, searchTerm, selectedUser])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, selectedUser])

  const totalPages = Math.max(1, Math.ceil(filteredBadges.length / itemsPerPage))
  const paginatedBadges = filteredBadges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <LayoutFix title="Gestion des badges">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    )
  }

  return (
    <LayoutFix title="Gestion des badges">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des badges</h1>
              <p className="text-gray-600 mt-2">Cliquez sur un badge pour ouvrir son detail et ses actions.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => void loadData()}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Rafraichir
              </button>
              <button
                onClick={() => void handleRegenerateAllBadges()}
                disabled={regenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {regenerating ? 'Regeneration...' : 'Regenerer tous les badges'}
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div> : null}
        {success ? <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div> : null}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nom, email, matricule, token..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as 'all' | Badge['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="expired">Expires</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
              <select
                value={selectedUser === null ? '' : String(selectedUser)}
                onChange={(event) => {
                  const nextUserId = event.target.value ? Number(event.target.value) : null
                  setSelectedUser(nextUserId)
                  if (!nextUserId) {
                    setSelectedBadgeId(null)
                    return
                  }
                  const nextBadge = badges.find((entry) => entry.user_id === nextUserId) || null
                  setSelectedBadgeId(nextBadge?.id || null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les utilisateurs</option>
                {users.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.prenom} {entry.nom} {entry.matricule ? `- ${entry.matricule}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apercu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cree le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expire le</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBadges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                      Aucun badge trouve.
                    </td>
                  </tr>
                ) : (
                  paginatedBadges.map((badge) => (
                    <tr
                      key={badge.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedBadgeId(badge.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedBadgeId(badge.id)
                        }
                      }}
                      tabIndex={0}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setZoomedBadgeToken(badge.token)
                          }}
                          className="rounded-lg border border-gray-200 bg-white p-1 hover:shadow"
                          title="Voir badge en grand"
                        >
                          <img
                            src={buildBadgeQrUrl(badge.token, 72)}
                            alt={`Badge ${badge.user_name}`}
                            className="w-[52px] h-[52px] object-contain"
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 max-w-xs truncate">{badge.token}</div>
                        <div className="text-xs text-blue-600">Voir details</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{badge.user_name}</div>
                          <div className="text-gray-500">{badge.user_email}</div>
                          <div className="text-xs text-gray-500">
                            {badge.user_matricule ? `Matricule: ${badge.user_matricule}` : `Utilisateur #${badge.user_id}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{getRoleLabel(badge.user_role)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(badge.status)}`}>
                          {getStatusLabel(badge.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{badge.usage_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(badge.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(badge.expires_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredBadges.length)} sur {filteredBadges.length} badges
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Precedent
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions globales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => void handleRegenerateAllBadges()}
              disabled={regenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Regenerer tous les badges
            </button>

            <button
              onClick={() => void handleUpdateAllStatus('inactive')}
              disabled={updatingStatus}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-ban"></i>
              Desactiver tous les badges
            </button>

            <button
              onClick={() => void handleUpdateAllStatus('active')}
              disabled={updatingStatus}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              Activer tous les badges
            </button>
          </div>
        </div>
      </div>

      {selectedBadge ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedBadgeId(null)} aria-hidden="true"></div>
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detail du badge</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedBadge.user_name} ({getRoleLabel(selectedBadge.user_role)})</p>
              </div>
              <button
                onClick={() => setSelectedBadgeId(null)}
                className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="space-y-3">
                <h4 className="font-semibold text-gray-900">Apercu badge</h4>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setZoomedBadgeToken(selectedBadge.token)}
                    className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-md transition-shadow"
                    title="Afficher en grand"
                  >
                    <img
                      src={buildBadgeQrUrl(selectedBadge.token, 220)}
                      alt={`Badge ${selectedBadge.user_name}`}
                      className="w-[220px] h-[220px] object-contain"
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Cliquez sur le badge pour l'ouvrir en grand format.</p>
              </section>

              <section className="space-y-3">
                <h4 className="font-semibold text-gray-900">Informations user + badge</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Utilisateur:</strong> {selectedBadge.user_name}</p>
                  <p><strong>Role:</strong> {getRoleLabel(selectedBadge.user_role)}</p>
                  <p><strong>Token:</strong> <span className="font-mono break-all">{selectedBadge.token}</span></p>
                  <p><strong>Matricule:</strong> {selectedBadge.user_matricule || `Utilisateur #${selectedBadge.user_id}`}</p>
                  <p><strong>Email:</strong> {selectedBadge.user_email || '-'}</p>
                  <p><strong>Cree le:</strong> {formatDateTime(selectedBadge.created_at)}</p>
                  <p><strong>Expire le:</strong> {formatDateTime(selectedBadge.expires_at)}</p>
                  <p><strong>Derniere utilisation:</strong> {formatDateTime(selectedBadge.last_used)}</p>
                  <p><strong>Utilisations:</strong> {selectedBadge.usage_count}</p>
                  <p>
                    <strong>Statut:</strong>{' '}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(selectedBadge.status)}`}>
                      {getStatusLabel(selectedBadge.status)}
                    </span>
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="font-semibold text-gray-900">Privileges selon role</h4>
                <div className="space-y-2">
                  {getRoleBadgePrivileges(selectedBadge.user_role).map((privilege) => (
                    <div key={privilege} className="rounded-lg border border-blue-100 bg-blue-50 text-blue-900 px-3 py-2 text-sm">
                      {privilege}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={() => void handleRegenerateBadge(selectedBadge.id)}
                disabled={regenerating}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {regenerating ? 'Regeneration...' : 'Regenerer ce badge'}
              </button>

              {selectedBadge.status === 'active' ? (
                <button
                  onClick={() => void handleUpdateStatus(selectedBadge.id, 'inactive')}
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Desactiver
                </button>
              ) : (
                <button
                  onClick={() => void handleUpdateStatus(selectedBadge.id, 'active')}
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {zoomedBadgeToken ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/55" onClick={() => setZoomedBadgeToken(null)} aria-hidden="true"></div>
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Badge QR - grand format</h3>
              <button
                type="button"
                onClick={() => setZoomedBadgeToken(null)}
                className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center">
              <img
                src={buildBadgeQrUrl(zoomedBadgeToken, 420)}
                alt="Badge QR agrandi"
                className="w-[420px] h-[420px] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </LayoutFix>
  )
}
