/**
 * APP-Not-Found Error Handling
 * 
 * Utilities for handling cases where:
 * - Selected APP is no longer available
 * - APP is deleted or archived
 * - APP reference is invalid
 */

export interface APPNotFoundError {
  type: 'APP_NOT_FOUND' | 'INVALID_APP_ID' | 'APP_DELETED' | 'APP_ARCHIVED'
  appId: string
  message: string
  recommendation: string
}

/**
 * Create APP not found error
 */
export function createAPPNotFoundError(
  appId: string,
  reason: 'NOT_FOUND' | 'DELETED' | 'ARCHIVED' = 'NOT_FOUND'
): APPNotFoundError {
  const errorMap = {
    NOT_FOUND: {
      type: 'APP_NOT_FOUND' as const,
      message: `The selected Annual Procurement Plan (${appId}) is no longer available.`,
      recommendation:
        'Select another approved APP or check if this APP has been archived or deleted.',
    },
    DELETED: {
      type: 'APP_DELETED' as const,
      message: `The selected Annual Procurement Plan (${appId}) has been deleted.`,
      recommendation: 'This APP can no longer be used for APR creation. Please select another APP.',
    },
    ARCHIVED: {
      type: 'APP_ARCHIVED' as const,
      message: `The selected Annual Procurement Plan (${appId}) has been archived.`,
      recommendation: 'Archived APPs cannot be used for new APRs. Please select an active APP.',
    },
  }

  return {
    type: errorMap[reason].type,
    appId,
    message: errorMap[reason].message,
    recommendation: errorMap[reason].recommendation,
  }
}

/**
 * Check if APP is still valid (not deleted, not archived)
 */
export function isAPPValid(app: any): boolean {
  if (!app) return false
  if (app.status === 'DELETED' || app.status === 'ARCHIVED') return false
  if (app.deletedAt || app.archivedAt) return false
  return true
}

/**
 * Get error message for invalid APP
 */
export function getAPPInvalidReason(app: any | null): APPNotFoundError | null {
  if (!app) {
    return createAPPNotFoundError('UNKNOWN', 'NOT_FOUND')
  }

  if (app.status === 'DELETED' || app.deletedAt) {
    return createAPPNotFoundError(app.id, 'DELETED')
  }

  if (app.status === 'ARCHIVED' || app.archivedAt) {
    return createAPPNotFoundError(app.id, 'ARCHIVED')
  }

  return null
}

/**
 * Validate APP ID format (basic validation)
 */
export function isValidAPPId(appId: string): boolean {
  if (!appId || typeof appId !== 'string') return false
  if (appId.trim().length === 0) return false
  // Add more specific format validation if needed
  return true
}

/**
 * User-friendly error display text
 */
export function getAPPNotFoundDisplayText(error: APPNotFoundError): string {
  return `${error.message}\n\n💡 ${error.recommendation}`
}
