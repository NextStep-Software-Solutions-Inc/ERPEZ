/**
 * LineItemDeltaCalculator - Task 3.4 (CRITICAL)
 * Smart diff extraction for Supplemental APP line items
 * 
 * The "Smart" Delta Math:
 * - Original PPMP v1.0: 10 Laptops (locked in Main APP)
 * - Amended PPMP v1.1: 12 Laptops + 5 Printers (newly approved)
 * - Result: Supplemental APP contains ONLY: 2 Laptops + 5 Printers
 * 
 * This prevents double-counting and ensures grand totals match actual need
 */

import type { PPMPItem, DeltaItem } from '../types'

export interface PPMPVersion {
  id: string
  version: string // "1.0", "1.1", etc.
  ppmpId: string
  items: PPMPItem[]
  createdAt: string
}

/**
 * Extract net-new or quantity-added line items between two PPMP versions
 * 
 * Algorithm:
 * 1. For each item in amended PPMP:
 *    a. If code exists in original: delta = amended.quantity - original.quantity
 *    b. If delta > 0: include item with delta quantity (supplement)
 *    c. If delta <= 0: exclude (no change or reduction)
 * 2. If code NOT in original: include entire item (brand new)
 */
export function calculateLineItemDelta(
  originalItems: PPMPItem[],
  amendedItems: PPMPItem[]
): DeltaItem[] {
  const deltaItems: DeltaItem[] = []

  // Create map of original items by code for quick lookup
  const originalMap = new Map<string, PPMPItem>()
  originalItems.forEach((item) => {
    originalMap.set(item.code, item)
  })

  // Process amended items
  amendedItems.forEach((amendedItem) => {
    const originalItem = originalMap.get(amendedItem.code)

    if (originalItem) {
      // Item exists in both - calculate delta
      const deltaQuantity = amendedItem.quantity - originalItem.quantity

      if (deltaQuantity > 0) {
        // Only include positive deltas (additions)
        const deltaItem: DeltaItem = {
          ...amendedItem,
          originalQuantity: originalItem.quantity,
          amendedQuantity: amendedItem.quantity,
          deltaQuantity,
          isNewItem: false,
        }
        deltaItems.push(deltaItem)
      }
      // If delta <= 0, exclude (no change or reduction)
    } else {
      // New item not in original PPMP
      const deltaItem: DeltaItem = {
        ...amendedItem,
        originalQuantity: 0,
        amendedQuantity: amendedItem.quantity,
        deltaQuantity: amendedItem.quantity,
        isNewItem: true,
      }
      deltaItems.push(deltaItem)
    }
  })

  return deltaItems
}

/**
 * Compare two PPMP versions and extract delta
 * Main entry point for delta calculation
 */
export function extractDeltaFromAmendedPPMP(
  originalVersion: PPMPVersion | null,
  amendedVersion: PPMPVersion
): DeltaItem[] {
  // If no original version, all amended items are new
  if (!originalVersion) {
    return amendedVersion.items.map((item) => ({
      ...item,
      originalQuantity: 0,
      amendedQuantity: item.quantity,
      deltaQuantity: item.quantity,
      isNewItem: true,
    }))
  }

  return calculateLineItemDelta(originalVersion.items, amendedVersion.items)
}

/**
 * Calculate totals from delta items
 */
export function calculateDeltaTotals(deltaItems: DeltaItem[]) {
  return {
    totalQuantity: deltaItems.reduce((sum, item) => sum + item.deltaQuantity, 0),
    totalAmount: deltaItems.reduce((sum, item) => sum + item.totalAmount, 0),
    newItems: deltaItems.filter((item) => item.isNewItem).length,
    amendedItems: deltaItems.filter((item) => !item.isNewItem).length,
  }
}

/**
 * Generate delta summary for display
 * Example: "2 additional Laptops + 5 new Printers (Total: ₱150,000)"
 */
export function generateDeltaSummary(deltaItems: DeltaItem[]): string {
  if (deltaItems.length === 0) {
    return 'No changes detected'
  }

  const summaries: string[] = []

  // Group by item
  const itemsByCode = new Map<string, DeltaItem>()
  deltaItems.forEach((item) => {
    itemsByCode.set(item.code, item)
  })

  // Generate descriptions
  itemsByCode.forEach((item) => {
    if (item.isNewItem) {
      summaries.push(`${item.deltaQuantity} new ${item.description}`)
    } else {
      summaries.push(`${item.deltaQuantity} additional ${item.description}`)
    }
  })

  const totals = calculateDeltaTotals(deltaItems)
  return `${summaries.join(', ')} (Total: ₱${totals.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
}

/**
 * Validate that delta calculation is correct
 * Sanity checks:
 * - All deltaQuantity should be > 0
 * - isNewItem items should have originalQuantity = 0
 * - deltaQuantity = amendedQuantity - originalQuantity for amended items
 */
export function validateDeltaItems(deltaItems: DeltaItem[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  deltaItems.forEach((item, index) => {
    if (item.deltaQuantity <= 0) {
      errors.push(`Item ${index}: deltaQuantity (${item.deltaQuantity}) should be > 0`)
    }

    if (item.isNewItem && item.originalQuantity !== 0) {
      errors.push(`Item ${index}: New item should have originalQuantity = 0`)
    }

    if (!item.isNewItem) {
      const expectedDelta = item.amendedQuantity - item.originalQuantity
      if (item.deltaQuantity !== expectedDelta) {
        errors.push(
          `Item ${index}: deltaQuantity (${item.deltaQuantity}) doesn't match expected (${expectedDelta})`
        )
      }
    }

    if (item.totalAmount <= 0) {
      errors.push(`Item ${index}: totalAmount (${item.totalAmount}) should be > 0`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Example usage:
 * 
 * const original = { id: 'ppmp-v1', version: '1.0', items: [...] }
 * const amended = { id: 'ppmp-v2', version: '1.1', items: [...] }
 * 
 * const deltaItems = extractDeltaFromAmendedPPMP(original, amended)
 * const validation = validateDeltaItems(deltaItems)
 * 
 * if (validation.isValid) {
 *   console.log(`Creating supplemental with ${deltaItems.length} items`)
 * } else {
 *   console.error('Delta calculation failed:', validation.errors)
 * }
 */
