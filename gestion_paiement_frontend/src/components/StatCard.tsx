import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  color?: string
  icon?: React.ReactNode
  unit?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, delta, deltaType = 'up', color = 'var(--instat-dark)', icon, unit
}) => {
  const deltaColor = deltaType === 'up' ? 'var(--green)' : deltaType === 'down' ? 'var(--instat-red)' : 'var(--instat-gray-400)'

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--instat-gray-200)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '12px 12px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--instat-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '13px', color: 'var(--instat-gray-400)', fontWeight: 500 }}>{unit}</span>}
      </div>

      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {deltaType === 'up' ? <TrendingUp size={12} color={deltaColor} /> : <TrendingDown size={12} color={deltaColor} />}
          <span style={{ fontSize: '12px', color: deltaColor, fontWeight: 500 }}>{delta}</span>
        </div>
      )}
    </div>
  )
}