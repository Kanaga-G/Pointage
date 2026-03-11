import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/authService';
import { adminService, PointageEntry } from '../../services/adminService';
import LayoutFix from '../../components/LayoutFix';
import { Clock, Calendar, User, Filter } from 'lucide-react';

interface PointageHistorique {
  id: number;
  date: string;
  arrivee: string;
  depart: string;
  type: 'arrivee' | 'depart';
  statut: 'normal' | 'retard' | 'absent';
  retard_minutes?: number;
}

export default function HistoriquePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [dateDebutFilter, setDateDebutFilter] = useState('');
  const [dateFinFilter, setDateFinFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'arrivee' | 'depart'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'retard' | 'absent'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadHistorique(currentPage);
  }, [user, currentPage, dateFilter, dateDebutFilter, dateFinFilter, typeFilter, statusFilter, navigate]);

  const loadHistorique = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire les paramètres pour adminService
      const params: any = {
        page,
        per_page: 50,
        employe_id: user?.id?.toString() || '',
      };
      
      // Ajouter les filtres de date
      if (dateFilter) params.date = dateFilter;
      if (dateDebutFilter) params.date_debut = dateDebutFilter;
      if (dateFinFilter) params.date_fin = dateFinFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.statut = statusFilter;

      const result = await adminService.getPointages(params);
      setPointages(result.items || []);
      setTotalPages(result.total_pages || 1);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setError('Erreur lors du chargement de l\'historique');
      setPointages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'retard': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'retard': return 'En retard';
      case 'absent': return 'Absent';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'arrivee' ? '🟢' : '🔴';
  };

  const getTypeText = (type: string) => {
    return type === 'arrivee' ? 'Arrivée' : 'Départ';
  };

  const resetFilters = () => {
    setDateFilter('');
    setDateDebutFilter('');
    setDateFinFilter('');
    setTypeFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <LayoutFix title="Historique des pointages">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    );
  }

  return (
    <LayoutFix title="Historique des pointages">
      <div className="max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Historique des pointages
              </h1>
              <p className="text-gray-600">
                Historique complet de vos pointages - {user?.prenom} {user?.nom}
              </p>
            </div>
            <button
              onClick={() => navigate('/employee')}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date unique
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer par date spécifique"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateDebutFilter}
                onChange={(e) => setDateDebutFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer à partir de cette date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateFinFilter}
                onChange={(e) => setDateFinFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer jusqu'à cette date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="arrivee">Arrivées</option>
                <option value="depart">Départs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="normal">Normal</option>
                <option value="retard">En retard</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex items-end lg:col-span-5">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des pointages */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Historique complet ({pointages.length} pointages)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retard</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pointages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6 text-center text-gray-500">
                      Aucun pointage trouvé pour la période sélectionnée.
                    </td>
                  </tr>
                ) : (
                  pointages.map((pointage) => (
                    <tr key={pointage.id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pointage.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-3">
                          <span>{getTypeIcon(pointage.type || 'arrivee')}</span>
                          {getTypeText(pointage.type || 'arrivee')}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                        {pointage.type === 'arrivee' ? (pointage.arrivee || '-') : (pointage.depart || '-')}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(pointage.statut || 'normal')}`}>
                          {getStatusText(pointage.statut || 'normal')}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                        {pointage.retard_minutes ? `${pointage.retard_minutes} min` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutFix>
  );
}
