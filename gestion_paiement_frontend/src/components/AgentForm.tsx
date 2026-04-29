import React, { useState, useEffect } from 'react'
import { X, Save, User, FileText, Briefcase, GraduationCap, Baby, Plus, Trash2 } from 'lucide-react'
import type { Agent, AgentFormData } from '../types/agent'
import { directions, services, divisions, statuts, contrats } from '../data/agentsData'

interface AgentFormProps {
  agent?: Agent | null
  onSave: (data: AgentFormData) => void
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

const DIPLOMES_OPTIONS = ['Aucun', 'BEPC', 'Baccalauréat', 'Licence', 'Master', 'Doctorat', 'Autre']

interface Enfant {
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

const fieldGroup = (label: string, children: React.ReactNode, required = false) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: 'var(--instat-red)' }}>*</span>}
    </label>
    {children}
  </div>
)

export const AgentForm: React.FC<AgentFormProps> = ({ agent, onSave, onClose }) => {
  const [step, setStep] = useState<FormStep>('identite')
  const [form, setForm] = useState<AgentFormData>({
    num_matricule: '',
    nom: '',
    prenoms: '',
    adresse: '',
    N_CIN: '',
    date_de_naissance: '',
    sexe: 'M',
    date_entree_admin: '',
    date_delivrance_CI: '',
    lieu_delivrance_CI: '',
    civilite: 'M.',
    tel: '',
    porte: '',
    Id_direction: undefined,
    Id_service: undefined,
    Id_division: undefined,
    Id_statut: undefined,
    Id_contrat: undefined,
  })

  // États Diplômes
  const [selectedDiplomes, setSelectedDiplomes] = useState<string[]>([])
  const [specialiteDiplome, setSpecialiteDiplome] = useState('')

  // États Enfants
  const [enfants, setEnfants] = useState<Enfant[]>([])

  const addEnfant = () => setEnfants(prev => [...prev, { date_naissance: '' }])
  const removeEnfant = (i: number) => setEnfants(prev => prev.filter((_, idx) => idx !== i))
  const updateEnfant = (i: number, val: string) =>
    setEnfants(prev => prev.map((e, idx) => idx === i ? { ...e, date_naissance: val } : e))

  const toggleDiplome = (d: string) =>
    setSelectedDiplomes(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  // États séparés pour la cascade Direction → Service → Division
  const [directionId, setDirectionId] = useState<number | ''>(agent?.Id_direction ?? '')
  const [serviceId, setServiceId] = useState<number | ''>(agent?.Id_service ?? '')
  const [divisionId, setDivisionId] = useState<number | ''>(agent?.Id_division ?? '')

  // Listes filtrées en cascade
  const filteredServices = services.filter(s => s.Id_direction === directionId)
  const filteredDivisions = divisions.filter(d => d.Id_service === serviceId)

  useEffect(() => {
    if (agent) {
      setDirectionId(agent.Id_direction ?? '')
      setServiceId(agent.Id_service ?? '')
      setDivisionId(agent.Id_division ?? '')
      setForm({
        num_matricule: agent.num_matricule,
        nom: agent.nom,
        prenoms: agent.prenoms,
        adresse: agent.adresse ?? '',
        N_CIN: agent.N_CIN ?? '',
        date_de_naissance: agent.date_de_naissance ?? '',
        sexe: agent.sexe ?? 'M',
        date_entree_admin: agent.date_entree_admin ?? '',
        date_delivrance_CI: agent.date_delivrance_CI ?? '',
        lieu_delivrance_CI: agent.lieu_delivrance_CI ?? '',
        civilite: agent.civilite ?? 'M.',
        tel: agent.tel ?? '',
        porte: agent.porte ?? '',
        Id_direction: agent.Id_direction,
        Id_service: agent.Id_service,
        Id_division: agent.Id_division,
        Id_statut: agent.Id_statut,
        Id_contrat: agent.Id_contrat,
      })
    }
  }, [agent])

  const set = (key: keyof AgentFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (!form.num_matricule || !form.nom || !form.prenoms) {
      alert('Veuillez remplir les champs obligatoires : Matricule, Nom, Prénoms')
      setStep('identite')
      return
    }
    onSave(form)
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        width: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--instat-dark)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
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
          }}>
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
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* ÉTAPE 1 : IDENTITÉ */}
          {step === 'identite' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fieldGroup('Matricule', (
                <input style={inputStyle} value={form.num_matricule}
                  onChange={e => set('num_matricule', e.target.value)}
                  placeholder="Ex: MAT-006" />
              ), true)}

              {fieldGroup('Civilité', (
                <select style={inputStyle} value={form.civilite}
                  onChange={e => set('civilite', e.target.value)}>
                  <option>M.</option>
                  <option>Mme</option>
                  <option>Mlle</option>
                </select>
              ))}

              {fieldGroup('Nom', (
                <input style={inputStyle} value={form.nom}
                  onChange={e => set('nom', e.target.value.toUpperCase())}
                  placeholder="Nom de famille" />
              ), true)}

              {fieldGroup('Prénoms', (
                <input style={inputStyle} value={form.prenoms}
                  onChange={e => set('prenoms', e.target.value)}
                  placeholder="Prénoms complets" />
              ), true)}

              {fieldGroup('Sexe', (
                <select style={inputStyle} value={form.sexe}
                  onChange={e => set('sexe', e.target.value)}>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              ))}

              {fieldGroup('Date de naissance', (
                <input style={inputStyle} type="date" value={form.date_de_naissance}
                  onChange={e => set('date_de_naissance', e.target.value)} />
              ))}

              <div style={{ gridColumn: '1 / -1' }}>
                {fieldGroup('Adresse', (
                  <input style={inputStyle} value={form.adresse}
                    onChange={e => set('adresse', e.target.value)}
                    placeholder="Adresse complète" />
                ))}
              </div>

              {fieldGroup('Téléphone', (
                <input style={inputStyle} value={form.tel}
                  onChange={e => set('tel', e.target.value)}
                  placeholder="034 XX XXX XX" />
              ))}

              {fieldGroup('Porte', (
                <input style={inputStyle} value={form.porte}
                  onChange={e => set('porte', e.target.value)}
                  placeholder="Numéro de porte" />
              ))}
            </div>
          )}

          {/* ÉTAPE 2 : ADMINISTRATIF */}
          {step === 'administratif' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fieldGroup('Numéro CIN', (
                <input style={inputStyle} value={form.N_CIN}
                  onChange={e => set('N_CIN', e.target.value)}
                  placeholder="101 XXX XXX XXX" />
              ))}

              {fieldGroup('Date de délivrance CIN', (
                <input style={inputStyle} type="date" value={form.date_delivrance_CI}
                  onChange={e => set('date_delivrance_CI', e.target.value)} />
              ))}

              {fieldGroup('Lieu de délivrance CIN', (
                <input style={inputStyle} value={form.lieu_delivrance_CI}
                  onChange={e => set('lieu_delivrance_CI', e.target.value)}
                  placeholder="Ex: Antananarivo" />
              ))}

              {fieldGroup('Date d\'entrée administrative', (
                <input style={inputStyle} type="date" value={form.date_entree_admin}
                  onChange={e => set('date_entree_admin', e.target.value)} />
              ))}

              {fieldGroup('Statut', (
                <select style={inputStyle} value={form.Id_statut ?? ''}
                  onChange={e => set('Id_statut', Number(e.target.value))}>
                  <option value="">-- Choisir un statut --</option>
                  {statuts.map(s => (
                    <option key={s.Id_statut} value={s.Id_statut}>{s.type_statut}</option>
                  ))}
                </select>
              ))}

              {fieldGroup('Type de contrat', (
                <select style={inputStyle} value={form.Id_contrat ?? ''}
                  onChange={e => set('Id_contrat', Number(e.target.value))}>
                  <option value="">-- Choisir un contrat --</option>
                  {contrats.map(c => (
                    <option key={c.Id_contrat} value={c.Id_contrat}>
                      {c.type_contrat} {c.duree ? `(${c.duree})` : ''}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {/* ÉTAPE 3 : AFFECTATION */}
          {step === 'affectation' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                {fieldGroup('Direction', (
                  <select
                    style={inputStyle}
                    value={directionId}
                    onChange={e => {
                      const val = Number(e.target.value)
                      setDirectionId(val)
                      setServiceId('')
                      setDivisionId('')
                      set('Id_direction', val)
                      set('Id_service', '')
                      set('Id_division', '')
                    }}
                  >
                    <option value="">-- Choisir une direction --</option>
                    {directions.map(d => (
                      <option key={d.Id_Direction} value={d.Id_Direction}>
                        [{d.Sigle}] {d.Nom_Direction}
                      </option>
                    ))}
                  </select>
                ))}
              </div>

              {fieldGroup('Service', (
                <select
                  style={inputStyle}
                  value={serviceId}
                  onChange={e => {
                    const val = Number(e.target.value)
                    setServiceId(val)
                    setDivisionId('')
                    set('Id_service', val)
                    set('Id_division', '')
                  }}
                  disabled={!directionId}
                >
                  <option value="">-- Choisir un service --</option>
                  {filteredServices.map(s => (
                    <option key={s.Id_service} value={s.Id_service}>{s.Nom_service}</option>
                  ))}
                </select>
              ))}

              {fieldGroup('Division', (
                <select
                  style={inputStyle}
                  value={divisionId}
                  onChange={e => {
                    const val = Number(e.target.value)
                    setDivisionId(val)
                    set('Id_division', val)
                  }}
                  disabled={!serviceId}
                >
                  <option value="">-- Choisir une division --</option>
                  {filteredDivisions.map(d => (
                    <option key={d.Id_division} value={d.Id_division}>
                      {d.nom_division} {d.section ? `· ${d.section}` : ''}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        {/* ÉTAPE 4 : DIPLÔMES */}
          {step === 'diplome' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Niveau de diplôme obtenu</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                  {DIPLOMES_OPTIONS.map(d => {
                    const selected = selectedDiplomes.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiplome(d)}
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
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s',
                        }}
                      >
                        <GraduationCap size={14} />
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Spécialité / Filière</label>
                <input
                  style={inputStyle}
                  value={specialiteDiplome}
                  onChange={e => setSpecialiteDiplome(e.target.value)}
                  placeholder="Ex: Informatique, Statistique, Gestion..."
                />
              </div>
              {selectedDiplomes.length > 0 && (
                <div style={{ background: 'var(--instat-gray-50)', borderRadius: '8px', padding: '14px', border: '1px solid var(--instat-gray-200)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--instat-gray-600)', marginBottom: '8px' }}>DIPLÔMES SÉLECTIONNÉS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedDiplomes.map(d => (
                      <span key={d} style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--instat-dark)', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                        🎓 {d}
                      </span>
                    ))}
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
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEnfant(i)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #c0392b20', background: '#c0392b10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--instat-red)', flexShrink: 0 }}
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