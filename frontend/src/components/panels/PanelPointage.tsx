import React from 'react'

// PanelPointage : port partiel de `panel_pointage.php`.
// Ici on fournit uniquement la structure et des props de données.
export default function PanelPointage({ data }: { data: any[] }) {
  return (
    <section id="pointage" className="panel-section card bg-white p-4 rounded shadow-sm">
      <h3 className="mb-3">Pointages</h3>
      {data.length === 0 ? (
        <div className="text-muted">Aucun pointage disponible.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Heure entrée</th>
                <th>Heure sortie</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i} data-href={p.url ?? ''}>
                  <td>{p.prenom} {p.nom}</td>
                  <td>{p.timeIn}</td>
                  <td>{p.timeOut ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
