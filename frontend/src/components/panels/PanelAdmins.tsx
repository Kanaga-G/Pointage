import React from 'react'
import { useNavigate } from 'react-router-dom'

// PanelAdmins : affichage des administrateurs avec redirection vers la page détail
export default function PanelAdmins({ data }: { data: any[] }) {
  const navigate = useNavigate()

  return (
    <section id="admins" className="panel-section card bg-white p-4 rounded shadow-sm">
      <h3 className="mb-3">Admins</h3>
      {data.length === 0 ? (
        <div className="text-muted">Aucun administrateur.</div>
      ) : (
        <div className="list-group">
          {data.map((a) => (
            <button
              key={a.id || a.email}
              type="button"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              onClick={() => {
                // Navigate to the admin user detail page (same pattern as employees)
                // prefer the admin/employes detail route
                const id = a.id || a.user_id || a.uid || a.email
                navigate(`/admin/employes/${id}`)
              }}
            >
              <div>
                <div className="fw-medium">{a.prenom ? `${a.prenom} ${a.nom}` : a.nom}</div>
                <small className="text-muted">{a.email}</small>
              </div>
              <span className="badge bg-light text-dark">Voir</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
