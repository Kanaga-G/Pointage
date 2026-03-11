import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../services/authService';
import { adminService, PointageEntry } from '../../services/adminService';
import LayoutFix from '../../components/LayoutFix';

const ADMIN_ALLOWED_ROLES = new Set(['admin', 'super_admin', 'manager', 'hr']);

const getTodayIso = () => new Date().toISOString().split('T')[0];

const formatDateLabel = (isoDate: string) => {
  if (!isoDate) return '-';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('fr-FR');
};

export default function PointageListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayIso = useMemo(() => getTodayIso(), []);

  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateDebutFilter, setDateDebutFilter] = useState(todayIso);
  const [dateFinFilter, setDateFinFilter] = useState(todayIso);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !ADMIN_ALLOWED_ROLES.has(String(user.role || '').toLowerCase())) {
      navigate('/admin');
      return;
    }
    loadPointages(currentPage, dateDebutFilter, dateFinFilter);
  }, [user, currentPage, dateDebutFilter, dateFinFilter, navigate]);

  const loadPointages = async (page: number, dateDebut: string, dateFin: string) => {
    if (dateDebut && dateFin && dateDebut > dateFin) {
      setError('La date de debut doit etre inferieure ou egale a la date de fin.');
      setPointages([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: {
        page: number;
        per_page: number;
        date?: string;
        date_debut?: string;
        date_fin?: string;
      } = {
        page,
        per_page: 100,
      };

      if (dateDebut && dateFin) {
        params.date_debut = dateDebut;
        params.date_fin = dateFin;
      } else if (dateDebut || dateFin) {
        params.date = dateDebut || dateFin;
      } else {
        params.date = todayIso;
      }

      const result = await adminService.getPointages(params);
      setPointages(result.items || []);
      setTotalPages(result.total_pages || 1);
    } catch (err) {
      console.error('Erreur lors du chargement des pointages:', err);
      setError('Erreur lors du chargement des pointages');
      setPointages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'retard':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'retard':
        return 'En retard';
      case 'absent':
        return 'Absent';
      default:
        return status || '-';
    }
  };

  const resetToToday = () => {
    setDateDebutFilter(todayIso);
    setDateFinFilter(todayIso);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredPointages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return pointages;

    return pointages.filter((pointage) => {
      const fullName = `${pointage.prenom || ''} ${pointage.nom || ''}`.trim().toLowerCase();
      const matricule = String(pointage.matricule || '').toLowerCase();
      const departement = String(pointage.departement || '').toLowerCase();
      const date = String(pointage.date || '').toLowerCase();
      const status = String(getStatusText(pointage.statut || 'normal')).toLowerCase();
      const userType = String(pointage.user_type || '').toLowerCase();
      const role = String(pointage.role || '').toLowerCase();
      return (
        fullName.includes(search)
        || matricule.includes(search)
        || departement.includes(search)
        || date.includes(search)
        || status.includes(search)
        || userType.includes(search)
        || role.includes(search)
      );
    });
  }, [pointages, searchTerm]);

  const activePeriodLabel = useMemo(() => {
    const start = dateDebutFilter || dateFinFilter || todayIso;
    const end = dateFinFilter || dateDebutFilter || todayIso;
    if (start === end) {
      return `le ${formatDateLabel(start)}`;
    }
    return `du ${formatDateLabel(start)} au ${formatDateLabel(end)}`;
  }, [dateDebutFilter, dateFinFilter, todayIso]);

  if (loading && currentPage === 1) {
    return (
      <LayoutFix title="Pointages recents">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    );
  }

  return (
    <LayoutFix title="Pointages recents">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pointages recents</h1>
              <p className="text-gray-600">Suivi des activites de pointage des utilisateurs ({activePeriodLabel})</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
              <input
                type="date"
                value={dateDebutFilter}
                onChange={(event) => {
                  setDateDebutFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={dateFinFilter}
                onChange={(event) => {
                  setDateFinFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nom, matricule, departement, statut, role, type utilisateur..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={resetToToday}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Afficher aujourd'hui
            </button>
            <button
              onClick={() => {
                setDateDebutFilter('');
                setDateFinFilter('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retirer les filtres de date
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Sans filtre, les pointages du jour sont affiches par defaut.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Pointages trouves ({filteredPointages.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depart</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retard</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPointages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {searchTerm.trim()
                          ? `Aucun resultat pour "${searchTerm.trim()}".`
                          : `Aucun pointage enregistre ${activePeriodLabel}.`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Modifiez la periode ou la recherche pour afficher des donnees.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPointages.map((pointage) => (
                    <tr key={pointage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {pointage.photo && (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={pointage.photo}
                              alt={`${pointage.prenom} ${pointage.nom}`}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pointage.prenom && pointage.nom ? `${pointage.prenom} ${pointage.nom}` : 'Utilisateur inconnu'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {pointage.user_type === 'admin' ? (
                                  <>
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    {pointage.role === 'super_admin' ? 'Super_Admin' : pointage.role === 'admin' ? 'Admin' : pointage.role || 'Admin'}
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 mr-1" />
                                    Employe
                                  </>
                                )}
                              </span>
                              {pointage.departement && (
                                <span>{pointage.departement}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateLabel(pointage.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.arrivee || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.depart || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pointage.statut || 'normal')}`}>
                          {getStatusText(pointage.statut || 'normal')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.retard_minutes ? `${pointage.retard_minutes} min` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !searchTerm.trim() && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Precedent
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
