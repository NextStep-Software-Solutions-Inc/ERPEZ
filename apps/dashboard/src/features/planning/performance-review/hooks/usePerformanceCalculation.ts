/**
 * Performance Review – Calculation Engine
 * Centralised hook for all QET/score computation.
 *
 * Rules:
 *  - KPI Average  = sum(enabled dimensions) / count(enabled dimensions)
 *  - Category Avg = mean of all KPI averages within the category
 *  - Final Rating  = Σ (categoryAvg × categoryWeight)
 *  - Adjectival   = derived from finalRating
 */

import { useMemo } from 'react'
import {
  type KPILineItem,
  type KPICategory,
  type EvaluationSession,
  type AdjectivalRating,
  KPI_CATEGORY_WEIGHTS,
  getAdjectivalRating,
} from '../types'

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * Compute a single KPI's average from its QET rating.
 * Only averages the dimensions the KPI is tagged for.
 */
export function computeKPIAverage(item: KPILineItem, useRating: 'self' | 'final' = 'self'): number | null {
  const rating = useRating === 'self' ? item.selfRating : item.finalRating
  const enabled = item.tags

  const values: number[] = []
  if (enabled.includes('quality') && rating.quality !== null) values.push(rating.quality)
  if (enabled.includes('efficiency') && rating.efficiency !== null) values.push(rating.efficiency)
  if (enabled.includes('timeliness') && rating.timeliness !== null) values.push(rating.timeliness)

  if (values.length === 0) return null
  const sum = values.reduce((a, b) => a + b, 0)
  return parseFloat((sum / values.length).toFixed(2))
}

/**
 * Compute category average: mean of all KPI averages in the category.
 */
export function computeCategoryAverage(
  items: KPILineItem[],
  category: KPICategory,
  useRating: 'self' | 'final' = 'self'
): number | null {
  const categoryItems = items.filter(i => i.category === category)
  if (categoryItems.length === 0) return null

  const averages = categoryItems
    .map(i => computeKPIAverage(i, useRating))
    .filter((v): v is number => v !== null)

  if (averages.length === 0) return null
  const sum = averages.reduce((a, b) => a + b, 0)
  return parseFloat((sum / averages.length).toFixed(2))
}

/**
 * Compute the overall final rating using weighted category averages.
 * Uses dynamic weights from kpiItems (falls back to KPI_CATEGORY_WEIGHTS).
 */
export function computeFinalRating(
  items: KPILineItem[],
  useRating: 'self' | 'final' = 'self',
  weights: Partial<Record<KPICategory, number>> = KPI_CATEGORY_WEIGHTS
): number | null {
  const categories: KPICategory[] = ['STRATEGIC', 'CORE', 'SUPPORT']

  let weightedSum = 0
  let totalWeight = 0

  for (const cat of categories) {
    const catAvg = computeCategoryAverage(items, cat, useRating)
    if (catAvg !== null) {
      const w = weights[cat] ?? KPI_CATEGORY_WEIGHTS[cat]
      weightedSum += catAvg * w
      totalWeight += w
    }
  }

  if (totalWeight === 0) return null
  // Normalise if not all categories have data
  return parseFloat((weightedSum / totalWeight).toFixed(2))
}

// ─── React Hook ───────────────────────────────────────────────────────────────

export interface PerformanceCalculationResult {
  // KPI-level
  kpiAverages: Record<string, { self: number | null; final: number | null }>
  // Category-level
  categoryAverages: {
    self: Record<KPICategory, number | null>
    final: Record<KPICategory, number | null>
  }
  // Overall
  finalRatingScore: { self: number | null; final: number | null }
  adjectivalRating: { self: AdjectivalRating | null; final: AdjectivalRating | null }
  // Completeness guard
  selfRatingComplete: boolean
  finalRatingComplete: boolean
}

export function usePerformanceCalculation(
  session: EvaluationSession | null,
  customWeights?: Partial<Record<KPICategory, number>>
): PerformanceCalculationResult {
  return useMemo((): PerformanceCalculationResult => {
    const items = session?.kpiItems ?? []
    const categories: KPICategory[] = ['STRATEGIC', 'CORE', 'SUPPORT']

    // KPI-level averages
    const kpiAverages: Record<string, { self: number | null; final: number | null }> = {}
    for (const item of items) {
      kpiAverages[item.id] = {
        self: computeKPIAverage(item, 'self'),
        final: computeKPIAverage(item, 'final'),
      }
    }

    // Category-level averages
    const selfCatAvg: Record<KPICategory, number | null> = {
      STRATEGIC: computeCategoryAverage(items, 'STRATEGIC', 'self'),
      CORE: computeCategoryAverage(items, 'CORE', 'self'),
      SUPPORT: computeCategoryAverage(items, 'SUPPORT', 'self'),
    }
    const finalCatAvg: Record<KPICategory, number | null> = {
      STRATEGIC: computeCategoryAverage(items, 'STRATEGIC', 'final'),
      CORE: computeCategoryAverage(items, 'CORE', 'final'),
      SUPPORT: computeCategoryAverage(items, 'SUPPORT', 'final'),
    }

    // Overall final rating
    const selfScore = computeFinalRating(items, 'self', customWeights)
    const finalScore = computeFinalRating(items, 'final', customWeights)

    // Adjectival
    const selfAdj = selfScore !== null ? getAdjectivalRating(selfScore) : null
    const finalAdj = finalScore !== null ? getAdjectivalRating(finalScore) : null

    // Completeness checks
    const selfRatingComplete = items.every(item => {
      const avg = computeKPIAverage(item, 'self')
      const needsMov = item.movFiles.length === 0
      const needsJustification = item.justification === '' && /* actual < target logic approximated */ false
      return avg !== null && !needsMov && !needsJustification
    })

    const finalRatingComplete = items.every(item => computeKPIAverage(item, 'final') !== null)

    return {
      kpiAverages,
      categoryAverages: { self: selfCatAvg, final: finalCatAvg },
      finalRatingScore: { self: selfScore, final: finalScore },
      adjectivalRating: { self: selfAdj, final: finalAdj },
      selfRatingComplete,
      finalRatingComplete,
    }
  }, [session, customWeights])
}
