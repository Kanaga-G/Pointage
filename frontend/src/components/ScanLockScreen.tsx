import React, { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, Lock, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../services/authService'
import scanSecurityService from '../services/scanSecurityService'

type ScanLockScreenProps = {
  onUnlocked?: () => void
}

const ScanLockScreen: React.FC<ScanLockScreenProps> = ({ onUnlocked }) => {
  const { user } = useAuth()
  const [unlockValue, setUnlockValue] = useState('')
  const [duration, setDuration] = useState(60) // minutes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSuperAdmin = useMemo(() => scanSecurityService.isSuperAdmin(user), [user])

  // Gérer le déverrouillage
  const handleUnlock = useCallback(async () => {
    if (!unlockValue.trim() || unlockValue.length !== 4) {
      setError('Veuillez entrer un code PIN à 4 chiffres')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await scanSecurityService.unlockByPIN(unlockValue.trim(), duration)
      if (!response.success) {
        setError(response.message || 'Échec du déverrouillage')
        return
      }

      setSuccess(`Zone de scan déverrouillée avec succès! Session active pour ${duration} minutes`)
      setUnlockValue('')
      onUnlocked?.()
    } catch (error: any) {
      console.error('Erreur lors du déverrouillage:', error)
      setError(error.message || 'Échec du déverrouillage')
    } finally {
      setLoading(false)
    }
  }, [unlockValue, duration, onUnlocked])

  const handleAdminUnlock = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await scanSecurityService.adminOverrideUnlock(duration)
      if (!response.success) {
        setError(response.message || 'Échec du déverrouillage admin')
        return
      }

      setSuccess(`Déverrouillage admin réussi! Session active pour ${duration} minutes`)
      onUnlocked?.()
    } catch (error: any) {
      console.error('Erreur lors du déverrouillage admin:', error)
      setError(error.message || 'Échec du déverrouillage admin')
    } finally {
      setLoading(false)
    }
  }, [user, duration])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
            <p className="text-gray-600">Veuillez vous connecter pour accéder à la zone de scan.</p>
          </div>
        </div>
      </div>
    )
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zone de Scan Verrouillée
          </h1>
          <p className="text-gray-600">
            Veuillez déverrouiller la zone de scan pour continuer
          </p>
        </div>

        {/* Messages de feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bouton de déverrouillage admin pour super_admin */}
        {isSuperAdmin && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Accès Super Admin</span>
              </div>
              <p className="text-sm mb-3">En tant que super administrateur, vous pouvez déverrouiller automatiquement la zone de scan.</p>
              <button
                onClick={handleAdminUnlock}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Déverrouillage en cours...' : 'Déverrouillage automatique'}
              </button>
            </div>
          </div>
        )}

        {/* Formulaire de déverrouillage - Code PIN */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Déverrouillage par Code PIN</h3>
            <p className="text-sm text-gray-600">Entrez votre code PIN personnel pour accéder à la zone de scan</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code PIN <span className="text-xs text-gray-500">(4 chiffres)</span>
            </label>
            <input
              type="password"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              value={unlockValue}
              onChange={(e) => {
                // N'accepter que les chiffres pour le PIN
                const value = e.target.value.replace(/[^0-9]/g, '');
                setUnlockValue(value);
              }}
              placeholder="1234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée de la session (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes (par défaut)</option>
              <option value={120}>2 heures</option>
              <option value={240}>4 heures</option>
              <option value={480}>8 heures</option>
            </select>
          </div>

          <button
            onClick={handleUnlock}
            disabled={loading || unlockValue.length !== 4}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Déverrouillage en cours...' : 'Déverrouiller la zone de scan'}
          </button>

          <div className="text-center text-xs text-gray-500">
            <p>Code PIN par défaut : <strong>1234</strong></p>
            <p>Vous pouvez le modifier dans les paramètres admin</p>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Sécurité</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• La zone de scan est protégée par un code PIN sécurisé</li>
            <li>• Chaque session est chiffrée et expire automatiquement</li>
            <li>• Le code PIN par défaut est "1234"</li>
            <li>• Toutes les activités de scan sont tracées et journalisées</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ScanLockScreen
