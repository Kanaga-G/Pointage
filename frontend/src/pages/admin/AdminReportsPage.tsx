import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, AdminStats, Demande } from '../../services/adminService'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../services/authService'

interface PeriodPointage {
  id: number
  type: string
  dateHeure: string
  retardMinutes?: number
  employe?: {
    id?: number
    prenom?: string
    nom?: string
    departement?: string
  } | null
}

interface PointagePeriodResponse {
  success: boolean
  pointages?: PeriodPointage[]
}

const ADMIN_ALLOWED_ROLES = new Set(['admin', 'super_admin', 'manager', 'hr'])

const toDateInput = (date: Date) => date.toISOString().slice(0, 10)
const toDateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR')

const escapeCsvCell = (value: unknown) => {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const downloadCsv = (filename: string, rows: Array<Array<unknown>>) => {
  const csvContent = rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const AdminReportsPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    total_employes: 0,
    presents: 0,
    absents: 0,
    retards: 0,
    total_heures_jour: 0,
    taux_presence: 0
  })
  const [pointages, setPointages] = useState<PeriodPointage[]>([])
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date()
    return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [toDate, setToDate] = useState(() => toDateInput(new Date()))

  const isUnauthorizedError = useCallback((err: unknown) => {
    const error = err as { status?: number; message?: string }
    const status = Number(error?.status || 0)
    if (status === 401 || status === 403) return true
    const message = String(error?.message || '').toLowerCase()
    return message.includes('401') || message.includes('403') || message.includes('token')
  }, [])

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const startIso = new Date(`${fromDate}T00:00:00`).toISOString()
      const endIso = new Date(`${toDate}T23:59:59`).toISOString()

      const [statsResult, pointagesResult, demandesResult] = await Promise.allSettled([
        adminService.getStats(),
        apiClient.get<PointagePeriodResponse>(
          `/api/pointages/period?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`
        ),
        adminService.getDemandes({ page: 1, per_page: 500 })
      ])

      const rejectedReasons = [statsResult, pointagesResult, demandesResult]
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map((result) => result.reason)

      if (rejectedReasons.some((reason) => isUnauthorizedError(reason))) {
        logout()
        navigate('/login', { replace: true })
        return
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
      } else {
        setStats({
          total_employes: 0,
          presents: 0,
          absents: 0,
          retards: 0,
          total_heures_jour: 0,
          taux_presence: 0
        })
      }

      const pointagesPayload = pointagesResult.status === 'fulfilled' ? pointagesResult.value.pointages : []
      setPointages(Array.isArray(pointagesPayload) ? pointagesPayload : [])

      if (demandesResult.status === 'fulfilled') {
        const filtered = (demandesResult.value.items || []).filter((demande) => {
          if (!demande.date_demande) return false
          const date = new Date(demande.date_demande)
          if (Number.isNaN(date.getTime())) return false
          return date >= new Date(`${fromDate}T00:00:00`) && date <= new Date(`${toDate}T23:59:59`)
        })
        setDemandes(filtered)
      } else {
        setDemandes([])
      }
    } catch (loadError: unknown) {
      if (isUnauthorizedError(loadError)) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      console.error('Erreur rapports admin:', loadError)
      setError('Impossible de charger les rapports.')
      setPointages([])
      setDemandes([])
    } finally {
      setLoading(false)
    }
  }, [fromDate, isUnauthorizedError, logout, navigate, toDate])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    const role = String(user.role || '').toLowerCase()
    if (!ADMIN_ALLOWED_ROLES.has(role)) {
      navigate('/employee', { replace: true })
      return
    }
    void loadReports()
  }, [authLoading, loadReports, navigate, user])

  const arrivalsCount = useMemo(
    () => pointages.filter((pointage) => String(pointage.type).toLowerCase() === 'arrivee').length,
    [pointages]
  )
  const departuresCount = useMemo(
    () => pointages.filter((pointage) => String(pointage.type).toLowerCase() === 'depart').length,
    [pointages]
  )
  const lateCount = useMemo(
    () => pointages.filter((pointage) => Number(pointage.retardMinutes || 0) > 0).length,
    [pointages]
  )

  const topDepartments = useMemo(() => {
    const map = new Map<string, number>()
    for (const pointage of pointages) {
      const key = String(pointage.employe?.departement || 'Non renseigne')
      map.set(key, (map.get(key) || 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [pointages])

  const handleExportPointages = () => {
    const rows: Array<Array<unknown>> = [
      ['ID', 'Employe', 'Departement', 'Type', 'Date heure', 'Retard (min)']
    ]

    for (const pointage of pointages) {
      rows.push([
        pointage.id,
        `${pointage.employe?.prenom || ''} ${pointage.employe?.nom || ''}`.trim(),
        pointage.employe?.departement || '-',
        pointage.type,
        new Date(pointage.dateHeure).toLocaleString('fr-FR'),
        Number(pointage.retardMinutes || 0)
      ])
    }

    downloadCsv(`rapport_pointages_${fromDate}_${toDate}.csv`, rows)
  }

  const handleExportDemandes = () => {
    const rows: Array<Array<unknown>> = [
      ['ID', 'Employe', 'Type', 'Statut', 'Date demande', 'Date debut', 'Date fin']
    ]

    for (const demande of demandes) {
      rows.push([
        demande.id,
        `${demande.prenom || ''} ${demande.nom || ''}`.trim(),
        demande.type,
        demande.statut,
        demande.date_demande ? new Date(demande.date_demande).toLocaleString('fr-FR') : '-',
        demande.date_debut || '-',
        demande.date_fin || '-'
      ])
    }

    downloadCsv(`rapport_demandes_${fromDate}_${toDate}.csv`, rows)
  }

  return (
    <div className="space-y-6">
      <section className="php-card">
        <div className="php-card-header">
          <h2 className="php-card-title">Rapports administratifs</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => void loadReports()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Actualiser
            </button>
          </div>
        </div>
        <div className="php-card-body">
          <p className="text-sm text-gray-600">
            Periode: <strong>{toDateLabel(fromDate)}</strong> au <strong>{toDateLabel(toDate)}</strong>
          </p>
          {error ? <span className="php-pill is-danger">{error}</span> : null}
          {loading ? <span className="php-pill is-warning">Chargement des rapports...</span> : null}
        </div>
      </section>

      <section className="php-stats-grid">
        <article className="php-stat-card is-primary">
          <p className="php-stat-value">{stats.total_employes}</p>
          <p className="php-stat-label">Employes actifs</p>
        </article>
        <article className="php-stat-card is-success">
          <p className="php-stat-value">{arrivalsCount}</p>
          <p className="php-stat-label">Arrivees (periode)</p>
        </article>
        <article className="php-stat-card is-warning">
          <p className="php-stat-value">{departuresCount}</p>
          <p className="php-stat-label">Departs (periode)</p>
        </article>
        <article className="php-stat-card is-danger">
          <p className="php-stat-value">{lateCount}</p>
          <p className="php-stat-label">Retards detectes</p>
        </article>
      </section>

      <section className="php-grid-2">
        <article className="php-card">
          <div className="php-card-header">
            <h2 className="php-card-title">Activite par departement</h2>
            <button
              onClick={handleExportPointages}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
            >
              Export CSV pointages
            </button>
          </div>
          <div className="php-card-body php-table-wrap">
            <table className="php-table">
              <thead>
                <tr>
                  <th>Departement</th>
                  <th>Pointages</th>
                </tr>
              </thead>
              <tbody>
                {topDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={2}>Aucune donnee disponible.</td>
                  </tr>
                ) : (
                  topDepartments.map(([departement, count]) => (
                    <tr key={departement}>
                      <td>{departement}</td>
                      <td>{count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="php-card">
          <div className="php-card-header">
            <h2 className="php-card-title">Demandes sur la periode</h2>
            <button
              onClick={handleExportDemandes}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
            >
              Export CSV demandes
            </button>
          </div>
          <div className="php-card-body php-list">
            <div className="php-list-item">
              <div>
                <strong>Total demandes</strong>
                <small>Toutes categories confondues</small>
              </div>
              <span className="php-pill is-success">{demandes.length}</span>
            </div>
            <div className="php-list-item">
              <div>
                <strong>En attente</strong>
                <small>Demandes a traiter</small>
              </div>
              <span className="php-pill is-warning">
                {demandes.filter((demande) => demande.statut === 'en_attente').length}
              </span>
            </div>
            <div className="php-list-item">
              <div>
                <strong>Approuvees</strong>
                <small>Demandes validees</small>
              </div>
              <span className="php-pill is-success">
                {demandes.filter((demande) => demande.statut === 'approuve').length}
              </span>
            </div>
            <div className="php-list-item">
              <div>
                <strong>Rejetees</strong>
                <small>Demandes refusees</small>
              </div>
              <span className="php-pill is-danger">
                {demandes.filter((demande) => demande.statut === 'rejete').length}
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default AdminReportsPage
