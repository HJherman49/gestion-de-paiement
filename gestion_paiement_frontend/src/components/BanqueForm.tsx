import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { BanquePayload, BanqueFromAPI } from '../services/banqueServices'
import '../styles/pages/BanquePage.css'

interface BanqueFormProps {
  banque?: BanqueFromAPI | null
  onSave:  (data: BanquePayload) => Promise<void>
  onClose: () => void
}

const EMPTY: BanquePayload = {
  Nom_banque:        '',
  agence:            '',
  code_banque:       '',
  code_localite_bnq: '',
}

export const BanqueForm: React.FC<BanqueFormProps> = ({ banque, onSave, onClose }) => {
  const [form, setForm]   = useState<BanquePayload>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (banque) {
      setForm({
        Nom_banque:        banque.Nom_banque,
        agence:            banque.agence,
        code_banque:       banque.code_banque,
        code_localite_bnq: banque.code_localite_bnq,
      })
    } else {
      setForm({ ...EMPTY })
    }
  }, [banque])

  const set = (key: keyof BanquePayload, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.Nom_banque.trim()) { setError('Le nom de la banque est obligatoire'); return }
    if (!form.code_banque.trim()) { setError('Le code banque est obligatoire'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err: any) {
      const v = err.response?.data?.errors
      setError(v ? Object.values(v).flat().join(' | ') as string : err.response?.data?.message ?? 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bf-overlay">
      <div className="bf-modal">
        <div className="bf-header">
          <div>
            <h2 className="bf-header-title">{banque ? 'Modifier la banque' : 'Nouvelle banque'}</h2>
            <p className="bf-header-sub">{banque ? `Banque #${banque.Id_banque}` : 'Enregistrer une banque'}</p>
          </div>
          <button className="bf-close-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        {error && (
          <div className="bf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="bf-body">
          <div className="bf-field">
            <label className="bf-label">Nom de la banque <span className="bf-required">*</span></label>
            <input className="bf-input" value={form.Nom_banque}
              onChange={e => set('Nom_banque', e.target.value)}
              placeholder="Ex: BNI Madagascar" />
          </div>

          <div className="bf-field">
            <label className="bf-label">Agence</label>
            <input className="bf-input" value={form.agence}
              onChange={e => set('agence', e.target.value)}
              placeholder="Ex: Agence Analakely" />
          </div>

          <div className="bf-grid-2">
            <div className="bf-field">
              <label className="bf-label">Code banque <span className="bf-required">*</span></label>
              <input className="bf-input" value={form.code_banque}
                onChange={e => set('code_banque', e.target.value)}
                placeholder="Ex: 00005" />
            </div>
            <div className="bf-field">
              <label className="bf-label">Code localité banque</label>
              <input className="bf-input" value={form.code_localite_bnq}
                onChange={e => set('code_localite_bnq', e.target.value)}
                placeholder="Ex: 00101" />
            </div>
          </div>

          {/* Aperçu RIB */}
          {(form.code_banque || form.code_localite_bnq) && (
            <div className="bf-preview">
              <p className="bf-preview-title">Aperçu des codes</p>
              <div className="bf-preview-row">
                <span className="bf-preview-label">Code banque</span>
                <span className="bf-preview-value">{form.code_banque || '—'}</span>
              </div>
              <div className="bf-preview-row">
                <span className="bf-preview-label">Code localité</span>
                <span className="bf-preview-value">{form.code_localite_bnq || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bf-footer">
          <button className="bf-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="bf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="bf-spin" /> Enregistrement...</>
              : <><Save size={14} /> {banque ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}