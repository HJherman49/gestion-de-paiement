import React, { useState } from 'react'
import { User, Lock, Bell, Moon, Globe, Shield, Save, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string
  email: string
  tel: string
  role: string
}

// ── Styles communs ────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #e2e6ef', borderRadius: '8px',
  fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
  color: '#1a1f3c', outline: 'none', background: '#fff',
}

const inpDisabled: React.CSSProperties = {
  ...inp, background: '#f8f9fc', color: '#9aa3b5', cursor: 'not-allowed',
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: '#5a6478', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e6ef',
  borderRadius: '12px', overflow: 'hidden',
}

const cardHeader: React.CSSProperties = {
  padding: '16px 20px', borderBottom: '1px solid #e2e6ef',
  display: 'flex', alignItems: 'center', gap: '8px',
}

const cardTitle: React.CSSProperties = {
  fontSize: '14px', fontWeight: 700, color: '#1a1f3c',
}

const cardBody: React.CSSProperties = {
  padding: '20px',
}

// ── Composant Switch ──────────────────────────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: '42px', height: '24px', borderRadius: '12px',
      border: 'none', cursor: 'pointer',
      background: checked ? '#1a1f3c' : '#e2e6ef',
      position: 'relative', flexShrink: 0,
      transition: 'background 0.2s',
    }}
  >
    <span style={{
      position: 'absolute', top: '3px',
      left: checked ? '21px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%',
      background: '#fff', transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
)

// ── Composant Préférence ──────────────────────────────────────────────────────

const Pref: React.FC<{
  icon: React.ReactNode
  label: string
  desc: string
  checked: boolean
  onChange: () => void
}> = ({ icon, label, desc, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f0f2f7' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a6478', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1f3c' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#9aa3b5', marginTop: '1px' }}>{desc}</div>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
)

// ── Page principale ───────────────────────────────────────────────────────────

export const ParametresPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Admin SIRH',
    email: 'admin@instat.mg',
    tel: '+261 20 22 000 00',
    role: 'Administrateur',
  })
  const [saved, setSaved] = useState(false)
  const [pwdActuel, setPwdActuel] = useState('')
  const [pwdNouv, setPwdNouv] = useState('')

  const [prefs, setPrefs] = useState({
    notifEmail:       true,
    notifRecrutement: true,
    notifPaie:        false,
    modeSombre:       false,
    langueFr:         true,
  })

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const ROLES = [
    { r: 'Administrateur',    p: 'Accès complet — tous modules' },
    { r: 'Gestionnaire RH',   p: 'Agents, recrutement, carrière, formation' },
    { r: 'Gestionnaire Paie', p: 'Paie, banque, bulletins' },
    { r: 'Consultant',        p: 'Lecture seule sur agents et structure' },
    { r: 'Agent',             p: 'Consultation de son propre dossier' },
    { r: 'Auditeur',          p: 'Lecture historique uniquement' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1f3c', marginBottom: '4px' }}>Paramètres</h1>
        <p style={{ fontSize: '13px', color: '#9aa3b5' }}>Profil utilisateur, préférences et sécurité</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* ── Profil ── */}
        <div style={card}>
          <div style={cardHeader}>
            <User size={15} color="#5a6478" />
            <span style={cardTitle}>Profil</span>
          </div>
          <div style={cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Nom</label>
                <input style={inp} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Nom complet" />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input style={inp} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="email@instat.mg" />
              </div>
              <div>
                <label style={lbl}>Téléphone</label>
                <input style={inp} value={profile.tel} onChange={e => setProfile(p => ({ ...p, tel: e.target.value }))} placeholder="+261 …" />
              </div>
              <div>
                <label style={lbl}>Rôle</label>
                <input style={inpDisabled} value={profile.role} disabled />
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ borderTop: '1px solid #f0f2f7', marginBottom: '20px' }} />

            {/* Mot de passe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Lock size={14} color="#5a6478" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1f3c' }}>Changer le mot de passe</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Mot de passe actuel</label>
                <input style={inp} type="password" value={pwdActuel} onChange={e => setPwdActuel(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label style={lbl}>Nouveau mot de passe</label>
                <input style={inp} type="password" value={pwdNouv} onChange={e => setPwdNouv(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { setProfile({ name: 'Admin SIRH', email: 'admin@instat.mg', tel: '+261 20 22 000 00', role: 'Administrateur' }); setPwdActuel(''); setPwdNouv('') }}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e6ef', background: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', color: '#5a6478' }}
              >
                <X size={13} /> Annuler
              </button>
              <button
                onClick={handleSave}
                style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: saved ? '#27ae60' : '#1a1f3c', color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.3s' }}
              >
                <Save size={13} /> {saved ? 'Enregistré !' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Préférences ── */}
        <div style={card}>
          <div style={cardHeader}>
            <Bell size={15} color="#5a6478" />
            <span style={cardTitle}>Préférences</span>
          </div>
          <div style={cardBody}>
            <Pref
              icon={<Bell size={14} />}
              label="Notifications email"
              desc="Recevoir les alertes par email"
              checked={prefs.notifEmail}
              onChange={() => togglePref('notifEmail')}
            />
            <Pref
              icon={<Bell size={14} />}
              label="Notifications recrutement"
              desc="Étapes du workflow"
              checked={prefs.notifRecrutement}
              onChange={() => togglePref('notifRecrutement')}
            />
            <Pref
              icon={<Bell size={14} />}
              label="Notifications paie"
              desc="Validation mensuelle"
              checked={prefs.notifPaie}
              onChange={() => togglePref('notifPaie')}
            />

            <div style={{ borderTop: '1px solid #e2e6ef', margin: '8px 0' }} />

            <Pref
              icon={<Moon size={14} />}
              label="Mode sombre"
              desc="Interface foncée"
              checked={prefs.modeSombre}
              onChange={() => togglePref('modeSombre')}
            />
            <Pref
              icon={<Globe size={14} />}
              label="Langue française"
              desc="Interface en français"
              checked={prefs.langueFr}
              onChange={() => togglePref('langueFr')}
            />
          </div>
        </div>

        {/* ── Rôles & Permissions ── */}
        <div style={{ ...card, gridColumn: '1 / -1' }}>
          <div style={cardHeader}>
            <Shield size={15} color="#5a6478" />
            <span style={cardTitle}>Rôles & permissions</span>
            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#9aa3b5', fontWeight: 500 }}>lecture seule</span>
          </div>
          <div style={cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {ROLES.map(({ r, p }) => {
                const isCurrentRole = r === profile.role
                return (
                  <div
                    key={r}
                    style={{
                      border: `1px solid ${isCurrentRole ? '#1a1f3c' : '#e2e6ef'}`,
                      borderRadius: '10px', padding: '14px',
                      background: isCurrentRole ? '#1a1f3c08' : '#fff',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {isCurrentRole && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#1a1f3c' }} />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1f3c' }}>{r}</span>
                      {isCurrentRole && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a1f3c', background: '#1a1f3c18', padding: '2px 8px', borderRadius: '20px' }}>
                          Votre rôle
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#9aa3b5', lineHeight: 1.4 }}>{p}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}