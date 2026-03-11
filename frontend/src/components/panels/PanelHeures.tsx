import React from 'react'

// PanelHeures : port partiel de `panel_heures.php`.
export default function PanelHeures({ data, totalPages }: { data: any[]; totalPages: number }) {
  return (
    <section id="heures" className="panel-section card bg-white p-4 rounded shadow-sm">
      <h3 className="mb-3">Temps totaux par employé</h3>
      {data.length === 0 ? (
        <div className="text-muted">Aucune donnée disponible.</div>
      ) : (
        <div className="overflow-auto max-h-60">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th className="text-center">Temps total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t, i) => (
                <tr key={i}>
                  <td>{t.prenom}</td>
                  <td>{t.nom}</td>
                  <td>{t.email}</td>
                  <td className="text-center">{t.total_travail?.slice?.(0,5) ?? '00:00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination simple si nécessaire */}
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <li key={i} className="px-2 py-1 bg-white border rounded">{i + 1}</li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  )
}
