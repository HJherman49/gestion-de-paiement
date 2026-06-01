import React, { useState } from 'react'
import { Search, Plus, Menu, X } from 'lucide-react'
import '../styles/components/Navbar.css'
import { NotificationPanel } from './Notificationpanel'
import logoInstat from '../assets/logo-instat.png'

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
  onOpenAdmin: () => void
  user?: any
  onLogout?: () => void
  userPermissions: string[]
}

<<<<<<< HEAD
const NAV_ITEMS = [
=======
// Page Permissions mapping
const PAGE_PERMISSIONS: Record<string, string[]> = {
  dashboard:    [],
  agents:       ['agents.voir'],
  bareme:       ['baremes.voir'],
  paie:         ['paies.voir'],
  carriere:     ['carrieres.voir'],
  reclassement: ['reclassements.voir'],
  banque:       ['banques.voir', 'comptes_bancaires.voir'],
  fonction:     ['fonctions.voir'],
  preembauche:  ['preembauches.voir'],
  historique:   ['historique.voir'],
  parametres:   ['parametres.voir', 'utilisateurs.voir'],
}

// Helper function for permission check
const canAccess = (page: string, permissions: string[]): boolean => {
  const required = PAGE_PERMISSIONS[page]
  if (!required || required.length === 0) return true
  if (required.includes('parametres.voir')) return true
  return required.some(p => permissions.includes(p))
}

const ALL_ITEMS: { id: string; label: string; children?: string[] }[] = [
>>>>>>> 7bbca741af64d4d99bdd28dbc8488368093643fb
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'agents', label: 'Agents' },
  { id: 'bareme', label: 'Bareme' },
  { id: 'carriere', label: 'Carrière' },
  { id: 'reclassement', label: 'Reclassement' },
  { id: 'banque', label: 'Banque' },
  { id: 'fonction', label: 'Fonction' },
  { id: 'preembauche', label: 'Préembauche' },
  { id: 'paie', label: 'Paiement' },
]

const QUICK_LINKS = [
  { id: 'actualite', label: 'Actualités' },
  { id: 'historique', label: 'Historique' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'contact', label: 'Contact' }
]

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, onOpenAdmin, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

<<<<<<< HEAD
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
=======
  // Filter menu items based on user permissions
  const userPermissions = user?.permissions ?? []
  const menuItems = ALL_ITEMS.filter(item =>
    canAccess(item.id, userPermissions)
  )
>>>>>>> 7bbca741af64d4d99bdd28dbc8488368093643fb

  return (
    <header className="navbar-header">
      {/* Main Navigation */}
      <nav className="main-navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <div className="navbar-logo-content">
              <img src={logoInstat} alt="INSTAT" className="logo-img" />
              <span className="logo-badge">SIRH</span>
            </div>
            <span className="navbar-subtitle">Système RH · Madagascar</span>
          </div>

<<<<<<< HEAD
          {/* Onglets principaux */}
          <div className="navbar-items">
            {NAV_ITEMS.map(item => (
=======
        {/* Navigation items */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '60px', flex: 1 }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => item.children && setOpenDropdown(item.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
>>>>>>> 7bbca741af64d4d99bdd28dbc8488368093643fb
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item-btn ${activePage === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Zone droite */}
          <div className="navbar-right">
            {/* Bouton Menu ☰ */}
            <button className="menu-btn" onClick={toggleMenu} title="Accès rapide">
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Recherche */}
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>

            <NotificationPanel />

            {/* Utilisateur */}
            <div className="user-info" onClick={onLogout} title="Se déconnecter">
              <div className="user-text">
                <div>{user?.name || 'Admin'}</div>
                <div className="user-email">{user?.email || 'Administrateur'}</div>
              </div>
              <div className="user-avatar">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu déroulant (Desktop + Mobile) */}
      {isMenuOpen && (
        <div className="dropdown-menu">
          <div className="menu-section">
            <p className="menu-title">Accès rapide</p>
            
            {QUICK_LINKS.map(link => (
              <a
                key={link.id}
                onClick={() => {
                  onNavigate(link.id)
                  setIsMenuOpen(false)
                }}
                className="menu-link"
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => {
                onOpenAdmin()
                setIsMenuOpen(false)
              }}
              className="menu-admin-btn"
            >
              <Plus size={18} /> + Admin
            </button>
          </div>
        </div>
      )}
    </header>
  )
}