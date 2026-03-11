import React from 'react'

// PanelRetards : port partiel du panel retards.
export default function PanelRetards({ data }: { data: any[] }) {
  return (
    <section id="retard" className="panel-section card bg-white p-4 rounded shadow-sm">
      <h3 className="mb-3">Retards</h3>
      {data.length === 0 ? (
        <div className="text-muted">Aucun retard répertorié.</div>
      ) : (
        <ul>
          {data.map((r, i) => (
            <li key={i}>{r.prenom} {r.nom} — {r.date} — {r.minutes} min</li>
          ))}
        </ul>
      )}
    </section>
  )
}
