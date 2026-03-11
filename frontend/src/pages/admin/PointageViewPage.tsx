import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/authService';
import LayoutFix from '../../components/LayoutFix';

interface PointageRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  type: 'arrivee' | 'depart';
  time: string;
  status: 'on-time' | 'late' | 'early' | 'absent';
  retard_minutes?: number;
  notes?: string;
}

export default function PointageViewPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pointage, setPointage] = useState<PointageRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    if (id) {
      loadPointageDetail(parseInt(id));
    }
  }, [user, id, navigate]);

  const loadPointageDetail = async (pointageId: number) => {
    try {
      setLoading(true);
      // Simuler la récupération des données du pointage
      const mockPointages: PointageRecord[] = [
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Doe',
          date: '2024-03-01',
          type: 'arrivee',
          time: '08:45',
          status: 'on-time'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Marie Martin',
          date: '2024-03-01',
          type: 'arrivee',
          time: '09:15',
          status: 'late',
          retard_minutes: 15
        },
        {
          id: 3,
          employee_id: 1,
          employee_name: 'John Doe',
          date: '2024-03-01',
          type: 'depart',
          time: '18:30',
          status: 'on-time'
        }
      ];

      const found = mockPointages.find(p => p.id === pointageId);
      if (found) {
        setPointage(found);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'early': return 'bg-blue-100 text-blue-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time': return 'À l\'heure';
      case 'late': return 'En retard';
      case 'early': return 'En avance';
      case 'absent': return 'Absent';
      default: return status;
    }
  };

  if (loading) {
    return (
      <LayoutFix title="Détail Pointage">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    );
  }

  if (!pointage) {
    return (
      <LayoutFix title="Détail Pointage">
        <div className="text-center text-red-600">
          Pointage non trouvé
        </div>
      </LayoutFix>
    );
  }

  return (
    <LayoutFix title="Détail Pointage">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Détail du Pointage
              </h1>
              <p className="text-gray-600">
                {pointage.employee_name} • {new Date(pointage.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/admin/pointages')}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* Informations du pointage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du pointage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employé
              </label>
              <p className="text-gray-900 font-medium">{pointage.employee_name}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {pointage.employee_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <p className="text-gray-900">
                {new Date(pointage.date).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  pointage.type === 'arrivee' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {pointage.type === 'arrivee' ? 'Arrivée' : 'Départ'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure
              </label>
              <p className="text-gray-900 font-mono">{pointage.time}</p>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pointage.status)}`}>
                {getStatusText(pointage.status)}
              </span>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            {pointage.retard_minutes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retard
                </label>
                <p className="text-gray-900">{pointage.retard_minutes} minutes</p>
                <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes supplémentaires */}
        {pointage.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <p className="text-gray-900">{pointage.notes}</p>
          </div>
        )}

        {/* Informations système */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID du pointage
              </label>
              <p className="text-gray-900 font-mono">{pointage.id}</p>
              <p className="text-xs text-gray-500 mt-1">Identifiant unique</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de pointage
              </label>
              <p className="text-gray-900">Badge RFID</p>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point de pointage
              </label>
              <p className="text-gray-900">Entrée principale</p>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validé par
              </label>
              <p className="text-gray-900">Système automatique</p>
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
          </div>
        </div>

        {/* Message d'information */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1M3 21h18M5 21h1a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
            </svg>
            <span>
              <strong>Information :</strong> Les pointages ne sont pas modifiables pour garantir l'intégrité des données de présence.
              En cas d'erreur, veuillez contacter le service administratif.
            </span>
          </div>
        </div>
      </div>
    </LayoutFix>
  );
}

