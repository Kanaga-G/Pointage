import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authService';
import { apiClient } from '../../services/apiClient';

interface RawPointageRecord {
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

interface DayPointageRow {
  employee_id: number;
  employee_name: string;
  date: string;
  arrivee_time?: string;
  depart_time?: string;
  status: 'on-time' | 'late' | 'early' | 'absent';
  retard_minutes?: number;
}

export default function PointageManagementPanel() {
  const { user } = useAuth();
  const [pointages, setPointages] = useState<RawPointageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadPointages();
  }, [selectedDate]);

  const loadPointages = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get<any[]>(`/pointages?date=${encodeURIComponent(selectedDate)}`);
      const mapped: RawPointageRecord[] = (Array.isArray(data) ? data : [])
        .filter((p: any) => {
          // Exclure explicitement les pauses et autres types de pointages
          const type = p.type?.toLowerCase();
          return type === 'arrivee' || type === 'depart';
        })
        .map((p: any) => {
        const type = (p.type === 'depart' || p.type === 'arrivee') ? p.type : 'arrivee';
        const timeRaw = p.time_in || p.time_out || p.time || p.date_heure || '';
        const time = typeof timeRaw === 'string' && timeRaw.includes('T')
          ? timeRaw.split('T')[1]?.slice(0, 5) || ''
          : (typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : '');

        const retardMinutes = Number(p.minutes_retard ?? p.retard_minutes ?? 0) || 0;
        const status: RawPointageRecord['status'] =
          p.statut === 'absent' ? 'absent' :
          (retardMinutes > 0 ? 'late' : 'on-time');

        return {
          id: Number(p.id) || 0,
          employee_id: Number(p.employe_id ?? p.employee_id) || 0,
          employee_name: p.employe || p.employee_name || `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Employé',
          date: p.date || selectedDate,
          type,
          time: time || '00:00',
          status,
          retard_minutes: retardMinutes
        };
      });

      setPointages(mapped);
    } catch (error) {
      console.error('Error loading pointages:', error);
      setError('Erreur lors du chargement des pointages');
      setPointages([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedPointages: DayPointageRow[] = React.useMemo(() => {
    const map = new Map<string, DayPointageRow>();

    for (const p of pointages) {
      const key = `${p.date}__${p.employee_id}`;
      const existing = map.get(key) || {
        employee_id: p.employee_id,
        employee_name: p.employee_name,
        date: p.date,
        status: 'on-time' as const,
        retard_minutes: 0
      };

      if (p.type === 'arrivee') {
        existing.arrivee_time = p.time;
      } else {
        existing.depart_time = p.time;
      }

      existing.retard_minutes = Math.max(existing.retard_minutes || 0, p.retard_minutes || 0);
      if (p.status === 'late') {
        existing.status = 'late';
      }

      map.set(key, existing);
    }

    return Array.from(map.values())
      .sort((a, b) => a.employee_name.localeCompare(b.employee_name));
  }, [pointages]);

  const filteredPointages = groupedPointages.filter(row => {
    const matchesEmployee = !selectedEmployee || row.employee_name.toLowerCase().includes(selectedEmployee.toLowerCase());
    const matchesStatus = !selectedStatus || row.status === selectedStatus;
    return matchesEmployee && matchesStatus;
  });


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

  const employees = [...new Set(groupedPointages.map(p => p.employee_name))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadPointages}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="on-time">À l'heure</option>
              <option value="late">En retard</option>
              <option value="early">En avance</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total pointages</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPointages.length}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">À l'heure</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredPointages.filter(p => p.status === 'on-time').length}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredPointages.filter(p => p.status === 'late').length}
              </p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total retard (min)</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredPointages.reduce((sum, p) => sum + (p.retard_minutes || 0), 0)}
              </p>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
        </div>
      </div>

      {/* Tableau des pointages */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pointages du {new Date(selectedDate).toLocaleDateString('fr-FR')} ({filteredPointages.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retard</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPointages.map((row) => (
                <tr key={`${row.date}__${row.employee_id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{row.employee_name}</div>
                    <div className="text-sm text-gray-500">ID: {row.employee_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(row.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {row.arrivee_time ? (
                        <>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                            Arrivée
                          </span>
                          <span className="font-mono">{row.arrivee_time}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {row.depart_time ? (
                        <>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                            Départ
                          </span>
                          <span className="font-mono">{row.depart_time}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                      {getStatusText(row.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.retard_minutes ? `${row.retard_minutes} min` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
