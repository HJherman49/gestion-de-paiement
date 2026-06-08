import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  Building2, CreditCard, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  getBanques, createBanque, updateBanque, deleteBanque,
  getComptes, createCompte, updateCompte, deleteCompte,
  type BanqueFromAPI, type BanquePayload,
  type CompteBancaireFromAPI, type CompteBancairePayload,
} from '../services/banqueServices'
import { BanqueForm } from '../components/BanqueForm'
import { CompteBancaireForm } from '../components/ComptebancaireForm'
import '../styles/pages/BanquePage.css'

type TabKey = 'banques' | 'comptes'

const fmt = (str: string | null | undefined) => str || '—'

export const BanquePage: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('banques')

  // ── État banques
  const [banques, setBanques]           = useState<BanqueFromAPI[]>([])
  const [loadingB, setLoadingB]         = useState(true)
  const [showBanqueForm, setShowBanqueForm] = useState(false)
  const [editBanque, setEditBanque]     = useState<BanqueFromAPI | null>(null)
  const [viewBanque, setViewBanque]     = useState<BanqueFromAPI | null>(null)
  const [pageB, setPageB]               = useState(1)
  const [lastPageB, setLastPageB]       = useState(1)
  const [totalB, setTotalB]             = useState(0)
  const [searchB, setSearchB]           = useState('')

  // ── État comptes 
  const [comptes, setComptes]               = useState<CompteBancaireFromAPI[]>([])
  const [loadingC, setLoadingC]             = useState(true)
  const [showCompteForm, setShowCompteForm] = useState(false)
  const [editCompte, setEditCompte]         = useState<CompteBancaireFromAPI | null>(null)
  const [viewCompte, setViewCompte]         = useState<CompteBancaireFromAPI | null>(null)
  const [pageC, setPageC]                   = useState(1)
  const [lastPageC, setLastPageC]           = useState(1)
  const [totalC, setTotalC]                 = useState(0)
  const [searchC, setSearchC]               = useState('')

  const [error, setError] = useState<string | null>(null)

  // ── Chargements 
  const loadBanques = async () => {
    setLoadingB(true)
    try {
      const res = await getBanques({ page: pageB, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setBanques(raw)
      if (res.data.meta) { setLastPageB(res.data.meta.last_page ?? 1); setTotalB(res.data.meta.total ?? raw.length) }
    } catch { setError('Impossible de charger les banques') }
    finally { setLoadingB(false) }
  }

  const loadComptes = async () => {
    setLoadingC(true)
    try {
      const res = await getComptes({ page: pageC, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setComptes(raw)
      if (res.data.meta) { setLastPageC(res.data.meta.last_page ?? 1); setTotalC(res.data.meta.total ?? raw.length) }
    } catch { setError('Impossible de charger les comptes') }
    finally { setLoadingC(false) }
  }

  useEffect(() => { loadBanques() }, [pageB])
  useEffect(() => { loadComptes() }, [pageC])

  // ── Filtrage 
  const filteredBanques = banques.filter(b => {
    const q = searchB.toLowerCase()
    return b.Nom_banque?.toLowerCase().includes(q) || b.agence?.toLowerCase().includes(q) || b.code_banque?.includes(q)
  })

  const filteredComptes = comptes.filter(c => {
    const q = searchC.toLowerCase()
    return (
      c.agent?.nom?.toLowerCase().includes(q) ||
      c.agent?.prenoms?.toLowerCase().includes(q) ||
      c.agent?.num_matricule?.toLowerCase().includes(q) ||
      c.num_compte?.includes(q) ||
      c.banque?.Nom_banque?.toLowerCase().includes(q)
    )
  })

  // ── Sauvegarde banque 
  const handleSaveBanque = async (data: BanquePayload) => {
    if (editBanque) { await updateBanque(editBanque.Id_banque, data); alert('Banque modifiée') }
    else            { await createBanque(data); alert('Banque créée') }
    loadBanques(); setShowBanqueForm(false); setEditBanque(null)
  }

  const handleDeleteBanque = async (id: number) => {
    if (!confirm('Supprimer cette banque ?')) return
    try {
      await deleteBanque(id); alert('Banque supprimée'); loadBanques()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  // ── Sauvegarde compte 
  const handleSaveCompte = async (data: CompteBancairePayload) => {
    if (editCompte) { await updateCompte(editCompte.Id_compte, data); alert('Compte modifié') }
    else            { await createCompte(data); alert('Compte créé') }
    loadComptes(); setShowCompteForm(false); setEditCompte(null)
  }

  const handleDeleteCompte = async (id: number) => {
    if (!confirm('Supprimer ce compte bancaire ?')) return
    try {
      await deleteCompte(id); alert('Compte supprimé'); loadComptes()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur')
    }
  }

  const Pagination = ({ page, lastPage, onPage }: { page: number; lastPage: number; onPage: (p: number) => void }) => (
    lastPage > 1 ? (
      <div className="bp-pagination">
        <button className="bp-page-btn" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} title="Précédent">
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: lastPage }, (_, i) => i + 1)
          .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <React.Fragment key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="bp-ellipsis">…</span>}
              <button className={`bp-page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
            </React.Fragment>
          ))
        }
        <button className="bp-page-btn" onClick={() => onPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} title="Suivant">
          <ChevronRight size={14} />
        </button>
      </div>
    ) : null
  )

  return (
    <div className="bp-page">

      {/* Header */}
      <div className="bp-header">
        <div>
          <h1 className="bp-title">Gestion Bancaire</h1>
          <p className="bp-subtitle">{totalB} banque{totalB > 1 ? 's' : ''} · {totalC} compte{totalC > 1 ? 's' : ''} bancaire{totalC > 1 ? 's' : ''}</p>
        </div>
        <button
          className="bp-btn-primary"
          onClick={() => tab === 'banques' ? setShowBanqueForm(true) : setShowCompteForm(true)}
        >
          <Plus size={15} /> {tab === 'banques' ? 'Nouvelle banque' : 'Nouveau compte'}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>
      )}

      {/* Onglets */}
      <div className="bp-tabs">
        <button className={`bp-tab ${tab === 'banques' ? 'active' : ''}`} onClick={() => setTab('banques')}>
          <Building2 size={14} /> Banques
          <span className="bp-tab-count">{totalB}</span>
        </button>
        <button className={`bp-tab ${tab === 'comptes' ? 'active' : ''}`} onClick={() => setTab('comptes')}>
          <CreditCard size={14} /> Comptes bancaires
          <span className="bp-tab-count">{totalC}</span>
        </button>
      </div>

      {/* ── BANQUES ── */}
      {tab === 'banques' && (
        <>
          <div className="bp-search-wrapper">
            <div className="bp-search-box">
              <Search className="bp-search-icon" size={14} />
              <input className="bp-search-input" placeholder="Rechercher par nom, agence, code..."
                value={searchB} onChange={e => setSearchB(e.target.value)} />
            </div>
          </div>

          <div className="bp-table-wrapper">
            <table className="bp-table">
              <thead>
                <tr>
                  {['Nom banque', 'Agence', 'Code banque', 'Code localité', 'Comptes', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loadingB ? (
                  <tr><td colSpan={6} className="bp-empty"><span className="bp-spinner" /> Chargement...</td></tr>
                ) : filteredBanques.length === 0 ? (
                  <tr><td colSpan={6} className="bp-empty">Aucune banque trouvée</td></tr>
                ) : filteredBanques.map((b, i) => (
                  <tr key={`banque-${b.Id_banque ?? i}`} className={`bp-row ${i % 2 === 0 ? 'bp-row-even' : 'bp-row-odd'}`}>
                    <td>
                      <div className="bp-banque-name">{b.Nom_banque}</div>
                    </td>
                    <td className="bp-cell-gray">{fmt(b.agence)}</td>
                    <td><span className="bp-code">{fmt(b.code_banque)}</span></td>
                    <td><span className="bp-code">{fmt(b.code_localite_bnq)}</span></td>
                    <td>
                      <span className="bp-count-badge">
                        {b.comptes_bancaires_count ?? 0} compte{(b.comptes_bancaires_count ?? 0) > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <div className="bp-actions">
                        <button className="bp-icon-btn" title="Voir" onClick={() => setViewBanque(b)}><Eye size={13} /></button>
                        <button className="bp-icon-btn bp-icon-btn--edit" title="Modifier" onClick={() => { setEditBanque(b); setShowBanqueForm(true) }}><Pencil size={13} /></button>
                        <button className="bp-icon-btn bp-icon-btn--delete" title="Supprimer" onClick={() => handleDeleteBanque(b.Id_banque)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bp-table-footer">
              <span className="bp-table-info">{filteredBanques.length} banque{filteredBanques.length > 1 ? 's' : ''}</span>
              <Pagination page={pageB} lastPage={lastPageB} onPage={setPageB} />
            </div>
          </div>
        </>
      )}

      {/* ── COMPTES BANCAIRES ── */}
      {tab === 'comptes' && (
        <>
          <div className="bp-search-wrapper">
            <div className="bp-search-box">
              <Search className="bp-search-icon" size={14} />
              <input className="bp-search-input" placeholder="Rechercher par agent, numéro de compte, banque..."
                value={searchC} onChange={e => setSearchC(e.target.value)} />
            </div>
          </div>

          <div className="bp-table-wrapper">
            <table className="bp-table">
              <thead>
                <tr>
                  {['Agent', 'Banque', 'N° Compte', 'Guichet', 'Clé RIB', 'CODQEB', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loadingC && (
                  <tr key="loading">
                    <td colSpan={7} className="bp-empty"><span className="bp-spinner" /> Chargement...</td>
                  </tr>
                )}
                {!loadingC && filteredComptes.length === 0 && (
                  <tr key="empty">
                    <td colSpan={7} className="bp-empty">Aucun compte trouvé</td>
                  </tr>
                )}
                {!loadingC && filteredComptes.map((c, i) => (
                  <tr key={`compte-${c.Id_compte ?? i}`} className={`bp-row ${i % 2 === 0 ? 'bp-row-even' : 'bp-row-odd'}`}>
                    <td>
                      {c.agent ? (
                        <>
                          <div className="bp-agent-name">{c.agent.civilite} {c.agent.nom}</div>
                          <div className="bp-agent-mat">{c.agent.num_matricule}</div>
                        </>
                      ) : <span className="bp-cell-gray">—</span>}
                    </td>
                    <td>
                      {c.banque ? (
                        <>
                          <div className="bp-banque-name">{c.banque.Nom_banque}</div>
                          <div className="bp-cell-gray">{c.banque.agence}</div>
                        </>
                      ) : <span className="bp-cell-gray">—</span>}
                    </td>
                    <td><span className="bp-rib-num">{fmt(c.num_compte)}</span></td>
                    <td><span className="bp-code">{fmt(c.GUICHB)}</span></td>
                    <td><span className="bp-rib-key">{fmt(c.RIB)}</span></td>
                    <td><span className="bp-code">{fmt(c.CODQEB)}</span></td>
                    <td>
                      <div className="bp-actions">
                        <button className="bp-icon-btn" title="Voir" onClick={() => setViewCompte(c)}><Eye size={13} /></button>
                        <button className="bp-icon-btn bp-icon-btn--edit" title="Modifier" onClick={() => { setEditCompte(c); setShowCompteForm(true) }}><Pencil size={13} /></button>
                        <button className="bp-icon-btn bp-icon-btn--delete" title="Supprimer" onClick={() => handleDeleteCompte(c.Id_compte)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bp-table-footer">
              <span className="bp-table-info">{filteredComptes.length} compte{filteredComptes.length > 1 ? 's' : ''}</span>
              <Pagination page={pageC} lastPage={lastPageC} onPage={setPageC} />
            </div>
          </div>
        </>
      )}

      {/* Modal détail banque */}
      {viewBanque && (
        <div className="bp-modal-overlay">
          <div className="bp-modal">
            <div className="bp-modal-header">
              <div className="bp-modal-header-content">
                <div className="bp-modal-icon"><Building2 size={20} /></div>
                <div>
                  <div className="bp-modal-title">{viewBanque.Nom_banque}</div>
                  <div className="bp-modal-sub">{viewBanque.agence}</div>
                </div>
              </div>
              <button className="bp-modal-close" onClick={() => setViewBanque(null)} aria-label="Fermer"><X size={16} /></button>
            </div>
            <div className="bp-modal-body">
              <div className="bp-modal-grid">
                {[
                  { label: 'Nom banque',     value: viewBanque.Nom_banque },
                  { label: 'Agence',         value: viewBanque.agence },
                  { label: 'Code banque',    value: viewBanque.code_banque },
                  { label: 'Code localité',  value: viewBanque.code_localite_bnq },
                  { label: 'Nb comptes',     value: `${viewBanque.comptes_bancaires_count ?? 0} compte(s)` },
                ].map(({ label, value }) => (
                  <div key={label} className="bp-modal-field">
                    <div className="bp-modal-field-label">{label}</div>
                    <div className="bp-modal-field-value">{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bp-modal-footer">
              <button className="bp-btn-secondary" onClick={() => setViewBanque(null)}>Fermer</button>
              <button className="bp-btn-primary" onClick={() => { setViewBanque(null); setEditBanque(viewBanque); setShowBanqueForm(true) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail compte */}
      {viewCompte && (
        <div className="bp-modal-overlay">
          <div className="bp-modal bp-modal--wide">
            <div className="bp-modal-header">
              <div className="bp-modal-header-content">
                <div className="bp-modal-icon"><CreditCard size={20} /></div>
                <div>
                  <div className="bp-modal-title">Compte bancaire — RIB</div>
                  <div className="bp-modal-sub">
                    {viewCompte.agent ? `${viewCompte.agent.civilite} ${viewCompte.agent.nom} ${viewCompte.agent.prenoms}` : '—'}
                  </div>
                </div>
              </div>
              <button
                type="button"className="bp-modal-close"onClick={() => setViewCompte(null)}aria-label="Fermer"><X size={16} />
              </button>
            </div>
            <div className="bp-modal-body">
              {/* RIB complet */}
              <div className="bp-rib-block">
                <p className="bp-rib-block-label">RIB complet</p>
                <div className="bp-rib-full">
                  <div className="bp-rib-part">
                    <span className="bp-rib-part-label">Code banque</span>
                    <span className="bp-rib-part-value">{viewCompte.banque?.code_banque || '—'}</span>
                  </div>
                  <div className="bp-rib-sep">·</div>
                  <div className="bp-rib-part">
                    <span className="bp-rib-part-label">Guichet</span>
                    <span className="bp-rib-part-value">{viewCompte.GUICHB || '—'}</span>
                  </div>
                  <div className="bp-rib-sep">·</div>
                  <div className="bp-rib-part">
                    <span className="bp-rib-part-label">N° compte</span>
                    <span className="bp-rib-part-value">{viewCompte.num_compte || '—'}</span>
                  </div>
                  <div className="bp-rib-sep">·</div>
                  <div className="bp-rib-part">
                    <span className="bp-rib-part-label">Clé RIB</span>
                    <span className="bp-rib-part-value">{viewCompte.RIB || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="bp-modal-grid">
                {[
                  { label: 'Banque',          value: viewCompte.banque?.Nom_banque },
                  { label: 'Agence',          value: viewCompte.banque?.agence },
                  { label: 'Adresse banque',  value: viewCompte.adresse_bnq },
                  { label: 'Code localité',   value: viewCompte.code_localite },
                  { label: 'CODQEB',          value: viewCompte.CODQEB },
                  { label: 'Matricule agent', value: viewCompte.agent?.num_matricule },
                ].map(({ label, value }) => (
                  <div key={label} className="bp-modal-field">
                    <div className="bp-modal-field-label">{label}</div>
                    <div className="bp-modal-field-value">{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bp-modal-footer">
              <button className="bp-btn-secondary" onClick={() => setViewCompte(null)}>Fermer</button>
              <button className="bp-btn-primary" onClick={() => { setViewCompte(null); setEditCompte(viewCompte); setShowCompteForm(true) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaires */}
      {showBanqueForm && (
        <BanqueForm
          banque={editBanque}
          onSave={handleSaveBanque}
          onClose={() => { setShowBanqueForm(false); setEditBanque(null) }}
        />
      )}
      {showCompteForm && (
        <CompteBancaireForm
          compte={editCompte}
          onSave={handleSaveCompte}
          onClose={() => { setShowCompteForm(false); setEditCompte(null) }}
        />
      )}
    </div>
  )
}