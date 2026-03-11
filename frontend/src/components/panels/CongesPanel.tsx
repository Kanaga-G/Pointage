import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authService';

interface CongeRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  start_date: string;
  end_date: string;
  type: 'conge_paye' | 'conge_sans_solde' | 'maladie' | 'formation';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approver?: string;
  created_at: string;
}

export default function CongesPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CongeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CongeRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRequests: CongeRequest[] = [
        {
          id: 1,
          employee_id: 3,
          employee_name: 'Pierre Durand',
          start_date: '2024-03-15',
          end_date: '2024-03-20',
          type: 'conge_paye',
          status: 'pending',
          reason: 'Vacances familiales',
          created_at: '2024-02-20'
        },
        {
          id: 2,
          employee_id: 1,
          employee_name: 'John Doe',
          start_date: '2024-03-10',
          end_date: '2024-03-12',
          type: 'formation',
          status: 'approved',
          reason: 'Formation React avancé',
          approver: 'Marie Martin',
          created_at: '2024-02-18'
        },
        {
          id: 3,
          employee_id: 4,
          employee_name: 'Sophie Lefebvre',
          start_date: '2024-03-25',
          end_date: '2024-03-26',
          type: 'maladie',
          status: 'pending',
          reason: 'Rendez-vous médical',
          created_at: '2024-02-22'
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    return filter === 'all' || request.status === filter;
  });

  const handleApprove = (request: CongeRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = async (approved: boolean) => {
    if (!selectedRequest) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: approved ? 'approved' : 'rejected',
              approver: user?.prenom + ' ' + user?.nom
            }
          : req
      ));
      
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conge_paye': return 'bg-blue-100 text-blue-800';
      case 'conge_sans_solde': return 'bg-gray-100 text-gray-800';
      case 'maladie': return 'bg-red-100 text-red-800';
      case 'formation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conge_paye': return 'Congé payé';
      case 'conge_sans_solde': return 'Congé sans solde';
      case 'maladie': return 'Maladie';
      case 'formation': return 'Formation';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Demandes de Congés ({requests.filter(r => r.status === 'pending').length} en attente)
          </h3>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les demandes</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refusées</p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des demandes ({filteredRequests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const startDate = new Date(request.start_date);
                const endDate = new Date(request.end_date);
                const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleApprove(request)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                      <div className="text-sm text-gray-500">ID: {request.employee_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
                        {getTypeLabel(request.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(request.start_date).toLocaleDateString('fr-FR')}</div>
                      <div className="text-gray-500">au {new Date(request.end_date).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {duration} jour{duration > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                      {request.approver && (
                        <div className="text-xs text-gray-500 mt-1">
                          par {request.approver}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'approbation */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approuver/Refuser la demande de {selectedRequest.employee_name}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-sm text-gray-900">{getTypeLabel(selectedRequest.type)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Période:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {new Date(selectedRequest.start_date).toLocaleDateString('fr-FR')} au {new Date(selectedRequest.end_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Motif:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedRequest.reason}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmApprove(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Refuser
              </button>
              <button
                onClick={() => confirmApprove(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
