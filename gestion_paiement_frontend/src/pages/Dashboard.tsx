import React, { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import {
  Users, UserPlus, TrendingUp, Wallet, Clock,
  Briefcase, RefreshCw, AlertCircle,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import {
  getDashboardData, getEvolutionData, getRepartitionStatut,
  type EvolutionMois, type RepartitionStatut,
} from '../services/dashboardService'
import '../styles/pages/Dashboard.css'

type ChartView = 'effectifs' | 'recrutements' | 'masse'

const CHART_OPTIONS: { key: ChartView; label: string }[] = [
  { key: 'effectifs',    label: 'Effectifs' },
  { key: 'recrutements', label: 'Recrutements' },
  { key: 'masse',        label: 'Masse salariale' },
]

const ar = (val: number) =>
  val >= 1_000_000
    ? `${(val / 1_000_000).toFixed(1)} M Ar`
    : val >= 1_000
    ? `${(val / 1_000).toFixed(0)} K Ar`
    : `${val.toFixed(0)} Ar`

export const Dashboard: React.FC = () => {
  const [chartView, setChartView] = useState<ChartView>('effectifs')

  // ── États ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalAgents:        0,
    totalCarrieres:     0,
    totalReclassements: 0,
    totalPreembauches:  0,
    totalFonctions:     0,
    masseTotale:        0,
    moisCourant:        '',
  })
  const [evolutionData, setEvolutionData]           = useState<EvolutionMois[]>([])
  const [repartitionStatut, setRepartitionStatut]   = useState<RepartitionStatut[]>([])
  const [loading, setLoading]                       = useState(true)
  const [error, setError]                           = useState<string | null>(null)
  const [lastUpdated, setLastUpdated]               = useState<Date | null>(null)

  // ── Chargement ────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashData, evolution, repartition] = await Promise.all([
        getDashboardData(),
        getEvolutionData(),
        getRepartitionStatut(),
      ])
      setStats(dashData.stats)
      setEvolutionData(evolution)
      setRepartitionStatut(repartition.length > 0 ? repartition : dashData.repartitionStatut)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError('Impossible de charger les données du tableau de bord.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // ── Config graphiques ─────────────────────────────────────────────────────
  const chartConfig: Record<ChartView, { dataKey: string; color: string; label: string; unit: string }> = {
    effectifs:    { dataKey: 'effectifs',    color: '#1a1f3c', label: 'Agents',       unit: '' },
    recrutements: { dataKey: 'recrutements', color: '#c0392b', label: 'Recrutements', unit: '' },
    masse:        { dataKey: 'masseAriary',  color: '#27ae60', label: 'Masse (M Ar)', unit: 'M Ar' },
  }
  const cfg = chartConfig[chartView]

  // ── Stagiaires depuis la répartition ──────────────────────────────────────
  const nbStagiaires    = repartitionStatut.find(r => r.name === 'Stagiaire')?.value   ?? 0
  const nbFonctionnaires= repartitionStatut.find(r => r.name === 'Fonctionnaire')?.value ?? 0
  const nbContractuels  = repartitionStatut.find(r => r.name === 'Contractuel')?.value ?? 0

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <RefreshCw size={24} className="dashboard-loading-icon" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>
            Vue d'ensemble des effectifs, recrutements et masse salariale
            {lastUpdated && (
              <span className="dashboard-updated">
                · Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button className="dashboard-refresh-btn" onClick={loadAll} title="Actualiser">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="dashboard-error">
          <AlertCircle size={15} />
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          label="Agents actifs"
          value={stats.totalAgents}
          delta={`${nbFonctionnaires} fonctionnaires · ${nbContractuels} contractuels`}
          deltaType="up"
          color="var(--instat-dark)"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Stagiaires"
          value={nbStagiaires}
          delta="Agents en stage"
          deltaType="neutral"
          color="var(--amber)"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Recrutements"
          value={stats.totalPreembauches}
          delta={`${stats.totalFonctions} fonctions actives`}
          deltaType="up"
          color="var(--green)"
          icon={<UserPlus size={18} />}
        />
        <StatCard
          label="Masse salariale"
          value={stats.masseTotale > 0 ? Math.round(stats.masseTotale / 1_000_000) : 0}
          unit="M Ar"
          delta={`Période : ${stats.moisCourant}`}
          deltaType="neutral"
          color="var(--instat-red)"
          icon={<Wallet size={18} />}
        />
      </div>

      {/* Ligne 2 : stats secondaires */}
      <div className="dashboard-secondary-stats">
        {[
          { label: 'Carrières',      value: stats.totalCarrieres,     color: '#1a4d8c', icon: <TrendingUp size={16} /> },
          { label: 'Reclassements',  value: stats.totalReclassements, color: '#8c6d1a', icon: <RefreshCw size={16} /> },
          { label: 'Préembauches',   value: stats.totalPreembauches,  color: '#27ae60', icon: <UserPlus size={16} /> },
          { label: 'Fonctions',      value: stats.totalFonctions,     color: '#c0392b', icon: <Briefcase size={16} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="dashboard-sec-card" style={{ borderLeftColor: color }}>
            <div className="dashboard-sec-icon" style={{ color }}>{icon}</div>
            <div>
              <div className="dashboard-sec-value" style={{ color }}>{value}</div>
              <div className="dashboard-sec-label">{label}</div>
            </div>
          </div>
        ))}
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

          {evolutionData.length === 0 ? (
            <div className="dashboard-chart-empty">Pas encore de données disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e6ef', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 600, color: '#1a1f3c' }}
                  formatter={(v: any) => [`${v}${cfg.unit ? ' ' + cfg.unit : ''}`, cfg.label]}
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
          )}
        </div>

        {/* Répartition par statut */}
        <div className="chart-card">
          <h2>Répartition par statut</h2>
          {repartitionStatut.length === 0 ? (
            <div className="dashboard-chart-empty">Pas encore de données disponibles</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={repartitionStatut}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    paddingAngle={3} dataKey="value"
                  >
                    {repartitionStatut.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e6ef' }}
                    formatter={(v: any, name: any) => [`${v} agents`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="dashboard-legend">
                {repartitionStatut.map(item => (
                  <div key={item.name} className="dashboard-legend-item">
                    <div className="dashboard-legend-dot" style={{ background: item.color }} />
                    <span className="dashboard-legend-label">{item.name}</span>
                    <span className="dashboard-legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="dashboard-bottom-row">

        {/* Résumé RH */}
        <div className="chart-card">
          <h2 style={{ marginBottom: '20px' }}>Résumé RH</h2>
          <div className="dashboard-rh-grid">
            {[
              { label: 'Total agents',        value: stats.totalAgents,        color: '#1a1f3c' },
              { label: 'Fonctionnaires',      value: nbFonctionnaires,         color: '#1a1f3c' },
              { label: 'Contractuels',        value: nbContractuels,           color: '#27ae60' },
              { label: 'Stagiaires',          value: nbStagiaires,             color: '#f39c12' },
              { label: 'Vacataires',          value: repartitionStatut.find(r => r.name === 'Vacataire')?.value ?? 0, color: '#c0392b' },
              { label: 'Carrières actives',   value: stats.totalCarrieres,     color: '#1a4d8c' },
              { label: 'Reclassements',       value: stats.totalReclassements, color: '#8c6d1a' },
              { label: 'Dossiers préembauche',value: stats.totalPreembauches,  color: '#27ae60' },
            ].map(({ label, value, color }) => (
              <div key={label} className="dashboard-rh-item">
                <span className="dashboard-rh-label">{label}</span>
                <span className="dashboard-rh-value" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Masse salariale bar chart */}
        <div className="chart-card">
          <h2 style={{ marginBottom: '20px' }}>Masse salariale (M Ar) — 6 derniers mois</h2>
          {evolutionData.length === 0 ? (
            <div className="dashboard-chart-empty">Pas encore de données disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={evolutionData.slice(-6)} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e6ef', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: any) => [`${v} M Ar`, 'Masse salariale']}
                />
                <Bar dataKey="masseAriary" fill="var(--instat-dark)" radius={[4, 4, 0, 0]} name="Masse salariale" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}