/**
 * Bid Calculation Utilities
 * Functions for calculating bid totals and ratios
 */

import type { AwardCriterion } from '../types/aobTypes'

/**
 * Calculate total bid amount
 * Formula: quantity × unitBid
 */
export function calculateTotalBid(quantity: number, unitBid: number | null | undefined): number | null {
  if (!unitBid || unitBid <= 0) return null
  if (!quantity || quantity <= 0) return null
  return quantity * unitBid
}

/**
 * Determine if a bid is responsive (meets basic requirements)
 * A bid is responsive if:
 * - Has a valid total bid amount
 * - For MEARB/MARB: also has quality score
 */
export function isBidResponsive(
  totalBid: number | null | undefined,
  qualityScore?: number | null,
  awardCriterion?: AwardCriterion
): boolean {
  const hasValidBid = totalBid && totalBid > 0

  if (awardCriterion === 'MEARB' || awardCriterion === 'MARB') {
    const hasQualityScore = qualityScore && qualityScore > 0
    return !!(hasValidBid && hasQualityScore)
  }

  return !!hasValidBid
}

/**
 * Check if bid is within ABC (Approved Budget for Contract)
 * Bid amount should be ≤ ABC for LCRB
 */
export function isBidWithinABC(bidAmount: number | null | undefined, abc: number): boolean {
  if (!bidAmount || bidAmount <= 0) return false
  return bidAmount <= abc
}

/**
 * Calculate cost savings
 * Formula: (ABC - Winning Bid) / ABC × 100
 */
export function calculateCostSavingsPercentage(abc: number, winningBid: number): number {
  if (!abc || abc <= 0) return 0
  const savings = abc - winningBid
  if (savings <= 0) return 0
  return (savings / abc) * 100
}
