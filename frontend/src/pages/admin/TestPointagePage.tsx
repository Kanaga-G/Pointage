import React, { useEffect, useState } from 'react';
import { adminService, PointageEntry } from '../../services/adminService';
import LayoutFix from '../../components/LayoutFix';

export default function TestPointagePage() {
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPointages = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminService.getPointages({
          page: 1,
          per_page: 10
        });
        console.log('Pointages reçus:', result.items);
        setPointages(result.items || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des pointages');
      } finally {
        setLoading(false);
      }
    };

    loadPointages();
  }, []);

  if (loading) {
    return (
      <LayoutFix title="Test Pointage">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutFix>
    );
  }

  if (error) {
    return (
      <LayoutFix title="Test Pointage">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </LayoutFix>
    );
  }

  return (
    <LayoutFix title="Test Pointage">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Pointage - Debug</h1>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Nombre de pointages: {pointages.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employe ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pointages.map((pointage) => (
                  <tr key={pointage.id}>
                    <td className="px-6 py-4 text-sm">{pointage.id}</td>
                    <td className="px-6 py-4 text-sm">
                      {pointage.prenom} {pointage.nom}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {pointage.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{pointage.role}</td>
                    <td className="px-6 py-4 text-sm">{pointage.employe_id || '-'}</td>
                    <td className="px-6 py-4 text-sm">{pointage.admin_id || '-'}</td>
                    <td className="px-6 py-4 text-sm">{pointage.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutFix>
  );
}
