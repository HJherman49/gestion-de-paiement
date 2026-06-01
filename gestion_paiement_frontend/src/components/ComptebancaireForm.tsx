import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { CompteBancairePayload, CompteBancaireFromAPI } from '../services/banqueServices'
import api from '../services/api'
import '../styles/pages/BanquePage.css'

interface Banque { Id_banque: number; Nom_banque: string; agence: string; code_banque: string }
interface Agent  { Id_agent: number; nom: string; prenoms: string; num_matricule: string; civilite: string }

interface CompteBancaireFormProps {
  compte?:          CompteBancaireFromAPI | null
  defaultAgentId?:  number
  onSave:           (data: CompteBancairePayload) => Promise<void>
  onClose:          () => void
}

const EMPTY: CompteBancairePayload = {
  num_compte: '', adresse_bnq: '', code_localite: '',
  CODQEB: '', GUICHB: '', RIB: '', Id_agent: 0, Id_banque: 0,
}

export const CompteBancaireForm: React.FC<CompteBancaireFormProps> = ({
  compte, defaultAgentId, onSave, onClose,
}) => {
  const [form, setForm]       = useState<CompteBancairePayload>({ ...EMPTY, Id_agent: defaultAgentId ?? 0 })
  const [agents, setAgents]   = useState<Agent[]>([])
  const [banques, setBanques] = useState<Banque[]>([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Banque sélectionnée
  const selectedBanque = banques.find(b => b.Id_banque === form.Id_banque)

  useEffect(() => {
    api.get('/agents', { params: { per_page: 300 } })
      .then(r => setAgents(r.data.data ?? r.data ?? []))
      .catch(() => {})
    api.get('/banques', { params: { per_page: 100 } })
      .then(r => setBanques(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (compte) {
      setForm({
        num_compte:     compte.num_compte,
        adresse_bnq: compte.adresse_bnq,
        code_localite:  compte.code_localite,
        CODQEB:         compte.CODQEB,
        GUICHB:         compte.GUICHB,
        RIB:            compte.RIB,
        Id_agent:       compte.Id_agent,
        Id_banque:      compte.Id_banque,
      })
    }
  }, [compte])

  const set = (key: keyof CompteBancairePayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Auto-remplir code_localite depuis la banque
  const handleBanqueChange = (id: number) => {
    set('Id_banque', id)
    const b = banques.find(b => b.Id_banque === id)
    if (b && !form.adresse_bnq) set('adresse_bnq', b.agence)
  }

  const handleSubmit = async () => {
    if (!form.Id_agent)    { setError('Veuillez sélectionner un agent'); return }
    if (!form.Id_banque)   { setError('Veuillez sélectionner une banque'); return }
    if (!form.num_compte.trim()) { setError('Le numéro de compte est obligatoire'); return }
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

  // RIB complet calculé
  const ribComplet = selectedBanque
    ? `${selectedBanque.code_banque} ${form.GUICHB} ${form.num_compte} ${form.RIB}`.trim()
    : ''

  return (
    <div className="cbf-overlay">
      <div className="cbf-modal">
        <div className="cbf-header">
          <div>
            <h2 className="cbf-header-title">{compte ? 'Modifier le compte' : 'Nouveau compte bancaire'}</h2>
            <p className="cbf-header-sub">{compte ? `Compte #${compte.Id_compte}` : 'Enregistrer un RIB agent'}</p>
          </div>
          <button className="ff-close-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        {error && (
          <div className="cbf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="cbf-body">

          {/* Agent */}
          <div className="cbf-section">
            <p className="cbf-section-title">Agent</p>
            <div className="cbf-field">
              <label className="cbf-label">Agent <span className="cbf-required">*</span></label>
              <select className="cbf-input" value={form.Id_agent || ''}
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
          </div>

          {/* Banque */}
          <div className="cbf-section">
            <p className="cbf-section-title">Banque</p>
            <div className="cbf-field">
              <label className="cbf-label">Banque <span className="cbf-required">*</span></label>
              <select className="cbf-input" value={form.Id_banque || ''}
                onChange={e => handleBanqueChange(Number(e.target.value))} title="Banque">
                <option value="">-- Sélectionner une banque --</option>
                {banques.map(b => (
                  <option key={b.Id_banque} value={b.Id_banque}>
                    {b.Nom_banque} — {b.agence} (Code: {b.code_banque})
                  </option>
                ))}
              </select>
            </div>
            {selectedBanque && (
              <div className="cbf-banque-tag">
                🏦 {selectedBanque.Nom_banque} · Code {selectedBanque.code_banque}
              </div>
            )}
          </div>

          {/* Informations compte */}
          <div className="cbf-section">
            <p className="cbf-section-title">Informations RIB</p>
            <div className="cbf-grid-2">
              <div className="cbf-field">
                <label className="cbf-label">N° de compte <span className="cbf-required">*</span></label>
                <input className="cbf-input cbf-mono" value={form.num_compte}
                  onChange={e => set('num_compte', e.target.value)}
                  placeholder="Ex: 00012345678" />
              </div>
              <div className="cbf-field">
                <label className="cbf-label">RIB (clé)</label>
                <input className="cbf-input cbf-mono" value={form.RIB}
                  onChange={e => set('RIB', e.target.value)}
                  placeholder="Ex: 45" maxLength={2} />
              </div>
              <div className="cbf-field">
                <label className="cbf-label">Code guichet (GUICHB)</label>
                <input className="cbf-input cbf-mono" value={form.GUICHB}
                  onChange={e => set('GUICHB', e.target.value)}
                  placeholder="Ex: 00001" />
              </div>
              <div className="cbf-field">
                <label className="cbf-label">CODQEB</label>
                <input className="cbf-input cbf-mono" value={form.CODQEB}
                  onChange={e => set('CODQEB', e.target.value)}
                  placeholder="Ex: 001" />
              </div>
              <div className="cbf-field cbf-field--full">
                <label className="cbf-label">Code localité</label>
                <input className="cbf-input" value={form.code_localite}
                  onChange={e => set('code_localite', e.target.value)}
                  placeholder="Ex: 00101" />
              </div>
              <div className="cbf-field cbf-field--full">
                <label className="cbf-label">Adresse banque</label>
                <input className="cbf-input" value={form.adresse_bnq}
                  onChange={e => set('adresse_bnq', e.target.value)}
                  placeholder="Ex: Rue Solombavambahoaka, Antananarivo" />
              </div>
            </div>
          </div>

          {/* RIB complet */}
          {ribComplet && (
            <div className="cbf-rib-preview">
              <p className="cbf-rib-label">RIB complet</p>
              <p className="cbf-rib-value">{ribComplet}</p>
              <p className="cbf-rib-hint">Code banque · Guichet · N° compte · Clé RIB</p>
            </div>
          )}
        </div>

        <div className="cbf-footer">
          <button className="cbf-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="cbf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="cbf-spin" /> Enregistrement...</>
              : <><Save size={14} /> {compte ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}