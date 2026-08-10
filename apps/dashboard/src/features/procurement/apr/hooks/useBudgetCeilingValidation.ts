/**
 * Hook: Use Budget Ceiling Validation
 * 
 * Validates APR budget against APP approved ceiling
 * Real-time validation as items are modified
 */

import { useMemo } from 'react'
import {
  validateBudgetCeiling,
  canSubmitAPRWithBudget,
  calculateRemainingBudget,
  getBudgetUtilizationPercent,
} from '../utils/validateBudgetCeiling'
import type {
  BudgetCeilingValidationResult,
} from '../utils/validateBudgetCeiling'
import type { ConsolidatedAPRItem } from '../types'

interface UseBudgetCeilingValidationOptions {
  aprItems: ConsolidatedAPRItem[]
  appApprovedBudget: number
  thresholdPercent?: number // % at which validation becomes blocker
  warningPercent?: number // % at which warning is shown
  enabled?: boolean
}

interface UseBudgetCeilingValidationResult {
  validation: BudgetCeilingValidationResult
  canSubmit: boolean
  submitReason: string
  remainingBudget: number
  budgetUtilization: number // 0-100
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to validate APR total budget against APP ceiling
 * Returns validation status and submission eligibility
 */
export function useBudgetCeilingValidation({
  aprItems,
  appApprovedBudget,
  thresholdPercent = 5,
  warningPercent = 10,
  enabled = true,
}: UseBudgetCeilingValidationOptions): UseBudgetCeilingValidationResult {
  // Calculate total APR budget
  const aprTotalBudget = useMemo(
    () => aprItems.reduce((sum, item) => sum + item.totalAmount, 0),
    [aprItems]
  )

  // Validate against ceiling
  const validation = useMemo(() => {
    if (!enabled) {
      return {
        status: 'NOT_CALCULATED' as const,
        aprBudget: 0,
        appBudget: appApprovedBudget,
        budgetVariance: 0,
        variancePercent: 0,
        isValid: false,
        isBlocker: false,
        message: 'Validation disabled',
      }
    }

    return validateBudgetCeiling(
      aprTotalBudget,
      appApprovedBudget,
      thresholdPercent,
      warningPercent
    )
  }, [aprTotalBudget, appApprovedBudget, thresholdPercent, warningPercent, enabled])

  // Determine submission eligibility
  const { canSubmit, reason: submitReason } = useMemo(
    () => canSubmitAPRWithBudget(validation),
    [validation]
  )

  // Calculate remaining budget
  const remainingBudget = useMemo(
    () => calculateRemainingBudget(appApprovedBudget, aprTotalBudget),
    [appApprovedBudget, aprTotalBudget]
  )

  // Calculate utilization percentage
  const budgetUtilization = useMemo(
    () => getBudgetUtilizationPercent(aprTotalBudget, appApprovedBudget),
    [aprTotalBudget, appApprovedBudget]
  )

  return {
    validation,
    canSubmit,
    submitReason,
    remainingBudget,
    budgetUtilization,
    isLoading: false,
    error: null,
  }
}
