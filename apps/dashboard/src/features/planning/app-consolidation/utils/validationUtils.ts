import type { AppMaster, BACLineItem, ConsolidatedLineItem, CreateAPPFormValues } from '../types'

/**
 * Validation & Error Handling System
 *
 * Comprehensive validation for APP consolidation workflow:
 * - APP form validation (name, code, type, fiscal year)
 * - BAC item validation (description, quantities, budget)
 * - Lineage data validation
 * - Workflow state validation
 * - User-friendly error messages
 *
 * Documentation: documentations/validation-error-handling.md
 */

/**
 * Validation error types
 */
export enum ValidationErrorType {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_RANGE = 'INVALID_RANGE',
  DUPLICATE = 'DUPLICATE',
  DEPENDENCY = 'DEPENDENCY',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INVALID_STATE = 'INVALID_STATE',
}

/**
 * Validation error object
 */
export interface ValidationError {
  type: ValidationErrorType
  field: string
  message: string
  value?: any
  details?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<ValidationErrorType, Record<string, string>> = {
  [ValidationErrorType.REQUIRED_FIELD]: {
    appName: 'APP Name is required',
    appCode: 'APP Code is required',
    fiscalYear: 'Fiscal Year is required',
    type: 'APP Type is required',
    description: 'Item description is required',
    quantity: 'Quantity is required',
    budget: 'Budget is required',
    modeOfProcurement: 'Mode of Procurement is required',
  },
  [ValidationErrorType.INVALID_FORMAT]: {
    appCode: 'APP Code must follow format (e.g., APP-2024-001)',
    fiscalYear: 'Fiscal Year must be a valid year',
    quantity: 'Quantity must be a positive number',
    budget: 'Budget must be a valid amount',
    schedule: 'Schedule must be MM/YYYY, N/A, or valid date format',
  },
  [ValidationErrorType.INVALID_RANGE]: {
    quantity: 'Quantity must be greater than 0',
    budget: 'Budget must be greater than 0',
    percentage: 'Percentage must be between 0 and 100',
  },
  [ValidationErrorType.DUPLICATE]: {
    appCode: 'This APP Code already exists',
    itemCode: 'This item code already exists in this APP',
  },
  [ValidationErrorType.DEPENDENCY]: {
    submit: 'Cannot submit APP without any BAC items',
    consolidate: 'Cannot consolidate without selecting at least one PPMP',
  },
  [ValidationErrorType.PERMISSION_DENIED]: {
    create: 'You do not have permission to create APPs',
    edit: 'You do not have permission to edit this APP',
    approve: 'You do not have permission to approve APPs',
  },
  [ValidationErrorType.RESOURCE_NOT_FOUND]: {
    app: 'APP not found',
    ppmp: 'PPMP not found',
    item: 'Item not found',
  },
  [ValidationErrorType.CONFLICT]: {
    status: 'Cannot perform this action on an APP with this status',
    locked: 'Cannot modify a locked APP',
  },
  [ValidationErrorType.INVALID_STATE]: {
    workflow: 'APP is not in a valid state for this action',
  },
}

/**
 * Validate APP form values
 */
export function validateAPPForm(values: Partial<CreateAPPFormValues>): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!values.appName?.trim()) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'appName',
      message: ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].appName,
    })
  }

  if (!values.appCode?.trim()) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'appCode',
      message: ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].appCode,
    })
  } else {
    // Validate code format: APP-YYYY-XXX
    if (!/^APP-\d{4}-\d{3}$/.test(values.appCode)) {
      errors.push({
        type: ValidationErrorType.INVALID_FORMAT,
        field: 'appCode',
        message: ERROR_MESSAGES[ValidationErrorType.INVALID_FORMAT].appCode,
        value: values.appCode,
      })
    }
  }

  if (!values.fiscalYear) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'fiscalYear',
      message: ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].fiscalYear,
    })
  } else if (values.fiscalYear < 1900 || values.fiscalYear > 2100) {
    errors.push({
      type: ValidationErrorType.INVALID_FORMAT,
      field: 'fiscalYear',
      message: ERROR_MESSAGES[ValidationErrorType.INVALID_FORMAT].fiscalYear,
      value: values.fiscalYear,
    })
  }

  if (!values.appType) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'appType',
      message: ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].type,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate BAC line item
 */
export function validateBACLineItem(item: Partial<BACLineItem>): ValidationResult {
  const errors: ValidationError[] = []

  if (!item.description?.trim()) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'description',
      message: ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].description,
    })
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push({
      type: ValidationErrorType.INVALID_RANGE,
      field: 'quantity',
      message:
        item.quantity === undefined
          ? ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].quantity
          : ERROR_MESSAGES[ValidationErrorType.INVALID_RANGE].quantity,
      value: item.quantity,
    })
  }

  if (!item.totalAmount || item.totalAmount <= 0) {
    errors.push({
      type: ValidationErrorType.INVALID_RANGE,
      field: 'budget',
      message:
        item.totalAmount === undefined
          ? ERROR_MESSAGES[ValidationErrorType.REQUIRED_FIELD].budget
          : ERROR_MESSAGES[ValidationErrorType.INVALID_RANGE].budget,
      value: item.totalAmount,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate APP before submission
 */
export function validateAppForSubmission(app: AppMaster): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Check required fields
  if (!app.appName?.trim()) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'appName',
      message: 'APP Name is required',
    })
  }

  if (!app.appCode?.trim()) {
    errors.push({
      type: ValidationErrorType.REQUIRED_FIELD,
      field: 'appCode',
      message: 'APP Code is required',
    })
  }

  // Check BAC items
  if (!app.workspace?.lineItems || app.workspace.lineItems.length === 0) {
    errors.push({
      type: ValidationErrorType.DEPENDENCY,
      field: 'lineItems',
      message: ERROR_MESSAGES[ValidationErrorType.DEPENDENCY].submit,
    })
  }

  // Validate each BAC item
  app.workspace?.lineItems?.forEach((item: Partial<BACLineItem>) => {
    const itemValidation = validateBACLineItem(item)
    if (!itemValidation.isValid) {
      errors.push(
        ...itemValidation.errors.map((err) => ({
          ...err,
          field: `item_${item.id}_${err.field}`,
        }))
      )
    }
  })

  // Check MoP is set
  const itemsWithoutMoP = app.workspace?.lineItems?.filter((item: { modeOfProcurement: any }) => !item.modeOfProcurement) || []
  if (itemsWithoutMoP.length > 0) {
    warnings.push(`${itemsWithoutMoP.length} item(s) do not have Mode of Procurement set`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validate schedule input
 */
export function validateScheduleInput(value: string | undefined): ValidationResult {
  const errors: ValidationError[] = []

  if (!value) return { isValid: true, errors }

  // Check if it's a valid format
  const validFormats = [
    /^\d{2}\/\d{4}$/, // MM/YYYY
    /^(N\/A|as the need arises|various dates)$/, // Predefined options
    /^(\d{2}\/\d{4})(,\s*\d{2}\/\d{4})*$/, // Multiple months
  ]

  const isValid = validFormats.some((format) => format.test(value))

  if (!isValid) {
    errors.push({
      type: ValidationErrorType.INVALID_FORMAT,
      field: 'schedule',
      message: ERROR_MESSAGES[ValidationErrorType.INVALID_FORMAT].schedule,
      value,
      details: 'Expected MM/YYYY, N/A, as the need arises, various dates, or comma-separated months',
    })
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Sanitize and normalize form inputs
 */
export function sanitizeFormInputs(values: Record<string, any>): Record<string, any> {
  const sanitized = { ...values }

  // Trim strings
  Object.keys(sanitized).forEach((key) => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim()
    }
  })

  // Normalize APP Code to uppercase
  if (sanitized.appCode) {
    sanitized.appCode = sanitized.appCode.toUpperCase()
  }

  // Round numeric values
  if (sanitized.quantity) {
    sanitized.quantity = Math.max(0, Math.round(sanitized.quantity))
  }

  if (sanitized.totalAmount) {
    sanitized.totalAmount = Math.max(0, Math.round(sanitized.totalAmount * 100) / 100)
  }

  return sanitized
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  return `${error.message}${error.details ? ` (${error.details})` : ''}`
}

/**
 * Format all validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): {
  byField: Record<string, string[]>
  all: string[]
} {
  const byField: Record<string, string[]> = {}
  const all: string[] = []

  errors.forEach((error) => {
    const formatted = formatValidationError(error)
    all.push(formatted)

    if (!byField[error.field]) {
      byField[error.field] = []
    }
    byField[error.field].push(formatted)
  })

  return { byField, all }
}

/**
 * API error handling
 */
export interface APIError {
  code: string
  message: string
  statusCode: number
  details?: any
}

/**
 * Parse API error response
 */
export function parseAPIError(error: any): APIError {
  if (error.response?.data) {
    const data = error.response.data
    return {
      code: data.code || 'UNKNOWN_ERROR',
      message: data.message || 'An error occurred',
      statusCode: error.response.status,
      details: data.details,
    }
  }

  return {
    code: 'NETWORK_ERROR',
    message: error.message || 'Network error occurred',
    statusCode: 0,
  }
}

/**
 * User-friendly error message mapping
 */
export const USER_FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  CONFLICT: 'This action conflicts with the current state. Please refresh and try again.',
  VALIDATION_ERROR: 'Please check your input and try again',
  INTERNAL_SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  DUPLICATE_ENTRY: 'This record already exists',
  INVALID_STATE: 'Cannot perform this action in the current state',
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: APIError): string {
  return USER_FRIENDLY_ERROR_MESSAGES[error.code] || error.message || 'An unexpected error occurred'
}
