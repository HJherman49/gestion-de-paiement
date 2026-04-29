import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { AgentsPage } from './pages/AgentsPage'
import { AdminModal } from './components/AdminModal'

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard')
  const [showAdmin, setShowAdmin] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'agents':
        return <AgentsPage />
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
      <Navbar activePage={activePage} onNavigate={setActivePage} onOpenAdmin={() => setShowAdmin(true)} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
    </div>
  )
}

export default App