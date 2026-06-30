import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { ReclassementPayload, ReclassementFromAPI } from '../services/reclassementService'
import api from '../services/api'
import '../styles/pages/Reclassement.css'

interface Carriere {
  Id_carriere: number
  grade:       string
  classe:      string
  echelon:     string
  Categorie:   string
  indice:      number
  agent?: {
    nom:           string
    prenoms:       string
    num_matricule: string
    civilite:      string
  }
}

interface ReclassementFormProps {
  reclassement?:    ReclassementFromAPI | null
  defaultCarriereId?: number
  onSave:           (data: ReclassementPayload) => Promise<void>
  onClose:          () => void
}

const CATEGORIES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D']

const EMPTY: ReclassementPayload = {
  date_reclassement:     '',
  categ_reclassement:    '',
  date_effet_solde:      '',
  date_effet_anciennete: '',
  observation:           '',
  Id_carriere:           0,
}

export const ReclassementForm: React.FC<ReclassementFormProps> = ({
  reclassement, defaultCarriereId, onSave, onClose,
}) => {
  const [form, setForm]       = useState<ReclassementPayload>({ ...EMPTY, Id_carriere: defaultCarriereId ?? 0 })
  const [carrieres, setCarrieres] = useState<Carriere[]>([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Carrière sélectionnée (pour affichage info)
  const selectedCarriere = carrieres.find(c => c.Id_carriere === form.Id_carriere)

  // ── Charger les carrières
  useEffect(() => {
    api.get('/carrieres', { params: { per_page: 300 } })
      .then(r => setCarrieres(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  // ── Pré-remplir si édition 
  useEffect(() => {
    if (reclassement) {
      setForm({
        date_reclassement:     reclassement.date_reclassement,
        categ_reclassement:    reclassement.categ_reclassement,
        date_effet_solde:      reclassement.date_effet_solde,
        date_effet_anciennete: reclassement.date_effet_anciennete,
        observation:           reclassement.observation,
        Id_carriere:           reclassement.Id_carriere,
      })
    }
  }, [reclassement])

  const set = (key: keyof ReclassementPayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.Id_carriere)          { setError('Veuillez sélectionner une carrière'); return }
    if (!form.date_reclassement)    { setError('La date de reclassement est obligatoire'); return }
    if (!form.categ_reclassement)   { setError('La catégorie est obligatoire'); return }
    if (!form.date_effet_solde)     { setError('La date d\'effet solde est obligatoire'); return }
    if (!form.date_effet_anciennete){ setError('La date d\'effet ancienneté est obligatoire'); return }

    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err: any) {
      const v = err.response?.data?.errors
      setError(v
        ? Object.values(v).flat().join(' | ') as string
        : err.response?.data?.message ?? 'Erreur lors de la sauvegarde'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rf-overlay">
      <div className="rf-modal">

        {/* Header */}
        <div className="rf-header">
          <div>
            <h2 className="rf-header-title">
              {reclassement ? 'Modifier le reclassement' : 'Nouveau reclassement'}
            </h2>
            <p className="rf-header-sub">
              {reclassement
                ? `Reclassement #${reclassement.Id_reclass}`
                : 'Enregistrer un reclassement de carrière'}
            </p>
          </div>
          <button className="rf-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="rf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Corps */}
        <div className="rf-body">

          {/* Carrière */}
          <div className="rf-section">
            <p className="rf-section-title">Carrière concernée</p>
            <div className="rf-field">
              <label className="rf-label">Carrière <span className="rf-required">*</span></label>
              <select
                className="rf-input"
                value={form.Id_carriere || ''}
                onChange={e => set('Id_carriere', Number(e.target.value))}
                disabled={!!defaultCarriereId}
                title="Carrière"
              >
                <option value="">-- Sélectionner une carrière --</option>
                {carrieres.map(c => (
                  <option key={c.Id_carriere} value={c.Id_carriere}>
                    {c.agent
                      ? `[${c.agent.num_matricule}] ${c.agent.civilite} ${c.agent.nom} — ${c.grade} (Cat. ${c.Categorie})`
                      : `Carrière #${c.Id_carriere} — ${c.grade}`
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* Info carrière sélectionnée */}
            {selectedCarriere && (
              <div className="rf-carriere-info">
                <div className="rf-carriere-info-row">
                  <div className="rf-carriere-info-item">
                    <span className="rf-carriere-info-label">Grade actuel</span>
                    <span className="rf-carriere-info-value">{selectedCarriere.grade || '—'}</span>
                  </div>
                  <div className="rf-carriere-info-item">
                    <span className="rf-carriere-info-label">Catégorie</span>
                    <span className="rf-carriere-info-value">{selectedCarriere.Categorie || '—'}</span>
                  </div>
                  <div className="rf-carriere-info-item">
                    <span className="rf-carriere-info-label">Échelon</span>
                    <span className="rf-carriere-info-value">{selectedCarriere.echelon ? `${selectedCarriere.echelon}ème` : '—'}</span>
                  </div>
                  <div className="rf-carriere-info-item">
                    <span className="rf-carriere-info-label">Indice</span>
                    <span className="rf-carriere-info-value">{selectedCarriere.indice || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reclassement */}
          <div className="rf-section">
            <p className="rf-section-title">Informations du reclassement</p>
            <div className="rf-grid-2">

              {/* Date reclassement */}
              <div className="rf-field">
                <label className="rf-label">Date de reclassement <span className="rf-required">*</span></label>
                <input type="date" className="rf-input"
                  value={form.date_reclassement}
                  onChange={e => set('date_reclassement', e.target.value)}
                  title="Date de reclassement" />
              </div>

              {/* Catégorie reclassement */}
              <div className="rf-field">
                <label className="rf-label">Nouvelle catégorie <span className="rf-required">*</span></label>
                <select className="rf-input"
                  value={form.categ_reclassement}
                  onChange={e => set('categ_reclassement', e.target.value)}
                  title="Nouvelle catégorie">
                  <option value="">-- Catégorie --</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c} {selectedCarriere?.Categorie === c ? '(actuelle)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date effet solde */}
              <div className="rf-field">
                <label className="rf-label">Date d'effet solde <span className="rf-required">*</span></label>
                <input type="date" className="rf-input"
                  value={form.date_effet_solde}
                  onChange={e => set('date_effet_solde', e.target.value)}
                  title="Date d'effet solde" />
              </div>

              {/* Date effet ancienneté */}
              <div className="rf-field">
                <label className="rf-label">Date d'effet ancienneté <span className="rf-required">*</span></label>
                <input type="date" className="rf-input"
                  value={form.date_effet_anciennete}
                  onChange={e => set('date_effet_anciennete', e.target.value)}
                  title="Date d'effet ancienneté" />
              </div>
            </div>

            {/* Observation */}
            <div className="rf-field" style={{ marginTop: 14 }}>
              <label className="rf-label">Observation</label>
              <textarea
                className="rf-textarea"
                value={form.observation}
                onChange={e => set('observation', e.target.value)}
                placeholder="Notes ou remarques sur ce reclassement..."
                rows={3}
              />
            </div>
          </div>

          {/* Récap visuel */}
          {form.date_reclassement && form.categ_reclassement && (
            <div className="rf-recap">
              <p className="rf-recap-title">📋 Récapitulatif</p>
              <div className="rf-recap-grid">
                <div className="rf-recap-item">
                  <span className="rf-recap-label">Catégorie actuelle</span>
                  <span className="rf-recap-value rf-recap-value--old">
                    {selectedCarriere?.Categorie || '—'}
                  </span>
                </div>
                <div className="rf-recap-arrow">→</div>
                <div className="rf-recap-item">
                  <span className="rf-recap-label">Nouvelle catégorie</span>
                  <span className="rf-recap-value rf-recap-value--new">
                    {form.categ_reclassement}
                  </span>
                </div>
              </div>
              <div className="rf-recap-dates">
                <span>📅 Reclassement : <strong>{form.date_reclassement}</strong></span>
                <span>💰 Effet solde : <strong>{form.date_effet_solde || '—'}</strong></span>
                <span>⏳ Effet ancienneté : <strong>{form.date_effet_anciennete || '—'}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rf-footer">
          <button className="rf-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="rf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="rf-spin" /> Enregistrement...</>
              : <><Save size={14} /> {reclassement ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}