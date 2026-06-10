import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Save, DollarSign, User, FileText, Calendar, Loader2 } from 'lucide-react'
import type { PaiePayload, PaieFromAPI } from '../services/paieService'
import { getCarriereAgent, type CarriereFromAPI } from '../services/carriereService'
import api from '../services/api'

interface Agent {
  Id_agent: number
  nom: string
  prenoms: string
  num_matricule: string
  civilite: string
}

interface PaieFormProps {
  paie?: PaieFromAPI | null
  defaultAgentId?: number
  onSave: (data: PaiePayload) => Promise<void>
  onClose: () => void
}

type Section = 'identification' | 'remuneration' | 'deductions' | 'complement'

const STEPS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'identification', label: 'Identification',  icon: <User size={14} /> },
  { key: 'remuneration',   label: 'Rémunération',    icon: <DollarSign size={14} /> },
  { key: 'deductions',     label: 'Déductions',      icon: <FileText size={14} /> },
  { key: 'complement',     label: 'Complément',      icon: <Calendar size={14} /> },
]

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

const EMPTY: PaiePayload = {
  mois: new Date().getMonth() + 1,
  annee: new Date().getFullYear(),
  salaire_brut: 0,
  prime: 0,
  scola: 0,
  remboursement: 0,
  Indice: 0,
  prime_speciale: 0,
  prime_fin_annee: 0,
  alloc: 0,
  logement: 0,
  IGR: 0,
  rappel: 0,
  PA: 0,
  mode_paie: 'Virement',
  chap: '',
  art: '',
  date_effet: '',
  Id_agent: 0,
  Id_enfant: undefined,
}

const safeString = (value: string | null | undefined) => value ?? ''
const safeNumber = (value: number | null | undefined) => value ?? 0
const normalizePaie = (paie: PaieFromAPI): PaiePayload => ({
  mois:            safeNumber(paie.mois),
  annee:           safeNumber(paie.annee),
  salaire_brut:    safeNumber(paie.salaire_brut),
  prime:           safeNumber(paie.prime),
  scola:           safeNumber(paie.scola),
  remboursement:   safeNumber(paie.remboursement),
  Indice:          safeNumber(paie.Indice),
  prime_speciale:  safeNumber(paie.prime_speciale),
  prime_fin_annee: safeNumber(paie.prime_fin_annee),
  alloc:           safeNumber(paie.alloc),
  logement:        safeNumber(paie.logement),
  IGR:             safeNumber(paie.IGR),
  rappel:          safeNumber(paie.rappel),
  PA:              safeNumber(paie.PA),
  mode_paie:       safeString(paie.mode_paie),
  chap:            safeString(paie.chap),
  art:             safeString(paie.art),
  date_effet:      safeString(paie.date_effet),
  Id_agent:        safeNumber(paie.Id_agent),
  Id_enfant:       paie.Id_enfant == null ? undefined : safeNumber(paie.Id_enfant),
})

const NumField = React.memo<{
  label: string;
  field: keyof PaiePayload;
  value: number | undefined;
  onChange: (field: keyof PaiePayload, value: string) => void;
  required?: boolean;
  disabled?: boolean;          // ← Nouveau prop
}>(({ label, field, value, onChange, required = false, disabled = false }) => {
  const displayValue = (value === 0 || value == null) ? '' : String(value);

  return (
    <div className="pf-field">
      <label className="pf-label">
        {label}{required && <span className="pf-required"> *</span>}
      </label>
      <input
        type="number"
        className="pf-input"
        value={displayValue}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required={required}
        disabled={disabled}                    // ← Ajout
      />
    </div>
  );
});

NumField.displayName = 'NumField';




export const PaieForm: React.FC<PaieFormProps> = ({ paie, defaultAgentId, onSave, onClose }) => {
  const [step, setStep]       = useState<Section>('identification')
  const [form, setForm]       = useState<PaiePayload>({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
  const [agents, setAgents]   = useState<Agent[]>([])
  const [carrieres, setCarrieres] = useState<CarriereFromAPI[]>([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const isEditMode = Boolean(paie)

  const stepIndex = STEPS.findIndex(s => s.key === step)

  // ── Charger agents pour le select
  useEffect(() => {
    api.get('/agents', { params: { per_page: 200 } })
      .then(r => setAgents(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  // ── Pré-remplir si édition 
  useEffect(() => {
    if (paie) {
      setForm(normalizePaie(paie))
    } else {
      setForm({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
    }
  }, [paie, defaultAgentId])

  useEffect(() => {
    if (form.Id_agent) {
      loadAgentCarrieres(form.Id_agent)
    }
  }, [form.Id_agent])

  const set = (key: keyof PaiePayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleAgentChange = (Id_agent: number) => {
    set('Id_agent', Id_agent)
  }

  const handleNumChange = useCallback((key: keyof PaiePayload, value: string) => {
    set(key, value === '' ? 0 : parseFloat(value) || 0);
  }, [set]);

  const setNum = (key: keyof PaiePayload, value: string) =>
    set(key, value === '' ? 0 : parseFloat(value) || 0)

  const loadAgentCarrieres = async (Id_agent: number) => {
    try {
      const res = await getCarriereAgent(Id_agent)
      const data = res.data?.data ?? res.data ?? []
      setCarrieres(Array.isArray(data) ? data : [data])

      const carre = (Array.isArray(data) ? data : [data])
        .filter((c): c is CarriereFromAPI => !!c)
        .sort((a, b) => (b.Id_carriere ?? 0) - (a.Id_carriere ?? 0))[0]

      if (carre?.bareme?.salaire_base) {
        set('salaire_brut', Number(carre.bareme.salaire_base))
      }
    } catch (err) {
      setCarrieres([])
    }
  }

  const selectedCarriere = useMemo(() => {
    if (!form.Id_agent) return undefined
    return carrieres
      .sort((a, b) => (b.Id_carriere ?? 0) - (a.Id_carriere ?? 0))[0]
  }, [carrieres, form.Id_agent])

  // ── Totaux calculés 
  const totalBrut = form.salaire_brut + form.prime + form.prime_speciale +
    form.prime_fin_annee + form.alloc + form.logement + form.scola +
    form.remboursement + form.rappel
  const totalDeductions = form.IGR + form.PA
  const netAPayer = totalBrut - totalDeductions

  // ── Soumission 
  const handleSubmit = async () => {
    if (!form.Id_agent) { setError('Veuillez sélectionner un agent'); setStep('identification'); return }
    if (!form.mois || !form.annee) { setError('Mois et année sont obligatoires'); setStep('identification'); return }

    if (isEditMode && (form.prime === 0 || form.prime_speciale === 0 || form.prime_fin_annee === 0)) {
      setError('Pendant la modification, toutes les primes doivent être remplies.');
      setStep('remuneration');
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err: any) {
      const v = err.response?.data?.errors
      setError(v ? Object.values(v).flat().join(' | ') as string : err.response?.data?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // ── Champ numérique réutilisable 


  return (
    <div className="pf-overlay">
      <div className="pf-modal">

        {/* Header */}
        <div className="pf-header">
          <div>
            <h2 className="pf-header-title">
              {paie ? 'Modifier le bulletin' : 'Nouveau bulletin de paie'}
            </h2>
            <p className="pf-header-sub">
              {paie ? `Bulletin #${paie.Id_paie}` : 'Remplir les informations de paie'}
            </p>
          </div>
          <button className="pf-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="pf-steps">
          {STEPS.map((s, i) => {
            const isActive = s.key === step
            const isDone   = i < stepIndex
            return (
              <button
                key={s.key}
                className={`pf-step-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => setStep(s.key)}
              >
                <span className={`pf-step-num ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  {isDone ? '✓' : i + 1}
                </span>
                {s.icon}
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Erreur */}
        {error && (
          <div className="pf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Corps */}
        <div className="pf-body">

          {/* ── IDENTIFICATION ── */}
          {step === 'identification' && (
            <div className="pf-section">
              <p className="pf-section-title">Période & Agent</p>
              <div className="pf-grid-3">
                {/* Mois */}
                <div className="pf-field">
                  <label className="pf-label">Mois <span className="pf-required">*</span></label>
                  <select className="pf-input" value={form.mois} onChange={e => set('mois', Number(e.target.value))} title="Mois">
                    {MOIS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                {/* Année */}
                <div className="pf-field">
                  <label className="pf-label">Année <span className="pf-required">*</span></label>
                  <input
                    type="number"
                    className="pf-input"
                    value={form.annee || ''}
                    onChange={e => set('annee', Number(e.target.value))}
                    min="2000" max="2099"
                    placeholder="2025"
                  />
                </div>
                {/* Date d'effet */}
                <div className="pf-field">
                  <label className="pf-label">Date d'effet</label>
                  <input
                    type="date"
                    className="pf-input"
                    value={form.date_effet || ''}
                    onChange={e => set('date_effet', e.target.value)}
                    title="Date d'effet"
                  />
                </div>
              </div>

              {/* Agent */}
              <div className="pf-field" style={{ marginTop: 16 }}>
                <label className="pf-label">Agent <span className="pf-required">*</span></label>
                <select
                  className="pf-input"
                  value={form.Id_agent || ''}
                  onChange={e => handleAgentChange(Number(e.target.value))}
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

              <div className="pf-grid-2" style={{ marginTop: 16 }}>
                {/* Chapitre */}
                <div className="pf-field">
                  <label className="pf-label">Chapitre (CHAP)</label>
                  <input
                    type="text"
                    className="pf-input"
                    value={form.chap || ''}
                    onChange={e => set('chap', e.target.value)}
                    placeholder="Ex: 621"
                  />
                </div>
                {/* Article */}
                <div className="pf-field">
                  <label className="pf-label">Article (ART)</label>
                  <input
                    type="text"
                    className="pf-input"
                    value={form.art || ''}
                    onChange={e => set('art', e.target.value)}
                    placeholder="Ex: 6211"
                  />
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="pf-field" style={{ marginTop: 16 }}>
                <label className="pf-label">Mode de paiement</label>
                <select className="pf-input" value={form.mode_paie} onChange={e => set('mode_paie', e.target.value)} title="Mode de paiement">
                  <option value="Virement">Virement bancaire</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>
            </div>
          )}

          {/* ── RÉMUNÉRATION ── */}
          {step === 'remuneration' && (
            <div className="pf-section">
              <p className="pf-section-title">Éléments de rémunération</p>
              <div className="pf-grid-2">
                <div className="pf-field">
                  <label className="pf-label">Salaire brut</label>
                  <input
                    type="number"
                    className="pf-input"
                    value={form.salaire_brut ? String(form.salaire_brut) : ''}
                    disabled
                    placeholder={selectedCarriere ? 'Rempli depuis le barème' : 'Sélectionner un agent'}
                    title="Le salaire brut est défini automatiquement depuis le barème de la carrière"
                  />
                  {selectedCarriere?.bareme && (
                    <p className="pf-hint">
                      Barème {selectedCarriere.bareme.indice} — {Number(selectedCarriere.bareme.salaire_base).toLocaleString('fr-MG')} Ar
                    </p>
                  )}
                </div>

                <NumField label="Indice" field="Indice" value={form.Indice} onChange={handleNumChange} />

                {/* Primes : désactivées en création */}
                <NumField 
                  label="Prime" 
                  field="prime" 
                  value={form.prime} 
                  onChange={handleNumChange} 
                  required={isEditMode}
                  disabled={!isEditMode}   // ← Ajout
                />
                <NumField 
                  label="Prime spéciale" 
                  field="prime_speciale" 
                  value={form.prime_speciale} 
                  onChange={handleNumChange} 
                  required={isEditMode}
                  disabled={!isEditMode}   // ← Ajout
                />
                <NumField 
                  label="Prime fin d'année" 
                  field="prime_fin_annee" 
                  value={form.prime_fin_annee} 
                  onChange={handleNumChange} 
                  required={isEditMode}
                  disabled={!isEditMode}   // ← Ajout
                />

                <NumField label="Allocation" field="alloc" value={form.alloc} onChange={handleNumChange} />
                <NumField label="Logement" field="logement" value={form.logement} onChange={handleNumChange} />
                <NumField label="Scolarité" field="scola" value={form.scola} onChange={handleNumChange} />
                <NumField label="Remboursement" field="remboursement" value={form.remboursement} onChange={handleNumChange} />
                <NumField label="Rappel" field="rappel" value={form.rappel} onChange={handleNumChange} />
              </div>

              {/* Message explicatif en mode création */}
              {!isEditMode && (
                <div className="pf-info-box" style={{ marginTop: '12px' }}>
                  <small>ℹ️ Les primes ne sont saisissables que lors de la modification du bulletin.</small>
                </div>
              )}

              {/* Récap brut */}
              <div className="pf-recap pf-recap--green">
                <span>Total brut estimé</span>
                <span className="pf-recap-amount">
                  {totalBrut.toLocaleString('fr-MG')} Ar
                </span>
              </div>
            </div>
          )}

          {/* ── DÉDUCTIONS ── */}
          {step === 'deductions' && (
            <div className="pf-section">
              <p className="pf-section-title">Retenues & Cotisations</p>
              <div className="pf-grid-2">
                <NumField label="IGR (Impôt sur le revenu)" field="IGR" value={form.IGR} onChange={handleNumChange} />
                <NumField label="PA (Pension / CNAPS)"      field="PA" value={form.PA} onChange={handleNumChange} />
              </div>

              {/* Récap */}
              <div className="pf-recap pf-recap--red">
                <span>Total déductions</span>
                <span className="pf-recap-amount">{totalDeductions.toLocaleString('fr-MG')} Ar</span>
              </div>

              {/* Net à payer */}
              <div className="pf-net">
                <div>
                  <p className="pf-net-label">Net à payer</p>
                  <p className="pf-net-sub">Brut − Déductions</p>
                </div>
                <p className="pf-net-amount">{netAPayer.toLocaleString('fr-MG')} Ar</p>
              </div>
            </div>
          )}

          {/* ── COMPLÉMENT ── */}
          {step === 'complement' && (
            <div className="pf-section">
              <p className="pf-section-title">Récapitulatif du bulletin</p>

              {/* Tableau de synthèse */}
              <div className="pf-summary">
                {[
                  { label: 'Période',         value: `${MOIS[form.mois - 1]} ${form.annee}` },
                  { label: 'Agent (ID)',       value: form.Id_agent ? agents.find(a => a.Id_agent === form.Id_agent)?.nom + ' ' + agents.find(a => a.Id_agent === form.Id_agent)?.prenoms : '—' },
                  { label: 'Date d\'effet',   value: form.date_effet || '—' },
                  { label: 'Mode de paie',    value: form.mode_paie },
                  { label: 'Chapitre / Art',  value: `${form.chap || '—'} / ${form.art || '—'}` },
                  { label: 'Salaire brut',    value: `${form.salaire_brut.toLocaleString('fr-MG')} Ar` },
                  { label: 'Primes totales',  value: `${(form.prime + form.prime_speciale + form.prime_fin_annee).toLocaleString('fr-MG')} Ar` },
                  { label: 'Indemnités',      value: `${(form.alloc + form.logement + form.scola + form.remboursement + form.rappel).toLocaleString('fr-MG')} Ar` },
                  { label: 'Total brut',      value: `${totalBrut.toLocaleString('fr-MG')} Ar`, bold: true },
                  { label: 'IGR',             value: `- ${form.IGR.toLocaleString('fr-MG')} Ar`, red: true },
                  { label: 'PA / CNAPS',      value: `- ${form.PA.toLocaleString('fr-MG')} Ar`, red: true },
                ].map(({ label, value, bold, red }) => (
                  <div key={label} className="pf-summary-row">
                    <span className="pf-summary-label">{label}</span>
                    <span className={`pf-summary-value ${bold ? 'bold' : ''} ${red ? 'red' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Net à payer final */}
              <div className="pf-net pf-net--big">
                <div>
                  <p className="pf-net-label">NET À PAYER</p>
                  <p className="pf-net-sub">{MOIS[form.mois - 1]} {form.annee}</p>
                </div>
                <p className="pf-net-amount pf-net-amount--big">{netAPayer.toLocaleString('fr-MG')} Ar</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pf-footer">
          <button
            className="pf-btn-secondary"
            onClick={() => {
              if (stepIndex === 0) onClose()
              else setStep(STEPS[stepIndex - 1].key)
            }}
          >
            {stepIndex === 0 ? 'Annuler' : '← Précédent'}
          </button>

          {stepIndex < STEPS.length - 1 ? (
            <button className="pf-btn-primary" onClick={() => setStep(STEPS[stepIndex + 1].key)}>
              Suivant →
            </button>
          ) : (
            <button className="pf-btn-save" onClick={handleSubmit} disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="pf-spin" /> Enregistrement...</>
                : <><Save size={14} /> {paie ? 'Modifier' : 'Enregistrer'}</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}