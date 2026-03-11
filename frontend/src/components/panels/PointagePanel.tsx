import React, { useState, useEffect } from 'react'
import { useAuth } from '../../services/authService'

interface Pointage {
  id: number
  date_heure: string
  type: 'arrivee' | 'depart'
  created_at: string
}

interface PointagePanelProps {
  className?: string
}

export const PointagePanel: React.FC<PointagePanelProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchPointages()
    }
  }, [user])

  const fetchPointages = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pointages/employe/${user.id}`)
      const data = await response.json()

      if (data.success) {
        setPointages(data.pointages || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des pointages')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    return type === 'arrivee' ? 'fa-sign-in-alt' : 'fa-sign-out-alt'
  }

  const getTypeColor = (type: string) => {
    return type === 'arrivee' ? 'text-green-600' : 'text-blue-600'
  }

  const getTypeLabel = (type: string) => {
    return type === 'arrivee' ? 'Arrivée' : 'Départ'
  }

  // Grouper les pointages par jour
  const pointagesParJour = pointages.reduce((acc, pointage) => {
    const date = formatDate(pointage.date_heure)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(pointage)
    return acc
  }, {} as Record<string, Pointage[]>)

  // Trier les dates par ordre décroissant
  const sortedDates = Object.keys(pointagesParJour).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (!user) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Mes Pointages</h3>
        <button
          onClick={fetchPointages}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          <i className="fas fa-sync mr-1"></i>
          Actualiser
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des pointages...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPointages}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : pointages.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-600">Aucun pointage enregistré</p>
          <p className="text-sm text-gray-500 mt-2">Vos pointages apparaîtront ici dès que vous commencerez à pointer</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h4 className="text-sm font-medium text-gray-900 mb-3">{date}</h4>
              <div className="space-y-2">
                {pointagesParJour[date].map(pointage => (
                  <div
                    key={pointage.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(pointage.type)}`}>
                        <i className={`fas ${getTypeIcon(pointage.type)} text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getTypeLabel(pointage.type)}</p>
                        <p className="text-sm text-gray-500">{formatTime(pointage.date_heure)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatTime(pointage.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques rapides */}
      {pointages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Statistiques</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {pointages.filter(p => p.type === 'arrivee').length}
              </p>
              <p className="text-sm text-gray-600">Arrivées</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {pointages.filter(p => p.type === 'depart').length}
              </p>
              <p className="text-sm text-gray-600">Départs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PointagePanel
