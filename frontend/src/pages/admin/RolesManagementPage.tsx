import React, { useEffect, useMemo, useState } from 'react'
import LayoutFix from '../../components/LayoutFix'
import { apiClient } from '../../services/apiClient'

interface EmployeRow {
  id: number
  nom: string
  prenom: string
  email: string
  role?: string
  departement?: string
  statut?: string
}

interface RoleDefinition {
  id: string
  label: string
  scope?: 'admin' | 'employee'
}

export default function RolesManagementPage() {
  const [rows, setRows] = useState<EmployeRow[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [savingIds, setSavingIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)

      const [employeResponse, roleResponse] = await Promise.allSettled([
        apiClient.get<{ success: boolean; employes: EmployeRow[] }>('/api/employes'),
        apiClient.get<{ success: boolean; roles: RoleDefinition[] }>('/api/roles?scope=employee')
      ])

      if (employeResponse.status === 'fulfilled') {
        const data = employeResponse.value
        setRows(data?.success ? data.employes || [] : [])
      } else {
        setRows([])
      }

      if (roleResponse.status === 'fulfilled' && roleResponse.value?.success) {
        setRoles(roleResponse.value.roles || [])
      } else {
        setRoles([])
      }
    } catch (e: any) {
      console.error('Erreur chargement roles:', e)
      setError(e?.message || 'Erreur lors du chargement des employes')
      setRows([])
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selectableRoles = useMemo(
    () => roles.filter((role) => role.scope === 'employee'),
    [roles]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((item) => {
      return (
        `${item.prenom || ''} ${item.nom || ''}`.toLowerCase().includes(query) ||
        String(item.email || '').toLowerCase().includes(query) ||
        String(item.departement || '').toLowerCase().includes(query) ||
        String(item.role || '').toLowerCase().includes(query)
      )
    })
  }, [rows, search])

  const updateRole = async (employeId: number, nextRole: string) => {
    setSavingIds((prev) => (prev.includes(employeId) ? prev : [...prev, employeId]))

    try {
      const response = await apiClient.put<{ role: string }, { success: boolean; employe?: EmployeRow; message?: string }>(
        `/api/employes/${employeId}`,
        { role: nextRole }
      )

      if (!response?.success) {
        throw new Error(response?.message || 'Erreur lors de la mise a jour du role')
      }

      setRows((prev) => prev.map((item) => (item.id === employeId ? { ...item, role: nextRole } : item)))
    } catch (e: any) {
      console.error('Erreur update role:', e)
      alert(e?.message || 'Erreur lors de la mise a jour du role')
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== employeId))
    }
  }

  return (
    <LayoutFix title="Gestion des roles">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom, email, departement, role..."
              />
            </div>
            <button
              onClick={() => void load()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              Rafraichir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attribution des roles ({filtered.length})</h3>
            <p className="text-sm text-gray-600">Manager, chef de departement, comptable, stagiaire, employe.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Aucun employe trouve</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((row) => {
                    const isSaving = savingIds.includes(row.id)
                    const currentRole = row.role || 'employe'

                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.prenom} {row.nom}</div>
                          <div className="text-sm text-gray-500">ID: {row.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.departement || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={currentRole}
                            disabled={isSaving || selectableRoles.length === 0}
                            onChange={(event) => {
                              const next = event.target.value
                              void updateRole(row.id, next)
                            }}
                          >
                            {selectableRoles.length === 0 ? (
                              <option value={currentRole}>{currentRole || 'employe'}</option>
                            ) : (
                              selectableRoles.map((role) => (
                                <option key={role.id} value={role.id}>{role.label}</option>
                              ))
                            )}
                          </select>
                          {isSaving ? <span className="ml-3 text-sm text-gray-500">Enregistrement...</span> : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutFix>
  )
}
