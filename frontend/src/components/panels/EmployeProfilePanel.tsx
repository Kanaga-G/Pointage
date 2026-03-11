import React, { useState } from 'react'
import { useAuth } from '../../services/authService'
import { uploadService } from '../../services/uploadService'

interface EmployeProfilePanelProps {
  className?: string
}

export const EmployeProfilePanel: React.FC<EmployeProfilePanelProps> = ({ className = '' }) => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || ''
    })
    setIsEditing(false)
    setMessage(null)
  }

  if (!user) return null

  const initiales = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  const resolvedPhoto = uploadService.resolvePhotoUrl(user.photo)

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Mon Profil</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <i className="fas fa-edit mr-1"></i>
            Modifier
          </button>
        )}
      </div>

      {/* Photo et infos principales */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          {resolvedPhoto ? (
            <img
              src={resolvedPhoto}
              alt={`${user.prenom} ${user.nom}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-blue-600">{initiales}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-gray-900">
            {user.prenom} {user.nom}
          </h4>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {user.role === 'admin' ? 'Administrateur' : 'Employé'}
            </span>
            {user.departement && (
              <span className="text-sm text-gray-500">
                {user.departement}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulaire d'édition */}
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      ) : (
        /* Affichage en lecture seule */
        <div className="space-y-3">
          {user.telephone && (
            <div className="flex items-center text-sm">
              <i className="fas fa-phone w-5 text-gray-400"></i>
              <span className="ml-3 text-gray-600">{user.telephone}</span>
            </div>
          )}
          
          {user.adresse && (
            <div className="flex items-center text-sm">
              <i className="fas fa-map-marker-alt w-5 text-gray-400"></i>
              <span className="ml-3 text-gray-600">{user.adresse}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <i className="fas fa-envelope w-5 text-gray-400"></i>
            <span className="ml-3 text-gray-600">{user.email}</span>
          </div>
          
          {user.statut && (
            <div className="flex items-center text-sm">
              <i className="fas fa-circle w-5 text-green-500 text-xs"></i>
              <span className="ml-3 text-gray-600 capitalize">{user.statut}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EmployeProfilePanel
