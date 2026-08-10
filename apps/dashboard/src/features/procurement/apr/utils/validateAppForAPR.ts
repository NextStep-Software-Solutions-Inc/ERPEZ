/**
 * APP Approval Validation Utility
 * 
 * Validates that source APP meets SPMS prerequisites for APR creation
 */

import type { AppMaster } from '@/features/planning/app-consolidation/types'

export type APPValidationErrorCode =
  | 'APP_NOT_FOUND'
  | 'APP_NOT_APPROVED'
  | 'APP_DRAFT'
  | 'APP_PENDING_REVIEW'
  | 'APP_NOT_PUBLISHED'

export interface APPValidationError {
  code: APPValidationErrorCode
  message: string
  isBlocker: boolean // true = blocks APR creation, false = warning only
}

/**
 * Validate APP status for APR creation
 * SPMS Compliance: APR can only be created from APPROVED APPs
 */
export function validateAPPForAPRCreation(app: AppMaster | null): APPValidationError | null {
  if (!app) {
    return {
      code: 'APP_NOT_FOUND',
      message: 'Selected APP not found. Please select a valid APP.',
      isBlocker: true,
    }
  }

  switch (app.status) {
    case 'approved':
      // ✅ APP is approved - allow APR creation
      return null

    case 'published':
      // ✅ Published APPs are also valid for APR creation
      return null

    case 'draft':
      return {
        code: 'APP_DRAFT',
        message: 'The selected APP is still in DRAFT status. APP must be APPROVED before creating an APR.',
        isBlocker: true,
      }

    case 'pending-review':
      return {
        code: 'APP_PENDING_REVIEW',
        message: 'The selected APP is pending review. APP must be APPROVED before creating an APR.',
        isBlocker: true,
      }

    default:
      return {
        code: 'APP_NOT_APPROVED',
        message: 'The selected APP does not have a valid status for APR creation.',
        isBlocker: true,
      }
  }
}

/**
 * Validate selected line items count
 */
export function validateLineItemsSelection(
  selectedCount: number,
  totalCount: number
): APPValidationError | null {
  if (selectedCount === 0) {
    return {
      code: 'APP_NOT_APPROVED', // Repurposed for this context
      message: 'Please select at least one line item from the APP.',
      isBlocker: true,
    }
  }

  if (selectedCount > totalCount) {
    return {
      code: 'APP_NOT_APPROVED',
      message: 'Invalid line items selection. Please try again.',
      isBlocker: true,
    }
  }

  return null
}

/**
 * Get user-friendly validation error message with action
 */
export function getAPPValidationErrorMessage(
  error: APPValidationError | null
): { message: string; action: string } | null {
  if (!error) return null

  return {
    message: error.message,
    action:
      error.code === 'APP_NOT_FOUND'
        ? 'Select an APP and try again'
        : error.code === 'APP_DRAFT'
          ? 'Wait for APP consolidation and approval'
          : error.code === 'APP_PENDING_REVIEW'
            ? 'Wait for APP review to complete'
            : error.code === 'APP_NOT_PUBLISHED'
              ? 'Wait for APP to be published'
              : 'Contact your administrator',
  }
}
