/**
 * APR Submission Validation
 * 
 * Final validation layer before APR submission
 * Ensures SPMS compliance by validating:
 * 1. APR has source APP reference
 * 2. Source APP is approved
 * 3. Budget is within ceiling
 * 4. All required fields are complete
 */

import type { APRMaster } from '../types'

export interface SubmissionValidationError {
  type: 'MISSING_APP_REFERENCE' | 'APP_NOT_APPROVED' | 'BUDGET_EXCEEDS_CEILING' | 'INCOMPLETE_APR'
  message: string
  recommendation: string
  isBlocker: boolean
}

export interface SubmissionValidationResult {
  isValid: boolean
  canSubmit: boolean
  errors: SubmissionValidationError[]
  warnings: SubmissionValidationError[]
}

/**
 * Validate APR before submission
 * Checks all SPMS compliance requirements
 */
export function validateAPRBeforeSubmission(apr: APRMaster | null): SubmissionValidationResult {
  const errors: SubmissionValidationError[] = []
  const warnings: SubmissionValidationError[] = []

  if (!apr) {
    errors.push({
      type: 'INCOMPLETE_APR',
      message: 'APR data is missing or not loaded.',
      recommendation: 'Reload the APR or contact support if the issue persists.',
      isBlocker: true,
    })
    return {
      isValid: false,
      canSubmit: false,
      errors,
      warnings,
    }
  }

  // ✅ SPMS: Check source APP reference exists
  if (!apr.sourceAPPId) {
    errors.push({
      type: 'MISSING_APP_REFERENCE',
      message:
        'This APR is not derived from an Annual Procurement Plan (APP). SPMS compliance requires all APRs to reference an approved APP.',
      recommendation:
        'Create a new APR using the APP selection dialog to ensure SPMS compliance.',
      isBlocker: true,
    })
  }

  // ✅ SPMS: Check source APP is approved
  if (apr.sourceAPPId && apr.appStatus !== 'APPROVED') {
    errors.push({
      type: 'APP_NOT_APPROVED',
      message: `The source APP (${apr.sourceAPPId}) status is "${apr.appStatus}" but must be "APPROVED" for SPMS compliance.`,
      recommendation:
        'Ensure the source APP is approved before submitting this APR. Contact the planning/budget team if the APP needs approval.',
      isBlocker: true,
    })
  }

  // ✅ Check budget ceiling compliance
  if (apr.appValidationStatus === 'VARIANCE_THRESHOLD_EXCEEDED') {
    errors.push({
      type: 'BUDGET_EXCEEDS_CEILING',
      message: `APR budget variance exceeds acceptable threshold (${apr.totalBudgetVariancePercent}%).`,
      recommendation:
        'Reduce the APR budget or adjust items to align with approved APP budget.',
      isBlocker: true,
    })
  }

  // ⚠️ Warning: Check for incomplete items
  if (!apr.consolidatedItems || apr.consolidatedItems.length === 0) {
    warnings.push({
      type: 'INCOMPLETE_APR',
      message: 'APR has no consolidated items.',
      recommendation: 'Add items from the source APP before submitting.',
      isBlocker: false,
    })
  }

  // ⚠️ Warning: Check for large budget variance
  if (apr.totalBudgetVariancePercent && Math.abs(apr.totalBudgetVariancePercent) > 5) {
    warnings.push({
      type: 'BUDGET_EXCEEDS_CEILING',
      message: `APR budget variance is ${apr.totalBudgetVariancePercent}% - consider reviewing this deviation.`,
      recommendation:
        'If this variance is intentional, document the reason in APR terms/notes.',
      isBlocker: false,
    })
  }

  const isValid = errors.length === 0
  const canSubmit = isValid && warnings.length === 0

  return {
    isValid,
    canSubmit,
    errors,
    warnings,
  }
}

/**
 * Get user-friendly error message for submission validation
 */
export function getSubmissionValidationMessage(result: SubmissionValidationResult): string {
  if (result.isValid && result.canSubmit) {
    return 'APR is ready for submission.'
  }

  const errorMessages = result.errors.map((err) => `❌ ${err.message}`).join('\n')
  const warningMessages = result.warnings.map((w) => `⚠️ ${w.message}`).join('\n')

  return [errorMessages, warningMessages].filter(Boolean).join('\n\n')
}

/**
 * Get blocking errors only (errors that prevent submission)
 */
export function getBlockingErrors(result: SubmissionValidationResult): SubmissionValidationError[] {
  return result.errors.filter((err) => err.isBlocker)
}

/**
 * Get warnings only (non-blocking issues)
 */
export function getWarnings(result: SubmissionValidationResult): SubmissionValidationError[] {
  return result.warnings.filter((w) => !w.isBlocker)
}
