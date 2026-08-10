import type { PPMPItem, DeltaItem } from '../types'

/**
 * Delta Extraction Logic
 * 
 * Calculates the net-new line items or additional quantities between:
 * - Original PPMP (v1.0) used in the main APP
 * - Amended PPMP (v1.1) with updates
 * 
 * Smart Delta Math Example:
 * - Original: 10 Laptops (locked in Main APP)
 * - Amended: 12 Laptops + 5 Printers (new)
 * Result: Supplement should have 2 Laptops (delta) + 5 Printers (new)
 */

export interface DeltaCalculationResult {
  deltaItems: DeltaItem[]
  totalDeltaAmount: number
  itemsModified: number
  itemsAdded: number
}

/**
 * Calculate delta between original and amended PPMPs
 * @param originalItems - Items from the original PPMP (locked in main APP)
 * @param amendedItems - Items from the new amended PPMP
 * @returns Calculated delta items with net changes
 */
export function calculateDeltaItems(
  originalItems: PPMPItem[],
  amendedItems: PPMPItem[],
): DeltaCalculationResult {
  const deltaItems: DeltaItem[] = []
  let itemsModified = 0
  let itemsAdded = 0

  // Create a map of original items by code for fast lookup
  const originalMap = new Map<string, PPMPItem>()
  originalItems.forEach((item) => {
    originalMap.set(item.code, item)
  })

  // Process each amended item
  amendedItems.forEach((amendedItem) => {
    const originalItem = originalMap.get(amendedItem.code)

    if (!originalItem) {
      // NEW ITEM: Not in original PPMP, entire item is a delta
      const deltaItem: DeltaItem = {
        ...amendedItem,
        originalQuantity: 0,
        amendedQuantity: amendedItem.quantity,
        deltaQuantity: amendedItem.quantity,
        isNewItem: true,
      }
      deltaItems.push(deltaItem)
      itemsAdded++
    } else {
      // EXISTING ITEM: Calculate quantity difference
      const deltaDifference = amendedItem.quantity - originalItem.quantity

      if (deltaDifference > 0) {
        // QUANTITY INCREASED: Add the delta
        const deltaAmount = deltaDifference * amendedItem.unitCost
        const deltaItem: DeltaItem = {
          ...amendedItem,
          originalQuantity: originalItem.quantity,
          amendedQuantity: amendedItem.quantity,
          deltaQuantity: deltaDifference,
          totalAmount: deltaAmount, // Only delta amount, not full amended amount
          isNewItem: false,
        }
        deltaItems.push(deltaItem)
        itemsModified++
      }
      // If deltaQuantity <= 0, item is not included (no change or reduction)
    }
  })

  const totalDeltaAmount = deltaItems.reduce((sum, item) => sum + item.totalAmount, 0)

  return {
    deltaItems,
    totalDeltaAmount,
    itemsModified,
    itemsAdded,
  }
}

/**
 * Get next sequential supplemental number for an APP
 * @param existingSupplementals - Existing supplemental APPs for the same base APP
 * @returns Next sequential number (1, 2, 3, etc.)
 */
export function getNextSupplementalNumber(existingSupplementals: any[]): number {
  if (existingSupplementals.length === 0) {
    return 1
  }
  const maxNumber = Math.max(...existingSupplementals.map((s) => s.supplementalNumber || 0))
  return maxNumber + 1
}

/**
 * Format supplemental APP name with sequential numbering
 * @param supplementalNumber - Sequential number (1, 2, 3, etc.)
 * @param fiscalYear - Fiscal year
 * @returns Formatted name like "Supplemental Annual Procurement Plan No. 1 for FY 2024"
 */
export function formatSupplementalName(supplementalNumber: number, fiscalYear: number): string {
  return `Supplemental Annual Procurement Plan No. ${supplementalNumber} for FY ${fiscalYear}`
}

/**
 * Generate supplemental APP code
 * @param baseAppCode - Original APP code (e.g., "APP-2024-001")
 * @param supplementalNumber - Sequential number
 * @returns Code like "APP-2024-001-S1"
 */
export function generateSupplementalCode(baseAppCode: string, supplementalNumber: number): string {
  return `${baseAppCode}-S${supplementalNumber}`
}
