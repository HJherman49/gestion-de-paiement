// ──────────────────────────────────────────────────────────────────────────
// Composant MoisBar — à insérer dans PaiePage.tsx (remplace la barre de mois
// actuelle basée sur `hasPaies`)
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { getRecapMois, genererBulletinsMois, type RecapMois } from '../services/paieService'

const MOIS_COURTS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']

interface MoisBarProps {
  currentYear: number
  filterMois: number | null
  onSelectMois: (mois: number | null) => void
  onBulletinsGeneres: () => void   // callback pour recharger la liste après génération
}

export const MoisBar: React.FC<MoisBarProps> = ({
  currentYear, filterMois, onSelectMois, onBulletinsGeneres,
}) => {
  const [recap, setRecap] = useState<RecapMois[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<number | null>(null)

  const moisActuel = new Date().getMonth() + 1
  const anneeActuelle = new Date().getFullYear()

  const loadRecap = async () => {
    setLoading(true)
    try {
      const res = await getRecapMois(currentYear)
      setRecap(res.data.data)
    } catch {
      // silencieux — la barre reste vide si erreur, pas bloquant
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRecap() }, [currentYear])

  const handleGenerer = async (mois: number) => {
    setGenerating(mois)
    try {
      await genererBulletinsMois(mois, currentYear)
      await loadRecap()
      onBulletinsGeneres()
    } catch {
      alert('Erreur lors de la génération des bulletins.')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="pp-mois-bar">
      {MOIS_COURTS.map((label, idx) => {
        const moisNum = idx + 1
        const info = recap.find(r => r.mois === moisNum)
        const estFutur = currentYear === anneeActuelle && moisNum > moisActuel
        const estCourant = currentYear === anneeActuelle && moisNum === moisActuel
        const genere = info?.genere ?? false
        const aDesPrimes = info?.a_des_primes ?? false
        const isActive = filterMois === moisNum
        const estDesactive = estFutur && !genere

        return (
          <div key={moisNum} className="pp-mois-item-wrapper">
            <div
              role="button"
              tabIndex={estDesactive ? -1 : 0}
              {...(estDesactive ? { 'aria-disabled': true } : {})}
              className={`pp-mois-item ${isActive ? 'active' : ''} ${estCourant ? 'pp-mois-courant' : ''} ${estDesactive ? 'pp-mois-vide' : ''}`}
              onClick={() => !estDesactive && genere && onSelectMois(isActive ? null : moisNum)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !estDesactive && genere) {
                  e.preventDefault()
                  onSelectMois(isActive ? null : moisNum)
                }
              }}
              title={
                estDesactive
                  ? 'Ce mois n\'est pas encore arrivé'
                  : genere
                    ? `${info?.nb_bulletins} bulletin(s)${aDesPrimes ? ' — primes incluses' : ''}`
                    : 'Aucun bulletin généré pour ce mois'
              }
            >
              <span className="pp-mois-label">{label}</span>

              {genere && (
                <span className={`pp-mois-dot ${aDesPrimes ? 'pp-mois-dot--prime' : 'pp-mois-dot--auto'}`}>
                  {aDesPrimes && <Sparkles size={10} />}
                </span>
              )}

              {!genere && !estFutur && (
                <button
                  className="pp-mois-generer-btn"
                  onClick={(e) => { e.stopPropagation(); handleGenerer(moisNum) }}
                  disabled={generating === moisNum}
                  title="Générer les bulletins de ce mois"
                >
                  <RefreshCw size={12} className={generating === moisNum ? 'pp-spin' : ''} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}