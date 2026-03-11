import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authService';

export default function DashboardPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    totalHours: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    // Simuler le chargement des statistiques
    const loadStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalEmployees: 45,
        presentToday: 38,
        lateToday: 5,
        absentToday: 2,
        totalHours: 168,
        pendingRequests: 8
      });
    };
    loadStats();
  }, []);

  const recentActivities = [
    { id: 1, type: 'pointage', user: 'John Doe', action: 'Arrivée', time: '08:45', status: 'on-time' },
    { id: 2, type: 'pointage', user: 'Marie Martin', action: 'Arrivée', time: '09:15', status: 'late' },
    { id: 3, type: 'request', user: 'Pierre Durand', action: 'Demande de congé', time: '07:30', status: 'pending' },
    { id: 4, type: 'pointage', user: 'Sophie Lefebvre', action: 'Départ', time: '18:30', status: 'on-time' },
    { id: 5, type: 'request', user: 'Antoine Bernard', action: 'Modification profil', time: '10:15', status: 'approved' }
  ];

  const notifications = [
    { id: 1, type: 'warning', message: '3 employés en retard aujourd\'hui', time: 'Il y a 30 min' },
    { id: 2, type: 'info', message: 'Nouvelle demande de congé de Pierre Durand', time: 'Il y a 1 heure' },
    { id: 3, type: 'success', message: 'Salaire du mois dernier versé', time: 'Il y a 2 jours' },
    { id: 4, type: 'warning', message: 'Pointage manquant pour Sophie Lefebvre', time: 'Il y a 3 jours' }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Employés</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Présents</p>
              <p className="text-2xl font-bold">{stats.presentToday}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs">Retards</p>
              <p className="text-2xl font-bold">{stats.lateToday}</p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs">Absents</p>
              <p className="text-2xl font-bold">{stats.absentToday}</p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Heures Total</p>
              <p className="text-2xl font-bold">{stats.totalHours}h</p>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">En Attente</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités Récentes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'on-time' ? 'bg-green-500' :
                    activity.status === 'late' ? 'bg-yellow-500' :
                    activity.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.user} - {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'on-time' ? 'bg-green-100 text-green-800' :
                  activity.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.status === 'on-time' ? 'À l\'heure' :
                   activity.status === 'late' ? 'Retard' :
                   activity.status === 'pending' ? 'En attente' : 'Approuvé'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                notification.type === 'warning' ? 'bg-yellow-50' :
                notification.type === 'info' ? 'bg-blue-50' :
                notification.type === 'success' ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'info' ? 'bg-blue-500' :
                  notification.type === 'success' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {notification.type === 'warning' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {notification.type === 'info' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1M3 21h18M5 21h1a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                    </svg>
                  )}
                  {notification.type === 'success' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
