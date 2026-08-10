/**
 * Excel Export Implementation - Task 2.7
 * Uses SheetJS (XLSX) for Excel generation
 */

import type { AppMaster } from '../types'
import { formatBACLineItemsForExport, calculateGrandTotals, GPPB_COLUMNS, formatCurrencyNoSymbol } from './appExportFormatter'
import { formatAPPHeader, formatSignatories, formatExportDate } from './appExportEngine'

/**
 * Prepare Excel data in proper format
 * Returns data structure ready for SheetJS
 */
export function prepareExcelData(app: AppMaster) {
  const rows = formatBACLineItemsForExport(app.bac.lineItems || [])
  const totals = calculateGrandTotals(rows)
  const signatories = formatSignatories(app)

  const headerTitle = formatAPPHeader(app)
  const createdDate = formatExportDate(app.createdAt)

  // Build header section
  const headerSection = [
    [headerTitle],
    [`Code: ${app.appCode}`],
    [`Fiscal Year: ${app.fiscalYear}`],
    [`Status: ${app.status}`],
    [],
    [`Prepared by: ${app.createdBy}`],
    [`Date Prepared: ${createdDate}`],
    [],
  ]

  // Build column headers
  const columnHeaders = GPPB_COLUMNS.map((col) => col.label)

  // Build data rows
  const dataRows = rows.map((row) => [
    row.projectTitle,
    row.implementingUnit,
    row.description,
    row.modeOfProcurement,
    row.isEPA,
    row.bidEvaluationCriteria,
    row.startOfProcurement,
    row.endOfProcurement,
    row.sourceOfFund,
    formatCurrencyNoSymbol(row.estimatedBudget),
    row.procurementStrategy,
    row.remarks,
  ])

  // Add grand totals row
  const totalsRow = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'GRAND TOTAL:',
    formatCurrencyNoSymbol(totals.totalBudget),
    '',
    '',
  ]

  // Signatory section
  const signatorySection = [
    [],
    [],
    ['SIGNATORIES'],
    [],
    ['Prepared by', 'Recommending Approval', 'Approved by', 'Certified by'],
    [signatories.preparedBy[0]?.name ?? '', signatories.reviewedBy[0]?.name ?? '', signatories.approvedBy[0]?.name ?? '', signatories.certifiedBy[0]?.name ?? ''],
    [signatories.preparedBy[0]?.position ?? '', signatories.reviewedBy[0]?.position ?? '', signatories.approvedBy[0]?.position ?? '', signatories.certifiedBy[0]?.position ?? ''],
    [
      'BAC Secretariat',
      'Office Name',
      'Office Name',
      'Office Name',
    ],
  ]

  // Column widths for Excel
  const columnWidths = GPPB_COLUMNS.map((col) => ({ wch: col.width }))

  return {
    header: headerSection,
    columns: [columnHeaders],
    data: [...dataRows, totalsRow],
    signatories: signatorySection,
    totals,
    app,
    columnWidths,
  }
}

/**
 * Generate Excel workbook (returns worksheet data)
 * Use with SheetJS: XLSX.utils.book_new() and XLSX.utils.book_append_sheet()
 */
export function generateExcelWorksheet(app: AppMaster) {
  const prepared = prepareExcelData(app)

  // Combine all sections
  const allRows = [
    ...prepared.header,
    ...prepared.columns,
    ...prepared.data,
    ...prepared.signatories,
  ]

  // Column widths
  const columnWidths = GPPB_COLUMNS.map((col) => ({ wch: col.width }))

  return {
    data: allRows,
    columnWidths,
    columns: prepared.columns,
    totals: prepared.totals,
    app: prepared.app,
  }
}

/**
 * Create styled Excel workbook using exceljs (if available)
 * Falls back to simple XLSX if not
 */
export async function createStyledExcelWorkbook(app: AppMaster) {
  // Mock implementation - ready for API integration
  try {
    const prepared = prepareExcelData(app)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Mock: Creating styled Excel workbook for:', app.appCode)
    console.log('Data prepared with', prepared.data.length, 'rows')

    return {
      status: 'ready',
      message: 'Excel workbook prepared for export',
      appCode: app.appCode,
      rowCount: prepared.data.length,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('Error preparing Excel workbook:', error)
    return null
  }
}

/**
 * Helper to download Excel using Blob
 */
export function downloadExcelBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
