import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../services/authService'
import { DashboardSettings, settingsService } from '../../services/settingsService'
import scanSecurityService from '../../services/scanSecurityService'

interface AdminProfile {
  nom?: string
  prenom?: string
  telephone?: string
  adresse?: string
  departement?: string
  poste?: string
}

const ADMIN_ALLOWED_ROLES = new Set(['admin', 'super_admin', 'manager', 'hr'])

const DEFAULT_PROFILE: Required<AdminProfile> = {
  nom: '',
  prenom: '',
  telephone: '',
  adresse: '',
  departement: '',
  poste: ''
}

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Bamako', label: 'Africa/Bamako (Mali)' },
  { value: 'Africa/Abidjan', label: 'Africa/Abidjan (UTC)' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'UTC', label: 'UTC' }
]

const parseTimeToMinutes = (value: string): number | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

const formatMinutesToHours = (minutes: number): string => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes || 0)))
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  return `${hours}h${String(mins).padStart(2, '0')}`
}

const AdminSettingsPage: React.FC = () => {
  const { user, logout, updateProfile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE)
  const [settingsForm, setSettingsForm] = useState<DashboardSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [purgeBusy, setPurgeBusy] = useState(false)
  const [purgeResult, setPurgeResult] = useState<string | null>(null)
  const [purgeConfirmation, setPurgeConfirmation] = useState('')
  const [purgeTargets, setPurgeTargets] = useState({
    demandes: false,
    notifications: false,
    pointages: false,
    evenements: false,
    retards: false,
    pauses: false,
    badges: false
  })

  // États pour la gestion du code PIN
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  })
  const [pinLoading, setPinLoading] = useState(false)
  const [currentPinInfo, setCurrentPinInfo] = useState<{ pin: string; isDefault: boolean } | null>(null)
  const [showPinForm, setShowPinForm] = useState(false)

  const isUnauthorizedError = useCallback((err: unknown) => {
    const errorPayload = err as { status?: number; message?: string }
    const status = Number(errorPayload?.status || 0)
    if (status === 401 || status === 403) return true
    const message = String(errorPayload?.message || '').toLowerCase()
    return message.includes('401') || message.includes('403') || message.includes('token')
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [profileResponse, settingsResponse, pinResponse] = await Promise.all([
        apiClient.get<{ success: boolean; user?: AdminProfile; message?: string }>('/api/auth/validate'),
        settingsService.getMySettings(),
        scanSecurityService.getCurrentPIN().catch(() => ({ pin: '1234', isDefault: true }))
      ])

      if (!profileResponse?.success || !profileResponse.user) {
        throw new Error(profileResponse?.message || 'Profil introuvable')
      }

      setProfileForm({
        nom: profileResponse.user.nom || '',
        prenom: profileResponse.user.prenom || '',
        telephone: profileResponse.user.telephone || '',
        adresse: profileResponse.user.adresse || '',
        departement: profileResponse.user.departement || '',
        poste: profileResponse.user.poste || ''
      })

      setSettingsForm(settingsResponse)
      setCurrentPinInfo(pinResponse)
    } catch (loadError: unknown) {
      console.error('Erreur chargement parametres admin:', loadError)
      if (isUnauthorizedError(loadError)) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      setError('Impossible de charger les parametres.')
    } finally {
      setLoading(false)
    }
  }, [isUnauthorizedError, logout, navigate])

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

    void loadData()
  }, [authLoading, loadData, navigate, user])

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)
      setError(null)
      setSuccess(null)

      const payload = {
        nom: profileForm.nom.trim(),
        prenom: profileForm.prenom.trim(),
        telephone: profileForm.telephone.trim(),
        adresse: profileForm.adresse.trim(),
        departement: profileForm.departement.trim(),
        poste: profileForm.poste.trim()
      }

      const result = await updateProfile(payload)
      if (!result.success) {
        throw new Error(result.error || 'Mise a jour impossible')
      }

      setSuccess('Informations administrateur mises a jour.')
    } catch (saveError: unknown) {
      console.error('Erreur sauvegarde profil admin:', saveError)
      setError('Erreur lors de la sauvegarde du profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settingsForm) return

    try {
      setSavingSettings(true)
      setError(null)
      setSuccess(null)

      const updated = await settingsService.updateMySettings(settingsForm)
      setSettingsForm(updated)
      window.localStorage.setItem('dashboard_sidebar_collapsed', updated.compact_sidebar ? '1' : '0')
      window.dispatchEvent(new Event('dashboard-sidebar-collapsed-change'))
      setSuccess('Parametres du dashboard enregistres.')
    } catch (saveError: unknown) {
      console.error('Erreur sauvegarde parametres admin:', saveError)
      setError('Erreur lors de la sauvegarde des parametres.')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleRunPurge = async () => {
    try {
      setPurgeResult(null)
      setError(null)
      setSuccess(null)

      const targets = Object.entries(purgeTargets)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)

      if (targets.length === 0) {
        setError('Selectionnez au moins une categorie a purger.')
        return
      }

      if (purgeConfirmation.trim().toUpperCase() !== 'SUPPRIMER') {
        setError('Saisissez "SUPPRIMER" pour confirmer la purge.')
        return
      }

      setPurgeBusy(true)
      const response = await apiClient.post<{ targets: string[] }, { success?: boolean; deleted?: Record<string, number>; message?: string }>(
        '/api/admin/settings/purge',
        { targets }
      )

      if (!response?.success) {
        throw new Error(response?.message || 'Purge impossible.')
      }

      const deletedMap = response?.deleted || {}
      const totalDeleted = Object.values(deletedMap).reduce((sum, value) => sum + Number(value || 0), 0)
      setPurgeResult(`Purge terminee: ${totalDeleted} enregistrement(s) supprime(s).`)
      setPurgeConfirmation('')
      setPurgeTargets({
        demandes: false,
        notifications: false,
        pointages: false,
        evenements: false,
        retards: false,
        pauses: false,
        badges: false
      })
    } catch (purgeError: unknown) {
      console.error('Erreur purge admin:', purgeError)
      if (isUnauthorizedError(purgeError)) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      const message = (purgeError as { message?: string })?.message
      setError(message || 'Erreur lors de la purge des donnees.')
    } finally {
      setPurgeBusy(false)
    }
  }

  // Fonctions pour la gestion du code PIN
  const handleUpdatePIN = useCallback(async () => {
    if (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin) {
      setError('Tous les champs du code PIN sont requis')
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setError('La confirmation du nouveau code PIN ne correspond pas')
      return
    }

    if (!/^\d{4}$/.test(pinForm.newPin)) {
      setError('Le nouveau code PIN doit être composé de 4 chiffres')
      return
    }

    try {
      setPinLoading(true)
      setError(null)
      setSuccess(null)

      await scanSecurityService.updatePIN(pinForm.newPin, pinForm.currentPin)
      
      setSuccess('Code PIN modifié avec succès')
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
      setShowPinForm(false)
      
      // Recharger les informations du PIN
      const pinInfo = await scanSecurityService.getCurrentPIN()
      setCurrentPinInfo(pinInfo)
    } catch (pinError: unknown) {
      console.error('Erreur modification PIN:', pinError)
      const message = (pinError as { message?: string })?.message
      setError(message || 'Erreur lors de la modification du code PIN')
    } finally {
      setPinLoading(false)
    }
  }, [pinForm])

  const handleResetPIN = useCallback(async () => {
    try {
      setPinLoading(true)
      setError(null)
      setSuccess(null)

      await scanSecurityService.resetPIN()
      
      setSuccess('Code PIN réinitialisé à 1234 avec succès')
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
      setShowPinForm(false)
      
      // Recharger les informations du PIN
      const pinInfo = await scanSecurityService.getCurrentPIN()
      setCurrentPinInfo(pinInfo)
    } catch (pinError: unknown) {
      console.error('Erreur réinitialisation PIN:', pinError)
      const message = (pinError as { message?: string })?.message
      setError(message || 'Erreur lors de la réinitialisation du code PIN')
    } finally {
      setPinLoading(false)
    }
  }, [])

  const timezoneOptions = useMemo(() => {
    const current = String(settingsForm?.timezone || '').trim()
    if (!current) return TIMEZONE_OPTIONS
    if (TIMEZONE_OPTIONS.some((item) => item.value === current)) return TIMEZONE_OPTIONS
    return [{ value: current, label: `Personnalise (${current})` }, ...TIMEZONE_OPTIONS]
  }, [settingsForm?.timezone])

  const professionalSummary = useMemo(() => {
    if (!settingsForm) {
      return {
        slot: '--',
        gross: '--',
        net: '--',
        pause: '--',
        refresh: '--'
      }
    }

    const start = parseTimeToMinutes(settingsForm.work_start_time)
    const end = parseTimeToMinutes(settingsForm.work_end_time)
    const pauseMinutes = Math.max(0, Math.round(Number(settingsForm.pause_duration_minutes || 0)))
    let grossMinutes = 0

    if (start !== null && end !== null) {
      grossMinutes = end >= start ? (end - start) : ((24 * 60 - start) + end)
    }

    const netMinutes = Math.max(0, grossMinutes - pauseMinutes)

    return {
      slot: `${settingsForm.work_start_time} -> ${settingsForm.work_end_time}`,
      gross: formatMinutesToHours(grossMinutes),
      net: formatMinutesToHours(netMinutes),
      pause: `${pauseMinutes} min`,
      refresh: `${settingsForm.dashboard_auto_refresh_seconds}s`
    }
  }, [
    settingsForm?.dashboard_auto_refresh_seconds,
    settingsForm?.pause_duration_minutes,
    settingsForm?.work_end_time,
    settingsForm?.work_start_time
  ])

  if (loading || !settingsForm) {
    return (
      <section className="php-card">
        <div className="php-card-body">Chargement des parametres...</div>
      </section>
    )
  }

  return (
    <div className="xp-form space-y-6">
      {error ? (
        <section className="php-card">
          <div className="php-card-body">
            <span className="php-pill is-danger">{error}</span>
          </div>
        </section>
      ) : null}

      {success ? (
        <section className="php-card">
          <div className="php-card-body">
            <span className="php-pill is-success">{success}</span>
          </div>
        </section>
      ) : null}

      <section className="php-card">
        <div className="php-card-header">
          <h2 className="php-card-title">Profil administrateur</h2>
          <button
            onClick={() => void handleSaveProfile()}
            disabled={savingProfile}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {savingProfile ? 'Enregistrement...' : 'Enregistrer profil'}
          </button>
        </div>
        <div className="php-card-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Prenom</span>
            <input
              value={profileForm.prenom}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, prenom: event.target.value }))}
              placeholder="Prenom"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Nom</span>
            <input
              value={profileForm.nom}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, nom: event.target.value }))}
              placeholder="Nom"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Telephone</span>
            <input
              value={profileForm.telephone}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, telephone: event.target.value }))}
              placeholder="Telephone"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Departement</span>
            <input
              value={profileForm.departement}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, departement: event.target.value }))}
              placeholder="Departement"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Poste</span>
            <input
              value={profileForm.poste}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, poste: event.target.value }))}
              placeholder="Poste"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1 text-sm text-gray-700">
            <span>Adresse</span>
            <textarea
              value={profileForm.adresse}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, adresse: event.target.value }))}
              rows={2}
              placeholder="Adresse"
            />
          </label>
        </div>
      </section>

      <section className="php-card">
        <div className="php-card-header">
          <h2 className="php-card-title">Parametres professionnels et dashboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadData()}
              disabled={loading || savingSettings}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Recharger depuis la base
            </button>
            <button
              onClick={() => void handleSaveSettings()}
              disabled={savingSettings}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {savingSettings ? 'Enregistrement...' : 'Enregistrer parametres'}
            </button>
          </div>
        </div>

        <div className="php-card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <article className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
              <p className="text-xs text-blue-700">Plage horaire</p>
              <p className="text-base font-semibold text-blue-900">{professionalSummary.slot}</p>
            </article>
            <article className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2">
              <p className="text-xs text-emerald-700">Travail net / jour</p>
              <p className="text-base font-semibold text-emerald-900">{professionalSummary.net}</p>
              <p className="text-[11px] text-emerald-700">Brut: {professionalSummary.gross}</p>
            </article>
            <article className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
              <p className="text-xs text-amber-700">Pause standard</p>
              <p className="text-base font-semibold text-amber-900">{professionalSummary.pause}</p>
            </article>
            <article className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-2">
              <p className="text-xs text-indigo-700">Auto-actualisation</p>
              <p className="text-base font-semibold text-indigo-900">{professionalSummary.refresh}</p>
            </article>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <article className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">Interface</h3>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Langue</span>
                <select
                  value={settingsForm.language}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, language: event.target.value === 'en' ? 'en' : 'fr' } : prev)
                  }
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Theme</span>
                <select
                  value={settingsForm.theme}
                  onChange={(event) =>
                    setSettingsForm((prev) => {
                      if (!prev) return prev
                      const value = event.target.value
                      if (value === 'sombre' || value === 'systeme') return { ...prev, theme: value }
                      return { ...prev, theme: 'clair' }
                    })
                  }
                >
                  <option value="clair">Theme clair</option>
                  <option value="sombre">Theme sombre</option>
                  <option value="systeme">Theme systeme</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Fuseau horaire</span>
                <select
                  value={settingsForm.timezone}
                  onChange={(event) => setSettingsForm((prev) => prev ? { ...prev, timezone: event.target.value } : prev)}
                >
                  {timezoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Auto-refresh dashboard (secondes)</span>
                <input
                  type="number"
                  min={30}
                  max={600}
                  step={30}
                  value={settingsForm.dashboard_auto_refresh_seconds}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev
                      ? { ...prev, dashboard_auto_refresh_seconds: Number(event.target.value || 60) }
                      : prev)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Sidebar compacte</span>
                <input
                  type="checkbox"
                  checked={settingsForm.compact_sidebar}
                  onChange={(event) => setSettingsForm((prev) => prev ? { ...prev, compact_sidebar: event.target.checked } : prev)}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Afficher week-end calendrier</span>
                <input
                  type="checkbox"
                  checked={settingsForm.calendar_show_weekends}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, calendar_show_weekends: event.target.checked } : prev)
                  }
                />
              </label>
            </article>

            <article className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Notifications e-mail</span>
                <input
                  type="checkbox"
                  checked={settingsForm.notifications_email}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, notifications_email: event.target.checked } : prev)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Notifications push</span>
                <input
                  type="checkbox"
                  checked={settingsForm.notifications_push}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, notifications_push: event.target.checked } : prev)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Alerte retards</span>
                <input
                  type="checkbox"
                  checked={settingsForm.notifications_retards}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, notifications_retards: event.target.checked } : prev)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Validation demandes</span>
                <input
                  type="checkbox"
                  checked={settingsForm.notifications_demandes}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, notifications_demandes: event.target.checked } : prev)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>Rapport quotidien</span>
                <input
                  type="checkbox"
                  checked={settingsForm.daily_reports}
                  onChange={(event) => setSettingsForm((prev) => prev ? { ...prev, daily_reports: event.target.checked } : prev)}
                />
              </label>
            </article>

            <article className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">Regles professionnelles</h3>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Heure d'arrivee</span>
                <input
                  type="time"
                  value={settingsForm.work_start_time}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, work_start_time: event.target.value } : prev)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Heure de depart</span>
                <input
                  type="time"
                  value={settingsForm.work_end_time}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev ? { ...prev, work_end_time: event.target.value } : prev)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Pause standard (minutes)</span>
                <input
                  type="number"
                  min={0}
                  max={240}
                  step={5}
                  value={settingsForm.pause_duration_minutes}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev
                      ? { ...prev, pause_duration_minutes: Number(event.target.value || 0) }
                      : prev)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Duree session login (minutes)</span>
                <input
                  type="number"
                  min={15}
                  max={10080}
                  step={15}
                  value={settingsForm.session_duration_minutes}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev
                      ? { ...prev, session_duration_minutes: Number(event.target.value || 15) }
                      : prev)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Expiration badge (heures)</span>
                <input
                  type="number"
                  min={0}
                  max={168}
                  step={1}
                  value={settingsForm.badge_expiration_hours}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev
                      ? { ...prev, badge_expiration_hours: Number(event.target.value || 0) }
                      : prev)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                <span>Regeneration badge (heures)</span>
                <input
                  type="number"
                  min={0}
                  max={168}
                  step={1}
                  value={settingsForm.badge_regeneration_hours}
                  onChange={(event) =>
                    setSettingsForm((prev) => prev
                      ? { ...prev, badge_regeneration_hours: Number(event.target.value || 0) }
                      : prev)
                  }
                />
              </label>
            </article>
          </div>

          <p className="text-xs text-gray-500">
            Ces parametres sont charges depuis la base (`/api/settings/me`) et sauvegardes pour adapter le comportement du projet.
            `0` sur expiration/regeneration badge conserve le mode automatique actuel.
          </p>
        </div>
      </section>

      {/* Section Code PIN */}
      <section className="php-card">
        <div className="php-card-header">
          <h2 className="php-card-title">Code PIN de déverrouillage</h2>
          <button
            onClick={() => setShowPinForm(!showPinForm)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            {showPinForm ? 'Annuler' : 'Modifier'}
          </button>
        </div>
        <div className="php-card-body space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Code PIN actuel: {currentPinInfo?.pin || '1234'}
                </p>
                <p className="text-xs text-blue-600">
                  {currentPinInfo?.isDefault ? 'Code PIN par défaut' : 'Code PIN personnalisé'}
                </p>
              </div>
              <div className="text-2xl font-mono text-blue-700">
                🔒
              </div>
            </div>
          </div>

          {showPinForm && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code PIN actuel
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm(prev => ({ ...prev, currentPin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau code PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinForm.newPin}
                    onChange={(e) => setPinForm(prev => ({ ...prev, newPin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer nouveau PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinForm.confirmPin}
                    onChange={(e) => setPinForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5678"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Le code PIN doit être composé de 4 chiffres
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetPIN}
                    disabled={pinLoading}
                    className="px-3 py-1 rounded bg-gray-600 text-white text-sm hover:bg-gray-700 disabled:opacity-50"
                  >
                    Réinitialiser à 1234
                  </button>
                  <button
                    onClick={handleUpdatePIN}
                    disabled={pinLoading || !pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin}
                    className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {pinLoading ? 'Modification...' : 'Mettre à jour'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">À propos du code PIN :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Utilisé pour déverrouiller la zone de scan</li>
              <li>Code par défaut : 1234</li>
              <li>Peut être personnalisé par chaque admin</li>
              <li>Le super_admin peut accéder sans code PIN</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="php-card">
        <div className="php-card-header">
          <h2 className="php-card-title">Purge des donnees metier</h2>
          <button
            onClick={() => void handleRunPurge()}
            disabled={purgeBusy}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {purgeBusy ? 'Suppression...' : 'Lancer la purge'}
          </button>
        </div>
        <div className="php-card-body space-y-4">
          <p className="text-sm text-gray-600">
            Cochez les categories a nettoyer, puis confirmez avec le mot <strong>SUPPRIMER</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'demandes', label: 'Demandes' },
              { key: 'notifications', label: 'Notifications' },
              { key: 'pointages', label: 'Pointages' },
              { key: 'evenements', label: 'Evenements calendrier' },
              { key: 'retards', label: 'Retards' },
              { key: 'pauses', label: 'Pauses' },
              { key: 'badges', label: 'Badges et scans' }
            ].map((target) => (
              <label key={target.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={purgeTargets[target.key as keyof typeof purgeTargets]}
                  onChange={(event) =>
                    setPurgeTargets((prev) => ({
                      ...prev,
                      [target.key]: event.target.checked
                    }))
                  }
                />
                <span>{target.label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={purgeConfirmation}
              onChange={(event) => setPurgeConfirmation(event.target.value)}
              placeholder='Tapez "SUPPRIMER" pour confirmer'
            />
            <div className="text-xs text-gray-500 flex items-center">
              Cette action supprime des donnees operationnelles de maniere irreversible.
            </div>
          </div>

          {purgeResult ? (
            <span className="php-pill is-success">{purgeResult}</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default AdminSettingsPage
