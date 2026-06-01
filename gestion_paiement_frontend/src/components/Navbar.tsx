import React, { useState } from 'react'
import { Search, Plus, Menu, X } from 'lucide-react'
import '../styles/components/Navbar.css'
import { NotificationPanel } from './Notificationpanel'
import logoInstat from '../assets/logo-instat.png'

interface NavbarProps {
  activePage:      string
  onNavigate:      (page: string) => void
  onOpenAdmin:     () => void
  user?:           any
  onLogout?:       () => void
  userPermissions: string[]
}

// ── Mapping page → permissions requises ───────────────────────────────────────
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
  parametres:   [],  // tout le monde peut accéder aux paramètres
}

const canAccess = (page: string, permissions: string[]): boolean => {
  const required = PAGE_PERMISSIONS[page]
  if (!required || required.length === 0) return true
  return required.some(p => permissions.includes(p))
}

// ── Items de navigation ───────────────────────────────────────────────────────
const ALL_NAV_ITEMS = [
  { id: 'dashboard',    label: 'Tableau de bord' },
  { id: 'agents',       label: 'Agents' },
  { id: 'bareme',       label: 'Barème' },
  { id: 'carriere',     label: 'Carrière' },
  { id: 'reclassement', label: 'Reclassement' },
  { id: 'banque',       label: 'Banque' },
  { id: 'fonction',     label: 'Fonction' },
  { id: 'preembauche',  label: 'Préembauche' },
  { id: 'paie',         label: 'Paiement' },
]

const ALL_QUICK_LINKS = [
  { id: 'actualite',  label: 'Actualités' },
  { id: 'historique', label: 'Historique' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'contact',    label: 'Contact' },
]

// ── Composant ─────────────────────────────────────────────────────────────────

export const Navbar: React.FC<NavbarProps> = ({
  activePage, onNavigate, onOpenAdmin, user, onLogout, userPermissions,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Filtrer les items selon les permissions
  const navItems   = ALL_NAV_ITEMS.filter(item => canAccess(item.id, userPermissions))
  const quickLinks = ALL_QUICK_LINKS.filter(item => canAccess(item.id, userPermissions))

  const toggleMenu = () => setIsMenuOpen(prev => !prev)

  return (
    <header className="navbar-header">

      {/* Navigation principale */}
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

          {/* Onglets principaux — filtrés par permissions */}
          <div className="navbar-items">
            {navItems.map(item => (
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
                onChange={e => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>

            <NotificationPanel />

            {/* Utilisateur — clic pour déconnecter */}
            <div className="user-info" onClick={onLogout} title="Se déconnecter" style={{ cursor: 'pointer' }}>
              <div className="user-text">
                <div>{user?.name || 'Admin'}</div>
                <div className="user-email">{user?.role || user?.email || 'Administrateur'}</div>
              </div>
              <div className="user-avatar">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="dropdown-menu">
          <div className="menu-section">
            <p className="menu-title">Accès rapide</p>

            {quickLinks.map(link => (
              <a
                key={link.id}
                onClick={() => { onNavigate(link.id); setIsMenuOpen(false) }}
                className="menu-link"
                style={{ cursor: 'pointer' }}
              >
                {link.label}
              </a>
            ))}

            {/* Bouton Admin — uniquement pour Administrateur */}
            {userPermissions.includes('utilisateurs.voir') && (
              <button
                onClick={() => { onOpenAdmin(); setIsMenuOpen(false) }}
                className="menu-admin-btn"
              >
                <Plus size={18} /> + Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}