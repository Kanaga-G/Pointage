import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, Settings, Eye, EyeOff } from 'lucide-react'
import LayoutFix from '../../components/LayoutFix'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../services/authService'
import { uploadService } from '../../services/uploadService'
import '../../styles/pages/dashboard-php.css'

interface AdminProfile {
  situation_matrimoniale: string
  id: number
  userType?: 'admin' | 'employe'
  nom?: string
  prenom?: string
  email?: string
  role?: string
  telephone?: string
  adresse?: string
  departement?: string
  poste?: string
  statut?: string
  matricule?: string
  photo?: string
  date_embauche?: string
  dateCreation?: string
  createdAt?: string
  created_at?: string
  lastActivity?: string
  last_activity?: string
  badgeId?: string
  badge_id?: string
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
  photo?: string
  badgeId?: string
  qrCode?: string
  departement?: string
  validite?: string
}

interface ProfileFormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  departement: string
  poste: string
  statut: string
  badge_id: string
  date_embauche: string
  photo: string
  role: string
  matricule: string
  situation_matrimoniale: string
}

const ADMIN_ALLOWED_ROLES = new Set(['admin', 'super_admin', 'manager', 'hr'])
const isBlobUrl = (value: string) => value.startsWith('blob:')

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

const toDateInputValue = (value?: string) => {
  if (!value) return ''
  const asString = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(asString)) return asString.slice(0, 10)
  const parsed = new Date(asString)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('fr-FR')
}

const formatRole = (value?: string) => {
  const role = String(value || 'admin').trim().toLowerCase()
  return ROLE_LABELS[role] || role.replace(/_/g, ' ')
}

const generateMatricule = (prenom?: string, nom?: string): string => {
  // Prend les 3 premières lettres du nom et 3 premières lettres du prénom
  const nomPart = (nom || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X')
  const prenomPart = (prenom || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X')
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${nomPart}${prenomPart}${randomPart}`
}

const buildFormData = (profile: AdminProfile): ProfileFormData => ({
  nom: profile.nom || '',
  prenom: profile.prenom || '',
  email: profile.email || '',
  telephone: profile.telephone || '',
  adresse: profile.adresse || '',
  departement: profile.departement || '',
  poste: profile.poste || '',
  statut: profile.statut || 'actif',
  badge_id: profile.badge_id || profile.badgeId || profile.matricule || generateMatricule(profile.prenom, profile.nom),
  date_embauche: toDateInputValue(profile.date_embauche),
  photo: profile.photo || '',
  role: profile.role || '',
  matricule: profile.matricule || generateMatricule(profile.prenom, profile.nom),
  situation_matrimoniale: profile.situation_matrimoniale || ''
})

const buildBadgeQrUrl = (token: string, size = 320) => {
  const safeToken = String(token || '').trim()
  if (!safeToken) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safeToken)}`
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const badgeStatusClass = (status?: BadgePreview['status']) => {
  if (status === 'inactive') return 'is-danger'
  if (status === 'expired') return 'is-warning'
  return 'is-success'
}

const badgeStatusLabel = (status?: BadgePreview['status']) => {
  if (status === 'inactive') return 'Badge desactive'
  if (status === 'expired') return 'Badge expire'
  return 'Badge actif'
}

const AdminProfilePage: React.FC = () => {
  const { user, isLoading: authLoading, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    departement: '',
    poste: '',
    statut: 'actif',
    badge_id: '',
    date_embauche: '',
    photo: '',
    role: '',
    matricule: '',
    situation_matrimoniale: ''
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [badge, setBadge] = useState<BadgePreview | null>(null)
  const [loadingBadge, setLoadingBadge] = useState(false)
  const [badgeModalOpen, setBadgeModalOpen] = useState(false)

  const profileDate = useMemo(
    () => profile?.date_embauche || profile?.dateCreation || profile?.createdAt || profile?.created_at || '',
    [profile]
  )
  const canEditHireDate = useMemo(() => profile?.userType === 'employe', [profile?.userType])
  const isSuperAdmin = useMemo(() => profile?.role === 'super_admin', [profile?.role])
  const canEditProfessionalInfo = useMemo(() => isSuperAdmin, [isSuperAdmin])
  const lastActivity = useMemo(
    () => profile?.lastActivity || profile?.last_activity || '',
    [profile]
  )
  const badgeId = useMemo(
    () => profile?.badgeId || profile?.badge_id || profile?.matricule || '',
    [profile]
  )
  const currentPhotoSource = editing ? formData.photo : profile?.photo || formData.photo
  const resolvedPhotoUrl = useMemo(
    () => photoPreviewUrl || uploadService.resolvePhotoUrl(currentPhotoSource),
    [currentPhotoSource, photoPreviewUrl]
  )
  const initials = useMemo(
    () => `${(formData.prenom?.[0] || profile?.prenom?.[0] || 'A').toUpperCase()}${(formData.nom?.[0] || profile?.nom?.[0] || 'D').toUpperCase()}`,
    [formData.nom, formData.prenom, profile?.nom, profile?.prenom]
  )

  useEffect(() => {
    return () => {
      if (isBlobUrl(photoPreviewUrl)) {
        URL.revokeObjectURL(photoPreviewUrl)
      }
    }
  }, [photoPreviewUrl])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ success: boolean; user?: AdminProfile; message?: string }>('/api/auth/validate')
      if (!response?.success || !response.user) {
        throw new Error(response?.message || 'Profil introuvable')
      }
      setProfile(response.user)
      setFormData(buildFormData(response.user))
      
      // Charger le badge de l'admin avec le profil utilisateur
      if (response.user.id) {
        await loadAdminBadge(response.user.id, response.user)
      }
    } catch (loadError: any) {
      console.error('Erreur chargement profil admin:', loadError)
      setError(loadError?.message || 'Impossible de charger le profil')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const loadAdminBadge = async (adminId: number, userProfile?: AdminProfile, retryCount = 0) => {
    try {
      setLoadingBadge(true)
      console.log(`🔄 Chargement du badge pour l'admin ID: ${adminId} (tentative ${retryCount + 1})`)

      // Utiliser le profil utilisateur passé en paramètre ou celui de l'état
      const currentProfile = userProfile || profile
      
      // Essayer les endpoints spécifiques pour les admins
      const endpoints = ['/api/admin/badge', '/api/badge/admin']
      let badgeFound = false
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Tentative endpoint: ${endpoint}`)
          const response = await apiClient.get<{ success: boolean; badge?: BadgePreview | null; message?: string }>(endpoint)
          console.log(`📋 Réponse de ${endpoint}:`, { success: response?.success, hasBadge: !!response?.badge })
          
          if (response?.success && response.badge?.token) {
            console.log(`✅ Badge trouvé via ${endpoint}:`, { 
              id: response.badge.id, 
              token: response.badge.token.substring(0, 10) + '...', 
              status: response.badge.status 
            })
            
            // Nettoyer et enrichir les données du badge
            const cleanedBadge = {
              ...response.badge,
              qrCode: buildBadgeQrUrl(response.badge.token),
              user_matricule: response.badge.user_matricule || response.badge.badgeId || currentProfile?.matricule || '',
              user_name: response.badge.user_name || `${currentProfile?.prenom} ${currentProfile?.nom}`,
              user_email: response.badge.user_email || currentProfile?.email,
              user_role: response.badge.user_role || currentProfile?.role,
              user_type: 'admin' as const
            }
            
            setBadge(cleanedBadge)
            console.log('🎯 Badge admin récupéré et nettoyé avec succès via endpoints admin')
            badgeFound = true
            return
          }
        } catch (endpointError: any) {
          console.log(`❌ Erreur endpoint ${endpoint}:`, endpointError?.message || endpointError?.status || 'Erreur inconnue')
          if (Number(endpointError?.status || 0) === 404) {
            console.log(`📍 Endpoint ${endpoint} non trouvé (404), essai suivant`)
            continue
          }
          console.log(`📍 Erreur autre que 404, continuation`)
        }
      }

      if (!badgeFound) {
        console.log('❌ Aucun badge trouvé via endpoints spécifiques, tentative fallback')
        
        // Fallback : chercher dans tous les badges
        try {
          const fallbackResponse = await apiClient.get<{ success: boolean; badges?: BadgePreview[]; message?: string }>('/api/badges?history=all')
          console.log(`📋 Réponse fallback:`, { success: fallbackResponse?.success, badgesCount: fallbackResponse?.badges?.length || 0 })
          
          if (fallbackResponse?.success && Array.isArray(fallbackResponse.badges)) {
            console.log(`📋 Recherche parmi ${fallbackResponse.badges.length} badges`)
            const fallbackBadge = fallbackResponse.badges
              .filter((entry) => Number(entry.user_id) === adminId && String(entry.user_type || 'admin') === 'admin')
              .sort((left, right) => {
                const leftTime = new Date(left.created_at || 0).getTime()
                const rightTime = new Date(right.created_at || 0).getTime()
                return rightTime - leftTime
              })[0] || null

            if (fallbackBadge && fallbackBadge.token) {
              console.log('✅ Badge trouvé via fallback:', { 
                id: fallbackBadge.id, 
                token: fallbackBadge.token.substring(0, 10) + '...', 
                status: fallbackBadge.status 
              })
              
              // Nettoyer et enrichir les données du badge
              const cleanedBadge = {
                ...fallbackBadge,
                qrCode: buildBadgeQrUrl(fallbackBadge.token),
                user_matricule: fallbackBadge.user_matricule || fallbackBadge.badgeId || currentProfile?.matricule || '',
                user_name: fallbackBadge.user_name || `${currentProfile?.prenom} ${currentProfile?.nom}`,
                user_email: fallbackBadge.user_email || currentProfile?.email,
                user_role: fallbackBadge.user_role || currentProfile?.role,
                user_type: 'admin' as const
              }
              
              setBadge(cleanedBadge)
              console.log('🎯 Badge admin récupéré et nettoyé avec succès via fallback')
              badgeFound = true
              return
            }
          }
        } catch (fallbackError: any) {
          console.log('❌ Erreur fallback:', fallbackError?.message || fallbackError?.status || 'Erreur inconnue')
        }
      }

      if (!badgeFound) {
        console.log('❌ Aucun badge trouvé pour cet admin après toutes les tentatives')
        setBadge(null)
        
        // Si aucun badge trouvé et que nous n'avons pas encore réessayé, attendre un peu et réessayer
        if (retryCount < 2) {
          console.log(`🔄 Aucun badge trouvé, nouvel essai dans 2 secondes...`)
          setTimeout(() => {
            loadAdminBadge(adminId, userProfile, retryCount + 1)
          }, 2000)
          return
        } else {
          console.log('❌ Nombre maximum de tentatives atteint, abandon')
        }
      }
    } catch (badgeError: any) {
      console.error('💥 Erreur générale chargement badge admin:', badgeError)
      
      // En cas d'erreur et si nous n'avons pas encore réessayé, attendre un peu et réessayer
      if (retryCount < 2) {
        console.log(`🔄 Erreur de chargement, nouvel essai dans 2 secondes...`)
        setTimeout(() => {
          loadAdminBadge(adminId, userProfile, retryCount + 1)
        }, 2000)
        return
      }
      
      setBadge(null)
    } finally {
      setLoadingBadge(false)
      console.log('🏁 Fin du chargement du badge admin')
    }
  }

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

    void loadProfile()
  }, [authLoading, navigate, user])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setUploadingPhoto(true)
      setError(null)

      const localPreviewUrl = URL.createObjectURL(file)
      setPhotoPreviewUrl((previous) => {
        if (isBlobUrl(previous)) {
          URL.revokeObjectURL(previous)
        }
        return localPreviewUrl
      })

      const uploadedPhotoUrl = await uploadService.uploadProfilePhoto(file)
      setFormData((prev) => ({ ...prev, photo: uploadedPhotoUrl }))
      setSuccess('Photo de profil mise a jour.')
    } catch (uploadError: any) {
      console.error('Erreur upload photo admin:', uploadError)
      setError(uploadError?.message || "Impossible d'ajouter la photo.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }))
    setPhotoPreviewUrl((previous) => {
      if (isBlobUrl(previous)) {
        URL.revokeObjectURL(previous)
      }
      return ''
    })
  }

  const handleStartEdit = () => {
    if (!profile) return
    setFormData(buildFormData(profile))
    setError(null)
    setSuccess(null)
    setEditing(true)
  }

  const handleCancel = () => {
    if (profile) {
      setFormData(buildFormData(profile))
    }
    setPhotoPreviewUrl((previous) => {
      if (isBlobUrl(previous)) {
        URL.revokeObjectURL(previous)
      }
      return ''
    })
    setEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      if (uploadingPhoto) {
        setError('Patientez pendant le telechargement de la photo.')
        return
      }

      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: Record<string, string | null> = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        adresse: formData.adresse.trim(),
        departement: formData.departement.trim(),
        poste: formData.poste.trim(),
        statut: formData.statut.trim(),
        badge_id: formData.badge_id.trim(),
        photo: formData.photo ? formData.photo.trim() : null
      }
      if (canEditHireDate) {
        payload.date_embauche = formData.date_embauche || null
      }

      const result = await updateProfile(payload)
      if (!result.success) {
        throw new Error(result.error || 'Mise a jour impossible')
      }

      await loadProfile()
      setPhotoPreviewUrl((previous) => {
        if (isBlobUrl(previous)) {
          URL.revokeObjectURL(previous)
        }
        return ''
      })
      setEditing(false)
      setSuccess('Profil mis a jour avec succes.')
    } catch (saveError: any) {
      console.error('Erreur mise a jour profil admin:', saveError)
      setError(saveError?.message || 'Erreur lors de la mise a jour du profil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <LayoutFix title="Mon profil">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    )
  }

  if (!profile) {
    return (
      <LayoutFix title="Mon profil">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-red-600">
          Profil introuvable.
        </div>
      </LayoutFix>
    )
  }

  return (
    <LayoutFix title="Mon profil">
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

        <section className="php-grid-2">
          <article className="php-card">
            <div className="php-card-header">
              <h2 className="php-card-title">
                <UserRound size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                Informations personnelles
              </h2>
              {!editing ? (
                <button
                  onClick={handleStartEdit}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving || uploadingPhoto}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    disabled={saving || uploadingPhoto}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : uploadingPhoto ? 'Upload photo...' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>
            <div className="php-card-body">
              {/* Section Photo et Badge côte à côte */}
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Photo */}
                <div className="flex-1">
                  <label className="xp-form-label">Photo professionnelle</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold overflow-hidden">
                      {resolvedPhotoUrl ? (
                        <img
                          src={resolvedPhotoUrl}
                          alt="Photo profil admin"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">{initials}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {editing ? (
                        <>
                          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            {uploadingPhoto ? 'Telechargement...' : 'Choisir une photo'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={handlePhotoChange}
                              disabled={uploadingPhoto}
                              className="hidden"
                            />
                          </label>
                          {(formData.photo || photoPreviewUrl) ? (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={uploadingPhoto}
                              className="px-3 py-2 rounded-lg border border-red-300 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Retirer
                            </button>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Cliquez sur Modifier pour ajouter/changer votre photo.</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Formats acceptes: JPG, PNG, WEBP, GIF (max 5 Mo).</p>
                </div>
                
                {/* Badge d'Accès */}
                <div className="flex-1">
                  <label className="xp-form-label">Badge d'Accès</label>
                  {loadingBadge ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                      <p className="text-xs text-gray-600">Chargement...</p>
                    </div>
                  ) : badge?.token ? (
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => setBadgeModalOpen(true)}
                          className="relative rounded-lg border-2 border-gray-200 bg-white p-3 hover:shadow-lg transition-all duration-300 hover:border-purple-300 hover:scale-105"
                          title="Afficher le badge en grand format"
                        >
                          <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            +
                          </div>
                          <img
                            src={badge.qrCode || buildBadgeQrUrl(badge.token, 120)}
                            alt="Badge QR admin"
                            className="w-[120px] h-[120px] object-contain"
                          />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            badge.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                            badge.status === 'inactive' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              badge.status === 'active' ? 'bg-green-500' : 
                              badge.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            {badge.status === 'active' ? 'Actif' :
                             badge.status === 'inactive' ? 'Inactif' : 'Expiré'}
                          </div>
                          <p className="text-xs text-gray-600">Matricule: {badge.user_matricule || badgeId || '-'}</p>
                          <p className="text-xs text-gray-500">Token: {badge.token.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Aucun badge</p>
                      <button
                        onClick={() => navigate('/admin/badges')}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Demander un badge
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Champs du formulaire */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="xp-form-label">Prenom</label>
                  <input
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Nom</label>
                  <input
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Telephone</label>
                  <input
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Situation matrimoniale</label>
                  <select
                    name="situation_matrimoniale"
                    value={formData.situation_matrimoniale || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
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
                  <label className="xp-form-label">Adresse personnelle</label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={3}
                    className="xp-form-input"
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="php-card">
            <div className="php-card-header">
              <h2 className="php-card-title">
                <Settings size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                Informations professionnelles {canEditProfessionalInfo ? '' : '(lecture seule)'}
              </h2>
            </div>
            {canEditProfessionalInfo && editing ? (
              <div className="php-card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="xp-form-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="xp-form-label">Departement</label>
                  <input
                    name="departement"
                    value={formData.departement}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Poste</label>
                  <input
                    name="poste"
                    value={formData.poste}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Date d'embauche</label>
                  <input
                    type="date"
                    name="date_embauche"
                    value={formData.date_embauche}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Matricule</label>
                  <input
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  />
                </div>
                <div>
                  <label className="xp-form-label">Statut</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="xp-form-input"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="php-card-body php-list">
                <div className="php-list-item">
                  <div>
                    <strong>Role</strong>
                    <small>{formatRole(profile?.role)}</small>
                  </div>
                  <span className="php-pill is-primary">{formatRole(profile?.role)}</span>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Departement</strong>
                    <small>{profile?.departement || '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Poste</strong>
                    <small>{profile?.poste || '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Date d'embauche</strong>
                    <small>{profile?.date_embauche ? formatDateTime(profile.date_embauche) : '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Matricule</strong>
                    <small>{profile?.matricule || badgeId || '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Email professionnel</strong>
                    <small>{profile?.email || '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Date de creation</strong>
                    <small>{profile?.dateCreation ? formatDateTime(profile.dateCreation) : '-'}</small>
                  </div>
                </div>
                <div className="php-list-item">
                  <div>
                    <strong>Derniere activite</strong>
                    <small>{profile?.lastActivity ? formatDateTime(profile.lastActivity) : '-'}</small>
                  </div>
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
      
      {/* Modal Badge */}
      {badgeModalOpen && badge && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setBadgeModalOpen(false)
            }
          }}
        >
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Bouton fermer en haut à droite */}
            <button
              onClick={() => setBadgeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenu principal du badge */}
            <div className="text-center space-y-6">
              {/* Photo et informations principales */}
              <div className="flex flex-col items-center space-y-4">
                {/* Photo de profil */}
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  {badge.photo ? (
                    <img src={badge.photo} alt="Badge" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  )}
                </div>
                
                {/* Nom et rôle */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{profile?.prenom} {profile?.nom}</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatRole(profile?.role)}</p>
                </div>
              </div>

              {/* Carte d'informations du badge */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    {badge.status === 'active' ? 'Actif' :
                     badge.status === 'inactive' ? 'Inactif' : 'Expiré'}
                  </div>
                </div>

                {/* QR Code centré */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <img 
                      src={badge.qrCode || buildBadgeQrUrl(badge.token, 200)} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Matricule</span>
                    <span className="font-mono text-gray-900 font-semibold">{badge.user_matricule || badgeId || generateMatricule(profile?.prenom, profile?.nom)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Token</span>
                    <span className="font-mono text-gray-900 text-xs break-all max-w-[200px]">{badge.token}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Département</span>
                    <span className="text-gray-900">{profile?.departement || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Poste</span>
                    <span className="text-gray-900">{profile?.poste || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Email</span>
                    <span className="text-gray-900 text-xs break-all max-w-[200px]">{profile?.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bouton Fermer */}
              <div>
                <button
                  onClick={() => setBadgeModalOpen(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutFix>
  )
}

export default AdminProfilePage
