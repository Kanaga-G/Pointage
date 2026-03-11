import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authService';
import { RoleService, ROLES } from '../../services/roleService';

export default function SettingsPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'system'>('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company: {
      name: 'Xpert Pro',
      email: 'contact@xpertpro.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la République, 75001 Paris'
    },
    workingHours: {
      startTime: '09:00',
      endTime: '18:00',
      lunchBreak: '12:00-13:00',
      workDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      weeklyReports: true,
      lateAlerts: true,
      absenceAlerts: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: []
    }
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      company: {
        name: 'Xpert Pro',
        email: 'contact@xpertpro.com',
        phone: '+33 1 23 45 67 89',
        address: '123 Rue de la République, 75001 Paris'
      },
      workingHours: {
        startTime: '09:00',
        endTime: '18:00',
        lunchBreak: '12:00-13:00',
        workDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        weeklyReports: true,
        lateAlerts: true,
        absenceAlerts: true
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 30,
        twoFactorAuth: false,
        ipWhitelist: []
      }
    });
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'system', label: 'Système', icon: '🖥️' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation des tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu du tab actif */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres Généraux</h3>
            
            {/* Informations de l'entreprise */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Informations de l'entreprise</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={settings.company.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      company: { ...prev.company, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.company.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      company: { ...prev.company, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={settings.company.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      company: { ...prev.company, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={settings.company.address}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      company: { ...prev.company, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Heures de travail */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Heures de travail</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={settings.workingHours.startTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, startTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
                  <input
                    type="time"
                    value={settings.workingHours.endTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, endTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pause déjeuner</label>
                  <input
                    type="text"
                    value={settings.workingHours.lunchBreak}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, lunchBreak: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres de Sécurité</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longueur minimale du mot de passe</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeout de session (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="twoFactor"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="twoFactor" className="text-sm font-medium text-gray-700">
                  Authentification à deux facteurs
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres de Notifications</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {key === 'emailAlerts' && 'Alertes par email'}
                    {key === 'pushNotifications' && 'Notifications push'}
                    {key === 'weeklyReports' && 'Rapports hebdomadaires'}
                    {key === 'lateAlerts' && 'Alertes de retard'}
                    {key === 'absenceAlerts' && 'Alertes d\'absence'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres Système</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Informations système</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Version: 1.0.0</p>
                  <p>Dernière mise à jour: 2024-02-28</p>
                  <p>Base de données: PostgreSQL</p>
                  <p>Environnement: Production</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Maintenance</h4>
                <p className="text-sm text-blue-700 mb-3">Prochaine maintenance prévue: Dimanche 03:00-05:00</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Planifier une maintenance
                </button>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Sauvegarde</h4>
                <p className="text-sm text-yellow-700 mb-3">Dernière sauvegarde: 2024-02-28 02:00</p>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Lancer une sauvegarde
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
