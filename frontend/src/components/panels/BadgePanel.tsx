import React, { useState, useEffect } from 'react'
import { useAuth } from '../../services/authService'

interface BadgeData {
  token: string
  token_hash: string
  expires_at: string
  status: 'active' | 'expired' | 'inactive'
  created_at: string
}

interface BadgePanelProps {
  className?: string
}

export const BadgePanel: React.FC<BadgePanelProps> = ({ className = '' }) => {
  const { user, getUserId } = useAuth()
  const [badge, setBadge] = useState<BadgeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      fetchBadge()
    }
  }, [user])

  const fetchBadge = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/badge/employe/${user.id}`)
      const data = await response.json()

      if (data.success && data.badge) {
        setBadge(data.badge)
      }
    } catch (error) {
      console.error('Erreur récupération badge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateBadge = async () => {
    if (!user) return

    setIsGenerating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/badge/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employe_id: user.id })
      })

      const data = await response.json()

      if (data.success && data.badge) {
        setBadge(data.badge)
        setMessage({ type: 'success', text: 'Nouveau badge généré avec succès' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la génération' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!badge) return

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(badge.token)}`
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `badge-${user?.prenom}-${user?.nom}.png`
    link.click()
  }

  const copyToken = () => {
    if (!badge) return

    navigator.clipboard.writeText(badge.token)
    setMessage({ type: 'success', text: 'Token copié dans le presse-papiers' })
    setTimeout(() => setMessage(null), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = badge ? new Date(badge.expires_at) < new Date() : false

  if (!user) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Mon Badge</h3>
        {badge && (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isExpired 
              ? 'bg-red-100 text-red-800' 
              : badge.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <i className={`fas fa-circle mr-1 text-xs ${
              isExpired ? 'text-red-500' : badge.status === 'active' ? 'text-green-500' : 'text-gray-500'
            }`}></i>
            {isExpired ? 'Expiré' : badge.status === 'active' ? 'Actif' : 'Inactif'}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du badge...</p>
        </div>
      ) : badge ? (
        <div className="space-y-6">
          {/* Message de feedback */}
          {message && (
            <div className={`p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 bg-gray-50 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(badge.token)}`}
                alt="QR Code Badge"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scannez ce code pour pointer
            </p>
          </div>

          {/* Token */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Token du badge</p>
                <p className="font-mono text-sm text-gray-900 mt-1">{badge.token}</p>
              </div>
              <button
                onClick={copyToken}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copier le token"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Créé le:</span>
              <span className="text-gray-900">{formatDate(badge.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expire le:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(badge.expires_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={downloadQR}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-download mr-2"></i>
              Télécharger
            </button>
            <button
              onClick={generateBadge}
              disabled={isGenerating}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Génération...
                </>
              ) : (
                <>
                  <i className="fas fa-sync mr-2"></i>
                  Régénérer
                </>
              )}
            </button>
          </div>

          {isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                <p className="text-sm text-yellow-800">
                  Votre badge a expiré. Veuillez en générer un nouveau pour continuer à pointer.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-qrcode text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de badge</p>
          <button
            onClick={generateBadge}
            disabled={isGenerating}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Génération...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Générer mon badge
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default BadgePanel
