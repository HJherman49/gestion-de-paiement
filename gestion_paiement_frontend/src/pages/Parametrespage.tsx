import React, { useState, useEffect } from 'react'
import {
  User, Lock, Bell, Moon, Globe, Shield, Save, X,
  Plus, Pencil, Trash2, Users, Key, Check, Loader2,
  Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  getUtilisateurs, createUtilisateur, updateUtilisateur, deleteUtilisateur,
  getRoles, getMe, updateProfil,
  type UserFromAPI, type RoleFromAPI, type UserPayload,
  MODULE_LABELS, ACTION_LABELS, ROLE_COLORS,
} from '../services/permissionService'
import '../styles/pages/ParametresPage.css'

type TabKey = 'profil' | 'utilisateurs' | 'roles'

// ── Toggle switch 
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button className={`prm-toggle ${checked ? 'on' : ''}`} onClick={onChange} type="button" aria-label="Changer permission">
    <span className="prm-toggle-knob" />
  </button>
)

export const ParametresPage: React.FC = () => {
  const [tab, setTab]   = useState<TabKey>('profil')
  const [myRole, setMyRole] = useState<string>('')
  const [myPermissions, setMyPermissions] = useState<string[]>([])

  const hasPermission = (permission: string) => myPermissions.includes(permission)
  const canViewUsers   = hasPermission('utilisateurs.voir')
  const canCreateUsers = hasPermission('utilisateurs.creer')
  const canModifyUsers = hasPermission('utilisateurs.modifier')
  const canDeleteUsers = hasPermission('utilisateurs.supprimer')
  const canViewRoles   = hasPermission('parametres.voir')

  // ── Profil 
  const [profil, setProfil]     = useState({ name: '', email: '', role: '' })
  const [pwdActuel, setPwdActuel]   = useState('')
  const [pwdNouv, setPwdNouv]       = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [savingProfil, setSavingProfil] = useState(false)
  const [profilMsg, setProfilMsg]   = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [prefs, setPrefs] = useState({
    notifEmail: true, notifRecrutement: true,
    notifPaie: false, modeSombre: false, langueFr: true,
  })
  const togglePref = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  // ── Utilisateurs 
  const [users, setUsers]           = useState<UserFromAPI[]>([])
  const [roles, setRoles]           = useState<RoleFromAPI[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editUser, setEditUser]     = useState<UserFromAPI | null>(null)
  const [userForm, setUserForm]     = useState<UserPayload>({ name: '', email: '', password: '', role: '' })
  const [savingUser, setSavingUser] = useState(false)
  const [userMsg, setUserMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // ── Rôles 
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  // ── Chargement initial 
  useEffect(() => {
    getMe()
      .then(r => {
        const d = r.data.data
        setProfil({ name: d.name, email: d.email, role: d.role })
        setMyRole(d.role)
        const perms = d.permissions ?? []
        setMyPermissions(perms)

        if (perms.includes('utilisateurs.voir')) {
          loadUsers()
        }
        if (perms.includes('parametres.voir')) {
          getRoles()
            .then(r => setRoles(r.data.data ?? []))
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const r = await getUtilisateurs()
      setUsers(r.data.data ?? [])
    } catch {}
    finally { setLoadingUsers(false) }
  }

  // ── Sauvegarder profil 
  const handleSaveProfil = async () => {
    setSavingProfil(true); setProfilMsg(null)
    try {
      await updateProfil({
        name:             profil.name,
        email:            profil.email,
        password_actuel:  pwdActuel  || undefined,
        password_nouveau: pwdNouv    || undefined,
      })
      setPwdActuel(''); setPwdNouv('')
      setProfilMsg({ type: 'ok', text: 'Profil mis à jour avec succès' })
    } catch (err: any) {
      setProfilMsg({ type: 'err', text: err.response?.data?.message ?? 'Erreur lors de la sauvegarde' })
    } finally {
      setSavingProfil(false)
      setTimeout(() => setProfilMsg(null), 3000)
    }
  }

  // ── Sauvegarder utilisateur
  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      setUserMsg({ type: 'err', text: 'Nom, email et rôle sont obligatoires' })
      return
    }
    setSavingUser(true); setUserMsg(null)
    try {
      if (editUser) {
        const payload: Partial<UserPayload> = { name: userForm.name, email: userForm.email, role: userForm.role }
        if (userForm.password) payload.password = userForm.password
        await updateUtilisateur(editUser.id, payload)
        setUserMsg({ type: 'ok', text: 'Utilisateur modifié' })
      } else {
        if (!userForm.password) { setUserMsg({ type: 'err', text: 'Le mot de passe est obligatoire' }); return }
        await createUtilisateur(userForm)
        setUserMsg({ type: 'ok', text: 'Utilisateur créé avec succès' })
      }
      loadUsers()
      setShowUserForm(false)
      setEditUser(null)
      setUserForm({ name: '', email: '', password: '', role: '' })
    } catch (err: any) {
      const v = err.response?.data?.errors
      setUserMsg({ type: 'err', text: v ? Object.values(v).flat().join(' | ') as string : err.response?.data?.message ?? 'Erreur' })
    } finally {
      setSavingUser(false)
    }
  }

  const handleDeleteUser = async (user: UserFromAPI) => {
    if (!confirm(`Supprimer l'utilisateur ${user.name} ?`)) return
    try {
      await deleteUtilisateur(user.id)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur')
    }
  }

  const openEdit = (u: UserFromAPI) => {
    setEditUser(u)
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowUserForm(true)
  }

  const isAdmin = myRole === 'Administrateur'

  // ── Grouper permissions par module 
  const groupPermissions = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {}
    permissions.forEach(p => {
      const [module, action] = p.split('.')
      if (!grouped[module]) grouped[module] = []
      grouped[module].push(action)
    })
    return grouped
  }

  return (
    <div className="prm-page">

      {/* Header */}
      <div className="prm-header">
        <h1 className="prm-title">Paramètres</h1>
        <p className="prm-subtitle">Profil utilisateur, gestion des comptes et permissions</p>
      </div>

      {/* Onglets */}
      <div className="prm-tabs">
        {[
          { key: 'profil',       label: 'Mon profil',        icon: <User size={14} /> },
          { key: 'utilisateurs', label: 'Utilisateurs',      icon: <Users size={14} />, permission: 'utilisateurs.voir' },
          { key: 'roles',        label: 'Rôles & Permissions',icon: <Shield size={14} />, permission: 'parametres.voir' },
        ].filter(t => !t.permission || hasPermission(t.permission)).map(t => (
          <button
            key={t.key}
            className={`prm-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key as TabKey)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── PROFIL ── */}
      {tab === 'profil' && (
        <div className="prm-grid-2">

          {/* Carte profil */}
          <div className="prm-card">
            <div className="prm-card-header">
              <User size={15} className="prm-card-icon" />
              <span className="prm-card-title">Informations personnelles</span>
            </div>
            <div className="prm-card-body">

              {/* Avatar */}
              <div className="prm-avatar-section">
                <div className="prm-avatar">
                  {profil.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="prm-avatar-name">{profil.name}</div>
                  <div className="prm-avatar-role">
                    <span className="prm-role-badge"
                      style={ROLE_COLORS[profil.role] ? {
                        background: ROLE_COLORS[profil.role].bg,
                        color:      ROLE_COLORS[profil.role].color,
                      } : {}}>
                      {profil.role || 'Aucun rôle'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prm-grid-2-inner">
                <div className="prm-field">
                  <label className="prm-label">Nom complet</label>
                  <input className="prm-input" value={profil.name}
                    onChange={e => setProfil(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nom complet" />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Email</label>
                  <input className="prm-input" type="email" value={profil.email}
                    onChange={e => setProfil(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@instat.mg" />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Rôle</label>
                  <input className="prm-input prm-input--disabled" value={profil.role} disabled aria-label="Rôle utilisateur"/>
                </div>
              </div>

              {/* Changer mot de passe */}
              <div className="prm-section-divider">
                <Lock size={13} /> Changer le mot de passe
              </div>

              <div className="prm-grid-2-inner">
                <div className="prm-field">
                  <label className="prm-label">Mot de passe actuel</label>
                  <div className="prm-pwd-wrapper">
                    <input className="prm-input" type={showPwd ? 'text' : 'password'}
                      value={pwdActuel} onChange={e => setPwdActuel(e.target.value)}
                      placeholder="••••••••" />
                    <button className="prm-pwd-eye" onClick={() => setShowPwd(!showPwd)} type="button">
                      {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div className="prm-field">
                  <label className="prm-label">Nouveau mot de passe</label>
                  <input className="prm-input" type={showPwd ? 'text' : 'password'}
                    value={pwdNouv} onChange={e => setPwdNouv(e.target.value)}
                    placeholder="••••••••" />
                </div>
              </div>

              {/* Message feedback */}
              {profilMsg && (
                <div className={`prm-msg ${profilMsg.type === 'ok' ? 'prm-msg--ok' : 'prm-msg--err'}`}>
                  {profilMsg.type === 'ok' ? <Check size={13} /> : <X size={13} />}
                  {profilMsg.text}
                </div>
              )}

              <div className="prm-actions">
                <button className="prm-btn-save" onClick={handleSaveProfil} disabled={savingProfil}>
                  {savingProfil
                    ? <><Loader2 size={13} className="prm-spin" /> Enregistrement...</>
                    : <><Save size={13} /> Enregistrer</>}
                </button>
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="prm-card">
            <div className="prm-card-header">
              <Bell size={15} className="prm-card-icon" />
              <span className="prm-card-title">Préférences</span>
            </div>
            <div className="prm-card-body">
              {[
                { key: 'notifEmail',       icon: <Bell size={14} />,  label: 'Notifications email',       desc: 'Recevoir les alertes par email' },
                { key: 'notifRecrutement', icon: <Bell size={14} />,  label: 'Notifications recrutement', desc: 'Étapes du workflow' },
                { key: 'notifPaie',        icon: <Bell size={14} />,  label: 'Notifications paie',        desc: 'Validation mensuelle' },
                { key: 'modeSombre',       icon: <Moon size={14} />,  label: 'Mode sombre',               desc: 'Interface foncée' },
                { key: 'langueFr',         icon: <Globe size={14} />, label: 'Langue française',          desc: 'Interface en français' },
              ].map(({ key, icon, label, desc }) => (
                <div key={key} className="prm-pref-row">
                  <div className="prm-pref-icon">{icon}</div>
                  <div className="prm-pref-text">
                    <div className="prm-pref-label">{label}</div>
                    <div className="prm-pref-desc">{desc}</div>
                  </div>
                  <Toggle
                    checked={prefs[key as keyof typeof prefs]}
                    onChange={() => togglePref(key as keyof typeof prefs)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UTILISATEURS ── */}
      {tab === 'utilisateurs' && (
        <div className="prm-card">
          <div className="prm-card-header">
            <Users size={15} className="prm-card-icon" />
            <span className="prm-card-title">Gestion des utilisateurs</span>
            <span className="prm-card-count">{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
            {canCreateUsers && (
              <button className="prm-btn-add" onClick={() => { setEditUser(null); setUserForm({ name: '', email: '', password: '', role: '' }); setShowUserForm(true) }}>
                <Plus size={13} /> Nouvel utilisateur
              </button>
            )}
          </div>

          {/* Formulaire ajout/modification */}
          {showUserForm && (
            <div className="prm-user-form">
              <div className="prm-user-form-title">
                {editUser ? `Modifier — ${editUser.name}` : 'Nouvel utilisateur'}
              </div>

              {userMsg && (
                <div className={`prm-msg ${userMsg.type === 'ok' ? 'prm-msg--ok' : 'prm-msg--err'}`}>
                  {userMsg.type === 'ok' ? <Check size={13} /> : <X size={13} />}
                  {userMsg.text}
                </div>
              )}

              <div className="prm-user-form-grid">
                <div className="prm-field">
                  <label className="prm-label">Nom complet *</label>
                  <input className="prm-input" value={userForm.name}
                    onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nom complet" />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Email *</label>
                  <input className="prm-input" type="email" value={userForm.email}
                    onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@instat.mg" />
                </div>
                <div className="prm-field">
                  <label className="prm-label">{editUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}</label>
                  <input className="prm-input" type="password" value={userForm.password}
                    onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••" />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Rôle *</label>
                  <select className="prm-input" value={userForm.role}
                    onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} title="Rôle">
                    <option value="">-- Sélectionner un rôle --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aperçu permissions du rôle sélectionné */}
              {userForm.role && (
                <div className="prm-role-preview">
                  <Key size={12} />
                  <span>Permissions du rôle <strong>{userForm.role}</strong> :</span>
                  <div className="prm-role-preview-perms">
                    {roles.find(r => r.name === userForm.role)?.permissions.slice(0, 8).map(p => (
                      <span key={p} className="prm-perm-chip">{p.replace('.', ' ')}</span>
                    ))}
                    {(roles.find(r => r.name === userForm.role)?.permissions.length ?? 0) > 8 && (
                      <span className="prm-perm-chip prm-perm-chip--more">
                        +{(roles.find(r => r.name === userForm.role)?.permissions.length ?? 0) - 8} autres
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="prm-user-form-actions">
                <button className="prm-btn-cancel" onClick={() => { setShowUserForm(false); setEditUser(null); setUserMsg(null) }}>
                  <X size={13} /> Annuler
                </button>
                <button className="prm-btn-save" onClick={handleSaveUser} disabled={savingUser}>
                  {savingUser
                    ? <><Loader2 size={13} className="prm-spin" /> Enregistrement...</>
                    : <><Save size={13} /> {editUser ? 'Modifier' : 'Créer'}</>}
                </button>
              </div>
            </div>
          )}

          {/* Liste utilisateurs */}
          <div className="prm-users-list">
            {loadingUsers ? (
              <div className="prm-loading"><Loader2 size={16} className="prm-spin" /> Chargement...</div>
            ) : users.length === 0 ? (
              <div className="prm-empty">Aucun utilisateur trouvé</div>
            ) : users.map(u => {
              const roleColor = ROLE_COLORS[u.role] ?? { bg: '#f0f0f0', color: '#666' }
              const isMe = u.email === profil.email
              return (
                <div key={u.id} className={`prm-user-row ${isMe ? 'prm-user-row--me' : ''}`}>
                  <div className="prm-user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="prm-user-info">
                    <div className="prm-user-name">
                      {u.name}
                      {isMe && <span className="prm-user-me-badge">Vous</span>}
                    </div>
                    <div className="prm-user-email">{u.email}</div>
                  </div>
                  <span className="prm-role-badge" style={{ background: roleColor.bg, color: roleColor.color }}>
                    {u.role}
                  </span>
                  <div className="prm-user-actions">
                    {canModifyUsers && (
                      <button className="prm-icon-btn prm-icon-btn--edit" title="Modifier" onClick={() => openEdit(u)}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {!isMe && canDeleteUsers && (
                      <button className="prm-icon-btn prm-icon-btn--delete" title="Supprimer" onClick={() => handleDeleteUser(u)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RÔLES & PERMISSIONS ── */}
      {tab === 'roles' && (
        <div>
          <div className="prm-roles-grid">
            {roles.map(role => {
              const roleColor   = ROLE_COLORS[role.name] ?? { bg: '#f0f0f0', color: '#666' }
              const isExpanded  = expandedRole === role.name
              const grouped     = groupPermissions(role.permissions)

              return (
                <div key={role.id} className={`prm-role-card ${isExpanded ? 'expanded' : ''}`}
                  style={{ borderTopColor: roleColor.color }}>

                  <div className="prm-role-card-header" onClick={() => setExpandedRole(isExpanded ? null : role.name)}>
                    <div className="prm-role-card-left">
                      <span className="prm-role-badge" style={{ background: roleColor.bg, color: roleColor.color }}>
                        {role.name}
                      </span>
                      <span className="prm-role-users">
                        <Users size={11} /> {role.users_count} utilisateur{role.users_count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="prm-role-card-right">
                      <span className="prm-role-perm-count">{role.permissions.length} permissions</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="prm-role-perms">
                      {Object.entries(grouped).map(([module, actions]) => (
                        <div key={module} className="prm-role-module">
                          <div className="prm-role-module-name">
                            {MODULE_LABELS[module] ?? module}
                          </div>
                          <div className="prm-role-module-actions">
                            {['voir', 'creer', 'modifier', 'supprimer', 'valider'].map(action => {
                              const has = actions.includes(action)
                              return (
                                <span
                                  key={action}
                                  className={`prm-action-chip ${has ? 'has' : 'no'}`}
                                >
                                  {has ? <Check size={10} /> : <X size={10} />}
                                  {ACTION_LABELS[action] ?? action}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {roles.length === 0 && (
            <div className="prm-empty">
              Aucun rôle trouvé. Lancez le seeder : <code>php artisan db:seed --class=RolePermissionSeeder</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}