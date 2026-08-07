/**
 * APP Export Engine - Task 2.6-2.7
 * Generic export utilities for PDF and Excel generation
 * Uses jsPDF + HTML2Canvas for PDF, ExcelJS for Excel
 */

import type { AppMaster } from '../types'
import { formatBACLineItemsForExport, calculateGrandTotals } from './appExportFormatter'

/**
 * Export Configuration
 */
export interface ExportConfig {
  filename: string
  app: AppMaster
  includeSignatories: boolean
  includeSummary: boolean
}

/**
 * Prepare APP data for export
 * Handles all formatting and calculations
 */
export function prepareAPPForExport(app: AppMaster, config: ExportConfig) {
  const formattedRows = formatBACLineItemsForExport(app.bac.lineItems || [])
  const totals = calculateGrandTotals(formattedRows)

  return {
    metadata: {
      title: app.appName,
      code: app.appCode,
      fiscalYear: app.fiscalYear,
      type: app.appType,
      status: app.status,
      createdAt: app.createdAt,
      createdBy: app.createdBy,
    },
    rows: formattedRows,
    totals,
    signatories: app.signatories || {},
    config,
  }
}

/**
 * Format metadata header for display
 */
export function formatAPPHeader(app: AppMaster): string {
  let typeLabel = 'Annual Procurement Plan'
  
  if (app.appType === 'Indicative') {
    typeLabel = 'Indicative Annual Procurement Plan'
  } else if (app.appType === 'Final') {
    typeLabel = 'Final Annual Procurement Plan'
  } else if (app.appType === 'Supplemental') {
    const supplementalNumber =
      'supplementalNumber' in app ? Number(app.supplementalNumber) || 1 : 1
    typeLabel = `Supplemental Annual Procurement Plan No. ${supplementalNumber}`
  }
  
  return `${typeLabel} for FY ${app.fiscalYear}`
}

/**
 * Format signatory information - supports multiple signatories per role
 */
export function formatSignatories(app: AppMaster): Record<string, any> {
  const sigs = app.signatories || {}

  return {
    preparedBy: (sigs.preparedBy && sigs.preparedBy.length > 0) ? sigs.preparedBy : [{ name: '', position: '', department: '' }],
    reviewedBy: (sigs.reviewedBy && sigs.reviewedBy.length > 0) ? sigs.reviewedBy : [{ name: '', position: '', department: '' }],
    approvedBy: (sigs.approvedBy && sigs.approvedBy.length > 0) ? sigs.approvedBy : [{ name: '', position: '', department: '' }],
    certifiedBy: (sigs.certifiedBy && sigs.certifiedBy.length > 0) ? sigs.certifiedBy : [{ name: '', position: '', department: '' }],
  }
}

/**
 * Generate export filename with timestamp
 */
export function generateExportFilename(app: AppMaster, format: 'pdf' | 'xlsx'): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  let typePrefix = 'APP'
  
  if (app.appType === 'Indicative') {
    typePrefix = 'APP_INDICATIVE'
  } else if (app.appType === 'Final') {
    typePrefix = 'APP_FINAL'
  } else if (app.appType === 'Supplemental') {
    typePrefix = 'SUPP_APP'
  }
  
  const ext = format === 'pdf' ? 'pdf' : 'xlsx'
  return `${typePrefix}_FY${app.fiscalYear}_${app.appCode}_${timestamp}.${ext}`
}

/**
 * Format date for display in export
 */
export function formatExportDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
