import React, { useState, useEffect } from 'react'
import {
  X, Plus, Trash2, Building2, Layers, GitBranch,
  GraduationCap, Shield, FileText, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react'
import api from '../services/api'
import '../styles/components/AdminModal.css'

// ── Types ──────────────────────────────────────────────────────────────────

interface RefItem { id: number; label: string; extra?: string }

interface DirectionItem extends RefItem {
  siege?: string
  faritany?: string
}

interface ServiceItem extends RefItem {
  Id_direction?: number
  directionLabel?: string
}

interface AdminData {
  statuts:    RefItem[]
  contrats:   RefItem[]
  directions: DirectionItem[]
  services:   ServiceItem[]
  divisions:  RefItem[]
  diplomes:   RefItem[]
}

type TabKey = keyof AdminData

// ── Config onglets ──────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'statuts',    label: 'Statuts',    icon: <Shield size={15} /> },
  { key: 'contrats',   label: 'Contrats',   icon: <FileText size={15} /> },
  { key: 'directions', label: 'Directions', icon: <Building2 size={15} /> },
  { key: 'services',   label: 'Services',   icon: <Layers size={15} /> },
  { key: 'divisions',  label: 'Divisions',  icon: <GitBranch size={15} /> },
  { key: 'diplomes',   label: 'Diplômes',   icon: <GraduationCap size={15} /> },
]

// ── Style de base ───────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  flex: 1, padding: '8px 12px',
  border: '1px solid #e2e6ef', borderRadius: '8px',
  fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
  color: '#1a1f3c', outline: 'none', background: '#fff',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700,
  color: '#9aa3b5', textTransform: 'uppercase',
  letterSpacing: '0.6px', marginBottom: '5px', display: 'block',
}

// ── Composant principal ─────────────────────────────────────────────────────

export const AdminModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab]   = useState<TabKey>('statuts')
  const [data, setData]             = useState<AdminData>({
    statuts: [], contrats: [], directions: [], services: [], divisions: [], diplomes: [],
  })
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [toast, setToast]           = useState<string | null>(null)

  // ── Champs génériques (statuts, contrats, divisions, diplômes)
  const [newLabel, setNewLabel] = useState('')
  const [newExtra, setNewExtra] = useState('')

  // ── Champs spéciaux : Direction
  const [dirNom,      setDirNom]      = useState('')
  const [dirSigle,    setDirSigle]    = useState('')
  const [dirSiege,    setDirSiege]    = useState('')
  const [dirFaritany, setDirFaritany] = useState('')

  // ── Champs spéciaux : Service
  const [svcNom,       setSvcNom]       = useState('')
  const [svcDirection, setSvcDirection] = useState<number | ''>('')

  // ── Champs spéciaux : Division
  const [divService, setDivService] = useState<number | ''>('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const resetForms = () => {
    setNewLabel(''); setNewExtra('')
    setDirNom(''); setDirSigle(''); setDirSiege(''); setDirFaritany('')
    setSvcNom(''); setSvcDirection('')
    setDivService('')
    setError(null)
  }

  // ── Chargement des données 

  const loadTab = async (tabKey: TabKey) => {
    setLoading(true)
    setError(null)
    try {
      if (tabKey === 'directions') {
        const res = await api.get('/directions')
        const raw: any[] = res.data.data ?? res.data ?? []
        setData(prev => ({
          ...prev,
          directions: raw.map(d => ({
            id:       d.Id_direction,
            label:    d.nom_direction,
            extra:    d.sigle,
            siege:    d.siege,
            faritany: d.faritany,
          })),
        }))

      } else if (tabKey === 'services') {
        // Charger services + directions (pour afficher le nom de la direction)
        const [svcRes, dirRes] = await Promise.all([
          api.get('/services'),
          api.get('/directions'),
        ])
        const rawSvc: any[] = svcRes.data.data ?? svcRes.data ?? []
        const rawDir: any[] = dirRes.data.data ?? dirRes.data ?? []

        // Si les directions ne sont pas encore chargées, on les charge aussi
        setData(prev => ({
          ...prev,
          directions: rawDir.map(d => ({
            id: d.Id_direction, label: d.nom_direction,
            extra: d.sigle, siege: d.siege, faritany: d.faritany,
          })),
          services: rawSvc.map(s => ({
            id:             s.Id_service,
            label:          s.nom_service,
            Id_direction:   s.Id_direction,
            directionLabel: rawDir.find((d: any) => d.Id_direction === s.Id_direction)?.sigle ?? '—',
          })),
        }))

      } else if (tabKey === 'statuts') {
        const res = await api.get('/statuts')
        const raw: any[] = res.data.data ?? res.data ?? []
        setData(prev => ({ ...prev, statuts: raw.map(x => ({ id: x.Id_statut, label: x.type_statut })) }))

      } else if (tabKey === 'contrats') {
        const res = await api.get('/contrats')
        const raw: any[] = res.data.data ?? res.data ?? []
        setData(prev => ({ ...prev, contrats: raw.map(x => ({ id: x.Id_contrat, label: x.type_contrat, extra: x.duree })) }))

      } else if (tabKey === 'divisions') {
        const [divRes, svcRes] = await Promise.all([api.get('/divisions'), api.get('/services')])
        const rawDiv: any[] = divRes.data.data ?? divRes.data ?? []
        const rawSvc: any[] = svcRes.data.data ?? svcRes.data ?? []
        setData(prev => ({
          ...prev,
          divisions: rawDiv.map(x => ({ id: x.Id_division, label: x.Nom_division, extra: x.section, service: x.service })),
          services: rawSvc.map(s => ({ id: s.Id_service, label: s.nom_service, Id_direction: s.Id_direction })),
        }))

      } else if (tabKey === 'diplomes') {
        const res = await api.get('/diplomes')
        const raw: any[] = res.data.data ?? res.data ?? []
        setData(prev => ({ ...prev, diplomes: raw.map(x => ({ id: x.Id_diplome, label: x.nom_diplome, extra: x.specialite })) }))
      }

    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTab(activeTab)
  }, [activeTab])

  // ── Ajout ──────────────────────────────────────────────────────────────────

  const addItem = async () => {
    setSaving(true)
    setError(null)
    try {
      if (activeTab === 'directions') {
        if (!dirNom.trim() || !dirSigle.trim()) {
          setError('Le nom et le sigle sont obligatoires')
          setSaving(false)
          return
        }
        await api.post('/directions', {
          nom_direction: dirNom.trim(),
          sigle:         dirSigle.trim(),
          siege:         dirSiege.trim(),
          faritany:      dirFaritany.trim(),
        })

      } else if (activeTab === 'services') {
        if (!svcNom.trim() || !svcDirection) {
          setError('Le nom et la direction sont obligatoires')
          setSaving(false)
          return
        }
        await api.post('/services', {
          nom_service:  svcNom.trim(),
          Id_direction: Number(svcDirection),
        })

      } else if (activeTab === 'divisions') {
        if (!newLabel.trim() || !divService) {
          setError('Le libellé et le service sont obligatoires')
          setSaving(false)
          return
        }
        await api.post('/divisions', {
          Nom_division: newLabel.trim(),
          section:      newExtra.trim(),
          Id_service:   Number(divService),
        })
      } else {
        if (!newLabel.trim()) {
          setError('Le libellé est obligatoire')
          setSaving(false)
          return
        }
        const payloads: Record<string, Record<string, string>> = {
          statuts:   { type_statut: newLabel.trim() },
          contrats:  { type_contrat: newLabel.trim(), duree: newExtra.trim() },
          diplomes:  { nom_diplome: newLabel.trim(), specialite: newExtra.trim() },
        }
        await api.post(`/${activeTab}`, payloads[activeTab])
      }

      resetForms()
      await loadTab(activeTab)
      showToast('Élément ajouté avec succès')
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        setError(Object.values(validationErrors).flat().join(' | ') as string)
      } else {
        setError(err.response?.data?.message ?? "Erreur lors de l'ajout")
      }
    } finally {
      setSaving(false)
    }
  }

  // ── supression ────────────────────────────────────────────────────────────

  const removeItem = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return
    setDeletingId(id)
    try {
      const endpoints: Record<TabKey, string> = {
        statuts: '/statuts', contrats: '/contrats', directions: '/directions',
        services: '/services', divisions: '/divisions', diplomes: '/diplomes',
      }
      await api.delete(`${endpoints[activeTab]}/${id}`)
      setData(prev => ({ ...prev, [activeTab]: (prev[activeTab] as any[]).filter((i: any) => i.id !== id) }))
      showToast('Élément supprimé')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const items = data[activeTab] as any[]
  const tab   = TABS.find(t => t.key === activeTab)!

  // ── Rendu formulaire d'ajout selon l'onglet ────────────────────────────────

  const renderForm = () => {
    // Direction : nom + sigle + siège + faritany
    if (activeTab === 'directions') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Nom de la direction *</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Direction des Ressources Humaines"
                value={dirNom} onChange={e => setDirNom(e.target.value)}
                disabled={saving} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Sigle *</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }}
                placeholder="Ex: DRH"
                value={dirSigle} onChange={e => setDirSigle(e.target.value.toUpperCase())}
                disabled={saving} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Siège</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Antananarivo"
                value={dirSiege} onChange={e => setDirSiege(e.target.value)}
                disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Faritany</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Analamanga"
                value={dirFaritany} onChange={e => setDirFaritany(e.target.value)}
                disabled={saving} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderAddButton()}
          </div>
        </div>
      )
    }

    // Service : nom + sélection direction
    if (activeTab === 'services') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Nom du service *</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Service Informatique"
                value={svcNom} onChange={e => setSvcNom(e.target.value)}
                disabled={saving} />
            </div>
            <div>
              <label htmlFor="service-direction-select" style={labelStyle}>Direction parente *</label>
              <select
                id="service-direction-select"
                style={{ ...inp, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                value={svcDirection}
                onChange={e => setSvcDirection(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={saving}
                title="Direction parente"
              >
                <option value="">-- Choisir une direction --</option>
                {data.directions.map((d, i) => (
                  <option key={`direction-${d.id ?? i}`} value={d.id}>
                    [{d.extra}] {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderAddButton()}
          </div>
        </div>
      )
    }

    if (activeTab === 'divisions') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Nom de la division *</label>
              <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Division Informatique"
                value={newLabel} onChange={e => setNewLabel(e.target.value)}
                disabled={saving} />
            </div>
            <div>
              <label htmlFor="division-service-select" style={labelStyle}>Service parent *</label>
              <select
                id="division-service-select"
                style={{ ...inp, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                value={divService}
                onChange={e => setDivService(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={saving}
              >
                <option value="">-- Choisir un service --</option>
                {data.services.map((s, i) => (
                  <option key={`service-${s.id ?? i}`} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Section</label>
            <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
              placeholder="Ex: Audit interne"
              value={newExtra} onChange={e => setNewExtra(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              disabled={saving} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderAddButton()}
          </div>
        </div>
      )
    }

    // Génériques : statuts, contrats, diplomes
    const extraLabels: Partial<Record<TabKey, string>> = {
      contrats: 'Durée', diplomes: 'Spécialité',
    }
    const extraLabel = extraLabels[activeTab]
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Libellé *</label>
          <input style={inp}
            placeholder={`Libellé du ${tab.label.replace(/s$/, '').toLowerCase()}...`}
            value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            disabled={saving} />
        </div>
        {extraLabel && (
          <div style={{ width: '160px' }}>
            <label style={labelStyle}>{extraLabel}</label>
            <input style={inp}
              placeholder={extraLabel}
              value={newExtra} onChange={e => setNewExtra(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              disabled={saving} />
          </div>
        )}
        {renderAddButton()}
      </div>
    )
  }

  const renderAddButton = () => (
    <button
      onClick={addItem}
      disabled={saving}
      style={{
        padding: '8px 18px', borderRadius: '8px', border: 'none',
        background: saving ? '#e2e6ef' : '#1a1f3c',
        color: saving ? '#9aa3b5' : '#fff',
        fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer',
        fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: '6px',
        flexShrink: 0, transition: 'all 0.15s', alignSelf: 'flex-end',
        height: '36px',
      }}
    >
      {saving
        ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Ajout...</>
        : <><Plus size={14} /> Ajouter</>
      }
    </button>
  )

  // ── Rendu d'un item de la liste selon l'onglet ─────────────────────────────

  const renderItemMeta = (item: any) => {
    if (activeTab === 'directions') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.extra && (
            <span style={badge('#1a1f3c')}>{item.extra}</span>
          )}
          {item.siege && (
            <span style={badge('#2980b9')}>📍 {item.siege}</span>
          )}
          {item.faritany && (
            <span style={badge('#27ae60')}>🗺 {item.faritany}</span>
          )}
        </div>
      )
    }
    if (activeTab === 'services') {
      return item.directionLabel ? (
        <span style={badge('#8e44ad')}>📂 {item.directionLabel}</span>
      ) : null
    }
    if (activeTab === 'divisions') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.service && <span style={badge('#8e44ad')}>📂 {item.service}</span>}
          {item.extra && <span style={badge('#5a6478')}>{item.extra}</span>}
        </div>
      )
    }
    return item.extra ? (
      <span style={badge('#5a6478')}>{item.extra}</span>
    ) : null
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
        width: 'min(820px, calc(100vw - 48px))', maxWidth: '820px', height: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: '#1a1f3c', padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: 700 }}>
              Administration
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '3px' }}>
              Gérez les données de référence
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} aria-label="Fermer"><X size={16} /></button>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex', background: '#f8f9fc',
          borderBottom: '1px solid #e2e6ef', overflowX: 'auto',
        }}>
          {TABS.map(t => (
            <button key={t.key}
              onClick={() => { setActiveTab(t.key); resetForms() }}
              style={{
                padding: '13px 18px', border: 'none',
                borderBottom: t.key === activeTab ? '3px solid #c0392b' : '3px solid transparent',
                background: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '12.5px', fontWeight: t.key === activeTab ? 700 : 500,
                color: t.key === activeTab ? '#1a1f3c' : '#9aa3b5',
                fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
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

        {/* Corps */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* Erreur */}
          {error && (
            <div style={{
              background: '#fee', border: '1px solid #fbb', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '16px',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} color="#c0392b" style={{ marginTop: '1px', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#c0392b', flex: 1 }}>{error}</p>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '16px' }}>×</button>
            </div>
          )}

          {/* Formulaire ajout */}
          <div style={{
            background: '#f8f9fc', border: '1px solid #e2e6ef',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#9aa3b5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
              Nouveau {tab.label.replace(/s$/, '').toLowerCase()}
            </p>
            {renderForm()}
          </div>

          {/* Liste */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9aa3b5' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>Chargement...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9aa3b5', fontSize: '14px' }}>
              Aucun élément — ajoutez-en un ci-dessus
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item: any, i: number) => (
                <div key={`${activeTab}-${item.id ?? i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', border: '1px solid #e2e6ef',
                    borderRadius: '10px', padding: '12px 16px',
                    opacity: deletingId === item.id ? 0.5 : 1,
                    transition: 'box-shadow 0.15s, opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: '#f0f2f7', color: '#9aa3b5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>

                  <span style={{ color: '#1a1f3c', flexShrink: 0 }}>{tab.icon}</span>

                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#1a1f3c' }}>
                    {item.label}
                  </span>

                  {/* Badges selon l'onglet */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {renderItemMeta(item)}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={deletingId === item.id}
                    style={{
                      width: '30px', height: '30px', borderRadius: '6px',
                      border: '1px solid #c0392b20', background: '#c0392b08',
                      cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                      color: '#c0392b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Supprimer"
                  >
                    {deletingId === item.id
                      ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e2e6ef',
          background: '#f8f9fc', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: '8px',
            border: '1px solid #e2e6ef', background: '#fff',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>Fermer</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#1a1f3c', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 10000,
        }}>
          <CheckCircle2 size={16} color="#27ae60" />
          {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ── Helper badge ────────────────────────────────────────────────────────────
const badge = (color: string): React.CSSProperties => ({
  padding: '2px 10px', borderRadius: '20px',
  background: color + '18', color,
  fontSize: '11px', fontWeight: 600,
})