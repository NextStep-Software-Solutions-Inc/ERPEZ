/**
 * Utility to identify CSE (Common-Use Supplies and Equipment) items for APR creation
 * 
 * APRs (Agency Purchase Requests) submitted to PS-DBM are strictly for CSE items.
 * Non-CSE items must never be included in APR workflows.
 */

export function isCSEItem(item: any): boolean {
  if (!item) return false

  // Explicit Non-CSE indicators
  if (item.isNonCSE === true || item.isNonCse === true) return false
  if (item.nonCSEItemId || item.nonCseItemId) return false
  if (item.NonCSEItem || item.nonCSEItem) return false

  // Explicit CSE indicators
  if (item.isCSE === true || item.isCse === true) return true
  if (item.cseItemId) return true
  if (item.CSEItem || item.cseItem) return true

  // Check procurement mode name
  const mode = String(
    item.procurementModeName || item.procurementMode || item.modeOfProcurement || ''
  ).toLowerCase()

  if (
    mode.includes('small value') ||
    mode.includes('53.9') ||
    mode.includes('bidding') ||
    mode.includes('direct contracting') ||
    mode.includes('negotiated')
  ) {
    return false
  }

  if (
    mode.includes('ps-dbm') ||
    mode.includes('virtual store') ||
    mode.includes('52.1.b') ||
    mode.includes('common-use') ||
    mode.includes('shopping')
  ) {
    return true
  }

  return true
}
