import React, { useState } from 'react'
import { Search, Bell, ChevronDown, Plus } from 'lucide-react'

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
  onOpenAdmin: () => void
}

const NAV_ITEMS: { id: string; label: string; children?: string[] }[] = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'agents', label: 'Agents' },
  { id: 'recrutement', label: 'Recrutement' },
  { id: 'carriere', label: 'Carrière & Paie' },
  { id: 'services', label: 'Services & Ressources' },
  { id: 'about', label: 'Qui sommes-nous ?' },
]

const QUICK_LINKS = ['Actualités', 'Historique', 'Paramètres', 'Contact']

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, onOpenAdmin }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Barre noire supérieure - style INSTAT */}
      <div style={{
        background: 'var(--instat-dark)',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        gap: 0,
      }}>
        {QUICK_LINKS.map((link, i) => (
          <a key={link} style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            padding: '0 14px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderLeft: i === 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
            borderRight: '1px solid rgba(255,255,255,0.12)',
            textDecoration: 'none',
            transition: 'color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#fff'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            {link}
          </a>
        ))}

        {/* Bouton + Administration */}
        <button
          onClick={onOpenAdmin}
          title="Administration — Référentiels"
          style={{
            height: '36px',
            padding: '0 14px',
            background: 'var(--instat-red)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.3px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#a93226'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--instat-red)'}
        >
          <Plus size={14} strokeWidth={3} />
          Admin
        </button>
      </div>

      {/* Navbar principale */}
      <nav style={{
        background: '#fff',
        borderBottom: '3px solid var(--instat-red)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--instat-dark)',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}>instat</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--instat-red)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              paddingBottom: '2px',
            }}>SIRH</span>
          </div>
          <span style={{ fontSize: '9px', color: 'var(--instat-gray-400)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Système RH · Madagascar
          </span>
        </div>

        {/* Navigation items */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '60px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => item.children && setOpenDropdown(item.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                onClick={() => onNavigate(item.id)}
                style={{
                  height: '60px',
                  padding: '0 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activePage === item.id ? '3px solid var(--instat-red)' : '3px solid transparent',
                  marginBottom: '-3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12.5px',
                  fontWeight: activePage === item.id ? 600 : 500,
                  color: activePage === item.id ? 'var(--instat-dark)' : 'var(--instat-gray-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => {
                  if (activePage !== item.id) (e.currentTarget as HTMLElement).style.color = 'var(--instat-dark)'
                }}
                onMouseLeave={e => {
                  if (activePage !== item.id) (e.currentTarget as HTMLElement).style.color = 'var(--instat-gray-600)'
                }}
              >
                {item.label}
                {item.children && <ChevronDown size={12} style={{ opacity: 0.5 }} />}
              </button>

              {/* Dropdown */}
              {item.children && openDropdown === item.id && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  left: 0,
                  background: '#fff',
                  border: '1px solid var(--instat-gray-200)',
                  borderTop: '3px solid var(--instat-red)',
                  borderRadius: '0 0 8px 8px',
                  minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 200,
                }}>
                  {item.children.map(child => (
                    <div
                      key={child}
                      style={{
                        padding: '10px 18px',
                        fontSize: '13px',
                        color: 'var(--instat-gray-600)',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--instat-gray-100)',
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--instat-gray-50)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--instat-dark)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#fff'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--instat-gray-600)'
                      }}
                    >
                      {child}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: search + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--instat-gray-400)' }} />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              style={{
                paddingLeft: '30px',
                paddingRight: '12px',
                height: '34px',
                width: '200px',
                border: '1px solid var(--instat-gray-200)',
                borderRadius: '20px',
                fontSize: '12px',
                color: 'var(--instat-gray-600)',
                background: 'var(--instat-gray-50)',
                outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="var(--instat-gray-400)" />
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: 'var(--instat-red)', color: '#fff',
              borderRadius: '50%', width: '14px', height: '14px',
              fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600,
            }}>3</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--instat-dark)' }}>Admin</div>
              <div style={{ fontSize: '11px', color: 'var(--instat-gray-400)' }}>Administrateur</div>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--instat-dark)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>A</div>
          </div>
        </div>
      </nav>
    </header>
  )
}