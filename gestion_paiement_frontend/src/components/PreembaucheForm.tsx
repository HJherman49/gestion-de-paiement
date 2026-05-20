import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { PreembauchePayload, PreembaucheFromAPI } from '../services/preembaucheService'
import api from '../services/api'
import '../styles/pages/PreembauchePage.css'

interface Agent   { Id_agent: number; nom: string; prenoms: string; num_matricule: string; civilite: string }
interface Contrat { Id_contrat: number; type_contrat: string; duree: string }

interface PreembaucheFormProps {
  preembauche?:    PreembaucheFromAPI | null
  defaultAgentId?: number
  onSave:          (data: PreembauchePayload) => Promise<void>
  onClose:         () => void
}

type Step = 'recrutement' | 'stage' | 'contrat'

const STEPS: { key: Step; label: string }[] = [
  { key: 'recrutement', label: '1. Recrutement' },
  { key: 'stage',       label: '2. Stage préembauche' },
  { key: 'contrat',     label: '3. Contrat & Montants' },
]

const EMPTY: PreembauchePayload = {
  N_contrat: '', Date_recrutement: '', Date_recrutement1: '',
  Deb_stage_PreEmb: '', Deb_stage_PreEmb_txt: '',
  Fin_stage_PreEmb: '', Fin_stage_PreEmb_txt: '',
  Montant_PreEmb: 0, Montant_PreEmb_Contrat: 0,
  Id_agent: 0, Id_contrat: 0,
}

const ar = (val: any) => val && Number(val) > 0
  ? `${Number(val).toLocaleString('fr-MG')} Ar` : '—'

export const PreembaucheForm: React.FC<PreembaucheFormProps> = ({
  preembauche, defaultAgentId, onSave, onClose,
}) => {
  const [step, setStep]         = useState<Step>('recrutement')
  const [form, setForm]         = useState<PreembauchePayload>({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
  const [agents, setAgents]     = useState<Agent[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const stepIndex = STEPS.findIndex(s => s.key === step)

  useEffect(() => {
    api.get('/agents', { params: { per_page: 300 } })
      .then(r => setAgents(r.data.data ?? r.data ?? []))
      .catch(() => {})
    api.get('/contrats')
      .then(r => setContrats(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (preembauche) {
      setForm({
        N_contrat:              preembauche.N_contrat,
        Date_recrutement:       preembauche.Date_recrutement,
        Date_recrutement1:      preembauche.Date_recrutement1,
        Deb_stage_PreEmb:       preembauche.Deb_stage_PreEmb,
        Deb_stage_PreEmb_txt:   preembauche.Deb_stage_PreEmb_txt,
        Fin_stage_PreEmb:       preembauche.Fin_stage_PreEmb,
        Fin_stage_PreEmb_txt:   preembauche.Fin_stage_PreEmb_txt,
        Montant_PreEmb:         Number(preembauche.Montant_PreEmb),
        Montant_PreEmb_Contrat: Number(preembauche.Montant_PreEmb_Contrat),
        Id_agent:               preembauche.Id_agent,
        Id_contrat:             preembauche.Id_contrat,
      })
    }
  }, [preembauche])

  const set = (key: keyof PreembauchePayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setNum = (key: keyof PreembauchePayload, val: string) =>
    set(key, val === '' ? 0 : parseFloat(val) || 0)

  const handleSubmit = async () => {
    if (!form.Id_agent)          { setError('Veuillez sélectionner un agent'); setStep('recrutement'); return }
    if (!form.Date_recrutement)  { setError('La date de recrutement est obligatoire'); setStep('recrutement'); return }
    if (form.Date_recrutement1 && form.Date_recrutement1 < form.Date_recrutement) {
      setError('La deuxième date de recrutement doit être égale ou postérieure à la première');
      setStep('recrutement');
      return
    }
    if (!form.Id_contrat)        { setError('Veuillez sélectionner un type de contrat'); setStep('contrat'); return }

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

  const selectedAgent   = agents.find(a => a.Id_agent === form.Id_agent)
  const selectedContrat = contrats.find(c => c.Id_contrat === form.Id_contrat)

  // Durée du stage en jours
  const dureeStageDays = form.Deb_stage_PreEmb && form.Fin_stage_PreEmb
    ? Math.round((new Date(form.Fin_stage_PreEmb).getTime() - new Date(form.Deb_stage_PreEmb).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="pef-overlay">
      <div className="pef-modal">

        {/* Header */}
        <div className="pef-header">
          <div>
            <h2 className="pef-header-title">
              {preembauche ? 'Modifier la préembauche' : 'Nouvelle préembauche'}
            </h2>
            <p className="pef-header-sub">
              {preembauche ? `Préembauche #${preembauche.Id_preembauche}` : 'Enregistrer un dossier de préembauche'}
            </p>
          </div>
          <button className="pef-close-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        {/* Steps */}
        <div className="pef-steps">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              className={`pef-step-btn ${s.key === step ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
              onClick={() => setStep(s.key)}
            >
              <span className={`pef-step-num ${s.key === step ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}>
                {i < stepIndex ? '✓' : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <div className="pef-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="pef-body">

          {/* ── ÉTAPE 1 : RECRUTEMENT ── */}
          {step === 'recrutement' && (
            <div className="pef-section">
              <p className="pef-section-title">Informations de recrutement</p>

              {/* Agent */}
              <div className="pef-field">
                <label className="pef-label">Agent <span className="pef-required">*</span></label>
                <select className="pef-input" value={form.Id_agent || ''}
                  onChange={e => set('Id_agent', Number(e.target.value))}
                  disabled={!!defaultAgentId} title="Agent">
                  <option value="">-- Sélectionner un agent --</option>
                  {agents.map(a => (
                    <option key={a.Id_agent} value={a.Id_agent}>
                      [{a.num_matricule}] {a.civilite} {a.nom} {a.prenoms}
                    </option>
                  ))}
                </select>
                {selectedAgent && (
                  <span className="pef-hint">
                    👤 {selectedAgent.civilite} {selectedAgent.nom} {selectedAgent.prenoms}
                  </span>
                )}
              </div>

              <div className="pef-grid-2">
                <div className="pef-field">
                  <label className="pef-label">Date de recrutement <span className="pef-required">*</span></label>
                  <input type="date" className="pef-input" value={form.Date_recrutement}
                    onChange={e => set('Date_recrutement', e.target.value)} title="Date de recrutement" />
                </div>
                <div className="pef-field">
                  <label className="pef-label">Date de recrutement 2</label>
                  <input type="date" className="pef-input" value={form.Date_recrutement1}
                    onChange={e => set('Date_recrutement1', e.target.value)} title="Date de recrutement 2" />
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : STAGE ── */}
          {step === 'stage' && (
            <div className="pef-section">
              <p className="pef-section-title">Période de stage préembauche</p>

              <div className="pef-grid-2">
                <div className="pef-field">
                  <label className="pef-label">Début de stage (date)</label>
                  <input type="date" className="pef-input" value={form.Deb_stage_PreEmb}
                    onChange={e => set('Deb_stage_PreEmb', e.target.value)} title="Début de stage" />
                </div>
                <div className="pef-field">
                  <label className="pef-label">Début de stage (texte)</label>
                  <input className="pef-input" value={form.Deb_stage_PreEmb_txt}
                    onChange={e => set('Deb_stage_PreEmb_txt', e.target.value)}
                    placeholder="Ex: Premier janvier deux mille vingt-cinq" />
                </div>
                <div className="pef-field">
                  <label className="pef-label">Fin de stage (date)</label>
                  <input type="date" className="pef-input" value={form.Fin_stage_PreEmb}
                    onChange={e => set('Fin_stage_PreEmb', e.target.value)} title="Fin de stage" />
                </div>
                <div className="pef-field">
                  <label className="pef-label">Fin de stage (texte)</label>
                  <input className="pef-input" value={form.Fin_stage_PreEmb_txt}
                    onChange={e => set('Fin_stage_PreEmb_txt', e.target.value)}
                    placeholder="Ex: Trente et un décembre deux mille vingt-cinq" />
                </div>
              </div>

              {/* Durée calculée */}
              {dureeStageDays !== null && dureeStageDays > 0 && (
                <div className="pef-duree-block">
                  <span>⏱ Durée du stage</span>
                  <span className="pef-duree-value">
                    {dureeStageDays} jour{dureeStageDays > 1 ? 's' : ''}
                    {dureeStageDays >= 30 && ` (≈ ${Math.round(dureeStageDays / 30)} mois)`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 3 : CONTRAT & MONTANTS ── */}
          {step === 'contrat' && (
            <div className="pef-section">
              <p className="pef-section-title">Contrat & Rémunération</p>

              {/* N° contrat */}
              <div className="pef-field">
                <label className="pef-label">N° de contrat</label>
                <input className="pef-input pef-mono" value={form.N_contrat}
                  onChange={e => set('N_contrat', e.target.value)}
                  placeholder="Ex: CTR-2025-001" />
              </div>

              {/* Type contrat */}
              <div className="pef-field" style={{ marginTop: 14 }}>
                <label className="pef-label">Type de contrat <span className="pef-required">*</span></label>
                <select className="pef-input" value={form.Id_contrat || ''}
                  onChange={e => set('Id_contrat', Number(e.target.value))} title="Type de contrat">
                  <option value="">-- Sélectionner un contrat --</option>
                  {contrats.map(c => (
                    <option key={c.Id_contrat} value={c.Id_contrat}>
                      {c.type_contrat} {c.duree ? `(${c.duree})` : ''}
                    </option>
                  ))}
                </select>
                {selectedContrat && (
                  <span className="pef-hint">📄 {selectedContrat.type_contrat} · {selectedContrat.duree}</span>
                )}
              </div>

              {/* Montants */}
              <div className="pef-grid-2" style={{ marginTop: 14 }}>
                <div className="pef-field">
                  <label className="pef-label">Montant préembauche (Ar)</label>
                  <input type="number" className="pef-input pef-mono" min="0" step="0.01"
                    value={form.Montant_PreEmb || ''}
                    onChange={e => setNum('Montant_PreEmb', e.target.value)}
                    placeholder="0" />
                </div>
                <div className="pef-field">
                  <label className="pef-label">Montant contrat (Ar)</label>
                  <input type="number" className="pef-input pef-mono" min="0" step="0.01"
                    value={form.Montant_PreEmb_Contrat || ''}
                    onChange={e => setNum('Montant_PreEmb_Contrat', e.target.value)}
                    placeholder="0" />
                </div>
              </div>

              {/* Récap final */}
              <div className="pef-recap">
                <p className="pef-recap-title">📋 Récapitulatif du dossier</p>
                <div className="pef-recap-rows">
                  {[
                    { label: 'Agent',               value: selectedAgent ? `${selectedAgent.nom} ${selectedAgent.prenoms}` : '—' },
                    { label: 'N° Contrat',           value: form.N_contrat || '—' },
                    { label: 'Type contrat',         value: selectedContrat?.type_contrat || '—' },
                    { label: 'Date recrutement',     value: form.Date_recrutement || '—' },
                    { label: 'Stage',                value: form.Deb_stage_PreEmb && form.Fin_stage_PreEmb ? `${form.Deb_stage_PreEmb} → ${form.Fin_stage_PreEmb}` : '—' },
                    { label: 'Montant préembauche',  value: ar(form.Montant_PreEmb) },
                    { label: 'Montant contrat',      value: ar(form.Montant_PreEmb_Contrat) },
                  ].map(({ label, value }) => (
                    <div key={label} className="pef-recap-row">
                      <span className="pef-recap-label">{label}</span>
                      <span className="pef-recap-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pef-footer">
          <button className="pef-btn-secondary"
            onClick={() => stepIndex === 0 ? onClose() : setStep(STEPS[stepIndex - 1].key)}>
            {stepIndex === 0 ? 'Annuler' : '← Précédent'}
          </button>

          {stepIndex < STEPS.length - 1 ? (
            <button className="pef-btn-primary" onClick={() => setStep(STEPS[stepIndex + 1].key)}>
              Suivant →
            </button>
          ) : (
            <button className="pef-btn-save" onClick={handleSubmit} disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="pef-spin" /> Enregistrement...</>
                : <><Save size={14} /> {preembauche ? 'Modifier' : 'Enregistrer'}</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}