import React from 'react';
import { useAuth } from '../../services/authService';
import { uploadService } from '../../services/uploadService';

export default function ProfilePanel() {
  const { user } = useAuth();
  const resolvedPhoto = uploadService.resolvePhotoUrl(user?.photo);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Mon Profil</h2>
      
      {/* Photo et informations de base */}
      <div className="flex items-center space-x-6 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          {resolvedPhoto ? (
            <img src={resolvedPhoto} alt="Photo" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-600">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.prenom} {user?.nom}
          </h3>
          <p className="text-gray-600">{user?.poste || 'Employé'}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            user?.statut === 'actif' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user?.statut}
          </span>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
          <p className="text-gray-900">{user?.email}</p>
          <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <p className="text-gray-900 capitalize">{user?.role}</p>
          <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
          <p className="text-gray-900">{user?.departement || 'Non spécifié'}</p>
          <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
          <p className="text-gray-900">{user?.poste || 'Employé'}</p>
          <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <p className="text-gray-900">{user?.telephone || 'Non renseigné'}</p>
          <p className="text-xs text-gray-500 mt-1">Modifiable</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <p className="text-gray-900">{user?.adresse || 'Non renseignée'}</p>
          <p className="text-xs text-gray-500 mt-1">Modifiable</p>
        </div>
      </div>

      {/* Contact d'urgence */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact d'urgence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
            <p className="text-gray-900">{user?.contact_urgence_nom || 'Non renseigné'}</p>
            <p className="text-xs text-gray-500 mt-1">Modifiable</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du contact</label>
            <p className="text-gray-900">{user?.contact_urgence_telephone || 'Non renseigné'}</p>
            <p className="text-xs text-gray-500 mt-1">Modifiable</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
            <p className="text-gray-900">{user?.contact_urgence_relation || 'Non renseigné'}</p>
            <p className="text-xs text-gray-500 mt-1">Modifiable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
