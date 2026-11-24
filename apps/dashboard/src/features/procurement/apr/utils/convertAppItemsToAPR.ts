/**
 * APP Line Items to APR Item Conversion Utility
 * 
 * Transforms selected APP line items into ConsolidatedAPRItem objects
 * Calculates variance from approved APP allocations
 * Maintains budget/quantity alignment for SPMS compliance
 */

import type { ConsolidatedAPRItem, APRMilestones } from '../types'

export interface GenericAPPLineItem {
  id: string
  ppmpItemId?: string
  ppmpItemName?: string
  description?: string
  unit?: string
  quantity?: number
  unitCost?: number
  totalAmount?: number
  office?: string
  officeId?: string
  officeName?: string
  fundSource?: string
  fundSourceName?: string
  fundSourceId?: string
  allotmentClass?: 'CO' | 'MOOE'
  milestones?: any
  schedules?: any[]
}

/**
 * Convert single APP line item to ConsolidatedAPRItem
 */
export function convertAppLineItemToAPRItem(
  lineItem: GenericAPPLineItem,
  appId: string,
  appBACId: string = '',
  index: number = 0
): ConsolidatedAPRItem {
  const itemId = lineItem.id || lineItem.ppmpItemId || `apr-item-${appId}-${index}`
  const description =
    lineItem.ppmpItemName ||
    lineItem.description ||
    (lineItem as any).remarks ||
    'Procurement Item'

  const unit =
    lineItem.unit ||
    (lineItem as any).unitOfMeasure ||
    (lineItem as any).unitOfMeasurement ||
    (lineItem as any).uom ||
    'unit'

  const unitCost =
    lineItem.unitCost ??
    (lineItem as any).unitPrice ??
    (lineItem as any).estimatedUnitCost ??
    (lineItem as any).price ??
    0

  const totalAmount =
    lineItem.totalAmount ||
    (lineItem as any).effectiveABC ||
    (lineItem as any).totalCost ||
    (lineItem as any).estimatedBudget ||
    (lineItem as any).totalEstimatedBudget ||
    (lineItem as any).originalPPMPBudget ||
    0

  const rawQty =
    lineItem.quantity ??
    (lineItem as any).approvedQuantity ??
    (lineItem as any).requestedQuantity ??
    (lineItem as any).qty

  const quantity =
    (rawQty && rawQty > 0)
      ? rawQty
      : (unitCost > 0 && totalAmount > 0)
      ? Math.round(totalAmount / unitCost)
      : 1
  const office = lineItem.officeName || lineItem.office || ''
  const fundSource = lineItem.fundSourceName || lineItem.fundSource || ''

  // Extract milestones if available
  const bacMilestones: APRMilestones | undefined = lineItem.milestones
    ? {
        advertisementDate: typeof lineItem.milestones.advertisementDate === 'string' ? lineItem.milestones.advertisementDate : undefined,
        submissionDate: typeof lineItem.milestones.submissionDate === 'string' ? lineItem.milestones.submissionDate : undefined,
        noticeOfAwardDate: typeof lineItem.milestones.noticeOfAwardDate === 'string' ? lineItem.milestones.noticeOfAwardDate : undefined,
        contractSigningDate: typeof lineItem.milestones.contractSigningDate === 'string' ? lineItem.milestones.contractSigningDate : undefined,
      }
    : undefined

  return {
    id: itemId,
    itemCode: '',
    description,
    unit,
    quantity,
    unitCost,
    totalAmount,
    office,
    fundSource,
    ppmpId: lineItem.ppmpItemId || '',
    appId,
    itemCategory: '',
    allotmentClass: lineItem.allotmentClass || 'CO',
    sourceFiscalYear: new Date().getFullYear(),
    sourceCategory: '',
    sourceMonth: '',
    appLineItemId: lineItem.id,
    appBACId,
    appApprovedQuantity: quantity,
    appApprovedBudget: totalAmount,
    quantityVariance: 0,
    quantityVariancePercent: 0,
    budgetVariance: 0,
    budgetVariancePercent: 0,
    bacMilestones,
  }
}

/**
 * Batch convert multiple APP line items to APR items
 */
export function convertAppLineItemsToAPRItems(
  lineItems: GenericAPPLineItem[],
  appId: string,
  appBACId: string = ''
): ConsolidatedAPRItem[] {
  return lineItems.map((lineItem, index) =>
    convertAppLineItemToAPRItem(lineItem, appId, appBACId, index)
  )
}

/**
 * Calculate variance when user modifies APR item quantity/budget
 */
export function calculateQuantityVariance(
  currentQuantity: number,
  approvedQuantity: number
): { variance: number; variancePercent: number } {
  const variance = currentQuantity - approvedQuantity
  const variancePercent = approvedQuantity > 0 ? (variance / approvedQuantity) * 100 : 0
  
  return {
    variance,
    variancePercent: Math.round(variancePercent * 100) / 100,
  }
}

/**
 * Calculate budget variance when user modifies unit cost
 */
export function calculateBudgetVariance(
  currentBudget: number,
  approvedBudget: number
): { variance: number; variancePercent: number } {
  const variance = currentBudget - approvedBudget
  const variancePercent = approvedBudget > 0 ? (variance / approvedBudget) * 100 : 0
  
  return {
    variance,
    variancePercent: Math.round(variancePercent * 100) / 100,
  }
}

/**
 * Check if variance exceeds acceptable threshold
 */
export function isVarianceThresholdExceeded(
  variancePercent: number,
  thresholdPercent = 10
): boolean {
  return Math.abs(variancePercent) > thresholdPercent
}

/**
 * Generate variance warning message
 */
export function getVarianceWarning(
  item: ConsolidatedAPRItem,
  quantityThreshold = 10,
  budgetThreshold = 10
): string | null {
  const warnings: string[] = []

  if (item.quantityVariancePercent !== undefined && isVarianceThresholdExceeded(item.quantityVariancePercent, quantityThreshold)) {
    warnings.push(
      `Quantity variance ${item.quantityVariancePercent > 0 ? '+' : ''}${item.quantityVariancePercent}% (${item.quantityVariance} units) exceeds ${quantityThreshold}% threshold`
    )
  }

  if (item.budgetVariancePercent !== undefined && isVarianceThresholdExceeded(item.budgetVariancePercent, budgetThreshold)) {
    warnings.push(
      `Budget variance ${item.budgetVariancePercent > 0 ? '+' : ''}${item.budgetVariancePercent}% (₱${item.budgetVariance?.toLocaleString()}) exceeds ${budgetThreshold}% threshold`
    )
  }

  return warnings.length > 0 ? warnings.join('. ') : null
}

/**
 * Calculate total APR budget from items
 */
export function calculateTotalAPRBudget(items: ConsolidatedAPRItem[]): number {
  return items.reduce((sum, item) => sum + item.totalAmount, 0)
}

/**
 * Calculate total APP variance across all APR items
 */
export function calculateTotalVariance(items: ConsolidatedAPRItem[]): {
  totalVariance: number
  totalVariancePercent: number
  totalApprovedBudget: number
} {
  const totalVariance = items.reduce((sum, item) => sum + (item.budgetVariance || 0), 0)
  const totalApprovedBudget = items.reduce((sum, item) => sum + (item.appApprovedBudget || 0), 0)
  const totalVariancePercent =
    totalApprovedBudget > 0 ? (totalVariance / totalApprovedBudget) * 100 : 0

  return {
    totalVariance,
    totalVariancePercent: Math.round(totalVariancePercent * 100) / 100,
    totalApprovedBudget,
  }
}
