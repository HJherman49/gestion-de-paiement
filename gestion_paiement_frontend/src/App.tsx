import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'
import { Dashboard } from './pages/Dashboard'
import { AgentsPage } from './pages/AgentsPage'
import { ParametresPage } from './pages/Parametrespage'
import {BaremePage} from "./pages/BaremePage"
import { PaiePage } from './pages/PaiePage'
import {CarrierePage} from "./pages/CarrierePage"
import {ReclassementPage} from "./pages/ReclassementPage"
import {BanquePage} from "./pages/BanquePage"
import { FonctionPage } from './pages/FonctionPage'
import { PreembauchePage } from './pages/PreembauchePage'
import { AdminModal } from './components/AdminModal'
import { HistoriquePage } from './pages/HistoriquePage'
import api, { sanctumApi } from './axios'

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard')
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setAuthLoading(false)
      return
    }

    setToken(storedToken)

    api.get('/user')
      .then((response) => {
        setUser(response.data.data)
        setIsAuthenticated(true)
      })
      .catch((error) => {
        console.error('Token validation failed:', error)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
      })
      .finally(() => {
        setAuthLoading(false)
      })
  }, [])

  const handleLogin = (newToken: string, userData: any) => {
    setToken(newToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await sanctumApi.post('/api/v1/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span>Chargement en cours...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'agents':
        return <AgentsPage />
      case 'bareme':
        return <BaremePage />
      case 'paie':
        return <PaiePage />
      case 'carriere':
        return <CarrierePage />
      case 'reclassement':
        return <ReclassementPage />
      case 'banque':
        return <BanquePage />
      case 'fonction':
        return <FonctionPage />
      case 'preembauche':
        return <PreembauchePage />
      case 'historique':
        return <HistoriquePage />
      case 'parametres':
        return <ParametresPage />
      default:
        return (
          <div style={{
            padding: '60px 32px',
            textAlign: 'center',
            color: 'var(--instat-gray-400)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--instat-dark)', marginBottom: '8px' }}>
              Page en cours de développement
            </h2>
            <p style={{ fontSize: '14px' }}>
              Cette section sera disponible prochainement.
            </p>
            <button
              onClick={() => setActivePage('dashboard')}
              style={{
                marginTop: '24px',
                padding: '10px 24px',
                background: 'var(--instat-dark)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Retour au tableau de bord
            </button>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--instat-gray-50)' }}>
      <Navbar activePage={activePage} onNavigate={setActivePage} onOpenAdmin={() => setShowAdmin(true)} user={user} onLogout={handleLogout} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
    </div>
  )
}

export default App