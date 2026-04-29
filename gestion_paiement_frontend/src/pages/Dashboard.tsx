import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { Users, UserPlus, TrendingUp, Wallet, Clock } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { evolutionData, repartitionStatut, recrutements } from '../data/mockData'

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
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--instat-dark)', marginBottom: '4px' }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--instat-gray-400)' }}>
          Vue d'ensemble des effectifs, recrutements et masse salariale
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '16px' }}>
        {/* Evolution chart */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--instat-gray-200)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--instat-dark)' }}>
              Évolution des données (12 mois)
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {CHART_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setChartView(opt.key)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: chartView === opt.key ? 'var(--instat-dark)' : 'var(--instat-gray-200)',
                    background: chartView === opt.key ? 'var(--instat-dark)' : 'transparent',
                    color: chartView === opt.key ? '#fff' : 'var(--instat-gray-600)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.15s',
                  }}
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
        <div style={{
          background: '#fff',
          border: '1px solid var(--instat-gray-200)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--instat-dark)', marginBottom: '16px' }}>
            Répartition par statut
          </h2>
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
                formatter={(value: number, name: string) => [`${value} agents`, name]}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recrutements en cours */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--instat-gray-200)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--instat-dark)' }}>
              Recrutements en cours
            </h2>
            <span style={{
              background: '#27ae6015', color: 'var(--green)',
              padding: '3px 10px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 600,
            }}>14 postes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recrutements.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--instat-gray-50)',
                borderRadius: '8px',
                border: '1px solid var(--instat-gray-100)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--instat-dark)', marginBottom: '2px' }}>{r.poste}</div>
                  <div style={{ fontSize: '11px', color: 'var(--instat-gray-400)' }}>{r.service} · {r.candidats} candidats</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                  background: `${statusColor[r.statut]}18`,
                  color: statusColor[r.statut],
                }}>
                  {r.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Masse salariale bar chart */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--instat-gray-200)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--instat-dark)', marginBottom: '20px' }}>
            Masse salariale (M Ar)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={evolutionData.slice(-6)} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9aa3b5' }} axisLine={false} tickLine={false} domain={[280, 320]} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e6ef', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`${v} M Ar`, 'Masse salariale']}
              />
              <Bar dataKey="masseAriary" fill="var(--instat-dark)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}