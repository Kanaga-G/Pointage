import React, { useState } from 'react'

// Composant modal pour ajout/édition d'événement (port du modal PHP)
export default function EventModal({ onSave }: { onSave?: (payload: any) => void }) {
  const [titre, setTitre] = useState('')
  const [type, setType] = useState('reunion')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [employeId, setEmployeId] = useState<number | ''>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { titre, type, startDate, endDate, description, employeId }
    if (onSave) onSave(payload)
  }

  return (
    <div className="modal" id="eventModal" style={{ display: 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <h5>Nouvel événement</h5>
          <form onSubmit={handleSubmit} id="eventForm">
            <div className="mb-2">
              <label className="block">Titre</label>
              <input value={titre} onChange={e => setTitre(e.target.value)} required className="input" />
            </div>
            <div className="mb-2">
              <label className="block">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input">
                <option value="reunion">Réunion</option>
                <option value="congé">Congé</option>
                <option value="formation">Formation</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label>Début</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input" />
              </div>
              <div>
                <label>Fin</label>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input" />
              </div>
            </div>
            <div className="mt-2">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input" />
            </div>
            <div className="mt-2">
              <label>Employé (optionnel)</label>
              <input type="number" value={employeId as any} onChange={e => setEmployeId(e.target.value ? Number(e.target.value) : '')} className="input" />
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button type="button" className="btn btn-outline-danger">Supprimer</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
