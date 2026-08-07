import type { CodeSegmentType } from '../../code-segments/types/commonTypes'

/**
 * Import Status
 */
export enum ImportStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL', // Some records succeeded, some failed
}

/**
 * Import Error Type
 */
export enum ImportErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_DIGIT_LENGTH = 'INVALID_DIGIT_LENGTH',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  DUPLICATE_CODE = 'DUPLICATE_CODE',
  INVALID_REFERENCE = 'INVALID_REFERENCE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * Import Error
 */
export interface ImportError {
  lineNumber: number
  column?: string
  errorType: ImportErrorType
  message: string
  value?: string
}

/**
 * Import Validation Summary
 */
export interface ImportValidationSummary {
  totalRecords: number
  newRecords: number
  updateRecords: number
  errorRecords: number
  duplicateRecords: number
  errors: ImportError[]
}

/**
 * Duplicate Handling Strategy
 */
export enum DuplicateHandling {
  SKIP = 'SKIP',           // Skip duplicate records
  OVERWRITE = 'OVERWRITE', // Overwrite existing records
  MERGE = 'MERGE',         // Merge data (if applicable)
}

/**
 * Import Job
 */
export interface ImportJob {
  id: string
  fileName: string
  fileSize: number
  codeSegmentType: CodeSegmentType
  status: ImportStatus
  validationSummary?: ImportValidationSummary
  duplicateHandling: DuplicateHandling
  processedRecords: number
  totalRecords: number
  startedAt: string
  completedAt?: string
  createdBy: string
}

/**
 * Import Request
 */
export interface ImportRequest {
  file: File
  codeSegmentType: CodeSegmentType
  fiscalYear: number
  duplicateHandling: DuplicateHandling
}
