import React, { useState } from 'react'
import {
  X, Plus, Trash2, Save, Shield, FileText,
  Building2, Layers, GitBranch, GraduationCap, Baby
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface RefItem { id: number; label: string; extra?: string }

interface AdminData {
  statuts:    RefItem[]
  contrats:   RefItem[]
  directions: RefItem[]
  services:   RefItem[]
  divisions:  RefItem[]
  diplomes:   RefItem[]
}

type TabKey = keyof AdminData

// ── Onglets config ──────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode; extraLabel?: string }[] = [
  { key: 'statuts',    label: 'Statuts',     icon: <Shield size={15} /> },
  { key: 'contrats',   label: 'Contrats',    icon: <FileText size={15} />, extraLabel: 'Durée' },
  { key: 'directions', label: 'Directions',  icon: <Building2 size={15} />, extraLabel: 'Sigle' },
  { key: 'services',   label: 'Services',    icon: <Layers size={15} /> },
  { key: 'divisions',  label: 'Divisions',   icon: <GitBranch size={15} />, extraLabel: 'Section' },
  { key: 'diplomes',   label: 'Diplômes',    icon: <GraduationCap size={15} />, extraLabel: 'Spécialité' },
]

// ── Données initiales ───────────────────────────────────────────────────────

const INITIAL: AdminData = {
  statuts:    [
    { id: 1, label: 'Fonctionnaire' },
    { id: 2, label: 'Contractuel' },
    { id: 3, label: 'Stagiaire' },
    { id: 4, label: 'Vacataire' },
  ],
  contrats:   [
    { id: 1, label: 'CDI',     extra: 'Indéterminée' },
    { id: 2, label: 'CDD',     extra: '12 mois' },
    { id: 3, label: 'Stage',   extra: '6 mois' },
    { id: 4, label: 'Vacation',extra: '3 mois' },
  ],
  directions: [
    { id: 1, label: 'Direction Générale',                      extra: 'DG' },
    { id: 2, label: "Direction des Systèmes d'Information",    extra: 'DSI' },
    { id: 3, label: 'Direction des Ressources Humaines',       extra: 'DRH' },
    { id: 4, label: 'Direction des Statistiques Économiques',  extra: 'DISE' },
    { id: 5, label: 'Direction Financière',                    extra: 'DF' },
  ],
  services: [
    { id: 1, label: 'Service Informatique' },
    { id: 2, label: 'Service Réseau' },
    { id: 3, label: 'Service Recrutement' },
    { id: 4, label: 'Service Paie' },
    { id: 5, label: 'Service Comptabilité' },
    { id: 6, label: 'Service Statistiques' },
  ],
  divisions: [
    { id: 1, label: 'Division Développement', extra: 'Web' },
    { id: 2, label: 'Division Infrastructure', extra: 'Serveurs' },
    { id: 3, label: 'Division Administration RH', extra: 'Gestion' },
    { id: 4, label: 'Division Traitement Paie', extra: 'Calcul' },
  ],
  diplomes: [
    { id: 1, label: 'Baccalauréat',  extra: '' },
    { id: 2, label: 'Licence',       extra: '' },
    { id: 3, label: 'Master',        extra: '' },
    { id: 4, label: 'Doctorat',      extra: '' },
  ],
}

// ── Styles communs ──────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  flex: 1, padding: '8px 12px',
  border: '1px solid #e2e6ef', borderRadius: '8px',
  fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
  color: '#1a1f3c', outline: 'none', background: '#fff',
}

// ── Composant principal ─────────────────────────────────────────────────────

export const AdminModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('statuts')
  const [data, setData] = useState<AdminData>(INITIAL)
  const [newLabel, setNewLabel] = useState('')
  const [newExtra, setNewExtra] = useState('')
  const [saved, setSaved] = useState(false)

  const tab = TABS.find(t => t.key === activeTab)!
  const items = data[activeTab]

  const addItem = () => {
    if (!newLabel.trim()) return
    const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
    setData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { id: newId, label: newLabel.trim(), extra: newExtra.trim() || undefined }],
    }))
    setNewLabel('')
    setNewExtra('')
  }

  const removeItem = (id: number) => {
    setData(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) }))
  }

  const handleSave = () => {
    // Ici : appel API futur
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '780px', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: '#1a1f3c', padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: 700 }}>
              Administration — Référentiels
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '3px' }}>
              Gérez les données de référence du SIRH · Mise à jour complète à venir
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              🚧 VERSION BÊTA
            </span>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
              width: '32px', height: '32px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><X size={16} /></button>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div style={{
          display: 'flex', background: '#f8f9fc',
          borderBottom: '1px solid #e2e6ef',
          overflowX: 'auto',
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setNewLabel(''); setNewExtra('') }}
              style={{
                padding: '13px 18px', border: 'none',
                borderBottom: t.key === activeTab ? '3px solid #c0392b' : '3px solid transparent',
                background: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '12.5px', fontWeight: t.key === activeTab ? 700 : 500,
                color: t.key === activeTab ? '#1a1f3c' : '#9aa3b5',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >
              {t.icon} {t.label}
              <span style={{
                background: t.key === activeTab ? '#1a1f3c' : '#e2e6ef',
                color: t.key === activeTab ? '#fff' : '#9aa3b5',
                fontSize: '10px', fontWeight: 700,
                padding: '1px 7px', borderRadius: '20px',
              }}>
                {data[t.key].length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Corps ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* Formulaire ajout */}
          <div style={{
            background: '#f8f9fc', border: '1px solid #e2e6ef',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#9aa3b5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Nouveau {tab.label.replace(/s$/, '').toLowerCase()}
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                style={inp}
                placeholder={`Libellé du ${tab.label.replace(/s$/, '').toLowerCase()}...`}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
              />
              {tab.extraLabel && (
                <input
                  style={{ ...inp, flex: '0 0 160px' }}
                  placeholder={tab.extraLabel}
                  value={newExtra}
                  onChange={e => setNewExtra(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                />
              )}
              <button
                onClick={addItem}
                disabled={!newLabel.trim()}
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  border: 'none',
                  background: newLabel.trim() ? '#1a1f3c' : '#e2e6ef',
                  color: newLabel.trim() ? '#fff' : '#9aa3b5',
                  fontSize: '13px', cursor: newLabel.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {/* Liste des éléments */}
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9aa3b5', fontSize: '14px' }}>
              Aucun élément — ajoutez-en un ci-dessus
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', border: '1px solid #e2e6ef',
                    borderRadius: '10px', padding: '12px 16px',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  {/* Numéro */}
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: '#f0f2f7', color: '#9aa3b5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>

                  {/* Icône onglet */}
                  <span style={{ color: '#1a1f3c', flexShrink: 0 }}>{tab.icon}</span>

                  {/* Label */}
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#1a1f3c' }}>
                    {item.label}
                  </span>

                  {/* Extra (sigle, durée, section...) */}
                  {item.extra && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px',
                      background: '#f0f2f7', color: '#5a6478',
                      fontSize: '11px', fontWeight: 600,
                    }}>
                      {item.extra}
                    </span>
                  )}

                  {/* Supprimer */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '6px',
                      border: '1px solid #c0392b20', background: '#c0392b08',
                      cursor: 'pointer', color: '#c0392b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  ><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e2e6ef',
          background: '#f8f9fc', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#9aa3b5' }}>
            💡 Les modifications seront disponibles dans tous les formulaires
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: '8px',
              border: '1px solid #e2e6ef', background: '#fff',
              fontSize: '13px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}>Fermer</button>
            <button onClick={handleSave} style={{
              padding: '9px 24px', borderRadius: '8px',
              border: 'none',
              background: saved ? '#27ae60' : '#1a1f3c',
              color: '#fff', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.3s',
            }}>
              <Save size={14} />
              {saved ? '✓ Enregistré !' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}