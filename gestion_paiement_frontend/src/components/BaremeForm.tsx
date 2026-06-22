import React, { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { BaremePayload, BaremeFromAPI } from '../services/baremeService'
import '../styles/pages/BaremePage.css'

interface BaremeFormProps {
  bareme?: BaremeFromAPI | null
  onSave:  (data: BaremePayload) => Promise<void>
  onClose: () => void
}

const EMPTY: BaremePayload = {
  Indice: 0, salaire_base: 0, salaire_mensuel: 0,
  anciennete: 0, DIF: 0, rappell: 0,
}

const NumField = React.memo<{
  label: string;
  field: keyof BaremePayload;
  value: number;
  onChange: (field: keyof BaremePayload, val: string) => void;
  required?: boolean;
  hint?: string;
}>(({ label, field, value, onChange, required = false, hint = '' }) => {
  
  // Afficher vide quand la valeur est 0 → comportement naturel
  const displayValue = value === 0 ? '' : String(value);

  return (
    <div className="brf-field">
      <label className="brf-label">
        {label}{required && <span className="brf-required"> *</span>}
      </label>
      <input
        type="number"
        className="brf-input"
        value={displayValue}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
      />
      {hint && <span className="brf-hint">{hint}</span>}
    </div>
  );
});

NumField.displayName = 'NumField';

export const BaremeForm: React.FC<BaremeFormProps> = ({ bareme, onSave, onClose }) => {
  const [form, setForm]   = useState<BaremePayload>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (bareme) {
      setForm({
        Indice:          bareme.Indice,
        salaire_base:    Number(bareme.salaire_base),
        salaire_mensuel: Number(bareme.salaire_mensuel),
        anciennete:      bareme.anciennete,
        DIF:             Number(bareme.DIF),
        rappell:         Number(bareme.rappell),
      })
    } else {
      setForm({ ...EMPTY })
    }
  }, [bareme])

  const setNum = (key: keyof BaremePayload, val: string) =>
    setForm(prev => ({ ...prev, [key]: val === '' ? 0 : parseFloat(val) || 0 }))

  const handleSubmit = async () => {
    if (!form.Indice) { setError('L\'indice est obligatoire'); return }
    if (!form.salaire_base) { setError('Le salaire de base est obligatoire'); return }
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
  const handleNumChange = useCallback((key: keyof BaremePayload, val: string) => {
    setForm(prev => ({
      ...prev,
      [key]: val === '' ? 0 : parseFloat(val) || 0
    }));
  }, []);

  // Salaire mensuel total calculé pour aperçu
  const totalMensuel = form.salaire_base + form.anciennete + form.DIF + form.rappell


  return (
    <div className="brf-overlay">
      <div className="brf-modal">

        {/* Header */}
        <div className="brf-header">
          <div>
            <h2 className="brf-header-title">{bareme ? 'Modifier le barème' : 'Nouveau barème'}</h2>
            <p className="brf-header-sub">
              {bareme ? `Barème #${bareme.Id_bareme} — Indice ${bareme.Indice}` : 'Renseigner les données du barème'}
            </p>
          </div>
          <button className="brf-close-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        {error && (
          <div className="brf-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="brf-body">

          {/* Indice */}
          <div className="brf-section">
            <p className="brf-section-title">Identification</p>
            <NumField label="Indice" field="Indice" value={form.Indice} onChange={handleNumChange} required hint="Identifiant unique du barème (ex: 350)" />
          </div>

          {/* Salaires */}
          <div className="brf-section">
            <p className="brf-section-title">Éléments de salaire</p>
            <div className="brf-grid-2">
              <NumField label="Salaire de base"   field="salaire_base" value={form.salaire_base} onChange={handleNumChange} required hint="Salaire brut de référence (Ar)" />
              {/* <NumField label="Salaire mensuel"   field="salaire_mensuel" value={form.salaire_mensuel} onChange={handleNumChange} hint="Salaire mensuel total (Ar)" /> */}
              <NumField label="Ancienneté"         field="anciennete"      value={form.anciennete} onChange={handleNumChange} hint="Prime d'ancienneté (Ar)" />
              <NumField label="DIF"                field="DIF"             value={form.DIF} onChange={handleNumChange} hint="Droit individuel à la formation (Ar)" />
              <NumField label="Rappel (rappell)"   field="rappell"         value={form.rappell} onChange={handleNumChange} hint="Montant de rappel (Ar)" />
            </div>
          </div>

          {/* Aperçu */}
          {form.Indice > 0 && (
            <div className="brf-preview">
              <p className="brf-preview-title">Aperçu du barème</p>
              <div className="brf-preview-rows">
                {[
                  { label: 'Indice',           value: form.Indice,          mono: true },
                  { label: 'Salaire de base',  value: form.salaire_base,    money: true },
                 // { label: 'Salaire mensuel',  value: form.salaire_mensuel, money: true },
                  { label: 'Ancienneté',        value: form.anciennete,      money: true },
                  { label: 'DIF',               value: form.DIF,             money: true },
                  { label: 'Rappel',            value: form.rappell,         money: true },
                ].map(({ label, value, money, mono }) => (
                  <div key={label} className="brf-preview-row">
                    <span className="brf-preview-label">{label}</span>
                    <span className={`brf-preview-value ${mono ? 'mono' : ''}`}>
                      {money ? `${Number(value).toLocaleString('fr-MG')} Ar` : value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="brf-total">
                <span>Total estimé</span>
                <span className="brf-total-amount">{totalMensuel.toLocaleString('fr-MG')} Ar</span>
              </div>
            </div>
          )}
        </div>

        <div className="brf-footer">
          <button className="brf-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="brf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="brf-spin" /> Enregistrement...</>
              : <><Save size={14} /> {bareme ? 'Modifier' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}