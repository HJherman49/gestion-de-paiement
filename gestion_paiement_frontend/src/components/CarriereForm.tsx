import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { CarrierePayload, CarriereFromAPI } from '../services/carriereService'
import api from '../services/api'

interface Agent {
  Id_agent:      number
  nom:           string
  prenoms:       string
  num_matricule: string
  civilite:      string
}

interface Bareme {
  Id_bareme:    number
  indice:       number
  salaire_base: number
}

interface CarriereFormProps {
  carriere?:      CarriereFromAPI | null
  defaultAgentId?: number
  onSave:         (data: CarrierePayload) => Promise<void>
  onClose:        () => void
}

const CATEGORIES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D']
const CLASSES     = ['1ère classe', '2ème classe', '3ème classe', 'Classe exceptionnelle']
const ECHELONS    = Array.from({ length: 12 }, (_, i) => `${i + 1}`)

const EMPTY: CarrierePayload = {
  Categorie:  '',
  corps:      '',
  grade:      '',
  classe:     '',
  echelon:    '',
  indice:     0,
  Id_agent:   0,
  Id_bareme:  undefined,
}

export const CarriereForm: React.FC<CarriereFormProps> = ({
  carriere, defaultAgentId, onSave, onClose,
}) => {
  const [form, setForm]     = useState<CarrierePayload>({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
  const [agents, setAgents] = useState<Agent[]>([])
  const [baremes, setBaremes] = useState<Bareme[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // ── Charger agents et barèmes 
  useEffect(() => {
    api.get('/agents', { params: { per_page: 300 } })
      .then(r => setAgents(r.data.data ?? r.data ?? []))
      .catch(() => {})

    api.get('/baremes')
      .then(r => setBaremes(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  // ── Pré-remplir si édition 
  useEffect(() => {
    if (carriere) {
      setForm({
        Categorie:  carriere.Categorie,
        corps:      carriere.corps,
        grade:      carriere.grade,
        classe:     carriere.classe,
        echelon:    carriere.echelon,
        indice:     carriere.indice,
        Id_agent:   carriere.Id_agent,
        Id_bareme:  carriere.Id_bareme,
      })
    }
  }, [carriere])

  const set = (key: keyof CarrierePayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // ── Auto-remplir indice depuis barème sélectionné 
  const handleBaremeChange = (Id_bareme: number) => {
    set('Id_bareme', Id_bareme)
    const b = baremes.find(b => b.Id_bareme === Id_bareme)
    if (b) set('indice', b.indice)
  }

  const handleSubmit = async () => {
    if (!form.Id_agent) { setError('Veuillez sélectionner un agent'); return }
    if (!form.grade.trim()) { setError('Le grade est obligatoire'); return }
    if (!form.Categorie) { setError('La catégorie est obligatoire'); return }

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

  const inp = 'cf-input'
  const lbl = 'cf-label'

  return (
    <div className="cf-overlay">
      <div className="cf-modal">

        {/* Header */}
        <div className="cf-header">
          <div>
            <h2 className="cf-header-title">
              {carriere ? 'Modifier la carrière' : 'Nouvelle carrière'}
            </h2>
            <p className="cf-header-sub">
              {carriere ? `Carrière #${carriere.Id_carriere}` : 'Renseigner les informations de carrière'}
            </p>
          </div>
          <button className="cf-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="cf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Corps */}
        <div className="cf-body">

          {/* Agent */}
          <div className="cf-section">
            <p className="cf-section-title">Agent concerné</p>
            <div className="cf-field">
              <label className={lbl}>Agent <span className="cf-required">*</span></label>
              <select
                className={inp}
                value={form.Id_agent || ''}
                onChange={e => set('Id_agent', Number(e.target.value))}
                disabled={!!defaultAgentId}
                title="Agent"
              >
                <option value="">-- Sélectionner un agent --</option>
                {agents.map(a => (
                  <option key={a.Id_agent} value={a.Id_agent}>
                    [{a.num_matricule}] {a.civilite} {a.nom} {a.prenoms}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classification */}
          <div className="cf-section">
            <p className="cf-section-title">Classification</p>
            <div className="cf-grid-2">
              {/* Catégorie */}
              <div className="cf-field">
                <label className={lbl}>Catégorie <span className="cf-required">*</span></label>
                <select className={inp} value={form.Categorie} onChange={e => set('Categorie', e.target.value)} title="Catégorie">
                  <option value="">-- Catégorie --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Corps */}
              <div className="cf-field">
                <label className={lbl}>Corps</label>
                <input type="text" className={inp} value={form.corps}
                  onChange={e => set('corps', e.target.value)}
                  placeholder="Ex: Corps des administrateurs" />
              </div>

              {/* Grade */}
              <div className="cf-field">
                <label className={lbl}>Grade <span className="cf-required">*</span></label>
                <input type="text" className={inp} value={form.grade}
                  onChange={e => set('grade', e.target.value)}
                  placeholder="Ex: Administrateur Principal" />
              </div>

              {/* Classe */}
              <div className="cf-field">
                <label className={lbl}>Classe</label>
                <select className={inp} value={form.classe} onChange={e => set('classe', e.target.value)} title="Classe">
                  <option value="">-- Classe --</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Échelon */}
              <div className="cf-field">
                <label className={lbl}>Échelon</label>
                <select className={inp} value={form.echelon} onChange={e => set('echelon', e.target.value)} title="Échelon">
                  <option value="">-- Échelon --</option>
                  {ECHELONS.map(e => <option key={e} value={e}>{e}ème échelon</option>)}
                </select>
              </div>

              {/* Indice */}
              <div className="cf-field">
                <label className={lbl}>Indice</label>
                <input type="number" className={inp} value={form.indice || ''}
                  onChange={e => set('indice', Number(e.target.value))}
                  placeholder="Ex: 350" min="0" />
              </div>
            </div>
          </div>

          {/* Barème */}
          <div className="cf-section">
            <p className="cf-section-title">Barème salarial</p>
            <div className="cf-field">
              <label className={lbl}>Barème associé</label>
              <select
                className={inp}
                value={form.Id_bareme || ''}
                onChange={e => handleBaremeChange(Number(e.target.value))}
                title="Barème"
              >
                <option value="">-- Aucun barème --</option>
                {baremes.map(b => (
                  <option key={b.Id_bareme} value={b.Id_bareme}>
                    Indice {b.indice} → {Number(b.salaire_base).toLocaleString('fr-MG')} Ar
                  </option>
                ))}
              </select>
              {form.Id_bareme && (
                <p className="cf-hint">
                  💡 L'indice a été auto-rempli depuis le barème sélectionné
                </p>
              )}
            </div>
          </div>

          {/* Récap */}
          {(form.grade || form.Categorie) && (
            <div className="cf-recap">
              <p className="cf-recap-title">Récapitulatif</p>
              <div className="cf-recap-grid">
                {[
                  { label: 'Catégorie', value: form.Categorie || '—' },
                  { label: 'Corps',     value: form.corps     || '—' },
                  { label: 'Grade',     value: form.grade     || '—' },
                  { label: 'Classe',    value: form.classe    || '—' },
                  { label: 'Échelon',   value: form.echelon   ? `${form.echelon}ème` : '—' },
                  { label: 'Indice',    value: form.indice    || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="cf-recap-item">
                    <span className="cf-recap-label">{label}</span>
                    <span className="cf-recap-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cf-footer">
          <button className="cf-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="cf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="cf-spin" /> Enregistrement...</>
              : <><Save size={14} /> {carriere ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}