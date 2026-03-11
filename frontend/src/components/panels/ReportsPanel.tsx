import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authService';

export default function ReportsPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reports = [
    {
      id: 'attendance',
      name: 'Rapport de Présence',
      description: 'Statistiques de présence et absences',
      icon: '📊',
      fields: ['total_days', 'present_days', 'absent_days', 'late_days', 'attendance_rate']
    },
    {
      id: 'pointage',
      name: 'Rapport de Pointage',
      description: 'Détail des heures de pointage',
      icon: '⏰',
      fields: ['total_hours', 'morning_hours', 'afternoon_hours', 'overtime_hours']
    },
    {
      id: 'conges',
      name: 'Rapport de Congés',
      description: 'Solde et utilisation des congés',
      icon: '🏖️',
      fields: ['total_conges', 'used_conges', 'remaining_conges', 'pending_requests']
    },
    {
      id: 'performance',
      name: 'Rapport de Performance',
      description: 'Indicateurs de performance par employé',
      icon: '📈',
      fields: ['productivity', 'quality', 'punctuality', 'teamwork']
    },
    {
      id: 'salary',
      name: 'Rapport Salarial',
      description: 'Résumé des salaires et primes',
      icon: '💰',
      fields: ['base_salary', 'overtime_pay', 'bonuses', 'deductions']
    }
  ];

  const generateReport = async (reportId: string) => {
    setLoading(true);
    try {
      // Simuler la génération du rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler le téléchargement
      const reportData = {
        reportId,
        dateRange,
        generatedBy: user?.prenom + ' ' + user?.nom,
        generatedAt: new Date().toISOString(),
        data: generateMockData(reportId)
      };
      
      // Créer un blob et télécharger
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${reportId}_${dateRange.start}_${dateRange.end}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (reportId: string) => {
    switch (reportId) {
      case 'attendance':
        return {
          total_days: 22,
          present_days: 20,
          absent_days: 2,
          late_days: 3,
          attendance_rate: 90.9
        };
      case 'pointage':
        return {
          total_hours: 176,
          morning_hours: 88,
          afternoon_hours: 88,
          overtime_hours: 12
        };
      case 'conges':
        return {
          total_conges: 25,
          used_conges: 8,
          remaining_conges: 17,
          pending_requests: 2
        };
      default:
        return {};
    }
  };

  const exportToExcel = async (reportId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simuler l'export Excel
      console.log('Exporting to Excel:', reportId);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (reportId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simuler l'export PDF
      console.log('Exporting to PDF:', reportId);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélection de la période */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Période du Rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rapports disponibles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{report.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => generateReport(report.id)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Génération...' : 'Générer JSON'}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportToExcel(report.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => exportToPDF(report.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rapports récents */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Récents</h3>
        <div className="space-y-3">
          {[
            {
              name: 'Rapport de Présence',
              date: '2024-02-28',
              type: 'JSON',
              size: '2.3 KB',
              generatedBy: 'Marie Martin'
            },
            {
              name: 'Rapport de Pointage',
              date: '2024-02-27',
              type: 'Excel',
              size: '15.7 KB',
              generatedBy: 'John Doe'
            },
            {
              name: 'Rapport de Congés',
              date: '2024-02-26',
              type: 'PDF',
              size: '845 KB',
              generatedBy: 'Pierre Durand'
            }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-500">
                    {report.date} • {report.type} • {report.size} • par {report.generatedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rapports ce mois</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total téléchargés</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="text-2xl">⬇️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Format Excel</p>
              <p className="text-2xl font-bold text-green-600">89</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Format PDF</p>
              <p className="text-2xl font-bold text-red-600">67</p>
            </div>
            <div className="text-2xl">📄</div>
          </div>
        </div>
      </div>
    </div>
  );
}
