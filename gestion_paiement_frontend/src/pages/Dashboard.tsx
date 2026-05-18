import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { Users, UserPlus, TrendingUp, Wallet, Clock } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { evolutionData, repartitionStatut, recrutements } from '../data/mockData'
import '../styles/pages/Dashboard.css'

type ChartView = 'effectifs' | 'recrutements' | 'masse'

const CHART_OPTIONS: { key: ChartView; label: string }[] = [
  { key: 'effectifs', label: 'Effectifs' },
  { key: 'recrutements', label: 'Recrutements' },
  { key: 'masse', label: 'Masse salariale' },
]

const statusColor: Record<string, string> = {
  'En cours': '#2980b9',
  'Entretiens': '#f39c12',
  'Sélection': '#27ae60',
}

export const Dashboard: React.FC = () => {
  const [chartView, setChartView] = useState<ChartView>('effectifs')

  const chartConfig: Record<ChartView, { dataKey: string; color: string; label: string; unit: string }> = {
    effectifs: { dataKey: 'effectifs', color: '#1a1f3c', label: 'Agents', unit: '' },
    recrutements: { dataKey: 'recrutements', color: '#c0392b', label: 'Recrutements', unit: '' },
    masse: { dataKey: 'masseAriary', color: '#27ae60', label: 'Masse (M Ar)', unit: 'M Ar' },
  }

  const cfg = chartConfig[chartView]

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble des effectifs, recrutements et masse salariale</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          label="Agents actifs"
          value={172}
          delta="+3.2% vs mois dernier"
          deltaType="up"
          color="var(--instat-dark)"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Stagiaires"
          value={20}
          delta="+2 vs mois dernier"
          deltaType="up"
          color="var(--amber)"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Recrutements en cours"
          value={14}
          delta="+2 vs mois dernier"
          deltaType="up"
          color="var(--green)"
          icon={<UserPlus size={18} />}
        />
        <StatCard
          label="Masse salariale"
          value={315}
          unit="M Ar"
          delta="-1.4% vs mois dernier"
          deltaType="down"
          color="var(--instat-red)"
          icon={<Wallet size={18} />}
        />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Evolution chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Évolution des données (12 mois)</h2>
            <div className="chart-options">
              {CHART_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setChartView(opt.key)}
                  className={`chart-btn ${chartView === opt.key ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e6ef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ fontWeight: 600, color: '#1a1f3c' }}
              />
              <Area
                type="monotone"
                dataKey={cfg.dataKey}
                stroke={cfg.color}
                strokeWidth={2.5}
                fill="url(#colorGrad)"
                dot={{ fill: cfg.color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name={cfg.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut */}
        <div className="chart-card">
          <h2>Répartition par statut</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={repartitionStatut}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {repartitionStatut.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e6ef' }}
                formatter={(
                  value: number | string | ReadonlyArray<number | string> | undefined,
                  name: number | string | undefined,
                ) => {
                  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                  return [`${numericValue} agents`, name ?? '']
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {repartitionStatut.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--instat-gray-600)' }}>{item.name}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--instat-dark)', marginLeft: 'auto' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Recrutements + Bar chart masse */}
      <div className="dashboard-bottom-row">
        {/* Recrutements en cours */}
        <div className="recrutements-section">
          <div className="recrutements-header">
            <h2>Recrutements en cours</h2>
            <span className="recrutements-badge">14 postes</span>
          </div>

          <div className="recrutements-list">
            {recrutements.map((r, i) => (
              <div key={i} className="recrutement-item">
                <div>
                  <div className="recrutement-poste">{r.poste}</div>
                  <div className="recrutement-details">{r.service} · {r.candidats} candidats</div>
                </div>
                <span className={`recrutement-status ${r.statut.toLowerCase().replace(' ', '-')}`}>
                  {r.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Masse salariale bar chart */}
        <div className="chart-card">
          <h2 style={{ marginBottom: '20px' }}>Masse salariale (M Ar)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={evolutionData.slice(-6)} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} domain={[280, 320]} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e6ef', borderRadius: '8px', fontSize: '12px' }}
                formatter={(
                  v: number | string | ReadonlyArray<number | string> | undefined,
                  name: number | string | undefined,
                ) => {
                  const numericValue = typeof v === 'number' ? v : Number(v ?? 0)
                  return [`${numericValue} M Ar`, name ?? 'Masse salariale']
                }}
              />
              <Bar dataKey="masseAriary" fill="var(--instat-dark)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}