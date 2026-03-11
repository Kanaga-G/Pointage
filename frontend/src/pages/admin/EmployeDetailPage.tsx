import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import LayoutFix from '../../components/LayoutFix'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../services/authService'
import { uploadService } from '../../services/uploadService'

interface EmployeDetail {
  id: number
  matricule?: string
  nom: string
  prenom: string
  email: string
  emailPro?: string
  email_pro?: string
  role: string
  departement: string
  poste: string
  telephone?: string
  adresse?: string
  date_embauche?: string
  contrat_type?: string
  contrat_duree?: string
  contrat_pdf_url?: string
  salaire?: number | string | null
  statut: string
  photo?: string
  contact_urgence_nom?: string
  contact_urgence_telephone?: string
  contact_urgence_relation?: string
  contact_urgence_adresse_physique?: string
  situation_matrimoniale?: string
}

interface RoleDefinition {
  id: string
  label: string
  scope?: 'admin' | 'employee'
}

interface EmployeFormData {
  id: number
  matricule: string
  email: string
  email_pro: string
  nom: string
  prenom: string
  telephone: string
  adresse: string
  date_embauche: string
  contrat_type: string
  contrat_duree: string
  contrat_pdf_url: string
  salaire: string
  situation_matrimoniale: string
  contact_urgence_nom: string
  contact_urgence_telephone: string
  contact_urgence_relation: string
  contact_urgence_adresse_physique: string
  role: string
  departement: string
  poste: string
  statut: string
}

interface BadgePreview {
  id: number
  token: string
  token_hash?: string
  user_id: number
  user_type?: 'employe' | 'admin'
  user_matricule?: string
  user_name?: string
  user_email?: string
  user_role?: string
  created_at?: string
  expires_at?: string
  status?: 'active' | 'inactive' | 'expired'
  last_used?: string | null
  usage_count?: number
}

const ADMIN_EDIT_ROLES = new Set(['admin', 'super_admin', 'manager', 'hr'])

const EMPTY_FORM: EmployeFormData = {
  id: 0,
  matricule: '',
  email: '',
  email_pro: '',
  nom: '',
  prenom: '',
  telephone: '',
  adresse: '',
  date_embauche: '',
  contrat_type: '',
  contrat_duree: '',
  contrat_pdf_url: '',
  salaire: '',
  situation_matrimoniale: '',
  contact_urgence_nom: '',
  contact_urgence_telephone: '',
  contact_urgence_relation: '',
  contact_urgence_adresse_physique: '',
  role: 'employe',
  departement: '',
  poste: '',
  statut: 'actif'
}

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
  const key = String(role || 'employe').trim().toLowerCase()
  return ROLE_LABELS[key] || key.replace(/_/g, ' ')
}

const buildBadgeQrUrl = (token?: string, size = 260) => {
  const safeToken = String(token || '').trim()
  if (!safeToken) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safeToken)}`
}

const badgeStatusClass = (status?: BadgePreview['status']) => {
  if (status === 'inactive') return 'bg-red-100 text-red-700 border-red-200'
  if (status === 'expired') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

const badgeStatusLabel = (status?: BadgePreview['status']) => {
  if (status === 'inactive') return 'Inactif'
  if (status === 'expired') return 'Expire'
  return 'Actif'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('fr-FR')
}

const toDateInputValue = (value?: string) => {
  if (!value) return ''
  const asString = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(asString)) {
    return asString.slice(0, 10)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const extractFileName = (value?: string | null) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const clean = raw.split('?')[0]
  const parts = clean.split('/')
  return decodeURIComponent(parts[parts.length - 1] || '')
}

const buildFormDataFromEmploye = (employe: EmployeDetail): EmployeFormData => ({
  id: Number(employe.id || 0),
  matricule: employe.matricule || '',
  email: employe.email || '',
  email_pro: employe.emailPro || employe.email_pro || '',
  nom: employe.nom || '',
  prenom: employe.prenom || '',
  telephone: employe.telephone || '',
  adresse: employe.adresse || '',
  date_embauche: toDateInputValue(employe.date_embauche),
  contrat_type: employe.contrat_type || '',
  contrat_duree: employe.contrat_duree || '',
  contrat_pdf_url: employe.contrat_pdf_url || '',
  salaire:
    employe.salaire === null || employe.salaire === undefined || String(employe.salaire).trim() === ''
      ? ''
      : String(employe.salaire),
  situation_matrimoniale: employe.situation_matrimoniale || '',
  contact_urgence_nom: employe.contact_urgence_nom || '',
  contact_urgence_telephone: employe.contact_urgence_telephone || '',
  contact_urgence_relation: employe.contact_urgence_relation || '',
  contact_urgence_adresse_physique: employe.contact_urgence_adresse_physique || '',
  role: employe.role || 'employe',
  departement: employe.departement || '',
  poste: employe.poste || '',
  statut: employe.statut || 'actif'
})

const EmployeDetailPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingContract, setUploadingContract] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [employe, setEmploye] = useState<EmployeDetail | null>(null)
  const [formData, setFormData] = useState<EmployeFormData>(EMPTY_FORM)
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [isEditing, setIsEditing] = useState(() => location.pathname.endsWith('/edit'))
  const [badge, setBadge] = useState<BadgePreview | null>(null)
  const [loadingBadge, setLoadingBadge] = useState(false)
  const [badgeModalOpen, setBadgeModalOpen] = useState(false)
  const [contractFileName, setContractFileName] = useState('')
  const contractFileInputRef = useRef<HTMLInputElement | null>(null)
  const canEditProfessional = useMemo(() => {
    const role = String(user?.role || '').toLowerCase()
    return ADMIN_EDIT_ROLES.has(role)
  }, [user?.role])

  const resolvedPhotoUrl = useMemo(() => uploadService.resolvePhotoUrl(employe?.photo || ''), [employe?.photo])
  const resolvedContractUrl = useMemo(() => String(formData.contrat_pdf_url || '').trim(), [formData.contrat_pdf_url])
  const initials = useMemo(
    () => `${(formData.prenom?.[0] || employe?.prenom?.[0] || 'E').toUpperCase()}${(formData.nom?.[0] || employe?.nom?.[0] || 'M').toUpperCase()}`,
    [employe?.nom, employe?.prenom, formData.nom, formData.prenom]
  )

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    const role = String(user.role || '').toLowerCase()
    if (!ADMIN_EDIT_ROLES.has(role)) {
      navigate('/employee', { replace: true })
      return
    }

    if (!id) {
      setError('Identifiant employe manquant.')
      setLoading(false)
      return
    }

    void Promise.all([loadRoles(), loadEmployeDetail(Number(id)), loadEmployeBadge(Number(id))])
  }, [authLoading, id, navigate, user])

  useEffect(() => {
    if (location.pathname.endsWith('/edit')) {
      setIsEditing(true)
    }
  }, [location.pathname])

  const loadRoles = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; roles?: RoleDefinition[] }>('/api/roles?scope=employee')
      if (response?.success && Array.isArray(response.roles)) {
        setRoles(response.roles)
      } else {
        setRoles([])
      }
    } catch (loadError) {
      console.error('Erreur chargement roles employe:', loadError)
      setRoles([])
    }
  }

  const loadEmployeDetail = async (employeId: number) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await apiClient.get<any>(`/api/admin/employes/${employeId}`)
      const current = response?.employe || response
      if (!current || !current.id) {
        throw new Error(response?.message || 'Employe introuvable')
      }
      setEmploye(current)
      setFormData(buildFormDataFromEmploye(current))
      setContractFileName(extractFileName(current.contrat_pdf_url || ''))
    } catch (loadError: any) {
      console.error('Erreur chargement detail employe:', loadError)
      setError('Impossible de charger les informations de cet employe.')
      setEmploye(null)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployeBadge = async (employeId: number) => {
    try {
      setLoadingBadge(true)

      const directResponse = await apiClient.get<{ success: boolean; badge?: BadgePreview | null }>(`/api/badge/employe/${employeId}`)
      if (directResponse?.success && directResponse.badge?.token) {
        setBadge(directResponse.badge)
        return
      }

      const fallbackResponse = await apiClient.get<{ success: boolean; badges?: BadgePreview[] }>('/api/badges?history=all')
      if (!fallbackResponse?.success || !Array.isArray(fallbackResponse.badges)) {
        setBadge(null)
        return
      }

      const fallbackBadge = fallbackResponse.badges
        .filter((entry) => Number(entry.user_id) === employeId && String(entry.user_type || 'employe') === 'employe')
        .sort((left, right) => {
          const leftTime = new Date(left.created_at || 0).getTime()
          const rightTime = new Date(right.created_at || 0).getTime()
          return rightTime - leftTime
        })[0] || null

      setBadge(fallbackBadge)
    } catch (badgeError) {
      console.error('Erreur chargement badge employe detail:', badgeError)
      setBadge(null)
    } finally {
      setLoadingBadge(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContractChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setUploadingContract(true)
      setError(null)
      setSuccess(null)

      const contractUrl = await uploadService.uploadContractPdf(file)
      setFormData((prev) => ({ ...prev, contrat_pdf_url: contractUrl }))
      setContractFileName(file.name)
      setSuccess('Contrat PDF telecharge avec succes.')
    } catch (uploadError: any) {
      console.error('Erreur upload contrat detail employe:', uploadError)
      setError(uploadError?.message || "Impossible de telecharger le contrat PDF.")
    } finally {
      setUploadingContract(false)
    }
  }

  const handleRemoveContract = () => {
    setFormData((prev) => ({ ...prev, contrat_pdf_url: '' }))
    setContractFileName('')
  }

  const handleOpenContractPicker = () => {
    if (!isEditing || !canEditProfessional || uploadingContract) return
    contractFileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!employe || !isEditing) return

    try {
      if (!canEditProfessional) {
        setError('Vous n avez pas les droits pour modifier les informations professionnelles.')
        return
      }

      setSaving(true)
      setError(null)
      setSuccess(null)

      if (uploadingContract) {
        setError('Patientez pendant le telechargement du contrat PDF.')
        setSaving(false)
        return
      }

      const payload = {
        email: formData.email.trim(),
        emailPro: formData.email_pro.trim() || null,
        matricule: formData.matricule.trim() || null,
        date_embauche: formData.date_embauche || null,
        contratType: formData.contrat_type.trim() || null,
        contratDuree: formData.contrat_duree.trim() || null,
        contrat_pdf_url: resolvedContractUrl || null,
        salaire: formData.salaire.trim() === '' ? null : Number(formData.salaire),
        role: formData.role,
        departement: formData.departement.trim(),
        poste: formData.poste.trim(),
        statut: formData.statut
      }

      if (!payload.email) {
        setError('L email professionnel est obligatoire.')
        setSaving(false)
        return
      }
      if (payload.salaire !== null && !Number.isFinite(payload.salaire)) {
        setError('Le salaire doit etre un nombre valide.')
        setSaving(false)
        return
      }

      const response = await apiClient.put<typeof payload, any>(
        `/api/admin/employes/${employe.id}`,
        payload
      )

      const updated = response?.employe || response
      if (!updated || !updated.id) {
        throw new Error(response?.message || 'Mise a jour impossible')
      }

      setEmploye(updated)
      setFormData(buildFormDataFromEmploye(updated))
      setContractFileName(extractFileName(updated.contrat_pdf_url || ''))
      setIsEditing(false)
      setSuccess('Informations mises a jour.')
    } catch (saveError: any) {
      console.error('Erreur mise a jour employe:', saveError)
      setError('Echec de la mise a jour des informations.')
    } finally {
      setSaving(false)
    }
  }

  const handleStartEdit = () => {
    setError(null)
    setSuccess(null)
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!employe) return
    const confirmed = window.confirm(`Supprimer ${employe.prenom} ${employe.nom} ? Cette action est irreversible.`)
    if (!confirmed) return

    try {
      setDeleting(true)
      setError(null)
      setSuccess(null)
      await apiClient.delete(`/api/admin/employes/${employe.id}`)
      navigate('/admin/employes', { replace: true })
    } catch (deleteError: any) {
      console.error('Erreur suppression employe:', deleteError)
      setError(deleteError?.message || "Impossible de supprimer cet employe.")
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    if (employe) {
      setFormData(buildFormDataFromEmploye(employe))
    }
    setError(null)
    setSuccess(null)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <LayoutFix title="Detail employe">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    )
  }

  if (!employe) {
    return (
      <LayoutFix title="Detail employe">
        <div className="bg-white rounded-xl shadow-sm p-7 text-center text-red-600">
          Employe introuvable.
        </div>
      </LayoutFix>
    )
  }

  return (
    <LayoutFix title="Detail employe">
      <div className="xp-form max-w-5xl mx-auto space-y-7">
        <section className="bg-white rounded-xl shadow-sm p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/employes')}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Retour liste
              </button>

              <div className="w-16 h-16 rounded-lg bg-blue-100 text-blue-700 overflow-hidden flex items-center justify-center text-xl font-semibold">
                {resolvedPhotoUrl ? (
                  <img src={resolvedPhotoUrl} alt="Photo employe" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employe.prenom} {employe.nom}
                </h1>
                <p className="text-sm text-gray-500">
                  {employe.matricule ? `Matricule ${employe.matricule}` : 'Matricule non attribue'}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
                {canEditProfessional ? (
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving || uploadingContract}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => void handleSave()}
                  disabled={saving || uploadingContract}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : uploadingContract ? 'Upload contrat...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        </section>

        {error ? (
          <section className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </section>
        ) : null}

        {success ? (
          <section className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </section>
        ) : null}

        <section className="bg-white rounded-xl shadow-sm p-7">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Badge de pointage</h2>
            {badge ? (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeStatusClass(badge.status)}`}>
                {badgeStatusLabel(badge.status)}
              </span>
            ) : null}
          </div>

          {loadingBadge ? (
            <div className="text-sm text-gray-500">Chargement du badge...</div>
          ) : badge?.token ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setBadgeModalOpen(true)}
                  className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-md transition-shadow"
                  title="Afficher le badge en grand"
                >
                  <img
                    src={buildBadgeQrUrl(badge.token, 220)}
                    alt="Badge QR employe"
                    className="w-[220px] h-[220px] object-contain"
                  />
                </button>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Matricule:</strong> {badge.user_matricule || employe.matricule || '-'}</p>
                <p><strong>Token:</strong> <span className="font-mono break-all">{badge.token}</span></p>
                <p><strong>Derniere utilisation:</strong> {formatDateTime(badge.last_used)}</p>
                <p><strong>Expiration:</strong> {formatDateTime(badge.expires_at)}</p>
                <p><strong>Utilisations:</strong> {Number(badge.usage_count || 0)}</p>
                <p className="text-xs text-gray-500">Cliquez sur l'apercu QR pour ouvrir le badge en grand.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Aucun badge actif detecte pour cet employe.
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles (lecture seule)</h2>
          <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="xp-form-label">Prenom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Telephone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Situation matrimoniale</label>
              <select
                name="situation_matrimoniale"
                value={formData.situation_matrimoniale}
                onChange={handleInputChange}
                className="xp-form-input"
              >
                <option value="">Non renseignee</option>
                <option value="celibataire">Celibataire</option>
                <option value="marie(e)">Marie(e)</option>
                <option value="divorce(e)">Divorce(e)</option>
                <option value="veuf(ve)">Veuf(ve)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="xp-form-label">Adresse</label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                rows={3}
                className="xp-form-input"
              />
            </div>
          </fieldset>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact d'urgence (lecture seule)</h2>
          <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="xp-form-label">Nom</label>
              <input
                type="text"
                name="contact_urgence_nom"
                value={formData.contact_urgence_nom}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Telephone</label>
              <input
                type="tel"
                name="contact_urgence_telephone"
                value={formData.contact_urgence_telephone}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Relation</label>
              <input
                type="text"
                name="contact_urgence_relation"
                value={formData.contact_urgence_relation}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="xp-form-label">Adresse physique du contact d'urgence</label>
              <textarea
                name="contact_urgence_adresse_physique"
                value={formData.contact_urgence_adresse_physique}
                onChange={handleInputChange}
                rows={2}
                className="xp-form-input"
              />
            </div>
          </fieldset>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations professionnelles</h2>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${canEditProfessional ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {canEditProfessional ? 'Edition reservee aux roles administration' : 'Lecture seule'}
            </span>
          </div>

          <fieldset disabled={!isEditing || !canEditProfessional} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="xp-form-label">ID employe</label>
              <input
                type="text"
                value={formData.id ? String(formData.id) : '-'}
                disabled
                className="xp-form-input"
              />
              <p className="text-xs text-gray-500 mt-1">Identifiant interne non modifiable.</p>
            </div>

            <div>
              <label className="xp-form-label">Matricule</label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Email professionnel (connexion)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Email pro interne</label>
              <input
                type="email"
                name="email_pro"
                value={formData.email_pro}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Date embauche</label>
              <input
                type="date"
                name="date_embauche"
                value={formData.date_embauche}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Salaire</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="salaire"
                value={formData.salaire}
                onChange={handleInputChange}
                placeholder="0.00"
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Type de contrat</label>
              <input
                type="text"
                name="contrat_type"
                value={formData.contrat_type}
                onChange={handleInputChange}
                placeholder="CDI, CDD, Stage..."
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Duree contrat</label>
              <input
                type="text"
                name="contrat_duree"
                value={formData.contrat_duree}
                onChange={handleInputChange}
                placeholder="12 mois, indefini..."
                className="xp-form-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="xp-form-label">Contrat de travail (PDF)</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenContractPicker}
                  disabled={!isEditing || !canEditProfessional || uploadingContract}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingContract ? 'Telechargement...' : 'Choisir un PDF'}
                </button>
                <input
                  ref={contractFileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleContractChange}
                  onClick={(event) => {
                    event.currentTarget.value = ''
                  }}
                  disabled={!isEditing || !canEditProfessional || uploadingContract}
                  className="hidden"
                />
                {resolvedContractUrl ? (
                  <a
                    href={resolvedContractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg border border-blue-300 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    Ouvrir le PDF
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Aucun contrat telecharge</span>
                )}
                {resolvedContractUrl && isEditing && canEditProfessional ? (
                  <button
                    type="button"
                    onClick={handleRemoveContract}
                    disabled={uploadingContract}
                    className="px-3 py-2 rounded-lg border border-red-300 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {contractFileName ? `Fichier: ${contractFileName}` : 'Formats: PDF uniquement. Taille max: 10 Mo.'}
              </p>
            </div>

            <div>
              <label className="xp-form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="xp-form-input"
              >
                {roles.length === 0 ? (
                  <option value={formData.role}>{formatRoleLabel(formData.role)}</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="xp-form-label">Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                className="xp-form-input"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>

            <div>
              <label className="xp-form-label">Departement</label>
              <input
                type="text"
                name="departement"
                value={formData.departement}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>

            <div>
              <label className="xp-form-label">Poste</label>
              <input
                type="text"
                name="poste"
                value={formData.poste}
                onChange={handleInputChange}
                className="xp-form-input"
              />
            </div>
          </fieldset>
        </section>

        {badgeModalOpen && badge?.token ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setBadgeModalOpen(false)} aria-hidden="true"></div>
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-xl w-full p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Badge de {employe.prenom} {employe.nom}</h3>
                <button
                  type="button"
                  onClick={() => setBadgeModalOpen(false)}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center mb-4">
                <img
                  src={buildBadgeQrUrl(badge.token, 380)}
                  alt="Badge QR grand format"
                  className="w-[380px] h-[380px] max-w-full object-contain"
                />
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Matricule:</strong> {badge.user_matricule || employe.matricule || '-'}</p>
                <p><strong>Token:</strong> <span className="font-mono break-all">{badge.token}</span></p>
                <p><strong>Statut:</strong> {badgeStatusLabel(badge.status)}</p>
                <p><strong>Expiration:</strong> {formatDateTime(badge.expires_at)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </LayoutFix>
  )
}

export default EmployeDetailPage

