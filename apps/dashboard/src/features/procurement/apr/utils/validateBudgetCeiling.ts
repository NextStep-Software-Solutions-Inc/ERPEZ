/**
 * Budget Ceiling Validation Utility
 * 
 * Validates APR budget against APP approved budget ceiling
 * Implements SPMS compliance for budget alignment
 */

export type BudgetCeilingValidationStatus = 
  | 'WITHIN_BUDGET'
  | 'EXCEEDS_BUDGET'
  | 'AT_THRESHOLD'
  | 'NOT_CALCULATED'

export interface BudgetCeilingValidationResult {
  status: BudgetCeilingValidationStatus
  aprBudget: number
  appBudget: number
  budgetVariance: number
  variancePercent: number
  isValid: boolean
  isBlocker: boolean // true = blocks submission, false = warning only
  message: string
  recommendation?: string
}

/**
 * Validate APR budget against APP approved budget ceiling
 * 
 * @param aprTotalBudget - Total budget of APR items
 * @param appApprovedBudget - Total approved budget in APP
 * @param thresholdPercent - Max allowed variance before warning (default 5%)
 * @param warningPercent - Max allowed variance before becoming blocker (default 10%)
 */
export function validateBudgetCeiling(
  aprTotalBudget: number,
  appApprovedBudget: number,
  thresholdPercent = 5,
  warningPercent = 10
): BudgetCeilingValidationResult {
  if (!appApprovedBudget || appApprovedBudget <= 0) {
    return {
      status: 'NOT_CALCULATED',
      aprBudget: aprTotalBudget,
      appBudget: appApprovedBudget,
      budgetVariance: 0,
      variancePercent: 0,
      isValid: false,
      isBlocker: true,
      message: 'APP approved budget not available for validation',
      recommendation: 'Contact administrator to verify APP budget configuration',
    }
  }

  const budgetVariance = aprTotalBudget - appApprovedBudget
  const variancePercent = (budgetVariance / appApprovedBudget) * 100

  // ✅ Within budget
  if (aprTotalBudget <= appApprovedBudget) {
    return {
      status: 'WITHIN_BUDGET',
      aprBudget: aprTotalBudget,
      appBudget: appApprovedBudget,
      budgetVariance: budgetVariance,
      variancePercent: variancePercent,
      isValid: true,
      isBlocker: false,
      message: `APR budget (₱${aprTotalBudget.toLocaleString()}) is within APP approved budget (₱${appApprovedBudget.toLocaleString()})`,
    }
  }

  // ❌ Exceeds budget
  if (variancePercent > warningPercent) {
    return {
      status: 'EXCEEDS_BUDGET',
      aprBudget: aprTotalBudget,
      appBudget: appApprovedBudget,
      budgetVariance: budgetVariance,
      variancePercent: Math.round(variancePercent * 100) / 100,
      isValid: false,
      isBlocker: true,
      message: `APR budget exceeds APP approved budget by ₱${budgetVariance.toLocaleString()} (${variancePercent.toFixed(2)}%)`,
      recommendation: `Reduce APR budget to ₱${appApprovedBudget.toLocaleString()} or request APP amendment`,
    }
  }

  // ⚠️ At threshold warning
  if (variancePercent > thresholdPercent) {
    return {
      status: 'AT_THRESHOLD',
      aprBudget: aprTotalBudget,
      appBudget: appApprovedBudget,
      budgetVariance: budgetVariance,
      variancePercent: Math.round(variancePercent * 100) / 100,
      isValid: true,
      isBlocker: false,
      message: `APR budget exceeds APP approved budget by ₱${budgetVariance.toLocaleString()} (${variancePercent.toFixed(2)}%). This may require APP amendment.`,
      recommendation: `Consider reducing APR budget or request APP amendment with justification`,
    }
  }

  // ✅ Slightly over but within warning threshold
  return {
    status: 'AT_THRESHOLD',
    aprBudget: aprTotalBudget,
    appBudget: appApprovedBudget,
    budgetVariance: budgetVariance,
    variancePercent: Math.round(variancePercent * 100) / 100,
    isValid: true,
    isBlocker: false,
    message: `APR budget is ₱${Math.abs(budgetVariance).toLocaleString()} over APP approved budget (${variancePercent.toFixed(2)}%)`,
  }
}

/**
 * Check if APR can be submitted based on budget ceiling
 */
export function canSubmitAPRWithBudget(
  result: BudgetCeilingValidationResult
): { canSubmit: boolean; reason: string } {
  if (result.isBlocker) {
    return {
      canSubmit: false,
      reason: result.message,
    }
  }

  return {
    canSubmit: true,
    reason: 'APR budget is within acceptable limits',
  }
}

/**
 * Budget status color mapping for Badge component
 */
export interface BudgetStatusColorMap {
  color: 'default' | 'destructive' | 'success' | 'info' | 'warning' | 'dark' | 'secondary'
  variant?: 'outline' | 'soft'
}

/**
 * Get user-friendly budget status badge color and variant
 */
export function getBudgetStatusColor(
  status: BudgetCeilingValidationStatus
): BudgetStatusColorMap {
  switch (status) {
    case 'WITHIN_BUDGET':
      return { color: 'success' }
    case 'AT_THRESHOLD':
      return { color: 'warning' }
    case 'EXCEEDS_BUDGET':
      return { color: 'destructive' }
    case 'NOT_CALCULATED':
      return { color: 'secondary', variant: 'outline' }
  }
}

/**
 * Calculate remaining budget from APP ceiling
 */
export function calculateRemainingBudget(
  appApprovedBudget: number,
  aprTotalBudget: number
): number {
  return Math.max(0, appApprovedBudget - aprTotalBudget)
}

/**
 * Get budget utilization percentage
 */
export function getBudgetUtilizationPercent(
  aprTotalBudget: number,
  appApprovedBudget: number
): number {
  if (!appApprovedBudget) return 0
  return Math.min(100, (aprTotalBudget / appApprovedBudget) * 100)
}
