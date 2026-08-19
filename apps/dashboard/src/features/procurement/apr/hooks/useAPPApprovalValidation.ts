/**
 * Hook: Use APP Approval Validation
 * 
 * Validates APP status and prerequisites for APR creation
 * Returns validation state for UI integration
 */

import { useMemo } from 'react'
import { validateAPPForAPRCreation, validateLineItemsSelection } from '../utils/validateAppForAPR'
import type { APPValidationError } from '../utils/validateAppForAPR'
import type { AppMaster } from '@/features/planning/app-consolidation/types'

interface UseAPPApprovalValidationOptions {
  app: AppMaster | null
  selectedLineItemCount: number
  totalLineItemCount: number
}

export interface UseAPPApprovalValidationResult {
  appValidationError: APPValidationError | null
  lineItemsValidationError: APPValidationError | null
  isValid: boolean
  blockingErrors: APPValidationError[]
  warningErrors: APPValidationError[]
}

/**
 * Hook to validate APP approval status for APR creation
 * Checks both APP status and line items selection
 */
export function useAPPApprovalValidation({
  app,
  selectedLineItemCount,
  totalLineItemCount,
}: UseAPPApprovalValidationOptions): UseAPPApprovalValidationResult {
  const appValidationError = useMemo(() => {
    return validateAPPForAPRCreation(app)
  }, [app])

  const lineItemsValidationError = useMemo(() => {
    return validateLineItemsSelection(selectedLineItemCount, totalLineItemCount)
  }, [selectedLineItemCount, totalLineItemCount])

  const blockingErrors = useMemo(() => {
    const errors: APPValidationError[] = []
    if (appValidationError?.isBlocker) errors.push(appValidationError)
    if (lineItemsValidationError?.isBlocker) errors.push(lineItemsValidationError)
    return errors
  }, [appValidationError, lineItemsValidationError])

  const warningErrors = useMemo(() => {
    const errors: APPValidationError[] = []
    if (appValidationError && !appValidationError.isBlocker) errors.push(appValidationError)
    if (lineItemsValidationError && !lineItemsValidationError.isBlocker) errors.push(lineItemsValidationError)
    return errors
  }, [appValidationError, lineItemsValidationError])

  const isValid = blockingErrors.length === 0 && selectedLineItemCount > 0

  return {
    appValidationError,
    lineItemsValidationError,
    isValid,
    blockingErrors,
    warningErrors,
  }
}
