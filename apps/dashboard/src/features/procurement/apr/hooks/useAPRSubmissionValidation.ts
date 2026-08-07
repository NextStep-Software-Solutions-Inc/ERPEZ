/**
 * Hook for APR submission validation
 * Checks SPMS compliance before allowing submission
 */

import { useMemo } from 'react'
import type { APRMaster } from '../types'
import {
  validateAPRBeforeSubmission,
  type SubmissionValidationResult,
} from '../utils/validateAPRBeforeSubmission'

export interface UseAPRSubmissionValidationOptions {
  apr: APRMaster | null
  enabled?: boolean
}

export interface UseAPRSubmissionValidationResult {
  validation: SubmissionValidationResult
  canSubmit: boolean
  blockingReasons: string[]
  warningReasons: string[]
}

/**
 * Hook for validating APR before submission
 * Ensures SPMS compliance requirements are met
 */
export function useAPRSubmissionValidation({
  apr,
  enabled = true,
}: UseAPRSubmissionValidationOptions): UseAPRSubmissionValidationResult {
  const validation = useMemo(() => {
    if (!enabled) {
      return validateAPRBeforeSubmission(null)
    }
    return validateAPRBeforeSubmission(apr)
  }, [enabled, apr])

  const blockingReasons = useMemo(
    () => validation.errors.map((err) => err.recommendation),
    [validation.errors]
  )

  const warningReasons = useMemo(
    () => validation.warnings.map((w) => w.recommendation),
    [validation.warnings]
  )

  return {
    validation,
    canSubmit: validation.canSubmit,
    blockingReasons,
    warningReasons,
  }
}
