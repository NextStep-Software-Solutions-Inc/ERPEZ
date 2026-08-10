/**
 * Award Criteria Calculation Utilities
 * Implements LCRB, MEARB, and MARB scoring methods
 *
 * - LCRB (Lowest Calculated Responsive Bid): Winner determined by lowest price
 * - MEARB (Most Economical or Advantageous Response Based): Weighted quality + price
 * - MARB (Most Advantageous Response Based): Complex multi-factor evaluation
 */

import type { SupplierBid, AwardCriterion } from '../types/aobTypes'

/**
 * LCRB (Lowest Calculated Responsive Bid)
 * Winner is the supplier with the lowest bid price
 */
export function calculateLCRB(bids: SupplierBid[]): SupplierBid | undefined {
  const responsiveBids = bids.filter((bid) => bid.unitBid && bid.unitBid > 0)

  if (responsiveBids.length === 0) return undefined

  return responsiveBids.reduce((lowest, current) => {
    if (!current.unitBid || !lowest.unitBid) return lowest
    return current.unitBid < lowest.unitBid ? current : lowest
  })
}

/**
 * Quality-to-Price Ratio Scoring
 * Used for LCRB evaluation and MEARB calculation
 * Higher ratio is better (higher quality, lower price)
 * Formula: Quality Score ÷ Unit Price
 *
 * Note: This is the consolidated quality/price ratio function.
 * Use this for all quality/price evaluations across award criteria.
 */
export function calculateQualityToPriceRatio(
  qualityScore: number | undefined,
  unitPrice: number | undefined
): number | undefined {
  if (!qualityScore || !unitPrice || unitPrice === 0) return undefined
  return qualityScore / unitPrice
}

/**
 * MEARB (Most Economical or Advantageous Response Based)
 * Weighted combination of price and quality factors
 *
 * Score = (Quality Weight × Quality Score/100) + (Price Weight × Price Score)
 * Price Score = (Lowest Bid / Bid) × 100
 */
export interface MEARBWeights {
  qualityWeight: number // 0-1, typically 0.3-0.7
  priceWeight: number // 0-1, should sum to 1.0 with quality
}

export function calculateMEARB(
  bids: SupplierBid[],
  weights: MEARBWeights = { qualityWeight: 0.4, priceWeight: 0.6 }
): Map<string, number> {
  const responsiveBids = bids.filter((bid) => bid.unitBid && bid.unitBid > 0)

  if (responsiveBids.length === 0) return new Map()

  const lowestPrice = Math.min(...responsiveBids.map((bid) => bid.unitBid || Infinity))
  const maxQualityScore = 100

  const scores = new Map<string, number>()

  responsiveBids.forEach((bid) => {
    if (!bid.unitBid || bid.unitBid === 0) return

    const qualityScore = (bid.qualityScore || 0) / maxQualityScore
    const priceScore = (lowestPrice / bid.unitBid) * 100

    const totalScore =
      weights.qualityWeight * qualityScore +
      (weights.priceWeight * priceScore) / 100

    // Use consistent composite key to avoid collisions across line items
    // Format: supplierId:lineItemId for deterministic lookup
    const bidKey = `${bid.supplierId}:${bid.lineItemId}`
    scores.set(bidKey, totalScore * 100) // Scale to 100
  })

  return scores
}

/**
 * Get MEARB winner with highest combined score
 */
export function getMEARBWinner(
  bids: SupplierBid[],
  weights?: MEARBWeights
): SupplierBid | undefined {
  const scores = calculateMEARB(bids, weights)

  if (scores.size === 0) return undefined

  let maxScore = -Infinity
  let winningKey: string | undefined

  scores.forEach((score, key) => {
    if (score > maxScore) {
      maxScore = score
      winningKey = key
    }
  })

  // Parse the composite key (format: supplierId:lineItemId) and find matching bid
  if (!winningKey) return undefined
  const [winningSupplierId, winningLineItemId] = winningKey.split(':')
  
  return bids.find((bid) => 
    bid.supplierId === winningSupplierId && bid.lineItemId === winningLineItemId
  )
}

/**
 * MARB (Most Advantageous Response Based)
 * Complex multi-factor evaluation considering:
 * - Price competitiveness
 * - Quality/specifications
 * - Delivery capability
 * - Technical compliance
 * - Past performance
 *
 * Each factor can have different weights based on RFQ requirements
 */
export interface MARBCriteria {
  price: { weight: number; score: number } // 0-100
  quality: { weight: number; score: number } // 0-100
  delivery: { weight: number; score: number } // 0-100
  technical: { weight: number; score: number } // 0-100
  performance: { weight: number; score: number } // 0-100
}

export function calculateMARBScore(criteria: MARBCriteria): number {
  const totalWeight =
    criteria.price.weight +
    criteria.quality.weight +
    criteria.delivery.weight +
    criteria.technical.weight +
    criteria.performance.weight

  if (totalWeight === 0) return 0

  const weightedScore =
    (criteria.price.score * criteria.price.weight +
      criteria.quality.score * criteria.quality.weight +
      criteria.delivery.score * criteria.delivery.weight +
      criteria.technical.score * criteria.technical.weight +
      criteria.performance.score * criteria.performance.weight) /
    totalWeight

  return weightedScore
}

/**
 * Rank bids by award criterion
 */
export function rankBidsByCriterion(
  bids: SupplierBid[],
  criterion: AwardCriterion,
  mearb_weights?: MEARBWeights
): Array<{ supplierId: string; supplierName: string; score: number; rank: number }> {
  let scores: Map<string, number> = new Map()

  if (criterion === 'LCRB') {
    // For LCRB, use quality-to-price ratio or lowest price
    scores = new Map(
      bids
        .filter((bid) => bid.unitBid && bid.unitBid > 0)
        .map((bid) => [
          bid.supplierId,
          bid.calculatedQualityPriceRatio || bid.unitBid || Infinity,
        ])
    )
  } else if (criterion === 'MEARB') {
    scores = calculateMEARB(bids, mearb_weights)
  } else if (criterion === 'MARB') {
    // MARB requires manual scoring setup per bid (handled elsewhere)
    scores = new Map(
      bids.map((bid) => [bid.supplierId, bid.qualityScore || 0])
    )
  }

  const ranked = Array.from(scores.entries())
    .map(([keyOrSupplierId, score], _index) => {
      let supplierName: string
      
      // Handle MEARB composite keys (format: supplierId:lineItemId)
      if (criterion === 'MEARB' && keyOrSupplierId.includes(':')) {
        const [supplierId, lineItemId] = keyOrSupplierId.split(':')
        const bid = bids.find((b) => b.supplierId === supplierId && b.lineItemId === lineItemId)
        supplierName = bid?.supplierName || keyOrSupplierId
      } else {
        // Standard supplier ID lookup for LCRB and MARB
        supplierName = bids.find((b) => b.supplierId === keyOrSupplierId)?.supplierName || keyOrSupplierId
      }
      
      return {
        supplierId: keyOrSupplierId,
        supplierName,
        score: Math.round(score * 100) / 100,
        rank: 0,
      }
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  return ranked
}

/**
 * Validate award decision against criteria
 */
export function validateAwardDecision(
  winnerBid: SupplierBid,
  allBids: SupplierBid[],
  criterion: AwardCriterion
): {
  isValid: boolean
  reason?: string
} {
  if (!winnerBid.unitBid) {
    return { isValid: false, reason: 'Winner bid has no price' }
  }

  const responsiveBids = allBids.filter((bid) => bid.unitBid && bid.unitBid > 0)

  if (criterion === 'LCRB') {
    const lowestBid = responsiveBids.reduce((lowest, bid) => {
      return !bid.unitBid || bid.unitBid > (lowest.unitBid || Infinity)
        ? lowest
        : bid
    })

    if (lowestBid.supplierId !== winnerBid.supplierId) {
      return {
        isValid: false,
        reason: `LCRB: Selected supplier is not the lowest bidder (${lowestBid.supplierName} is lower)`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Generate award summary for all items
 */
export function generateAwardSummary(
  itemIds: string[],
  bidsByItem: Map<string, SupplierBid[]>,
  criterion: AwardCriterion
) {
  const summary = itemIds.map((itemId) => {
    const itemBids = bidsByItem.get(itemId) || []
    const winner =
      criterion === 'LCRB'
        ? calculateLCRB(itemBids)
        : criterion === 'MEARB'
          ? getMEARBWinner(itemBids)
          : undefined

    return {
      itemId,
      winner,
      totalBids: itemBids.length,
      responsiveBids: itemBids.filter((b) => b.unitBid && b.unitBid > 0).length,
    }
  })

  return summary
}
