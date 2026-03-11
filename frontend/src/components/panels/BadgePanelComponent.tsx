import React, { useState } from 'react';
import { useAuth } from '../../services/authService';

export default function BadgePanelComponent() {
  const { user } = useAuth();
  const [badge, setBadge] = useState({
    token: 'XPRT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const
  });

  const getQRUrl = (token: string, size: number = 200) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${token}`;
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const handleRegenerate = () => {
    const newBadge = {
      token: 'XPRT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const
    };
    setBadge(newBadge);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mon Badge</h2>
        <button
          onClick={handleRegenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Régénérer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badge */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge de pointage</h3>
          <div className="flex flex-col items-center">
            {/* Photo et informations */}
            <div className="w-32 h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-4 mb-4">
              <div className="bg-white rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {getInitials(user?.nom || '', user?.prenom || '')}
                </span>
              </div>
              <div className="text-center text-white">
                <p className="font-semibold text-sm">{user?.prenom} {user?.nom}</p>
                <p className="text-xs opacity-90">{user?.poste || 'Employé'}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <img 
                src={getQRUrl(badge.token)} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Token: {badge.token.substring(0, 20)}...
              </p>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Employé</label>
              <p className="text-gray-900">{user?.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <p className="text-gray-900">{user?.prenom} {user?.nom}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <p className="text-gray-900">{user?.departement || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
              <p className="text-gray-900">
                {new Date(badge.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Actif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment utiliser votre badge</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Présentez votre badge</h4>
            <p className="text-sm text-gray-600">Approchez votre QR code du scanner</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Validation</h4>
            <p className="text-sm text-gray-600">Votre pointage est enregistré instantanément</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Sécurité</h4>
            <p className="text-sm text-gray-600">Votre badge est sécurisé et unique</p>
          </div>
        </div>
      </div>
    </div>
  );
}
