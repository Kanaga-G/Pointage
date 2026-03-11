import React, { useState, useMemo, useEffect } from 'react'
import { Clock3, CalendarDays, User, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'
import { adminService, PointageEntry } from '../../services/adminService'
import pointageAutoService from '../../services/pointageAutoService'

interface AdminPointageSectionProps {
  pointages: PointageEntry[]
  workStartTime?: string
  workEndTime?: string
}

interface GroupedPointageUser {
  userId: number
  user_type: 'employe' | 'admin'
  prenom: string
  nom: string
  role?: string
  departement?: string
  matricule?: string
  photo?: string
  pointages: Record<string, {
    date: string
    arrivee: PointageEntry | null
    depart: PointageEntry | null
  }>
}

const getTodayIso = () => new Date().toISOString().split('T')[0]

const formatTime = (dateHeure: string) => {
  try {
    const date = new Date(dateHeure)
    if (Number.isNaN(date.getTime())) return dateHeure
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateHeure
  }
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const getPointageStatusMeta = (pointage: PointageEntry, workStartTime: string = '09:00', workEndTime: string = '18:00') => {
  if (!pointage) return null
  
  const pointageTime = formatTime(pointage.date_heure || '')
  const isRetard = pointage.statut === 'retard' || (pointage.retard_minutes && pointage.retard_minutes > 0)
  const isDepartAnticipe = pointage.type === 'depart' && pointageTime < workEndTime
  
  if (isRetard) {
    return {
      label: `Retard ${pointage.retard_minutes ? `(${pointage.retard_minutes} min)` : ''}`,
      badgeClassName: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    }
  }
  
  if (isDepartAnticipe) {
    return {
      label: 'Départ anticipé',
      badgeClassName: 'bg-orange-100 text-orange-800 border border-orange-200'
    }
  }
  
  return {
    label: 'À l\'heure',
    badgeClassName: 'bg-green-100 text-green-800 border border-green-200'
  }
}

export default function AdminPointageSection({ pointages, workStartTime = '09:00', workEndTime = '18:00' }: AdminPointageSectionProps) {
  const [dateFilter, setDateFilter] = useState(getTodayIso())
  const [typeFilter, setTypeFilter] = useState<'all' | 'complet' | 'arrivee' | 'depart'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'a_l_heure' | 'retard' | 'depart_anticipe'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoProcessing, setAutoProcessing] = useState(false)
  const [autoProcessResult, setAutoProcessResult] = useState<{ processed: number; errors: any[] } | null>(null)
  const [systemSettings, setSystemSettings] = useState<any>(null)

  // Charger les paramètres système
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await pointageAutoService.getSystemSettings()
        setSystemSettings(settings)
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      }
    }
    loadSettings()
  }, [])

  // Fonction pour traiter les départs manquants automatiquement
  const handleAutoProcessDeparts = async () => {
    if (!systemSettings || !pointageAutoService.isAutoDepartEnabled(systemSettings)) {
      alert('Le remplissage automatique des départs n\'est pas activé dans les paramètres système')
      return
    }

    setAutoProcessing(true)
    setAutoProcessResult(null)

    try {
      const result = await pointageAutoService.processMissingDeparts(pointages, systemSettings)
      setAutoProcessResult(result)
      
      if (result.processed > 0) {
        // Recharger les pointages pour afficher les nouveaux départs
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors du traitement automatique:', error)
      setAutoProcessResult({
        processed: 0,
        errors: [{ error: 'Erreur lors du traitement automatique' }]
      })
    } finally {
      setAutoProcessing(false)
    }
  }

  // Grouper les pointages par utilisateur
  const groupedByUser = useMemo(() => {
    // Filtrer par date d'abord
    const filteredByDate = pointages.filter(p => p.date === dateFilter)
    
    // Grouper par utilisateur
    const userGroups = filteredByDate.reduce((acc, pointage) => {
      const userId = pointage.admin_id || pointage.employe_id || 0
      if (!userId) return acc
      
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          user_type: pointage.user_type || 'employe',
          prenom: pointage.prenom || '',
          nom: pointage.nom || '',
          role: pointage.role || '',
          departement: pointage.departement || '',
          matricule: pointage.matricule || '',
          photo: pointage.photo || '',
          pointages: {}
        }
      }
      
      // Regrouper par date
      const date = pointage.date
      if (!acc[userId].pointages[date]) {
        acc[userId].pointages[date] = { date, arrivee: null, depart: null }
      }
      
      if (pointage.type === 'arrivee') {
        acc[userId].pointages[date].arrivee = pointage
      } else if (pointage.type === 'depart') {
        acc[userId].pointages[date].depart = pointage
      }
      
      return acc
    }, {} as Record<number, GroupedPointageUser>)
    
    return Object.values(userGroups)
  }, [pointages, dateFilter])

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    return groupedByUser.filter(user => {
      // Filtre de recherche
      const searchLower = searchTerm.trim().toLowerCase()
      if (searchLower) {
        const fullName = `${user.prenom} ${user.nom}`.toLowerCase()
        const role = (user.role || '').toLowerCase()
        const dept = (user.departement || '').toLowerCase()
        const matricule = (user.matricule || '').toLowerCase()
        
        if (!fullName.includes(searchLower) && !role.includes(searchLower) && 
            !dept.includes(searchLower) && !matricule.includes(searchLower)) {
          return false
        }
      }
      
      // Filtre par type de pointage
      if (typeFilter !== 'all') {
        const todayPointages = Object.values(user.pointages)[0] // Premier jour (aujourd'hui)
        if (!todayPointages) return false
        
        if (typeFilter === 'complet' && (!todayPointages.arrivee || !todayPointages.depart)) return false
        if (typeFilter === 'arrivee' && !todayPointages.arrivee) return false
        if (typeFilter === 'depart' && !todayPointages.depart) return false
      }
      
      // Filtre par statut
      if (statusFilter !== 'all') {
        const todayPointages = Object.values(user.pointages)[0]
        if (!todayPointages) return false
        
        const arriveeMeta = todayPointages.arrivee ? getPointageStatusMeta(todayPointages.arrivee, workStartTime, workEndTime) : null
        const departMeta = todayPointages.depart ? getPointageStatusMeta(todayPointages.depart, workStartTime, workEndTime) : null
        
        if (statusFilter === 'a_l_heure') {
          const hasAHeure = (arriveeMeta && arriveeMeta.label === 'À l\'heure') || 
                           (departMeta && departMeta.label === 'À l\'heure')
          if (!hasAHeure) return false
        } else if (statusFilter === 'retard') {
          const hasRetard = (arriveeMeta && arriveeMeta.label.includes('Retard'))
          if (!hasRetard) return false
        } else if (statusFilter === 'depart_anticipe') {
          const hasAnticipe = (departMeta && departMeta.label.includes('Départ anticipé'))
          if (!hasAnticipe) return false
        }
      }
      
      return true
    })
  }, [groupedByUser, typeFilter, statusFilter, searchTerm, workStartTime, workEndTime])

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-blue-600" />
            Pointages du {formatDate(dateFilter)}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
            </div>
            {systemSettings && pointageAutoService.isAutoDepartEnabled(systemSettings) && (
              <button
                onClick={handleAutoProcessDeparts}
                disabled={autoProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {autoProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Remplir départs auto
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="complet">Arrivée + départ</option>
              <option value="arrivee">Arrivée</option>
              <option value="depart">Départ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="a_l_heure">A l'heure</option>
              <option value="retard">Arrivée en retard</option>
              <option value="depart_anticipe">Départ anticipé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, rôle, département..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Résultat du traitement automatique */}
      {autoProcessResult && (
        <div className={`rounded-lg p-4 mb-6 ${
          autoProcessResult.processed > 0 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {autoProcessResult.processed > 0 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <h3 className="font-semibold">
              {autoProcessResult.processed > 0 ? 'Traitement réussi' : 'Traitement terminé'}
            </h3>
          </div>
          <p className="text-sm mt-2">
            {autoProcessResult.processed} départs automatiques générés
          </p>
          {autoProcessResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">Erreurs:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {autoProcessResult.errors.map((error, index) => (
                  <li key={index}>{error.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun pointage trouvé</h3>
          <p className="text-sm text-gray-500">Aucun utilisateur ne correspond aux filtres sélectionnés.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.userId} className="bg-white rounded-lg shadow-sm p-6">
              {/* En-tête utilisateur */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.photo && (
                    <img
                      src={user.photo}
                      alt={`${user.prenom} ${user.nom}`}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {user.user_type === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {user.role === 'super_admin' ? 'Super_Admin' : user.role === 'admin' ? 'Admin' : user.role || 'Admin'}
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Employé
                          </>
                        )}
                      </span>
                      {user.departement && <span>{user.departement}</span>}
                      {user.matricule && <span>{user.matricule}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pointages par date */}
              <div className="space-y-3">
                {Object.values(user.pointages).map((dayPointage) => {
                  const arriveeMeta = dayPointage.arrivee ? getPointageStatusMeta(dayPointage.arrivee, workStartTime, workEndTime) : null
                  const departMeta = dayPointage.depart ? getPointageStatusMeta(dayPointage.depart, workStartTime, workEndTime) : null

                  return (
                    <div key={dayPointage.date} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-gray-900">
                          {formatDate(dayPointage.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dayPointage.arrivee && dayPointage.depart ? 'Journée complète' : 'Journée partielle'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Arrivée */}
                        <div className="bg-white rounded-lg border border-green-200 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Arrivée</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {dayPointage.arrivee
                                  ? (dayPointage.arrivee.arrivee || formatTime(dayPointage.arrivee.date_heure || ''))
                                  : 'Non pointée'}
                              </p>
                            </div>
                            {arriveeMeta ? (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${arriveeMeta.badgeClassName}`}>
                                {arriveeMeta.label}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600">
                                Absent
                              </span>
                            )}
                          </div>
                          {dayPointage.arrivee?.commentaire && (
                            <p className="mt-2 text-xs text-gray-600">
                              Justification: {dayPointage.arrivee.commentaire}
                            </p>
                          )}
                        </div>

                        {/* Départ */}
                        <div className="bg-white rounded-lg border border-blue-200 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Départ</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {dayPointage.depart
                                  ? (dayPointage.depart.depart || formatTime(dayPointage.depart.date_heure || ''))
                                  : dayPointage.arrivee ? 'Non pointé' : 'Non pointé (pas d\'arrivée)'}
                              </p>
                            </div>
                            {departMeta ? (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${departMeta.badgeClassName}`}>
                                {departMeta.label}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600">
                                {dayPointage.arrivee ? 'Absent' : 'Absent'}
                              </span>
                            )}
                          </div>
                          {dayPointage.depart?.commentaire && (
                            <p className="mt-2 text-xs text-gray-600">
                              Justification: {dayPointage.depart.commentaire}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
