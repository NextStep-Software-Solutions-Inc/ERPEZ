/**
 * Code Validation Dialog Helper
 * Generic utility for wrapping dialogs with code combination validation
 */

export interface CodeValidationAlertState {
  isOpen: boolean
  errors: string[]
  warnings: string[]
  hasErrors: boolean
}

/**
 * Creates initial validation alert state
 */
export function createValidationAlertState(): CodeValidationAlertState {
  return {
    isOpen: false,
    errors: [],
    warnings: [],
    hasErrors: false,
  }
}

/**
 * Updates validation alert state based on validation result
 */
export function updateValidationAlertState(
  errors: string[],
  warnings: string[]
): CodeValidationAlertState {
  return {
    isOpen: errors.length > 0 || warnings.length > 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
  }
}

/**
 * Determines if submission should be allowed
 */
export function canProceedWithSubmission(validationAlertState: CodeValidationAlertState): boolean {
  return validationAlertState.errors.length === 0
}

/**
 * Gets appropriate alert title based on state
 */
export function getValidationAlertTitle(validationAlertState: CodeValidationAlertState): string {
  if (validationAlertState.hasErrors) {
    return 'Validation Errors'
  }
  return 'Validation Warnings'
}

/**
 * Gets appropriate alert description
 */
export function getValidationAlertDescription(validationAlertState: CodeValidationAlertState): string {
  if (validationAlertState.hasErrors) {
    return 'Please fix the following errors before proceeding:'
  }
  return 'Please review these warnings before proceeding:'
}
