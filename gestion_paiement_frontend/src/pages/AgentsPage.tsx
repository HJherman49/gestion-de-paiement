import React, { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, Filter, Download, X, Phone, MapPin, Calendar, CreditCard, Building2, Layers, GitBranch, GraduationCap, Baby, Shield, FileText, ChevronRight, User, Mail } from 'lucide-react'
import type { Agent, AgentFormData, Statut } from '../types/agent'
import { AgentForm } from '../components/AgentForm'
import { getAgents, getStatuts, createAgent, updateAgent, deleteAgent } from '../services/agentService'
import api from '../services/api'
import '../styles/pages/AgentsPage.css'


const STATUT_CLASSES: Record<string, string> = {
  Fonctionnaire: 'badge-fonctionnaire',
  Contractuel:   'badge-contractuel',
  Stagiaire:     'badge-stagiaire',
  Vacataire:     'badge-vacataire',
}

export const AgentsPage: React.FC = () => {
  const [agentsList, setAgentsList] = useState<Agent[]>([])
  const [statutes, setStatutes]     = useState<Statut[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatut, setFilterStatut] = useState<number | ''>('')
  const [showForm, setShowForm]     = useState(false)
  const [editAgent, setEditAgent]   = useState<Agent | null>(null)
  const [viewAgent, setViewAgent]   = useState<Agent | null>(null)
  const [page, setPage]             = useState(1)
  const [agentEnfants, setAgentEnfants] = useState<any[]>([])
  const [loadingEnfants, setLoadingEnfants] = useState(false)
  const [activeTab, setActiveTab]   = useState<'infos' | 'enfants' | 'affectation'>('infos')
  const PER_PAGE = 10

  // ── Chargement agents 
  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await getAgents({
        search:    search || undefined,
        Id_statut: filterStatut || undefined,
      })
      setAgentsList(response.data.data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des agents:', error)
      alert('Impossible de charger les agents. Vérifiez que le serveur Laravel est démarré.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAgents() }, [search, filterStatut])

  // ── Charger les enfants d'un agent 
  const loadEnfants = async (agentId: number) => {
    setLoadingEnfants(true)
    setAgentEnfants([])
    try {
      const res = await api.get(`/agents/${agentId}/enfants`)
      setAgentEnfants(res.data.data ?? res.data ?? [])
    } catch {
      setAgentEnfants([])
    } finally {
      setLoadingEnfants(false)
    }
  }

  // ── Chargement statuts 
  useEffect(() => {
    const loadStatutes = async () => {
      try {
        const response = await getStatuts()
        setStatutes(response.data.data || response.data || [])
      } catch (error: any) {
        console.error('Erreur lors du chargement des statuts:', error)
      }
    }
    loadStatutes()
  }, [])

  // ── Filtrage local + pagination 
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

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  // ── Sauvegarde 
  const handleSave = async (data: AgentFormData) => {
    try {
      let savedAgent: any = null
      if (editAgent) {
        const res = await updateAgent(editAgent.Id_agent, data)
        savedAgent = res.data.data ?? res.data
        alert('Agent modifié avec succès')
      } else {
        const res = await createAgent(data)
        savedAgent = res.data.data ?? res.data
        alert('Agent créé avec succès')
      }
      loadAgents()
      setShowForm(false)
      setEditAgent(null)
      return savedAgent
    } catch (error: any) {
      console.error(error)
      const validationErrors = error.response?.data?.errors
      if (validationErrors) {
        const messages = Object.entries(validationErrors)
          .map(([field, msgs]) => `• ${field} : ${(msgs as string[]).join(', ')}`)
          .join('\n')
        alert('Erreurs de validation :\n' + messages)
      } else {
        alert(error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement")
      }
      throw error
    }
  }

  // ── Suppression 
  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet agent ?')) return
    try {
      await deleteAgent(id)
      alert('Agent supprimé avec succès')
      loadAgents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const openEdit = (agent: Agent) => { setEditAgent(agent); setShowForm(true) }
  const openAdd  = () => { setEditAgent(null); setShowForm(true) }

  const openView = (agent: Agent) => {
    setViewAgent(agent)
    setActiveTab('infos')
    loadEnfants(agent.Id_agent)
  }


  // Ajoute cette fonction juste avant le return (après les autres fonctions)
const calculateYearsOfService = (dateEntree?: string): string => {
  if (!dateEntree) return '—';
  
  const entryDate = new Date(dateEntree);
  const today = new Date();
  
  let years = today.getFullYear() - entryDate.getFullYear();
  const monthDiff = today.getMonth() - entryDate.getMonth();
  
  // Ajustement si on n'a pas encore passé l'anniversaire de l'entrée
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < entryDate.getDate())) {
    years--;
  }
  
  return years > 0 ? `${years} an${years > 1 ? 's' : ''}` : 'Moins d\'un an';
  };


  return (
    <div className="ap-page">

      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Agents</h1>
          <p className="ap-subtitle">
            {agentsList.length} agents enregistrés · {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="ap-header-actions">
          <button className="ap-btn-secondary">
            <Download size={14} /> Exporter
          </button>
          <button className="ap-btn-primary" onClick={openAdd}>
            <Plus size={15} /> Nouvel agent
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="ap-filters">
        <div className="ap-search-box">
          <Search className="ap-search-icon" size={14} />
          <input
            type="text"
            className="ap-search-input"
            placeholder="Rechercher par nom, matricule, CIN..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="ap-filter-select">
          <Filter size={14} color="var(--instat-gray-400)" />
          <select
            value={filterStatut}
            onChange={e => { setFilterStatut(e.target.value === '' ? '' : Number(e.target.value)); setPage(1) }}
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            {statutes.map(s => (
              <option key={s.Id_statut} value={s.Id_statut}>{s.type_statut}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="ap-table-wrapper">
        <table className="ap-table">
          <thead>
            <tr>
              {['Matricule', 'Nom & Prénoms', 'CIN', 'Direction', 'Service', 'Statut', 'Tél', 'Actions','Années de service'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="ap-empty">
                  <span className="ap-spinner" /> Chargement...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="ap-empty">Aucun agent trouvé</td>
              </tr>
            ) : paginated.map((agent, i) => {
              const statutInfo = agent.statut?.type_statut
              const badgeClass = statutInfo ? (STATUT_CLASSES[statutInfo] ?? 'badge-default') : ''
              return (
                <tr
                  key={agent.Id_agent}
                  className={`ap-row ${i % 2 === 0 ? 'ap-row-even' : 'ap-row-odd'}`}
                >
                  <td><span className="ap-matricule">{agent.num_matricule}</span></td>
                  <td>
                    <div className="ap-agent-name">{agent.civilite} {agent.nom}</div>
                    <div className="ap-agent-prenoms">{agent.prenoms}</div>
                  </td>
                  <td className="ap-cell-mono">{agent.N_CIN ?? '—'}</td>
                  <td className="ap-cell-gray">{agent.direction?.sigle ?? '—'}</td>
                  <td className="ap-cell-gray">{agent.service?.nom_service ?? '—'}</td>
                  <td>
                    {statutInfo
                      ? <span className={`ap-badge ${badgeClass}`}>{statutInfo}</span>
                      : '—'}
                  </td>
                  <td className="ap-cell-gray">{agent.tel ?? '—'}</td>
                  <td>
                    <div className="ap-actions">
                      <button className="ap-icon-btn" title="Voir" onClick={() => openView(agent)}>
                        <Eye size={13} />
                      </button>
                      <button className="ap-icon-btn ap-icon-btn--edit" title="Modifier" onClick={() => openEdit(agent)}>
                        <Pencil size={13} />
                      </button>
                      <button className="ap-icon-btn ap-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(agent.Id_agent)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                  {/* Nouvelle colonne pour les années de service */}
                  <td className="ap-cell-gray ap-years-service">
                    <strong>{calculateYearsOfService(agent.date_entree_admin)}</strong>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ap-pagination">
            <span className="ap-pagination-info">
              Page {page} sur {totalPages} · {filtered.length} résultats
            </span>
            <div className="ap-pagination-buttons">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`ap-page-btn ${p === page ? 'active' : ''}`}
                  aria-label={`Aller à la page ${p}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal fiche agent  */}
      {viewAgent && (
        <div className="ap-modal-overlay">
          <div className="ap-modal ap-modal--large">

            {/* Header avec avatar et infos principales */}
            <div className="ap-modal-header-v2">
              <div className="ap-modal-avatar-v2">
                {viewAgent.nom.charAt(0)}{viewAgent.prenoms.charAt(0)}
              </div>
              <div className="ap-modal-identity">
                <div className="ap-modal-fullname">
                  {viewAgent.civilite} {viewAgent.nom} {viewAgent.prenoms}
                </div>
                <div className="ap-modal-matricule">
                  <CreditCard size={12} /> {viewAgent.num_matricule}
                </div>
                <div className="ap-modal-badges">
                  {viewAgent.statut && (
                    <span className={`ap-badge ${STATUT_CLASSES[viewAgent.statut.type_statut] ?? 'badge-default'}`}>
                      {viewAgent.statut.type_statut}
                    </span>
                  )}
                  {viewAgent.contrat && (
                    <span className="ap-badge-contrat">{viewAgent.contrat.type_contrat}</span>
                  )}
                  <span className="ap-badge-sexe">{viewAgent.sexe === 'M' ? '♂ Homme' : '♀ Femme'}</span>
                </div>
              </div>
              <button className="ap-modal-close" onClick={() => setViewAgent(null)} title="Fermer">
                <X size={16} />
              </button>
            </div>

            {/* Onglets */}
            <div className="ap-modal-tabs">
              {[
                { key: 'infos',      label: 'Informations', icon: <Shield size={13} /> },
                { key: 'affectation',label: 'Affectation',  icon: <Building2 size={13} /> },
                { key: 'enfants',    label: 'Enfants',      icon: <Baby size={13} /> },
              ].map(t => (
                <button
                  key={t.key}
                  className={`ap-modal-tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key as any)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Corps */}
            <div className="ap-modal-body-v2">

              {/* ── ONGLET INFOS ── */}
              {activeTab === 'infos' && (
                <div className="ap-modal-sections">
                  {/* Identité */}
                  <div className="ap-modal-section">
                    <p className="ap-modal-section-title"><User size={13} /> Identité</p>
                    <div className="ap-modal-grid-3">
                      {[
                        { label: 'Date de naissance',    value: viewAgent.date_naissance,   icon: <Calendar size={11} /> },
                        { label: 'CIN',                   value: viewAgent.N_CIN,             icon: <CreditCard size={11} /> },
                        { label: 'Date délivrance CIN',   value: viewAgent.date_delivrance_CI },
                        { label: 'Lieu délivrance CIN',   value: viewAgent.lieu_delivrance_CI },
                        { label: 'Téléphone',             value: viewAgent.tel,               icon: <Phone size={11} /> },
                        { label: 'Email',                 value: viewAgent.mail,              icon: <Mail size={11} /> },
                        { label: 'Adresse',               value: viewAgent.adresse,           icon: <MapPin size={11} />, full: true },
                      ].map(({ label, value, icon, full }) => (
                        <div key={label} className={`ap-modal-field-v2 ${full ? 'ap-modal-field-v2--full' : ''}`}>
                          <div className="ap-modal-field-label-v2">{icon && <span>{icon}</span>}{label}</div>
                          <div className="ap-modal-field-value-v2">{value ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Administratif */}
                  <div className="ap-modal-section">
                    <p className="ap-modal-section-title"><FileText size={13} /> Administratif</p>
                    <div className="ap-modal-grid-3">
                      {[
                        { label: 'Date entrée administration', value: viewAgent.date_entree_admin, icon: <Calendar size={11} /> },
                        { label: 'Statut',                      value: viewAgent.statut?.type_statut },
                        { label: 'Type de contrat',             value: viewAgent.contrat?.type_contrat },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="ap-modal-field-v2">
                          <div className="ap-modal-field-label-v2">{icon && <span>{icon}</span>}{label}</div>
                          <div className="ap-modal-field-value-v2">{value ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ONGLET AFFECTATION ── */}
              {activeTab === 'affectation' && (
                <div className="ap-modal-sections">
                  <div className="ap-modal-section">
                    <p className="ap-modal-section-title"><Building2 size={13} /> Affectation organisationnelle</p>

                    {/* Breadcrumb direction → service → division */}
                    <div className="ap-modal-breadcrumb">
                      <div className="ap-modal-bc-item ap-modal-bc-item--direction">
                        <div className="ap-modal-bc-icon"><Building2 size={16} /></div>
                        <div>
                          <div className="ap-modal-bc-label">Direction</div>
                          <div className="ap-modal-bc-value">
                            {viewAgent.direction?.nom_direction ?? '—'}
                          </div>
                          {viewAgent.direction?.sigle && (
                            <div className="ap-modal-bc-sigle">[{viewAgent.direction.sigle}]</div>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="ap-modal-bc-sep" />
                      <div className="ap-modal-bc-item ap-modal-bc-item--service">
                        <div className="ap-modal-bc-icon"><Layers size={16} /></div>
                        <div>
                          <div className="ap-modal-bc-label">Service</div>
                          <div className="ap-modal-bc-value">{viewAgent.service?.nom_service ?? '—'}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="ap-modal-bc-sep" />
                      <div className="ap-modal-bc-item ap-modal-bc-item--division">
                        <div className="ap-modal-bc-icon"><GitBranch size={16} /></div>
                        <div>
                          <div className="ap-modal-bc-label">Division</div>
                          <div className="ap-modal-bc-value">{viewAgent.division?.Nom_division ?? '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ONGLET ENFANTS ── */}
              {activeTab === 'enfants' && (
                <div className="ap-modal-sections">
                  <div className="ap-modal-section">
                    <p className="ap-modal-section-title"><Baby size={13} /> Enfants à charge</p>

                    {loadingEnfants ? (
                      <div className="ap-modal-loading">
                        <span className="ap-spinner" /> Chargement des enfants...
                      </div>
                    ) : agentEnfants.length === 0 ? (
                      <div className="ap-modal-empty">
                        <Baby size={32} style={{ color: 'var(--instat-gray-300)', marginBottom: 8 }} />
                        <p>Aucun enfant enregistré pour cet agent</p>
                      </div>
                    ) : (
                      <>
                        {/* Compteurs */}
                        <div className="ap-enfants-stats">
                          <div className="ap-enfants-stat">
                            <span className="ap-enfants-stat-num">{agentEnfants[0]?.Nb_enf ?? agentEnfants.length}</span>
                            <span className="ap-enfants-stat-label">Total</span>
                          </div>
                          <div className="ap-enfants-stat ap-enfants-stat--inf">
                            <span className="ap-enfants-stat-num">{agentEnfants[0]?.Nb_enf_inf_15ans ?? '—'}</span>
                            <span className="ap-enfants-stat-label">{"< 15 ans"}</span>
                          </div>
                          <div className="ap-enfants-stat ap-enfants-stat--sup">
                            <span className="ap-enfants-stat-num">{agentEnfants[0]?.Nb_enf_sup_15ans ?? '—'}</span>
                            <span className="ap-enfants-stat-label">{"≥ 15 ans"}</span>
                          </div>
                        </div>

                        {/* Liste des enfants */}
                        <div className="ap-enfants-list">
                          {agentEnfants.map((enfant: any, idx: number) => {
                            const age = enfant.date_de_naissance
                              ? new Date().getFullYear() - new Date(enfant.date_de_naissance).getFullYear()
                              : null
                            return (
                              <div key={enfant.Id_enfant ?? idx} className="ap-enfant-card">
                                <div className="ap-enfant-num">{idx + 1}</div>
                                <div className="ap-enfant-info">
                                  <div className="ap-enfant-date">
                                    <Calendar size={11} />
                                    {enfant.date_de_naissance
                                      ? new Date(enfant.date_de_naissance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                      : '—'}
                                  </div>
                                  {age !== null && (
                                    <div className={`ap-enfant-age ${age < 15 ? 'ap-enfant-age--inf' : 'ap-enfant-age--sup'}`}>
                                      {age} an{age > 1 ? 's' : ''}
                                      {age < 15 ? ' · allocations' : ' · majeur'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ap-modal-footer-v2">
              <button className="ap-btn-secondary" onClick={() => setViewAgent(null)}>Fermer</button>
              <button className="ap-btn-primary" onClick={() => { setViewAgent(null); openEdit(viewAgent) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Formulaire */}
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