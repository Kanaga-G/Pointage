import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutFix from '../../components/LayoutFix';
import { apiClient } from '../../services/apiClient';

interface AdminRow {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
  departement?: string;
  statut?: string;
}

export default function AdminsPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      // Récupérer les administrateurs depuis l'endpoint /admins
      const response = await apiClient.get<{ success: boolean; admins: AdminRow[] }>('/admins');
      setAdmins(response.admins || []);
    } catch (e: any) {
      console.error('Erreur chargement admins:', e);
      setError(e?.message || 'Erreur lors du chargement des admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(a => {
      return (
        `${a.prenom || ''} ${a.nom || ''}`.toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.departement || '').toLowerCase().includes(q)
      );
    });
  }, [admins, searchTerm]);

  return (
    <LayoutFix title="Admins">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom, email, département..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadAdmins}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Liste des Admins ({filteredAdmins.length})</h3>
            <p className="text-sm text-gray-600">Cliquez sur une ligne pour voir le détail et éditer.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="text-red-600">{error}</div>
              <button
                onClick={loadAdmins}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Aucun admin trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/admins/${a.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{a.prenom} {a.nom}</div>
                        <div className="text-sm text-gray-500">ID: {a.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.departement || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {a.statut || 'actif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutFix>
  );
}

