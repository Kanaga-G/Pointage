import { apiClient } from './apiClient'

const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const MAX_CONTRACT_PDF_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ACCEPTED_CONTRACT_PDF_TYPES = new Set(['application/pdf'])

const getDirectApiOrigin = () => {
  if (typeof window === 'undefined') return 'http://localhost:3003'
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:3003`
}

const DIRECT_API_ORIGIN = getDirectApiOrigin()

class UploadService {
  uploadContract(file: File, id: number, arg2: string) {
    throw new Error('Method not implemented.')
  }
  async uploadProfilePhoto(file: File): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error('Fichier invalide.')
    }

    if (!ACCEPTED_PROFILE_PHOTO_TYPES.has(file.type)) {
      throw new Error('Format image non supporte. Utilisez JPG, PNG, WEBP ou GIF.')
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
      throw new Error('Image trop volumineuse (max 5 Mo).')
    }

    const payload = new FormData()
    payload.append('photo', file)

    const candidateEndpoints = [
      '/api/uploads/profile-photo',
      '/api/upload/profile-photo',
      `${DIRECT_API_ORIGIN}/api/uploads/profile-photo`,
      `${DIRECT_API_ORIGIN}/api/upload/profile-photo`
    ]
    let lastError: unknown = null

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await apiClient.post<FormData, { success: boolean; photo_url?: string; message?: string }>(
          endpoint,
          payload
        )
        if (response?.success && response.photo_url) {
          return response.photo_url
        }
        lastError = new Error(response?.message || 'Erreur upload photo.')
      } catch (error: any) {
        lastError = error
        if (Number(error?.status || 0) === 404) {
          continue
        }
        throw error
      }
    }

    const message = (lastError as { message?: string } | null)?.message
    throw new Error(message || "Endpoint d'upload photo introuvable (404). Redemarrez le backend.")
  }

  async uploadContractPdf(file: File): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error('Fichier invalide.')
    }

    if (!ACCEPTED_CONTRACT_PDF_TYPES.has(file.type)) {
      throw new Error('Format non supporte. Utilisez uniquement un PDF.')
    }

    if (file.size > MAX_CONTRACT_PDF_SIZE_BYTES) {
      throw new Error('PDF trop volumineux (max 10 Mo).')
    }

    const payload = new FormData()
    payload.append('contrat', file)

    const candidateEndpoints = [
      '/api/uploads/contract-pdf',
      '/api/upload/contract-pdf',
      `${DIRECT_API_ORIGIN}/api/uploads/contract-pdf`,
      `${DIRECT_API_ORIGIN}/api/upload/contract-pdf`
    ]

    let lastError: unknown = null
    for (const endpoint of candidateEndpoints) {
      try {
        const response = await apiClient.post<FormData, { success: boolean; contract_url?: string; message?: string }>(
          endpoint,
          payload
        )
        if (response?.success && response.contract_url) {
          return response.contract_url
        }
        lastError = new Error(response?.message || 'Erreur upload contrat PDF.')
      } catch (error: any) {
        lastError = error
        if (Number(error?.status || 0) === 404) {
          continue
        }
        throw error
      }
    }

    const message = (lastError as { message?: string } | null)?.message
    throw new Error(message || "Endpoint d'upload contrat introuvable (404). Redemarrez le backend.")
  }

  resolvePhotoUrl(photo?: string | null): string {
    const raw = String(photo || '').trim()
    if (!raw) return ''

    if (
      raw.startsWith('http://')
      || raw.startsWith('https://')
      || raw.startsWith('data:')
      || raw.startsWith('blob:')
      || raw.startsWith('/api/')
      || raw.startsWith('/uploads/')
    ) {
      return raw
    }

    if (raw.startsWith('api/')) {
      return `/${raw}`
    }

    if (raw.startsWith('uploads/')) {
      return `/api/${raw}`
    }

    if (raw.startsWith('/')) {
      return raw
    }

    return `/api/uploads/profile-photos/${raw}`
  }
}

export const uploadService = new UploadService()
export default uploadService
