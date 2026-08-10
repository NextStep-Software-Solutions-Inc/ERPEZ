/**
 * Data Transformation Utilities
 * Functions to transform API responses to component-friendly formats
 */

import type { LineItem, Supplier, SupplierBid, Winner } from '../types/aobTypes'

/**
 * Transform supplier bids array to matrix structure
 * Groups bids by line item for easier rendering
 */
export function transformBidsToMatrix(bids: SupplierBid[]) {
  const matrix: Record<string, SupplierBid[]> = {}

  for (const bid of bids) {
    if (!matrix[bid.lineItemId]) {
      matrix[bid.lineItemId] = []
    }
    matrix[bid.lineItemId].push(bid)
  }

  return matrix
}

/**
 * Transform line items with bids for matrix display
 */
export function transformLineItemsForMatrix(lineItems: LineItem[]) {
  return lineItems.map((item) => ({
    ...item,
    supplierCount: item.lineItems?.length || 0,
    lowestBid: item.lineItems?.reduce<SupplierBid | undefined>(
      (min, bid) =>
        bid.totalBid && (!min || bid.totalBid < (min.totalBid || Infinity)) ? bid : min,
      undefined
    ),
    highestBid: item.lineItems?.reduce<SupplierBid | undefined>(
      (max, bid) =>
        bid.totalBid && (!max || bid.totalBid > (max.totalBid || 0)) ? bid : max,
      undefined
    ),
    averageBid:
      item.lineItems && item.lineItems.length > 0
        ? item.lineItems.reduce((sum, bid) => sum + (bid.totalBid || 0), 0) / item.lineItems.length
        : null,
  }))
}

/**
 * Transform winners array to lookup map
 */
export function transformWinnersToMap(winners: Winner[]): Record<string, Winner> {
  const map: Record<string, Winner> = {}
  for (const winner of winners) {
    map[winner.lineItemId] = winner
  }
  return map
}

/**
 * Get responsive bids only (for LCRB selection)
 * Filters bids where: supplier is responsive, bid total is valid and > 0, and bid is within ABC
 */
export function getResponsiveBids(
  bids: SupplierBid[],
  suppliers: Supplier[],
  abc: number
): SupplierBid[] {
  // Create supplier lookup map for O(1) responsiveness checks
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]))

  return bids.filter((bid) => {
    const supplier = supplierMap.get(bid.supplierId)
    
    // Responsive bid must satisfy all conditions:
    // 1. Supplier marked as responsive
    // 2. Bid total is valid and greater than 0
    // 3. Bid is within ABC limit
    const supplierIsResponsive = supplier?.isResponsive === true
    const hasValidTotal = bid.totalBid != null && bid.totalBid > 0
    const withinABC = bid.totalBid != null && bid.totalBid <= abc
    
    return supplierIsResponsive && hasValidTotal && withinABC
  })
}

/**
 * Sort bids by total amount (for LCRB ranking)
 */
export function sortBidsByTotal(bids: SupplierBid[], ascending: boolean = true): SupplierBid[] {
  return [...bids].sort((a, b) => {
    const aTotal = a.totalBid || Infinity
    const bTotal = b.totalBid || Infinity

    if (ascending) {
      return aTotal - bTotal
    }
    return bTotal - aTotal
  })
}

/**
 * Sort bids by quality-price ratio (for MEARB/MARB ranking)
 */
export function sortBidsByRatio(
  bids: SupplierBid[],
  ascending: boolean = true
): SupplierBid[] {
  return [...bids].sort((a, b) => {
    const aRatio = a.calculatedQualityPriceRatio || Infinity
    const bRatio = b.calculatedQualityPriceRatio || Infinity

    if (ascending) {
      return aRatio - bRatio
    }
    return bRatio - aRatio
  })
}

/**
 * Get ranks for bids (1st, 2nd, 3rd, etc.)
 */
export function getRankedBids(bids: SupplierBid[], sortByRatio: boolean = false) {
  const sorted = sortByRatio ? sortBidsByRatio(bids) : sortBidsByTotal(bids)

  return sorted.map((bid, index) => ({
    ...bid,
    rank: index + 1,
    rankLabel: getRankLabel(index + 1),
  }))
}

function getRankLabel(rank: number): string {
  const labels: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
  }
  if (labels[rank]) return labels[rank]
  return `${rank}th`
}
