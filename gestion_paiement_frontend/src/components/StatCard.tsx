import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import '../styles/components/StatCard.css'

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
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '12px 12px 0 0' }} />

      <div className="stat-card-header">
        <span className="stat-card-label">
          {label}
        </span>
        {icon && (
          <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
            {icon}
          </div>
        )}
      </div>

      <div className="stat-card-value">
        <span className="stat-card-number" style={{ color, fontFamily: 'DM Mono, monospace' }}>
          {value}
        </span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>

      {delta && (
        <div className={`stat-card-delta ${deltaType}`}>
          {deltaType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  )
}