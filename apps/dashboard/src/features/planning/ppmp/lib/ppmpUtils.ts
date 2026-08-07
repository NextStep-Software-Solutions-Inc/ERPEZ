/**
 * PPMP Utility Functions
 * Pure business-logic helpers for budget computation, MoP rules, and validation.
 * All functions are side-effect-free and fully unit-testable.
 */

import type {
  MonthlyQuantities,
  PPMPLineItem,
  PPMPIoEBlock,
  PPMPActivityBlock,
  PPMP,
  CatalogItem,
  LineItemBudget,
  ModeOfProcurement,
} from '../types'
import { ALL_MONTHS } from '../types'

// ─── Budget Computation ───────────────────────────────────────────────────────

/**
 * Sums all monthly quantities.
 * NaN / undefined entries are treated as 0.
 */
export function sumMonthlyQuantities(quantities: MonthlyQuantities): number {
  return ALL_MONTHS.reduce((acc, month) => {
    const val = quantities[month]
    return acc + (Number.isFinite(val) ? val : 0)
  }, 0)
}

/**
 * Computes the estimated budget for a single line item.
 * estimatedBudget = sum(monthlyQuantities) × unitPrice
 */
export function computeLineItemBudget(
  quantities: MonthlyQuantities,
  unitPrice: number,
): number {
  const total = sumMonthlyQuantities(quantities)
  return total * unitPrice
}

/**
 * Validates and sums all items inside an IoE block against
 * that block's budget limit.
 */
export function validateIoEBudgetLimit(
  items: PPMPLineItem[],
  ioeBudgetLimit: number,
): { isValid: boolean; totalCost: number; overflow: number } {
  const totalCost = items.reduce((acc, item) => acc + item.estimatedBudget, 0)
  const overflow = Math.max(0, totalCost - ioeBudgetLimit)
  return { isValid: overflow === 0, totalCost, overflow }
}

/**
 * Computes total cost across all activity blocks (entire PPMP).
 */
export function computePPMPTotalBudget(
  activities: PPMPActivityBlock[],
): number {
  return activities.reduce((outerAcc, activity) => {
    const activityTotal = activity.ioEBlocks.reduce(
      (innerAcc, block) => innerAcc + block.totalCost,
      0,
    )
    return outerAcc + activityTotal
  }, 0)
}

/**
 * Returns true for PPMPs whose budgets should be counted in committed totals.
 */
export function isCountedBudgetPpmp(ppmp: Pick<PPMP, 'state'>): boolean {
  return ppmp.state !== 'rejected' && ppmp.state !== 'superseded'
}

/**
 * Computes how much of a LIB is already committed across PPMPs.
 */
export function computeCommittedLibBudget(
  ppmps: PPMP[],
  libId: string,
  fiscalYear: number,
  excludePpmpId?: string,
): number {
  return ppmps
    .filter(
      (ppmp) =>
        ppmp.libId === libId &&
        ppmp.fiscalYear === fiscalYear &&
        ppmp.id !== excludePpmpId &&
        isCountedBudgetPpmp(ppmp),
    )
    .reduce((sum, ppmp) => sum + ppmp.totalBudget, 0)
}

/**
 * Computes the remaining balance of a LIB after committed PPMP budgets.
 */
export function computeRemainingLibBudget(
  totalAllocation: number,
  ppmps: PPMP[],
  libId: string,
  fiscalYear: number,
  excludePpmpId?: string,
): number {
  const committed = computeCommittedLibBudget(
    ppmps,
    libId,
    fiscalYear,
    excludePpmpId,
  )
  return totalAllocation - committed
}

/**
 * Sums procurable IoE block totals across a PPMP workspace tree.
 */
export function computeProcurableBudget(
  activities: PPMPActivityBlock[],
): number {
  return activities.reduce(
    (sum, activity) =>
      sum +
      activity.ioEBlocks
        .filter((block) => block.isProcurable)
        .reduce((blockSum, block) => blockSum + block.totalCost, 0),
    0,
  )
}

/**
 * Computes how much of a LIB is committed specifically to procurable blocks.
 */
export function computeCommittedProcurableLibBudget(
  ppmps: PPMP[],
  libId: string,
  fiscalYear: number,
  excludePpmpId?: string,
): number {
  return ppmps
    .filter(
      (ppmp) =>
        ppmp.libId === libId &&
        ppmp.fiscalYear === fiscalYear &&
        ppmp.id !== excludePpmpId &&
        isCountedBudgetPpmp(ppmp),
    )
    .reduce(
      (sum, ppmp) => sum + computeProcurableBudget(ppmp.activityBlocks),
      0,
    )
}

/**
 * Returns true if any IoE block in the entire PPMP is over its budget limit.
 * Used to determine whether the Submit button should be disabled.
 */
export function hasAnyOverBudgetBlock(
  activities?: PPMPActivityBlock[],
): boolean {
  if (!activities) return false
  return activities.some((activity) =>
    activity.ioEBlocks.some((block) => block.isOverBudget),
  )
}

/**
 * Consolidated department PPMPs become read-only forever.
 */
export function assertPpmpWritable(
  ppmp: Pick<PPMP, 'isMasterOffice' | 'consolidatedToMasterId'>,
) {
  if (!ppmp.isMasterOffice && ppmp.consolidatedToMasterId) {
    throw new Error(
      'This department PPMP has already been consolidated and is read-only.',
    )
  }
}

// ─── MoP Rules ────────────────────────────────────────────────────────────────

/**
 * Returns the system-suggested Mode of Procurement for a catalog item
 * based on the RA 9184 IRR rules:
 *  - CSE items → NP-53.5 (Agency-to-Agency with PS-DBM)
 *  - Non-CSE with estimated amount < 50,000 → NP-53.9 (Small Value Procurement)
 *  - Non-CSE amount ≥ 50,000 → Public Bidding (Competitive Bidding)
 */
export function getSuggestedMoP(
  item: CatalogItem,
  estimatedAmount: number,
): ModeOfProcurement {
  if (item.catalogType === 'cse') {
    return 'NP-53.5'
  }
  if (estimatedAmount < 50_000) {
    return 'NP-53.9'
  }
  return 'Public Bidding'
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationError = {
  field: string
  message: string
}

/**
 * Validates monthly quantities for a line item.
 * - No negative values
 * - At least one month must have quantity > 0
 */
export function validateMonthlyQuantities(
  quantities: MonthlyQuantities,
): ValidationError | null {
  for (const month of ALL_MONTHS) {
    const val = quantities[month]
    if (val < 0) {
      return {
        field: month,
        message: `Quantity for ${month.toUpperCase()} cannot be negative.`,
      }
    }
    if (!Number.isInteger(val)) {
      return {
        field: month,
        message: `Quantity for ${month.toUpperCase()} must be a whole number.`,
      }
    }
  }
  const total = sumMonthlyQuantities(quantities)
  if (total === 0) {
    return {
      field: 'monthly_quantities',
      message: 'At least one month must have a quantity greater than zero.',
    }
  }
  return null
}

/**
 * Validates MoP override — justification is required when MoP is changed.
 */
export function validateMoPOverride(
  mopOverride: string | null,
  mopJustification: string,
): ValidationError | null {
  if (mopOverride && !mopJustification.trim()) {
    return {
      field: 'mopJustification',
      message:
        'Justification is required when overriding the suggested Mode of Procurement.',
    }
  }
  if (mopOverride && mopJustification.trim().length < 10) {
    return {
      field: 'mopJustification',
      message: 'Justification must be at least 10 characters.',
    }
  }
  if (mopJustification.trim().length > 500) {
    return {
      field: 'mopJustification',
      message: 'Justification must not exceed 500 characters.',
    }
  }
  return null
}

// ─── Derived IoE / Activity block helpers ─────────────────────────────────────

/**
 * Recomputes all derived fields (totalQuantity, estimatedBudget) for a line item
 * after monthly quantities are updated.
 */
export function recomputeLineItem(item: PPMPLineItem): PPMPLineItem {
  const totalQuantity = sumMonthlyQuantities(item.monthlyQuantities)
  const estimatedBudget = computeLineItemBudget(
    item.monthlyQuantities,
    item.unitPrice,
  )
  return { ...item, totalQuantity, estimatedBudget }
}

/**
 * Recomputes the totalCost and isOverBudget flag on an IoE block
 * after items are added/removed/updated.
 */
export function recomputeIoEBlock(block: PPMPIoEBlock): PPMPIoEBlock {
  const totalCost = block.items.reduce(
    (acc, item) => acc + item.estimatedBudget,
    0,
  )
  const isOverBudget = totalCost > block.budgetLimit
  return { ...block, totalCost, isOverBudget }
}

/**
 * Recomputes an activity block's totalCost after any of its IoE blocks change.
 */
export function recomputeActivityBlock(
  activity: PPMPActivityBlock,
): PPMPActivityBlock {
  const totalCost = activity.ioEBlocks.reduce((acc, b) => acc + b.totalCost, 0)
  return { ...activity, totalCost }
}

export interface PpmpManagementOverviewSummary {
  fiscalYear: number
  totalCeiling: number
  psCeiling: number
  mooeCeiling: number
  coCeiling: number
  usedAmount: number
  procurableAmount: number
  remainingAmount: number
  activeLibCount: number
  activePpmpCount: number
}

/**
 * Computes the management summary shown on the PPMP list page.
 */
export function computePpmpManagementOverview(
  ppmps: PPMP[],
  lineItemBudgets: LineItemBudget[],
  fiscalYear?: number,
): PpmpManagementOverviewSummary {
  const availableYears = [
    ...new Set([
      ...ppmps.map((ppmp) => ppmp.fiscalYear),
      ...lineItemBudgets.map((budget) => budget.fiscalYear),
    ]),
  ].sort((a, b) => b - a)
  const targetFiscalYear =
    fiscalYear ?? availableYears[0] ?? new Date().getFullYear()

  const activeBudgets = lineItemBudgets.filter(
    (budget) => budget.fiscalYear === targetFiscalYear,
  )
  const activePpmps = ppmps.filter(
    (ppmp) => ppmp.fiscalYear === targetFiscalYear && isCountedBudgetPpmp(ppmp),
  )

  const totalCeiling = activeBudgets.reduce(
    (sum, budget) => sum + budget.totalAllocation,
    0,
  )
  const psCeiling = activeBudgets.reduce(
    (sum, budget) => sum + budget.psAllocation,
    0,
  )
  const mooeCeiling = activeBudgets.reduce(
    (sum, budget) => sum + budget.mooeAllocation,
    0,
  )
  const coCeiling = activeBudgets.reduce(
    (sum, budget) => sum + budget.coAllocation,
    0,
  )

  const usedAmount = activePpmps.reduce(
    (sum, ppmp) => sum + ppmp.totalBudget,
    0,
  )
  const procurableAmount = activePpmps.reduce(
    (sum, ppmp) => sum + computeProcurableBudget(ppmp.activityBlocks),
    0,
  )
  const remainingAmount = totalCeiling - usedAmount

  return {
    fiscalYear: targetFiscalYear,
    totalCeiling,
    psCeiling,
    mooeCeiling,
    coCeiling,
    usedAmount,
    procurableAmount,
    remainingAmount,
    activeLibCount: activeBudgets.length,
    activePpmpCount: activePpmps.length,
  }
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

const PHP_FORMATTER = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats a number as Philippine Peso currency string.
 * e.g. 12345.67 → "₱12,345.67"
 */
export function formatCurrency(amount: number): string {
  return PHP_FORMATTER.format(amount)
}
