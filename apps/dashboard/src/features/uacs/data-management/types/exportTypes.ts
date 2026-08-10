import type { CodeSegmentType } from '../../code-segments/types/commonTypes'
import type { ImportStatus } from './importTypes'

/**
 * Export Format
 */
export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

/**
 * Export Options
 */
export interface ExportOptions {
  codeSegmentType: CodeSegmentType
  fiscalYear?: number
  includeInactive?: boolean
  format: ExportFormat
  filters?: Record<string, any>
}

/**
 * Export Job
 */
export interface ExportJob {
  id: string
  fileName: string
  codeSegmentType: CodeSegmentType
  format: ExportFormat
  status: ImportStatus // Reuse status enum
  recordCount: number
  fileUrl?: string
  startedAt: string
  completedAt?: string
  createdBy: string
}
