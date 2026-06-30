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
  parametres:   [],
}

const canAccess = (page: string, permissions: string[]): boolean => {
  const required = PAGE_PERMISSIONS[page]
  if (!required || required.length === 0) return true
  return required.some(p => permissions.includes(p))
}

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
  { id: 'historique', label: 'Historique' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'contact',    label: 'Contact' },
]

export const Navbar: React.FC<NavbarProps> = ({
  activePage, onNavigate, onOpenAdmin, user, onLogout, userPermissions,
}) => {
  const [isMenuOpen, setIsMenuOpen]     = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchValue, setSearchValue]   = useState('')

  const navItems   = ALL_NAV_ITEMS.filter(item => canAccess(item.id, userPermissions))
  const quickLinks = ALL_QUICK_LINKS.filter(item => canAccess(item.id, userPermissions))

  const handleNavigate = (page: string) => {
    onNavigate(page)
    setIsMobileOpen(false)
    setIsMenuOpen(false)
  }

  return (
    <header className="navbar-header">
      <nav className="main-navbar">
        <div className="navbar-container">

          {/* Logo */}
    <div className="navbar-logo">
      <div className="navbar-logo-circle">
        <img src={logoInstat} alt="INSTAT" className="logo-img" />
      </div>
    </div>

          {/* Onglets — cachés sur mobile */}
          <div className="navbar-items">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`nav-item-btn ${activePage === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Zone droite */}
          <div className="navbar-right">

            {/* Bouton accès rapide — desktop */}
            <button className="menu-btn desktop-only" onClick={() => setIsMenuOpen(v => !v)} title="Accès rapide">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Recherche — cachée sur petit mobile */}
            <div className="search-container desktop-search">
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

            {/* Avatar utilisateur */}
            <div className="user-info" onClick={onLogout} title="Se déconnecter">
              <div className="user-text">
                <div>{user?.name || 'Admin'}</div>
                <div className="user-email">{user?.role || user?.email || 'Administrateur'}</div>
              </div>
              <div className="user-avatar">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Hamburger — mobile uniquement */}
            <button
              className="hamburger-btn"
              onClick={() => setIsMobileOpen(v => !v)}
              title="Menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Dropdown accès rapide — desktop */}
      {isMenuOpen && (
        <div className="dropdown-menu" onClick={() => setIsMenuOpen(false)}>
          <div className="menu-section">
            <p className="menu-title">Accès rapide</p>
            {quickLinks.map(link => (
              <a key={link.id} onClick={() => handleNavigate(link.id)} className="menu-link">
                {link.label}
              </a>
            ))}
            {userPermissions.includes('utilisateurs.voir') && (
              <button onClick={() => { onOpenAdmin(); setIsMenuOpen(false) }} className="menu-admin-btn">
                <Plus size={18} /> Admin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Menu mobile complet */}
      {isMobileOpen && (
        <div className="mobile-menu">

          {/* Recherche mobile */}
          <div className="mobile-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Navigation */}
          <p className="mobile-section-title">Navigation</p>
          {navItems.map(item => (
            <a
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`mobile-link ${activePage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}

          <hr className="mobile-divider" />

          {/* Liens rapides */}
          <p className="mobile-section-title">Accès rapide</p>
          {quickLinks.map(link => (
            <a key={link.id} onClick={() => handleNavigate(link.id)} className="mobile-link">
              {link.label}
            </a>
          ))}

          {userPermissions.includes('utilisateurs.voir') && (
            <button onClick={() => { onOpenAdmin(); setIsMobileOpen(false) }} className="mobile-admin-btn">
              <Plus size={18} /> Admin
            </button>
          )}

          <hr className="mobile-divider" />

          {/* Déconnexion */}
          <button onClick={onLogout} className="mobile-logout-btn">
            Déconnexion · {user?.name}
          </button>
        </div>
      )}
    </header>
  )
}