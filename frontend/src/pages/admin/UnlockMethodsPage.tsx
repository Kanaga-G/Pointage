import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Shield, Plus, Edit2, Trash2, Key, Fingerprint, Smartphone, Lock, Unlock, AlertCircle, CheckCircle, X } from 'lucide-react'
import { unlockMethodsService, UnlockMethod, CreateUnlockMethodRequest, UpdateUnlockMethodRequest } from '../../services/unlockMethodsService'
import AuthContext from '../../contexts/AuthContext'

interface FormData {
  method: string
  value: string
  name: string
  type: string
  trusted: boolean
}

const UnlockMethodsPage: React.FC = () => {
  const authContext = useContext(AuthContext)
  const { user } = authContext
  const [methods, setMethods] = useState<UnlockMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<UnlockMethod | null>(null)
  const [formData, setFormData] = useState<FormData>({
    method: 'pin',
    value: '',
    name: '',
    type: '',
    trusted: false
  })

  // Charger les méthodes de déverrouillage
  const loadMethods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await unlockMethodsService.getUnlockMethods()
      setMethods(response.methods)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des méthodes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMethods()
  }, [loadMethods])

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      method: 'pin',
      value: '',
      name: '',
      type: '',
      trusted: false
    })
    setEditingMethod(null)
    setShowForm(false)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Valider le formulaire
  const validateForm = (): string | null => {
    if (!formData.value.trim()) return 'La valeur est requise'
    if (!formData.name.trim()) return 'Le nom est requis'

    switch (formData.method) {
      case 'pin':
        if (!unlockMethodsService.validatePin(formData.value)) {
          return 'Le code PIN doit contenir exactement 4 chiffres'
        }
        break
      case 'mac':
        if (!unlockMethodsService.validateMac(formData.value)) {
          return 'Format d\'adresse MAC invalide (ex: 00:1A:2B:3C:4D:5E)'
        }
        break
      case 'token':
        if (!unlockMethodsService.validateToken(formData.value)) {
          return 'Le token doit contenir au moins 8 caractères'
        }
        break
    }

    return null
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setError(null)
      setSuccess(null)

      if (editingMethod) {
        // Modifier une méthode existante
        const updateData: UpdateUnlockMethodRequest = {
          method: formData.method,
          value: formData.value,
          name: formData.name,
          type: formData.type || formData.method,
          trusted: formData.trusted
        }
        await unlockMethodsService.updateUnlockMethod(editingMethod.id, updateData)
        setSuccess('Méthode de déverrouillage modifiée avec succès')
      } else {
        // Ajouter une nouvelle méthode
        const createData: CreateUnlockMethodRequest = {
          method: formData.method,
          value: formData.value,
          name: formData.name,
          type: formData.type || formData.method
        }
        await unlockMethodsService.createUnlockMethod(createData)
        setSuccess('Méthode de déverrouillage ajoutée avec succès')
      }

      resetForm()
      loadMethods()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    }
  }

  // Supprimer une méthode
  const handleDelete = async (methodId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette méthode de déverrouillage ?')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await unlockMethodsService.deleteUnlockMethod(methodId)
      setSuccess('Méthode de déverrouillage supprimée avec succès')
      loadMethods()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  // Modifier une méthode
  const handleEdit = (method: UnlockMethod) => {
    setEditingMethod(method)
    setFormData({
      method: method.method,
      value: method.value,
      name: method.name,
      type: method.type,
      trusted: method.trusted
    })
    setShowForm(true)
  }

  // Déverrouillage admin pour super_admin
  const handleAdminUnlock = async () => {
    if (user?.role !== 'super_admin') {
      setError('Seul le super_admin peut utiliser cette fonction')
      return
    }

    try {
      setError(null)
      setSuccess(null)
      const response = await unlockMethodsService.adminOverrideUnlock()
      setSuccess(`Zone de scan déverrouillée avec succès (expire à ${new Date(response.session?.expiresAt || '').toLocaleTimeString()})`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du déverrouillage')
    }
  }

  // Obtenir l'icône pour la méthode
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'pin': return <Key size={20} />
      case 'mac': return <Smartphone size={20} />
      case 'fingerprint': return <Fingerprint size={20} />
      case 'token': return <Lock size={20} />
      default: return <Shield size={20} />
    }
  }

  // Obtenir la couleur pour le statut
  const getStatusColor = (trusted: boolean) => {
    return trusted ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="text-blue-600" />
              Méthodes de Déverrouillage
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les méthodes pour déverrouiller la zone de scan QR
            </p>
          </div>
          
          {user?.role === 'super_admin' && (
            <button
              onClick={handleAdminUnlock}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Unlock size={20} />
              Déverrouillage Admin
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={20} className="text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <span className="text-green-800">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X size={20} className="text-green-600" />
          </button>
        </div>
      )}

      {/* Bouton d'ajout */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Ajouter une méthode
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingMethod ? 'Modifier la méthode' : 'Ajouter une nouvelle méthode'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de méthode
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {unlockMethodsService.getAvailableMethods().map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Téléphone personnel, Bureau, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur
                </label>
                <input
                  type={formData.method === 'pin' ? 'password' : 'text'}
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder={
                    formData.method === 'pin' ? '1234' :
                    formData.method === 'mac' ? '00:1A:2B:3C:4D:5E' :
                    formData.method === 'token' ? 'Token secret' :
                    'Empreinte digitale'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="trusted"
                  id="trusted"
                  checked={formData.trusted}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="trusted" className="ml-2 text-sm text-gray-700">
                  Appareil de confiance (accès automatique)
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMethod ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des méthodes */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Méthodes configurées</h2>
        </div>

        {methods.length === 0 ? (
          <div className="p-8 text-center">
            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune méthode configurée</h3>
            <p className="text-gray-500">Ajoutez votre première méthode de déverrouillage.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {methods.map((method) => (
              <div key={method.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {getMethodIcon(method.method)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">
                        {unlockMethodsService.formatMethodName(method.method)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valeur: {unlockMethodsService.formatMethodValue(method.method, method.value)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(method.trusted)}`}>
                      {method.trusted ? 'Confiance' : 'Normal'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Dernière utilisation: {new Date(method.lastSeen).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UnlockMethodsPage
