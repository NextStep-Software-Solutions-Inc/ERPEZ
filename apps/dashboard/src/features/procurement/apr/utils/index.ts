/**
 * APR Utils — Barrel Export
 * Central export point for all APR utility functions
 */

export {
  convertAppLineItemToAPRItem,
  convertAppLineItemsToAPRItems,
  calculateQuantityVariance,
  calculateBudgetVariance,
  isVarianceThresholdExceeded,
  getVarianceWarning,
  calculateTotalAPRBudget,
  calculateTotalVariance,
} from './convertAppItemsToAPR'

export {
  validateAPPForAPRCreation,
  validateLineItemsSelection,
  getAPPValidationErrorMessage,
} from './validateAppForAPR'

export type { APPValidationError, APPValidationErrorCode } from './validateAppForAPR'

export {
  validateBudgetCeiling,
  canSubmitAPRWithBudget,
  calculateRemainingBudget,
  getBudgetUtilizationPercent,
  getBudgetStatusColor,
} from './validateBudgetCeiling'

export type {
  BudgetCeilingValidationResult,
  BudgetCeilingValidationStatus,
} from './validateBudgetCeiling'

export {
  reconcileAPRWithAPP,
  getReconciliationSummary,
  getReconciliationStatus,
  isReconciliationReviewRequired,
} from './reconcileAPRWithAPP'

export type {
  APRVsAPPReconciliation,
  ReconciliationItem,
  ReconciliationItemStatus,
} from './reconcileAPRWithAPP'

export {
  createAPPNotFoundError,
  isAPPValid,
  getAPPInvalidReason,
  isValidAPPId,
  getAPPNotFoundDisplayText,
} from './handleAPPNotFound'

export type { APPNotFoundError } from './handleAPPNotFound'

export {
  validateAPRBeforeSubmission,
  getSubmissionValidationMessage,
  getBlockingErrors,
  getWarnings,
} from './validateAPRBeforeSubmission'

export type {
  SubmissionValidationError,
  SubmissionValidationResult,
} from './validateAPRBeforeSubmission'

export {
  normalizeAPRStatus,
  matchesAPRStatus,
} from './normalizeAPRStatus'

export { isCSEItem } from './isCSEItem'
