import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { FonctionPayload, FonctionFromAPI } from '../services/fonctionService'
import api from '../services/api'
import '../styles/pages/FonctionPage.css'

interface Agent     { Id_agent: number; nom: string; prenoms: string; num_matricule: string; civilite: string }
interface Direction { Id_direction: number; nom_direction: string; sigle: string }

interface FonctionFormProps {
  fonction?:        FonctionFromAPI | null
  defaultAgentId?:  number
  onSave:           (data: FonctionPayload) => Promise<void>
  onClose:          () => void
}

const EMPTY: FonctionPayload = {
  nom_fonction: '', date_fonction: '', date_affectation: '',
  fonction_prime: 0, num_fonct: '', Id_direction: 0, Id_agent: 0,
}

export const FonctionForm: React.FC<FonctionFormProps> = ({
  fonction, defaultAgentId, onSave, onClose,
}) => {
  const [form, setForm]           = useState<FonctionPayload>({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
  const [agents, setAgents]       = useState<Agent[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    api.get('/agents', { params: { per_page: 300 } })
      .then(r => setAgents(r.data.data ?? r.data ?? []))
      .catch(() => {})
    api.get('/directions')
      .then(r => setDirections(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (fonction) {
      setForm({
        nom_fonction:     fonction.nom_fonction,
        date_fonction:    fonction.date_fonction,
        date_affectation: fonction.date_affectation,
        fonction_prime:   fonction.fonction_prime ?? 0,
        num_fonct:        fonction.num_fonct,
        Id_direction:     fonction.Id_direction,
        Id_agent:         fonction.Id_agent,
      })
    }
  }, [fonction])

  const set = (key: keyof FonctionPayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.Id_agent)           { setError('Veuillez sélectionner un agent'); return }
    if (!form.nom_fonction.trim()) { setError('Le nom de la fonction est obligatoire'); return }
    if (!form.Id_direction)       { setError('Veuillez sélectionner une direction'); return }
    if (!form.date_fonction)      { setError('La date de prise de fonction est obligatoire'); return }

    setSaving(true); setError(null)
    try {
      await onSave(form)
    } catch (err: any) {
      const v = err.response?.data?.errors
      setError(v ? Object.values(v).flat().join(' | ') as string : err.response?.data?.message ?? 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const selectedAgent     = agents.find(a => a.Id_agent === form.Id_agent)
  const selectedDirection = directions.find(d => d.Id_direction === form.Id_direction)

  return (
    <div className="ff-overlay">
      <div className="ff-modal">

        {/* Header */}
        <div className="ff-header">
          <div>
            <h2 className="ff-header-title">{fonction ? 'Modifier la fonction' : 'Nouvelle fonction'}</h2>
            <p className="ff-header-sub">
              {fonction ? `Fonction #${fonction.Id_fonction}` : 'Affecter une fonction à un agent'}
            </p>
          </div>
          <button className="ff-close-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="ff-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="ff-body">

          {/* Agent */}
          <div className="ff-section">
            <p className="ff-section-title">Agent concerné</p>
            <div className="ff-field">
              <label className="ff-label">Agent <span className="ff-required">*</span></label>
              <select className="ff-input" value={form.Id_agent || ''}
                onChange={e => set('Id_agent', Number(e.target.value))}
                disabled={!!defaultAgentId} title="Agent">
                <option value="">-- Sélectionner un agent --</option>
                {agents.map(a => (
                  <option key={a.Id_agent} value={a.Id_agent}>
                    [{a.num_matricule}] {a.civilite} {a.nom} {a.prenoms}
                  </option>
                ))}
              </select>
            </div>
            {selectedAgent && (
              <div className="ff-agent-tag">
                👤 {selectedAgent.civilite} {selectedAgent.nom} {selectedAgent.prenoms} · {selectedAgent.num_matricule}
              </div>
            )}
          </div>

          {/* Fonction */}
          <div className="ff-section">
            <p className="ff-section-title">Informations de la fonction</p>
            <div className="ff-grid-2">
              <div className="ff-field ff-field--full">
                <label className="ff-label">Nom de la fonction <span className="ff-required">*</span></label>
                <input className="ff-input" value={form.nom_fonction}
                  onChange={e => set('nom_fonction', e.target.value)}
                  placeholder="Ex: Chef de service, Directeur adjoint..." />
              </div>

              <div className="ff-field">
                <label className="ff-label">N° de fonction</label>
                <input className="ff-input ff-mono" value={form.num_fonct}
                  onChange={e => set('num_fonct', e.target.value)}
                  placeholder="Ex: FONCT-001" />
              </div>

              <div className="ff-field">
                <label className="ff-label">Prime de fonction (Ar)</label>
                <input type="number" className="ff-input ff-mono" min="0" step="0.01"
                  value={form.fonction_prime || ''}
                  onChange={e => set('fonction_prime', parseFloat(e.target.value) || 0)}
                  placeholder="0" />
              </div>
            </div>
          </div>

          {/* Direction + Dates */}
          <div className="ff-section">
            <p className="ff-section-title">Affectation & Dates</p>
            <div className="ff-grid-2">
              <div className="ff-field ff-field--full">
                <label className="ff-label">Direction <span className="ff-required">*</span></label>
                <select className="ff-input" value={form.Id_direction || ''}
                  onChange={e => set('Id_direction', Number(e.target.value))} title="Direction">
                  <option value="">-- Sélectionner une direction --</option>
                  {directions.map(d => (
                    <option key={d.Id_direction} value={d.Id_direction}>
                      [{d.sigle}] {d.nom_direction}
                    </option>
                  ))}
                </select>
                {selectedDirection && (
                  <span className="ff-hint">📂 {selectedDirection.nom_direction}</span>
                )}
              </div>

              <div className="ff-field">
                <label className="ff-label">Date de prise de fonction <span className="ff-required">*</span></label>
                <input type="date" className="ff-input"
                  value={form.date_fonction}
                  onChange={e => set('date_fonction', e.target.value)}
                  title="Date de prise de fonction" />
              </div>

              <div className="ff-field">
                <label className="ff-label">Date d'affectation</label>
                <input type="date" className="ff-input"
                  value={form.date_affectation}
                  onChange={e => set('date_affectation', e.target.value)}
                  title="Date d'affectation" />
              </div>
            </div>
          </div>

          {/* Récap */}
          {form.nom_fonction && form.Id_agent > 0 && (
            <div className="ff-recap">
              <p className="ff-recap-title">📋 Récapitulatif</p>
              <div className="ff-recap-grid">
                <div className="ff-recap-item">
                  <span className="ff-recap-label">Fonction</span>
                  <span className="ff-recap-value">{form.nom_fonction}</span>
                </div>
                <div className="ff-recap-item">
                  <span className="ff-recap-label">Direction</span>
                  <span className="ff-recap-value">{selectedDirection?.sigle || '—'}</span>
                </div>
                <div className="ff-recap-item">
                  <span className="ff-recap-label">Date prise</span>
                  <span className="ff-recap-value">{form.date_fonction || '—'}</span>
                </div>
                <div className="ff-recap-item">
                  <span className="ff-recap-label">Prime</span>
                  <span className="ff-recap-value">
                    {form.fonction_prime ? `${Number(form.fonction_prime).toLocaleString('fr-MG')} Ar` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ff-footer">
          <button className="ff-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="ff-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="ff-spin" /> Enregistrement...</>
              : <><Save size={14} /> {fonction ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}