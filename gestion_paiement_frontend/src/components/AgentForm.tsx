import React, { useState, useEffect, useRef } from 'react'
import { X, Save, User, FileText, Briefcase, GraduationCap, Baby, Plus, Trash2 } from 'lucide-react'
import type { Agent, AgentFormData, Direction, Service, Division, Statut, Contrat } from '../types/agent'
import { getDirections, getServices, getDivisions, getStatuts, getContrats } from '../services/agentService'
import api from '../services/api'
import '../styles/components/AgentForm.css'

interface AgentFormProps {
  agent?: Agent | null
  onSave: (data: AgentFormData) => Promise<Agent | null>
  onClose: () => void
}

type FormStep = 'identite' | 'administratif' | 'affectation' | 'diplome' | 'enfants'

const STEPS: { key: FormStep; label: string; icon: React.ReactNode }[] = [
  { key: 'identite', label: 'Identité', icon: <User size={15} /> },
  { key: 'administratif', label: 'Administratif', icon: <FileText size={15} /> },
  { key: 'affectation', label: 'Affectation', icon: <Briefcase size={15} /> },
  { key: 'diplome', label: 'Diplômes', icon: <GraduationCap size={15} /> },
  { key: 'enfants', label: 'Enfants', icon: <Baby size={15} /> },
]


interface DiplomeAPI {
  Id_diplome: number
  libelle:    string
  specialite?: string
}

interface Enfant {
  Id_enfant?: number
  date_naissance: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--instat-gray-200)',
  borderRadius: '8px',
  fontSize: '13px',
  color: 'var(--instat-dark)',
  background: '#fff',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--instat-gray-600)',
  marginBottom: '5px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const fieldGroup = (label: string, children: React.ReactNode, required = false, id?: string) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle} htmlFor={id}>
      {label} {required && <span style={{ color: 'var(--instat-red)' }}>*</span>}
    </label>
    {children}
  </div>
)

export const AgentForm: React.FC<AgentFormProps> = ({ agent, onSave, onClose }) => {
  const [step, setStep] = useState<FormStep>('identite')
  const [directions, setDirections] = useState<Direction[]>([])
  const [services, setServices] = useState<Service[]>([])
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [divisions, setDivisions] = useState<Division[]>([])
  const [statuts, setStatuts] = useState<Statut[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [form, setForm] = useState<AgentFormData>({
    num_matricule: '',
    nom: '',
    prenoms: '',
    adresse: '',
    N_CIN: '',
    date_naissance: '',
    sexe: 'M',
    date_entree_admin: '',
    date_delivrance_CI: '',
    lieu_delivrance_CI: '',
    civilite: 'Mr',
    tel: '',
    mail: '',
    categ_retraite: '',
    N_Cnaps: '',
    porte: '',
    pp_gale: 0,
    date_retraite: '',
    Id_direction: 0,
    Id_service: 0,
    Id_division: 0,
    Id_statut: 0,
    Id_contrat: 0,
  })

   // États Diplômes (API)
  const [diplomesAPI, setDiplomesAPI]         = useState<DiplomeAPI[]>([])
  const [selectedDiplomeIds, setSelectedDiplomeIds] = useState<number[]>([])
  const [loadingDiplomes, setLoadingDiplomes] = useState(false)


  // États Enfants
  const [enfants, setEnfants] = useState<Enfant[]>([])

  const addEnfant = () => setEnfants(prev => [...prev, { date_naissance: '' }])
  const removeEnfant = (i: number) => setEnfants(prev => prev.filter((_, idx) => idx !== i))
  const updateEnfant = (i: number, val: string) =>
    setEnfants(prev => prev.map((e, idx) => idx === i ? { ...e, date_naissance: val } : e))

  const toggleDiplome = (id: number) =>
    setSelectedDiplomeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const filteredServices = services.filter(s => String(s.Id_direction) === String(form.Id_direction))
  const filteredDivisions = divisions.filter(d => String(d.Id_service) === String(form.Id_service))

    // Charger les diplômes disponibles depuis l'API
  useEffect(() => {
    setLoadingDiplomes(true)
    api.get('/diplomes')
      .then(r => setDiplomesAPI(r.data.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingDiplomes(false))
  }, [])
 
  // Charger les diplômes existants de l'agent en édition
  useEffect(() => {
    if (agent?.Id_agent) {
      api.get(`/agents/${agent.Id_agent}/diplomes`)
        .then(r => {
          const ids = (r.data.data ?? []).map((d: any) => d.Id_diplome)
          setSelectedDiplomeIds(ids)
        })
        .catch(() => {})
    }
  }, [agent])

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [directionsRes, servicesRes, divisionsRes, statutsRes, contratsRes] = await Promise.all([
          getDirections(),
          getServices(),
          getDivisions(),
          getStatuts(),
          getContrats()
        ])
        setDirections(directionsRes.data.data ?? directionsRes.data ?? [])
        setServices(servicesRes.data.data ?? servicesRes.data ?? [])
        setDivisions(divisionsRes.data.data ?? divisionsRes.data ?? [])
        setStatuts(statutsRes.data.data ?? statutsRes.data ?? [])
        setContrats(contratsRes.data.data ?? contratsRes.data ?? [])
      } catch (error) {
        console.error('Erreur lors du chargement des données de référence:', error)
      }
    }
    fetchReferenceData()
  }, [])

  useEffect(() => {
    if (agent) {
      setForm({
        num_matricule: agent.num_matricule ?? '',
        nom: agent.nom ?? '',
        prenoms: agent.prenoms ?? '',
        adresse: agent.adresse ?? '',
        N_CIN: agent.N_CIN ?? '',
        date_naissance: agent.date_naissance ?? '',
        sexe: agent.sexe ?? 'M',
        date_entree_admin: agent.date_entree_admin ?? '',
        date_delivrance_CI: agent.date_delivrance_CI ?? '',
        lieu_delivrance_CI: agent.lieu_delivrance_CI ?? '',
        civilite: agent.civilite ?? 'Mr',
        tel: agent.tel ?? '',
        mail: agent.mail ?? '',
        categ_retraite: agent.categ_retraite ?? null,
        N_Cnaps: agent.N_Cnaps ?? null,
        porte: agent.porte ?? null,
        pp_gale: agent.pp_gale ?? 0,
        date_retraite: agent.date_retraite ?? null,
        Id_direction: agent.Id_direction ?? agent.direction?.Id_direction ?? 0,
        Id_service: agent.Id_service ?? agent.service?.Id_service ?? 0,
        Id_division: agent.Id_division ?? agent.division?.Id_division ?? 0,
        Id_statut: agent.Id_statut ?? agent.statut?.Id_statut ?? 0,
        Id_contrat: agent.Id_contrat ?? agent.contrat?.Id_contrat ?? 0,
      })
    } else {
      setForm({
        num_matricule: '',
        nom: '',
        prenoms: '',
        adresse: '',
        N_CIN: '',
        date_naissance: '',
        sexe: 'M',
        date_entree_admin: '',
        date_delivrance_CI: '',
        lieu_delivrance_CI: '',
        civilite: 'Mr',
        tel: '',
        mail: '',
        categ_retraite: '',
        N_Cnaps: '',
        porte: '',
        pp_gale: 0,
        date_retraite: '',
        Id_direction: 0,
        Id_service: 0,
        Id_division: 0,
        Id_statut: 0,
        Id_contrat: 0,
      })
    }
  }, [agent])

  // Charger les enfants existants de l'agent en édition
  useEffect(() => {
    const fetchEnfants = async () => {
      if (!agent?.Id_agent) {
        setEnfants([])
        return
      }
      try {
        const res = await api.get(`/agents/${agent.Id_agent}/enfants`)
        const list = (res.data.data ?? res.data ?? [])
        // Adapter au format local { Id_enfant, date_naissance }
        const mapped: Enfant[] = list.map((e: any) => ({
          Id_enfant: e.Id_enfant,
          date_naissance: e.date_de_naissance || '',
        }))
        setEnfants(mapped)
      } catch (err) {
        console.warn("Impossible de charger les enfants de l'agent:", err)
        setEnfants([])
      }
    }
    fetchEnfants()
  }, [agent])

  const set = (key: keyof AgentFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ── Calcul automatique des compteurs enfants 
  const calculerCompteurs = () => {
    const now = new Date()
    let inf15 = 0
    let sup15 = 0
    enfants.forEach(e => {
      if (!e.date_naissance) return
      const age = now.getFullYear() - new Date(e.date_naissance).getFullYear()
      if (age < 15) inf15++
      else sup15++
    })
    return { total: enfants.length, inf15, sup15 }
  }

  // ── Envoyer les enfants à l'API après création/modification de l'agent 
  const sauvegarderEnfants = async (Id_agent: number) => {
    const { total, inf15, sup15 } = calculerCompteurs()

    const buildPayload = (date_naissance: string) => ({
      Id_agent,
      date_de_naissance: date_naissance,
      Nb_enf: total,
      Nb_enf_inf_15ans: inf15,
      Nb_enf_sup_15ans: sup15,
    })

    if (agent?.Id_agent) {
      try {
        const existing = await api.get(`/agents/${Id_agent}/enfants`)
        const existingList = existing.data.data ?? existing.data ?? []
        const existingById = new Map<number, any>(
          existingList.map((e: any) => [e.Id_enfant, e])
        )

        const keptEnfants = enfants.filter(e => !!e.Id_enfant)
        const newEnfants = enfants.filter(e => !e.Id_enfant && e.date_naissance)
        const deletedEnfants = existingList.filter((e: any) =>
          !keptEnfants.some(k => k.Id_enfant === e.Id_enfant)
        )

        await Promise.all(
          deletedEnfants.map((e: any) =>
            api.delete(`/enfants/${e.Id_enfant}`).catch((err: any) => {
              if (err?.response?.status !== 404) throw err
            })
          )
        )

        await Promise.all(
          keptEnfants
            .filter(e => {
              const existing = e.Id_enfant ? existingById.get(e.Id_enfant) : null
              return existing && existing.date_de_naissance !== e.date_naissance
            })
            .map(e =>
              api.put(`/enfants/${e.Id_enfant}`, buildPayload(e.date_naissance))
            )
        )

        await Promise.all(
          newEnfants.map(e => api.post('/enfants', buildPayload(e.date_naissance)))
        )
      } catch (err) {
        console.warn("Impossible de synchroniser les enfants de l'agent:", err)
      }
      return
    }

    if (enfants.length === 0) return

    await Promise.all(
      enfants
        .filter(e => e.date_naissance)
        .map(e => api.post('/enfants', buildPayload(e.date_naissance)))
    )
  }

    const handleSubmit = async () => {
    if (!form.num_matricule || !form.nom || !form.prenoms) {
      alert('Veuillez remplir les champs obligatoires : Matricule, Nom, Prénoms')
      setStep('identite')
      return
    }

    try {
      // 1. Sauvegarder l'agent (create ou update) via onSave
      // onSave retourne l'agent sauvegardé avec son Id_agent
      const payload = { ...form, diplomes: selectedDiplomeIds }
      if (payload.Id_direction === 0) delete payload.Id_direction
      if (payload.Id_service === 0) delete payload.Id_service
      if (payload.Id_division === 0) delete payload.Id_division
      if (payload.Id_statut === 0) delete payload.Id_statut
      if (payload.Id_contrat === 0) delete payload.Id_contrat
      if (payload.date_naissance === '') delete payload.date_naissance
      if (payload.date_entree_admin === '') delete payload.date_entree_admin
      if (payload.date_delivrance_CI === '') delete payload.date_delivrance_CI
      if (payload.date_retraite === '') delete payload.date_retraite
      const savedAgent = await onSave(payload)

      const Id_agent = savedAgent?.Id_agent ?? agent?.Id_agent
      if (!Id_agent) {
        throw new Error('Impossible de récupérer l\'Id_agent après la sauvegarde de l\'agent.')
      }

      // 2. Synchroniser les enfants de l'agent
      if (agent || enfants.length > 0) {
        await sauvegarderEnfants(Id_agent)
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err)
    }
  }

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0
    }
  }, [step])

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="agent-form-overlay">
      <div className="agent-form-container">
        {/* Header */}
        <div className="agent-form-header">
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
              {agent ? 'Modifier l\'agent' : 'Nouvel agent'}
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {agent ? `Matricule : ${agent.num_matricule}` : 'Remplir les informations de l\'agent'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--instat-gray-200)',
          background: 'var(--instat-gray-50)',
        }}>
          {STEPS.map((s, i) => {
            const isActive = s.key === step
            const isDone = i < currentStepIndex
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                style={{
                  flex: 1, padding: '14px 8px',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '3px solid var(--instat-red)' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--instat-dark)' : isDone ? 'var(--green)' : 'var(--instat-gray-400)',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: isActive ? 'var(--instat-dark)' : isDone ? 'var(--green)' : 'var(--instat-gray-200)',
                  color: isActive || isDone ? '#fff' : 'var(--instat-gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                }}>
                  {isDone ? '✓' : i + 1}
                </span>
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Form body */}
        <div ref={bodyRef} className="agent-form-body">

          {/* ÉTAPE 1 : IDENTITÉ */}
          {step === 'identite' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fieldGroup('Matricule', (
                <input style={inputStyle} value={form.num_matricule ?? ''}
                  onChange={e => set('num_matricule', e.target.value)}
                  placeholder="Ex: MAT-006" />
              ), true)}

              {fieldGroup('Civilité', (
                <select id="civilite-select" style={inputStyle} value={form.civilite ?? 'Mr'}
                  onChange={e => set('civilite', e.target.value)} title="Civilité">
                  <option>Mr</option>
                  <option>Mme</option>
                  <option>Melle</option>
                </select>
              ), false, 'civilite-select')}

              {fieldGroup('Nom', (
                <input style={inputStyle} value={form.nom ?? ''}
                  onChange={e => set('nom', e.target.value.toUpperCase())}
                  placeholder="Nom de famille" />
              ), true)}

              {fieldGroup('Prénoms', (
                <input style={inputStyle} value={form.prenoms ?? ''}
                  onChange={e => set('prenoms', e.target.value)}
                  placeholder="Prénoms complets" />
              ), true)}

              {fieldGroup('Sexe', (
                <select id="sexe-select" style={inputStyle} value={form.sexe ?? 'M'}
                  onChange={e => set('sexe', e.target.value)} title="Sexe">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              ), false, 'sexe-select')}

              {fieldGroup('Date de naissance', (
                <input style={inputStyle} type="date" value={form.date_naissance ?? ''}
                  onChange={e => set('date_naissance', e.target.value)} title="Date de naissance" />
              ))}

              <div style={{ gridColumn: '1 / -1' }}>
                {fieldGroup('Adresse', (
                  <input style={inputStyle} value={form.adresse ?? ''}
                    onChange={e => set('adresse', e.target.value)}
                    placeholder="Adresse complète" />
                ))}
              </div>

              {fieldGroup('Téléphone', (
                <input style={inputStyle} value={form.tel ?? ''}
                  onChange={e => set('tel', e.target.value)}
                  placeholder="034 XX XXX XX" />
              ))}

              {fieldGroup('Email', (
                <input style={inputStyle} type="email" value={form.mail ?? ''}
                  onChange={e => set('mail', e.target.value)}
                  placeholder="agent@instat.mg" />
              ))}

              {fieldGroup('Porte', (
                <input style={inputStyle} value={form.porte ?? ''}
                  onChange={e => set('porte', e.target.value)}
                  placeholder="Numéro de porte" />
              ))}
            </div>
          )}

          {/* ÉTAPE 2 : ADMINISTRATIF */}
          {step === 'administratif' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fieldGroup('Numéro CIN', (
                <input style={inputStyle} value={form.N_CIN ?? ''}
                  onChange={e => set('N_CIN', e.target.value)}
                  placeholder="101 XXX XXX XXX" />
              ))}

              {fieldGroup('Date de délivrance CIN', (
                <input style={inputStyle} type="date" value={form.date_delivrance_CI ?? ''}
                  onChange={e => set('date_delivrance_CI', e.target.value)} title="Date de délivrance CIN" />
              ))}

              {fieldGroup('Lieu de délivrance CIN', (
                <input style={inputStyle} value={form.lieu_delivrance_CI ?? ''}
                  onChange={e => set('lieu_delivrance_CI', e.target.value)}
                  placeholder="Ex: Antananarivo" />
              ))}

              {fieldGroup('Date d\'entrée administrative', (
                <input style={inputStyle} type="date" value={form.date_entree_admin ?? ''}
                  onChange={e => set('date_entree_admin', e.target.value)} title="Date d'entrée administrative" />
              ))}

              {fieldGroup('Statut', (
                <select id="statut-select" style={inputStyle} value={form.Id_statut ?? ''}
                  onChange={e => set('Id_statut', Number(e.target.value))} title="Statut">
                  <option value="">-- Choisir un statut --</option>
                  {statuts.map(s => (
                    <option key={s.Id_statut} value={s.Id_statut}>{s.type_statut}</option>
                  ))}
                </select>
              ), false, 'statut-select')}

              {fieldGroup('Type de contrat', (
                <select id="contrat-select" style={inputStyle} value={form.Id_contrat ?? ''}
                  onChange={e => set('Id_contrat', Number(e.target.value))} title="Type de contrat">
                  <option value="">-- Choisir un contrat --</option>
                  {contrats.map(c => (
                    <option key={c.Id_contrat} value={c.Id_contrat}>
                      {c.type_contrat} {c.duree ? `(${c.duree})` : ''}
                    </option>
                  ))}
                </select>
              ), false, 'contrat-select')}

              {fieldGroup('Numéro CNAPS', (
                <input style={inputStyle} value={form.N_Cnaps ?? ''}
                  onChange={e => set('N_Cnaps', e.target.value)}
                  placeholder="Numéro CNAPS" />
              ))}

              {fieldGroup('Catégorie retraite', (
                <input style={inputStyle} value={form.categ_retraite ?? ''}
                  onChange={e => set('categ_retraite', e.target.value)}
                  placeholder="Catégorie retraite" />
              ))}

              {fieldGroup('PP Gale', (
                <input style={inputStyle} type="number" step="0.01" value={form.pp_gale ?? ''}
                  onChange={e => set('pp_gale', parseFloat(e.target.value) || 0)}
                  placeholder="0.00" />
              ))}

              {fieldGroup('Date retraite', (
                <input style={inputStyle} type="date" value={form.date_retraite ?? ''}
                  onChange={e => set('date_retraite', e.target.value)} title="Date retraite" />
              ))}
            </div>
          )}

          {/* ÉTAPE 3 : AFFECTATION */}
          {step === 'affectation' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                {fieldGroup('Direction', (
                  <select
                    id="direction-select"
                    style={inputStyle}
                    value={form.Id_direction || ''}
                    onChange={e => {
                      const val = Number(e.target.value)
                      //  CORRIGÉ : on met à jour uniquement form, et on reset service + division
                      setForm(prev => ({
                        ...prev,
                        Id_direction: val,
                        Id_service: 0,   // reset service
                        Id_division: 0,  // reset division
                      }))
                    }}
                    title="Direction"
                  >
                    <option value="">-- Choisir une direction --</option>
                    {directions.map(d => (
                      <option key={d.Id_direction} value={d.Id_direction}>
                        [{d.sigle ?? d.sigle}] {d.nom_direction}
                      </option>
                    ))}
                  </select>
                ), false, 'direction-select')}
              </div>

              {fieldGroup('Service', (
                <select
                  id="service-select"
                  style={inputStyle}
                  value={form.Id_service || ''}
                  onChange={e => {
                    const val = Number(e.target.value)
                    //  CORRIGÉ : on met à jour uniquement form, et on reset division
                    setForm(prev => ({
                      ...prev,
                      Id_service: val,
                      Id_division: 0,  // reset division
                    }))
                  }}
                  disabled={!form.Id_direction}
                  title="Service"
                >
                  <option value="">-- Choisir un service --</option>
                  {/*  filteredServices est maintenant réactif car basé sur form.Id_direction */}
                  {filteredServices.map(s => (
                    <option key={s.Id_service} value={s.Id_service}>{s.nom_service}</option>
                  ))}
                </select>
              ), false, 'service-select')}

              {fieldGroup('Division', (
                <select
                  id="division-select"
                  style={inputStyle}
                  value={form.Id_division || ''}
                  onChange={e => {
                    set('Id_division', Number(e.target.value))
                  }}
                  disabled={!form.Id_service}
                  title="Division"
                >
                  <option value="">-- Choisir une division --</option>
                  {/*  filteredDivisions est maintenant réactif car basé sur form.Id_service */}
                  {filteredDivisions.map(d => (
                    <option key={d.Id_division} value={d.Id_division}>
                      {d.Nom_division} {d.section ? `· ${d.section}` : ''}
                    </option>
                  ))}
                </select>
              ), false, 'division-select')}
            </div>
          )}

           {/* ÉTAPE 4 : DIPLÔMES — connecté à l'API */}
          {step === 'diplome' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Sélectionner les diplômes obtenus</label>
                {selectedDiplomeIds.length > 0 && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--instat-dark)', background: 'var(--instat-gray-100)', padding: '3px 10px', borderRadius: '20px' }}>
                    {selectedDiplomeIds.length} sélectionné{selectedDiplomeIds.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
 
              {/* Liste des diplômes depuis l'API */}
              {loadingDiplomes ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--instat-gray-400)', fontSize: '13px' }}>
                  Chargement des diplômes...
                </div>
              ) : diplomesAPI.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--instat-gray-400)', fontSize: '13px', background: 'var(--instat-gray-50)', borderRadius: '8px', border: '1px dashed var(--instat-gray-200)' }}>
                  Aucun diplôme disponible.{' '}
                  <span style={{ color: 'var(--instat-dark)', fontWeight: 600 }}>
                    Ajoutez des diplômes dans l'administration.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {diplomesAPI.map(d => {
                    const selected = selectedDiplomeIds.includes(d.Id_diplome)
                    return (
                      <button
                        key={d.Id_diplome}
                        type="button"
                        onClick={() => toggleDiplome(d.Id_diplome)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: `2px solid ${selected ? 'var(--instat-dark)' : 'var(--instat-gray-200)'}`,
                          background: selected ? 'var(--instat-dark)' : '#fff',
                          color: selected ? '#fff' : 'var(--instat-gray-600)',
                          fontSize: '13px',
                          fontWeight: selected ? 700 : 400,
                          cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '4px',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GraduationCap size={13} />
                          {d.libelle}
                        </span>
                        {d['specialite'] && (
                          <span style={{ fontSize: '11px', opacity: 0.7 }}>
                            {d['specialite']}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
 
              {/* Récap sélection */}
              {selectedDiplomeIds.length > 0 && (
                <div style={{ background: 'var(--instat-gray-50)', borderRadius: '8px', padding: '14px', border: '1px solid var(--instat-gray-200)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--instat-gray-600)', marginBottom: '8px' }}>
                    DIPLÔMES SÉLECTIONNÉS
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedDiplomeIds.map(id => {
                      const d = diplomesAPI.find(x => x.Id_diplome === id)
                      return d ? (
                        <span key={id} style={{
                            padding: '4px 12px', borderRadius: '20px',
                            background: 'var(--instat-dark)', color: '#fff',
                            fontSize: '12px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }}>
                            🎓 {d.libelle}
                            <button
                              type="button"
                              onClick={() => toggleDiplome(id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, fontSize: '14px', lineHeight: 1 }}
                            >×</button>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ÉTAPE 5 : ENFANTS */}
          {step === 'enfants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--instat-dark)' }}>
                    {enfants.length === 0 ? 'Aucun enfant déclaré' : `${enfants.length} enfant${enfants.length > 1 ? 's' : ''} déclaré${enfants.length > 1 ? 's' : ''}`}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--instat-gray-400)', marginTop: '2px' }}>
                    Ajoutez les enfants à charge de l'agent
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEnfant}
                  style={{
                    padding: '8px 16px', borderRadius: '8px',
                    border: 'none', background: 'var(--instat-dark)',
                    color: '#fff', fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Plus size={14} /> Ajouter un enfant
                </button>
              </div>

              {enfants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--instat-gray-50)', borderRadius: '12px', border: '2px dashed var(--instat-gray-200)' }}>
                  <Baby size={36} color="var(--instat-gray-200)" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--instat-gray-400)' }}>Cliquez sur "Ajouter un enfant" pour déclarer un enfant</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {enfants.map((enf, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--instat-gray-50)', padding: '14px', borderRadius: '10px', border: '1px solid var(--instat-gray-200)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--instat-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, marginBottom: '4px' }}>Enfant {i + 1} — Date de naissance</label>
                        <input
                          type="date"
                          style={inputStyle}
                          value={enf.date_naissance}
                          onChange={e => updateEnfant(i, e.target.value)}
                          title={`Date de naissance de l'enfant ${i + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEnfant(i)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #c0392b20', background: '#c0392b10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--instat-red)', flexShrink: 0 }}
                        aria-label="Supprimer cet enfant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {enfants.length > 0 && (
                <div style={{ background: '#f0faf4', border: '1px solid #c3e6cb', borderRadius: '8px', padding: '12px 16px' }}>
                  <p style={{ fontSize: '12px', color: '#27ae60', fontWeight: 600 }}>
                    📊 Récapitulatif : {enfants.length} enfant(s) · {enfants.filter(e => {
                      if (!e.date_naissance) return false
                      const age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear()
                      return age < 15
                    }).length} de moins de 15 ans · {enfants.filter(e => {
                      if (!e.date_naissance) return false
                      const age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear()
                      return age >= 15
                    }).length} de 15 ans et plus
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--instat-gray-200)',
          background: 'var(--instat-gray-50)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            onClick={() => {
              const i = STEPS.findIndex(s => s.key === step)
              if (i > 0) setStep(STEPS[i - 1].key)
              else onClose()
            }}
            style={{
              padding: '9px 20px', borderRadius: '8px',
              border: '1px solid var(--instat-gray-200)',
              background: '#fff', fontSize: '13px',
              color: 'var(--instat-gray-600)', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
            }}
          >
            {currentStepIndex === 0 ? 'Annuler' : '← Précédent'}
          </button>

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(STEPS[currentStepIndex + 1].key)}
              style={{
                padding: '9px 24px', borderRadius: '8px',
                border: 'none', background: 'var(--instat-dark)',
                color: '#fff', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              }}
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                padding: '9px 24px', borderRadius: '8px',
                border: 'none', background: 'var(--instat-red)',
                color: '#fff', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Save size={14} />
              {agent ? 'Enregistrer les modifications' : 'Créer l\'agent'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}