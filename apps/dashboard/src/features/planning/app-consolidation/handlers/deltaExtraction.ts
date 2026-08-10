import { AppMaster, PPMPData, PPMPItem } from "../types"

export interface DeltaItem {
  id: string
  description: string
  code: string
  unit: string
  originalQuantity: number
  amendedQuantity: number
  deltaQuantity: number
  unitCost: number
  deltaAmount: number
  isNewItem: boolean
  modeOfProcurement: string
  fundSource: string
  itemCategory: string
  // PPMP source information
  ppmpId: string
  ppmpVersion: number | string
  ppmpLabel: string
  isModified: boolean // True if item exists in original APP, False if newly added
}

export interface DeltaExtractionResult {
  deltaItems: DeltaItem[]
  totalDeltaAmount: number
  totalNewItemsAmount: number
  totalQuantityChanges: number
}

/**
 * Calculate delta between original APP PPMP and amended PPMP
 * This implements the "Smart Delta Math" approach:
 * - For existing items: Calculate quantity difference (Amended Qty - Original Qty)
 * - For new items: Include full amended quantity
 * 
 * Example:
 * Original: 10 Laptops → Amended: 12 Laptops = +2 Laptops delta
 * Original: 0 Printers → Amended: 5 Printers = +5 Printers delta (new item)
 */
export function extractDeltaItems(
  originalApp: AppMaster,
  amendedPPMP: PPMPData,
  ppmpLabel?: string
): DeltaExtractionResult {
  const deltaItems: DeltaItem[] = []
  let totalDeltaAmount = 0
  let totalNewItemsAmount = 0
  let totalQuantityChanges = 0

  // Guard against undefined aggregationResults
  if (!originalApp.aggregationResults?.items || !amendedPPMP.items) {
    return {
      deltaItems,
      totalDeltaAmount,
      totalNewItemsAmount,
      totalQuantityChanges,
      amendedPPMPLabels: ppmpLabel ? [ppmpLabel] : [],
    }
  }

  // Build map of original items by code for quick lookup
  const originalItemsMap = new Map<
    string,
    {
      description: string
      quantity: number
      unitCost: number
      unit: string
      code: string
      modeOfProcurement: string
      fundSource: string
      itemCategory: string
    }
  >()

  // Extract items from original app's aggregation results
  originalApp.aggregationResults.items.forEach((aggregation) => {
    aggregation.items.forEach((item: PPMPItem) => {
      originalItemsMap.set(item.code, {
        description: item.description,
        quantity: item.quantity,
        unitCost: item.unitCost || 0,
        unit: item.unit,
        code: item.code,
        modeOfProcurement: item.modeOfProcurement,
        fundSource: item.fundSource,
        itemCategory: item.itemCategory,
      })
    })
  })

  // Process amended PPMP items
  amendedPPMP.items.forEach((amendedItem: PPMPItem) => {
    const originalItem = originalItemsMap.get(amendedItem.code)

    const originalQty = originalItem?.quantity || 0
    const amendedQty = amendedItem.quantity || 0
    const deltaQty = amendedQty - originalQty

    // Only include items with positive delta (new items or quantity increases)
    if (deltaQty > 0) {
      const unitCost = amendedItem.unitCost
      const deltaAmount = deltaQty * unitCost
      const isNewItem = originalQty === 0
      const isModified = !isNewItem // True if it existed and was modified

      const deltaItem: DeltaItem = {
        id: `delta-${amendedPPMP.id}-${amendedItem.id}`,
        description: amendedItem.description,
        code: amendedItem.code,
        unit: amendedItem.unit,
        originalQuantity: originalQty,
        amendedQuantity: amendedQty,
        deltaQuantity: deltaQty,
        unitCost,
        deltaAmount,
        isNewItem,
        modeOfProcurement: amendedItem.modeOfProcurement,
        fundSource: amendedItem.fundSource,
        itemCategory: amendedItem.itemCategory,
        ppmpId: amendedPPMP.id,
        ppmpVersion: amendedPPMP.ppmpVersion || 1,
        ppmpLabel: ppmpLabel || `PPMP v${amendedPPMP.ppmpVersion || 1}`,
        isModified,
      }

      deltaItems.push(deltaItem)
      totalDeltaAmount += deltaAmount
      totalQuantityChanges += deltaQty

      if (isNewItem) {
        totalNewItemsAmount += deltaAmount
      }
    }
  })

  return {
    deltaItems: deltaItems.sort((a, b) => a.description.localeCompare(b.description)),
    totalDeltaAmount,
    totalNewItemsAmount,
    totalQuantityChanges,
  }
}

/**
 * Generate supplemental APP metadata with sequential naming
 */
export function generateSupplementalMetadata(
  originalApp: AppMaster,
  supplementalNumber: number,
  fiscalYear: number
) {
  return {
    supplementalNumber,
    supplementalName: `Supplemental Annual Procurement Plan No. ${supplementalNumber} for FY ${fiscalYear}`,
    supplementalCode: `${originalApp.appCode}-S${supplementalNumber}`,
    description: `Supplemental to ${originalApp.appCode} - Generated mid-year for amended PPMP aggregation`,
  }
}

/**
 * Extract delta items from multiple amended PPMPs and merge results
 * Used when multiple PPMPs in a single APP have been amended
 * 
 * Example:
 * - Office1 APP has PPMP-1 and PPMP-2
 * - Both have amendments to v2
 * - This merges deltas from both PPMP-1 v2 and PPMP-2 v2
 */
export function extractMultiplePPMPDeltas(
  originalApp: AppMaster,
  amendedPPMPs: Array<{ data: PPMPData; label: string }>
): DeltaExtractionResult {
  const mergedDeltas: DeltaItem[] = []
  let totalDeltaAmount = 0
  let totalNewItemsAmount = 0
  let totalQuantityChanges = 0

  // Process each amended PPMP and merge results
  amendedPPMPs.forEach(({ data: amendedPPMP, label: ppmpLabel }) => {
    const result = extractDeltaItems(originalApp, amendedPPMP, ppmpLabel)

    mergedDeltas.push(...result.deltaItems)
    totalDeltaAmount += result.totalDeltaAmount
    totalNewItemsAmount += result.totalNewItemsAmount
    totalQuantityChanges += result.totalQuantityChanges
  })

  // Deduplicate items with same code (take the higher delta amount)
  const deduplicatedMap = new Map<string, DeltaItem>()
  mergedDeltas.forEach((item) => {
    const existing = deduplicatedMap.get(item.code)
    if (!existing || item.deltaAmount > existing.deltaAmount) {
      deduplicatedMap.set(item.code, item)
    }
  })

  const finalDeltaItems = Array.from(deduplicatedMap.values())

  // Recalculate totals based on deduplicated items
  let recalculatedTotal = 0
  let recalculatedNewAmount = 0
  finalDeltaItems.forEach((item) => {
    recalculatedTotal += item.deltaAmount
    if (item.isNewItem) {
      recalculatedNewAmount += item.deltaAmount
    }
  })

  return {
    deltaItems: finalDeltaItems.sort((a, b) => a.description.localeCompare(b.description)),
    totalDeltaAmount: recalculatedTotal,
    totalNewItemsAmount: recalculatedNewAmount,
    totalQuantityChanges,
  }
}

/**
 * Identify which PPMPs belong to the original APP
 * Returns mapping of PPMP IDs that should be eligible for amendment selection
 */
export function getOriginalPPMPIds(originalApp: AppMaster): string[] {
  const ppmpIds = new Set<string>()

  // Extract PPMP IDs from aggregation results if available
  if (originalApp.aggregationResults?.items) {
    originalApp.aggregationResults.items.forEach((aggregation) => {
      if (aggregation.ppmpId) {
        ppmpIds.add(aggregation.ppmpId)
      }
    })
  }

  // Also check ppmpIds array if it exists
  if (originalApp.ppmpIds && Array.isArray(originalApp.ppmpIds)) {
    originalApp.ppmpIds.forEach((id: string) => ppmpIds.add(id))
  }

  return Array.from(ppmpIds)
}
