import React, { useState, useMemo } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, Filter, Download, X } from 'lucide-react'
import type { Agent, AgentFormData } from '../types/agent'
import { agents as initialAgents, statuts } from '../data/agentsData'
import { AgentForm } from '../components/AgentForm'

const STATUT_COLORS: Record<string, { bg: string; color: string }> = {
  Fonctionnaire: { bg: '#1a1f3c18', color: '#1a1f3c' },
  Contractuel:   { bg: '#27ae6018', color: '#27ae60' },
  Stagiaire:     { bg: '#f39c1218', color: '#d68910' },
  Vacataire:     { bg: '#c0392b18', color: '#c0392b' },
}

export const AgentsPage: React.FC = () => {
  const [agentsList, setAgentsList] = useState<Agent[]>(initialAgents)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<number | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [viewAgent, setViewAgent] = useState<Agent | null>(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // Filtrage
  const filtered = useMemo(() => {
    return agentsList.filter(a => {
      const q = search.toLowerCase()
      const matchSearch =
        a.nom.toLowerCase().includes(q) ||
        a.prenoms.toLowerCase().includes(q) ||
        a.num_matricule.toLowerCase().includes(q) ||
        (a.N_CIN ?? '').includes(q)
      const matchStatut = filterStatut === '' || a.Id_statut === Number(filterStatut)
      return matchSearch && matchStatut
    })
  }, [agentsList, search, filterStatut])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const handleSave = (data: AgentFormData) => {
    if (editAgent) {
      setAgentsList(prev => prev.map(a =>
        a.id_agents === editAgent.id_agents ? { ...a, ...data } : a
      ))
    } else {
      const newId = Math.max(...agentsList.map(a => a.id_agents)) + 1
      setAgentsList(prev => [...prev, { ...data, id_agents: newId }])
    }
    setShowForm(false)
    setEditAgent(null)
  }

  const handleDelete = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cet agent ?')) {
      setAgentsList(prev => prev.filter(a => a.id_agents !== id))
    }
  }

  const openEdit = (agent: Agent) => {
    setEditAgent(agent)
    setShowForm(true)
  }

  const openAdd = () => {
    setEditAgent(null)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--instat-dark)', marginBottom: '4px' }}>
            Agents
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--instat-gray-400)' }}>
            {agentsList.length} agents enregistrés · {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '9px 16px', borderRadius: '8px',
            border: '1px solid var(--instat-gray-200)',
            background: '#fff', fontSize: '13px',
            color: 'var(--instat-gray-600)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <Download size={14} /> Exporter
          </button>
          <button
            onClick={openAdd}
            style={{
              padding: '9px 18px', borderRadius: '8px',
              border: 'none', background: 'var(--instat-dark)',
              color: '#fff', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            }}>
            <Plus size={15} /> Nouvel agent
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--instat-gray-200)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--instat-gray-400)',
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, CIN..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              border: '1px solid var(--instat-gray-200)',
              borderRadius: '8px', fontSize: '13px',
              color: 'var(--instat-dark)', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--instat-gray-400)" />
          <select
            value={filterStatut}
            onChange={e => { setFilterStatut(e.target.value === '' ? '' : Number(e.target.value)); setPage(1) }}
            style={{
              padding: '9px 12px', border: '1px solid var(--instat-gray-200)',
              borderRadius: '8px', fontSize: '13px', color: 'var(--instat-dark)',
              outline: 'none', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
            }}
          >
            <option value="">Tous les statuts</option>
            {statuts.map(s => (
              <option key={s.Id_statut} value={s.Id_statut}>{s.type_statut}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--instat-gray-200)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--instat-gray-50)', borderBottom: '1px solid var(--instat-gray-200)' }}>
              {['Matricule', 'Nom & Prénoms', 'CIN', 'Direction', 'Service', 'Statut', 'Tél', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '11px', fontWeight: 700,
                  color: 'var(--instat-gray-400)',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--instat-gray-400)', fontSize: '14px' }}>
                  Aucun agent trouvé
                </td>
              </tr>
            ) : paginated.map((agent, i) => {
              const statutInfo = agent.statut?.type_statut
              const colors = statutInfo ? STATUT_COLORS[statutInfo] : { bg: '#f0f0f0', color: '#666' }
              return (
                <tr
                  key={agent.id_agents}
                  style={{
                    borderBottom: '1px solid var(--instat-gray-100)',
                    background: i % 2 === 0 ? '#fff' : 'var(--instat-gray-50)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f4ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : 'var(--instat-gray-50)'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '12px', fontWeight: 600,
                      color: 'var(--instat-dark)',
                      background: 'var(--instat-gray-100)',
                      padding: '3px 8px', borderRadius: '4px',
                    }}>{agent.num_matricule}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--instat-dark)' }}>
                      {agent.civilite} {agent.nom}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--instat-gray-400)' }}>{agent.prenoms}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--instat-gray-600)', fontFamily: 'DM Mono, monospace' }}>
                    {agent.N_CIN ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--instat-gray-600)' }}>
                    {agent.direction?.Sigle ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--instat-gray-600)' }}>
                    {agent.service?.Nom_service ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {statutInfo ? (
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: 600,
                        background: colors.bg, color: colors.color,
                      }}>{statutInfo}</span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--instat-gray-600)' }}>
                    {agent.tel ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setViewAgent(agent)}
                        title="Voir"
                        style={{
                          width: '30px', height: '30px', borderRadius: '6px',
                          border: '1px solid var(--instat-gray-200)',
                          background: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--instat-gray-600)',
                        }}>
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(agent)}
                        title="Modifier"
                        style={{
                          width: '30px', height: '30px', borderRadius: '6px',
                          border: '1px solid #2980b920',
                          background: '#2980b910', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#2980b9',
                        }}>
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id_agents)}
                        title="Supprimer"
                        style={{
                          width: '30px', height: '30px', borderRadius: '6px',
                          border: '1px solid #c0392b20',
                          background: '#c0392b10', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--instat-red)',
                        }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--instat-gray-200)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--instat-gray-50)',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--instat-gray-400)' }}>
              Page {page} sur {totalPages} · {filtered.length} résultats
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: '1px solid',
                  borderColor: p === page ? 'var(--instat-dark)' : 'var(--instat-gray-200)',
                  background: p === page ? 'var(--instat-dark)' : '#fff',
                  color: p === page ? '#fff' : 'var(--instat-gray-600)',
                  fontSize: '12px', cursor: 'pointer', fontWeight: p === page ? 700 : 400,
                  fontFamily: 'DM Sans, sans-serif',
                }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal fiche agent */}
      {viewAgent && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '560px', overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          }}>
            {/* Header fiche */}
            <div style={{ background: 'var(--instat-dark)', padding: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, color: '#fff',
                }}>
                  {viewAgent.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    {viewAgent.civilite} {viewAgent.nom} {viewAgent.prenoms}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                    {viewAgent.num_matricule} · {viewAgent.statut?.type_statut}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewAgent(null)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}><X size={16} /></button>
            </div>

            {/* Détails */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'CIN', value: viewAgent.N_CIN },
                { label: 'Date de naissance', value: viewAgent.date_de_naissance },
                { label: 'Date entrée admin', value: viewAgent.date_entree_admin },
                { label: 'Téléphone', value: viewAgent.tel },
                { label: 'Adresse', value: viewAgent.adresse },
                { label: 'Direction', value: viewAgent.direction?.Nom_Direction },
                { label: 'Service', value: viewAgent.service?.Nom_service },
                { label: 'Division', value: viewAgent.division?.nom_division },
                { label: 'Contrat', value: viewAgent.contrat?.type_contrat },
                { label: 'Lieu délivrance CIN', value: viewAgent.lieu_delivrance_CI },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--instat-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--instat-dark)', fontWeight: 500 }}>{value ?? '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--instat-gray-200)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => { setViewAgent(null); openEdit(viewAgent) }} style={{
                padding: '9px 18px', borderRadius: '8px',
                border: 'none', background: 'var(--instat-dark)',
                color: '#fff', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire ajout/modification */}
      {showForm && (
        <AgentForm
          agent={editAgent}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditAgent(null) }}
        />
      )}
    </div>
  )
}