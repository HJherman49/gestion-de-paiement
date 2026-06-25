import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'
import { Dashboard } from './pages/Dashboard'
import { AgentsPage } from './pages/AgentsPage'
import { ParametresPage } from './pages/Parametrespage'
import { BaremePage } from './pages/BaremePage'
import { PaiePage } from './pages/PaiePage'
import { CarrierePage } from './pages/CarrierePage'
import { ReclassementPage } from './pages/ReclassementPage'
import { BanquePage } from './pages/BanquePage'
import { FonctionPage } from './pages/FonctionPage'
import { PreembauchePage } from './pages/PreembauchePage'
import { AdminModal } from './components/AdminModal'
import { HistoriquePage } from './pages/HistoriquePage'
import api, { sanctumApi } from './axios'

// ── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id:          number
  name:        string
  email:       string
  role:        string
  permissions: string[]
}

// ── Pages accessibles par rôle ────────────────────────────────────────────────
// Clé = page, valeur = permissions requises (au moins une suffit)

const PAGE_PERMISSIONS: Record<string, string[]> = {
  dashboard:    [],                          // tout le monde
  agents:       ['agents.voir'],
  bareme:       ['baremes.voir'],
  paie:         ['paies.voir'],
  carriere:     ['carrieres.voir'],
  reclassement: ['reclassements.voir'],
  banque:       ['banques.voir', 'comptes_bancaires.voir'],
  fonction:     ['fonctions.voir'],
  preembauche:  ['preembauches.voir'],
  historique:   ['historique.voir'],
  parametres:   ['parametres.voir', 'utilisateurs.voir'], // tout le monde pour son profil
}

// ── Helper ────────────────────────────────────────────────────────────────────

const canAccess = (page: string, permissions: string[]): boolean => {
  const required = PAGE_PERMISSIONS[page]
  if (!required || required.length === 0) return true           // dashboard = libre
  if (required.includes('parametres.voir')) return true         // paramètres = toujours
  return required.some(p => permissions.includes(p))
}

// ── App ───────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [activePage, setActivePage]         = useState('dashboard')
  const [showAdmin, setShowAdmin]           = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser]                     = useState<UserData | null>(null)
  const [token, setToken]                   = useState<string | null>(null)
  const [authLoading, setAuthLoading]       = useState(true)

  // ── Vérifier le token au démarrage ─────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) { setAuthLoading(false); return }

    setToken(storedToken)

    api.get('/utilisateurs/me')
      .then(res => {
        const data = res.data.data
        setUser({
          id:          data.id,
          name:        data.name,
          email:       data.email,
          role:        data.role,
          permissions: data.permissions ?? [],
        })
        setIsAuthenticated(true)
      })
      .catch(() => {
        // Fallback : essayer /user si /utilisateurs/me pas encore déployé
        api.get('/user')
          .then(res => {
            const data = res.data.data ?? res.data
            setUser({
              id:          data.id ?? 0,
              name:        data.name,
              email:       data.email,
              role:        data.role ?? 'Administrateur',
              permissions: data.permissions ?? [],
            })
            setIsAuthenticated(true)
          })
          .catch(() => {
            localStorage.removeItem('token')
            setToken(null); setUser(null); setIsAuthenticated(false)
          })
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const handleLogin = (newToken: string, userData: any) => {
    setToken(newToken)
    // Charger les permissions depuis /utilisateurs/me après login
    api.get('/utilisateurs/me')
      .then(res => {
        const data = res.data.data
        setUser({
          id:          data.id,
          name:        data.name,
          email:       data.email,
          role:        data.role,
          permissions: data.permissions ?? [],
        })
      })
      .catch(() => {
        // Fallback si /utilisateurs/me pas encore dispo
        setUser({
          id:          userData.id ?? 0,
          name:        userData.name,
          email:       userData.email,
          role:        userData.role ?? 'Administrateur',
          permissions: userData.permissions ?? [],
        })
      })
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try { await sanctumApi.post('/api/v1/logout') } catch {}
    localStorage.removeItem('token')
    setToken(null); setUser(null); setIsAuthenticated(false)
  }

  // ── Navigation protégée ────────────────────────────────────────────────────
  const handleNavigate = (page: string) => {
    if (!user) return
    if (canAccess(page, user.permissions)) {
      setActivePage(page)
    }
    // Si pas accès → ne pas naviguer (la Navbar n'affiche que les pages autorisées)
  }

  // ── Rendu de la page active ────────────────────────────────────────────────
  const renderPage = () => {
    // Vérification de sécurité côté client
    if (user && !canAccess(activePage, user.permissions) && activePage !== 'dashboard') {
      return <AccessDenied onBack={() => setActivePage('dashboard')} />
    }

    switch (activePage) {
      case 'dashboard':    return <Dashboard />
      case 'agents':       return <AgentsPage />
      case 'bareme':       return <BaremePage />
      case 'paie':         return <PaiePage />
      case 'carriere':     return <CarrierePage />
      case 'reclassement': return <ReclassementPage />
      case 'banque':       return <BanquePage />
      case 'fonction':     return <FonctionPage />
      case 'preembauche':  return <PreembauchePage />
      case 'historique':   return <HistoriquePage />
      case 'parametres':   return <ParametresPage />
      default: return <PageEnDev onBack={() => setActivePage('dashboard')} />
    }
  }

  // ── États de chargement et auth ────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'DM Sans, sans-serif', flexDirection: 'column', gap: 12, color: 'var(--instat-gray-400)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--instat-gray-200)', borderTopColor: 'var(--instat-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 14 }}>Vérification de la session...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--instat-gray-50)' }}>
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setShowAdmin(true)}
        user={user}
        onLogout={handleLogout}
        // Passer les permissions pour filtrer la navbar
        userPermissions={user?.permissions ?? []}
      />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 93px)' }}>
        {renderPage()}
      </main>
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
    </div>
  )
}

// ── Composants utilitaires ────────────────────────────────────────────────────

const AccessDenied: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ padding: '80px 32px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--instat-dark)', marginBottom: 8 }}>
      Accès refusé
    </h2>
    <p style={{ fontSize: 14, color: 'var(--instat-gray-400)', marginBottom: 24 }}>
      Vous n'avez pas les permissions nécessaires pour accéder à cette page.
    </p>
    <button onClick={onBack} style={{ padding: '10px 24px', background: 'var(--instat-dark)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
      Retour au tableau de bord
    </button>
  </div>
)

const PageEnDev: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ padding: '60px 32px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--instat-dark)', marginBottom: 8 }}>
      Page en cours de développement
    </h2>
    <p style={{ fontSize: 14, color: 'var(--instat-gray-400)' }}>Cette section sera disponible prochainement.</p>
    <button onClick={onBack} style={{ marginTop: 24, padding: '10px 24px', background: 'var(--instat-dark)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
      Retour au tableau de bord
    </button>
  </div>
)

export default App