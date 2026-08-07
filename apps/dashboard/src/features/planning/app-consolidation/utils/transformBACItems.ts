import type { AppMaster, BACLineItem } from '../types'
import { generateMockMilestones } from './generateMilestones'
import { MODE_OF_PROCUREMENT_OPTIONS } from '../constants'

/**
 * Transform aggregated PPMP items into BAC line items
 * 
 * Populates:
 * - Procurement modes (randomly selected)
 * - Milestones (mock dates)
 * - Remarks (item description)
 * - EPA eligibility (40% chance)
 * 
 * @param app - APP master with aggregation results
 * @returns Array of BAC line items
 */
/**
 * Transform real APP items from API into BAC line items
 *
 * @param app - APP master with APPItems array from API
 * @returns Array of BAC line items with real APPItem IDs
 */
export function transformAPPItemsToBACLineItems(app: AppMaster): BACLineItem[] {
  const items = app.APPItems || []
  if (items.length === 0) {
    return transformAggregatedItemsToBACLineItems(app)
  }

  return items.map((appItem) => {
    return {
      id: appItem.id,
      code: appItem.papCode || appItem.code || '',
      description: appItem.ppmpItemName || appItem.description || 'Procurement Item',
      unit: appItem.unit || 'unit',
      quantity: appItem.quantity || 1,
      unitCost: appItem.unitCost || 0,
      totalAmount: appItem.totalAmount || 0,
      modeOfProcurement: appItem.procurementModeName || appItem.modeOfProcurement || '',
      office: appItem.officeName || appItem.office || '',
      fundSource: appItem.fundSourceName || appItem.fundSource || '',
      schedules: (appItem.schedules || []).map((s: any) => ({
        id: s.id || `sch-${Math.random()}`,
        period: s.procurementActivityTypeName || '',
        scheduledDate: s.scheduledDate || s.customDateText || '',
        quantity: 0,
      })),
      remarks: appItem.remarks || '',
      eligibleForEPA: appItem.isEarlyProcurementActivity || false,
      epaRemarks: appItem.epaRemarks || '',
    } as BACLineItem
  })
}

/**
 * Fallback: Transform aggregated PPMP items into BAC line items
 */
export function transformAggregatedItemsToBACLineItems(app: AppMaster): BACLineItem[] {
  if (!app.aggregationResults?.items || app.aggregationResults.items.length === 0) {
    return []
  }

  return app.aggregationResults.items.flatMap((aggregatedItem) => {
    return aggregatedItem.items.map((ppmpItem) => {
      const selectedMoP =
        ppmpItem.modeOfProcurement ||
        MODE_OF_PROCUREMENT_OPTIONS[0]

      return {
        id: ppmpItem.id,
        description: ppmpItem.description,
        unit: ppmpItem.unit,
        quantity: ppmpItem.quantity,
        unitCost: ppmpItem.unitCost,
        totalAmount: ppmpItem.totalAmount,
        modeOfProcurement: selectedMoP,
        schedules: [],
        milestones: generateMockMilestones(selectedMoP),
        remarks: ppmpItem.remarks || `Procurement for ${ppmpItem.description.substring(0, 40)}...`,
        eligibleForEPA: false,
        epaRemarks: undefined,
      } as BACLineItem
    })
  })
}

/**
 * Extract unique fund sources and procurement modes from aggregated items
 * 
 * @param app - APP master with aggregation results
 * @returns Object with sourceFunds and modeOfProcurements arrays
 */
export function extractBACMetadata(app: AppMaster) {
  const sourceFunds = new Set<string>()
  const modeOfProcurements = new Set<string>()

  app.aggregationResults?.items?.forEach((aggregatedItem) => {
    aggregatedItem.items.forEach((item) => {
      if (item.fundSource) {
        sourceFunds.add(item.fundSource)
      }
      if (item.modeOfProcurement) {
        modeOfProcurements.add(item.modeOfProcurement)
      }
    })
  })

  return {
    sourceFunds:
      Array.from(sourceFunds).length > 0
        ? Array.from(sourceFunds)
        : ['General Fund'],
    modeOfProcurements: Array.from(modeOfProcurements),
  }
}
