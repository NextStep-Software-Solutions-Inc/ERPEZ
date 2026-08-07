/**
 * APP Line Items to APR Item Conversion Utility
 * 
 * Transforms selected APP BAC line items into ConsolidatedAPRItem objects
 * Calculates variance from approved APP allocations
 * Maintains budget/quantity alignment for SPMS compliance
 */

import type { BACLineItem } from '@/features/planning/app-consolidation/types'
import type { ConsolidatedAPRItem, APRMilestones } from '../types'

/**
 * Convert single APP BAC line item to ConsolidatedAPRItem
 * Initializes with APP approved quantities/budgets
 * Variances start at 0 (APR matches APP until modified)
 */
export function convertAppLineItemToAPRItem(
  lineItem: BACLineItem,
  appId: string,
  appBACId: string,
  index: number
): ConsolidatedAPRItem {
  const itemId = `apr-item-${appId}-${lineItem.id}-${Date.now()}-${index}`
  
  // Extract BAC milestones if available
  const bacMilestones: APRMilestones | undefined = lineItem.milestones
    ? {
        advertisementDate: lineItem.milestones.advertisementDate,
        submissionDate: lineItem.milestones.submissionDate,
        noticeOfAwardDate: lineItem.milestones.noticeOfAwardDate,
        contractSigningDate: lineItem.milestones.contractSigningDate,
      }
    : undefined

  return {
    id: itemId,
    itemCode: '', // Will be populated from PSDBM if needed
    description: lineItem.description,
    unit: lineItem.unit,
    quantity: lineItem.quantity, // Start with APP approved quantity
    unitCost: lineItem.unitCost,
    totalAmount: lineItem.totalAmount, // quantity * unitCost
    office: lineItem.office || '',
    fundSource: '', // Will be populated from APP
    ppmpId: '', // Reference if available
    appId: appId, // Source APP ID
    itemCategory: '', // Will be populated from PSDBM
    allotmentClass: lineItem.allotmentClass || 'CO',
    sourceFiscalYear: new Date().getFullYear(),
    sourceCategory: '', // Will be populated from PSDBM
    sourceMonth: '', // Will be populated from PSDBM
    // APP References (SPMS Compliance)
    appLineItemId: lineItem.id, // ✅ Link to APP BAC line item
    appBACId: appBACId,
    appApprovedQuantity: lineItem.quantity, // Snapshot of approved quantity
    appApprovedBudget: lineItem.totalAmount, // Snapshot of approved budget
    // Variance Tracking (Budget Alignment)
    quantityVariance: 0, // Current - Approved (starts at 0)
    quantityVariancePercent: 0, // Percentage difference
    budgetVariance: 0, // Current - Approved (starts at 0)
    budgetVariancePercent: 0, // Percentage difference
    // Procurement Milestones from BAC
    bacMilestones,
  }
}

/**
 * Batch convert multiple APP line items to APR items
 * @param lineItems - Selected BAC line items from APP
 * @param appId - Source APP document ID
 * @param appBACId - BAC workspace ID
 * @returns Array of ConsolidatedAPRItem ready for APR
 */
export function convertAppLineItemsToAPRItems(
  lineItems: BACLineItem[],
  appId: string,
  appBACId: string
): ConsolidatedAPRItem[] {
  return lineItems.map((lineItem, index) =>
    convertAppLineItemToAPRItem(lineItem, appId, appBACId, index)
  )
}

/**
 * Calculate variance when user modifies APR item quantity/budget
 * @param currentQuantity - User-entered quantity
 * @param approvedQuantity - Original APP approved quantity
 * @returns Variance object with amount and percentage
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
 * @param currentBudget - Current total budget (quantity * unitCost)
 * @param approvedBudget - Original APP approved budget
 * @returns Variance object with amount and percentage
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
 * Typical threshold: 10% for procurement planning
 * @param variancePercent - Variance percentage
 * @param thresholdPercent - Max allowed variance (default 10%)
 * @returns true if variance exceeds threshold
 */
export function isVarianceThresholdExceeded(
  variancePercent: number,
  thresholdPercent = 10
): boolean {
  return Math.abs(variancePercent) > thresholdPercent
}

/**
 * Generate variance warning message
 * @param item - APR item with variance data
 * @param quantityThreshold - Max allowed quantity variance %
 * @param budgetThreshold - Max allowed budget variance %
 * @returns Warning message or null if no threshold exceeded
 */
export function getVarianceWarning(
  item: ConsolidatedAPRItem,
  quantityThreshold = 10,
  budgetThreshold = 10
): string | null {
  const warnings: string[] = []

  if (isVarianceThresholdExceeded(item.quantityVariancePercent, quantityThreshold)) {
    warnings.push(
      `Quantity variance ${item.quantityVariancePercent > 0 ? '+' : ''}${item.quantityVariancePercent}% (${item.quantityVariance} units) exceeds ${quantityThreshold}% threshold`
    )
  }

  if (isVarianceThresholdExceeded(item.budgetVariancePercent, budgetThreshold)) {
    warnings.push(
      `Budget variance ${item.budgetVariancePercent > 0 ? '+' : ''}${item.budgetVariancePercent}% (₱${item.budgetVariance.toLocaleString()}) exceeds ${budgetThreshold}% threshold`
    )
  }

  return warnings.length > 0 ? warnings.join('. ') : null
}

/**
 * Calculate total APR budget from items
 * @param items - Array of APR items
 * @returns Total budget across all items
 */
export function calculateTotalAPRBudget(items: ConsolidatedAPRItem[]): number {
  return items.reduce((sum, item) => sum + item.totalAmount, 0)
}

/**
 * Calculate total APP variance across all APR items
 * @param items - Array of APR items
 * @returns Total variance amount and percentage
 */
export function calculateTotalVariance(items: ConsolidatedAPRItem[]): {
  totalVariance: number
  totalVariancePercent: number
  totalApprovedBudget: number
} {
  const totalVariance = items.reduce((sum, item) => sum + item.budgetVariance, 0)
  const totalApprovedBudget = items.reduce((sum, item) => sum + item.appApprovedBudget, 0)
  const totalVariancePercent =
    totalApprovedBudget > 0 ? (totalVariance / totalApprovedBudget) * 100 : 0

  return {
    totalVariance,
    totalVariancePercent: Math.round(totalVariancePercent * 100) / 100,
    totalApprovedBudget,
  }
}
