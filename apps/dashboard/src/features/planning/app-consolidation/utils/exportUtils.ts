import jsPDF from 'jspdf'
// TODO: Install jspdf-autotable for advanced table formatting
// import 'jspdf-autotable'
import type { AppMaster, BACLineItem } from '../types'
import { generateLineageReport, exportLineageAsCSV } from './lineageUtils'

/**
 * Export & Document Generation Utilities
 *
 * Provides comprehensive export functionality for APPs:
 * - PDF export with BAC items, schedules, lineage details
 * - CSV export for Excel analysis
 * - Audit reports with lineage tracking
 * - Professional formatting for government procurement compliance
 *
 * Documentation: See documentations/export-generation.md
 */

/**
 * Export APP as PDF
 */
export function exportAPPAsPDF(app: AppMaster): void {
  const pdf = new jsPDF()
  const lineItems = app.workspace?.lineItems || app.bac?.lineItems || []

  // Title
  pdf.setFontSize(16)
  pdf.text('Annual Procurement Plan (APP)', 14, 20)

  // APP Details
  pdf.setFontSize(10)
  pdf.text(`APP Code: ${app.appCode}`, 14, 30)
  pdf.text(`APP Name: ${app.appName}`, 14, 36)
  pdf.text(`Fiscal Year: ${app.fiscalYear}`, 14, 42)
  pdf.text(`Status: ${app.status}`, 14, 48)
  pdf.text(`Type: ${app.type || 'Indicative'}`, 14, 54)

  // BAC Items Table
  const tableData = lineItems.map((item) => [
    item.description || 'N/A',
    item.quantity || 0,
    item.unitCost || 0,
    item.totalAmount || 0,
    item.modeOfProcurement || 'N/A',
  ])

  pdf.autoTable({
    startY: 65,
    head: [['Description', 'Qty', 'Unit Cost', 'Total Amount', 'Mode of Procurement']],
    body: tableData,
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    margin: { left: 14, right: 14 },
  })

  // Summary
  const totalBudget = lineItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  pdf.setFontSize(10)
  pdf.text(`Total Budget: ₱${totalBudget.toLocaleString('en-PH')}`, 14, pdf.lastAutoTable.finalY + 10)
  pdf.text(`Total Items: ${lineItems.length}`, 14, pdf.lastAutoTable.finalY + 16)

  // Download
  pdf.save(`APP-${app.appCode}-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Export APP line items as CSV
 */
export function exportAPPAsCSV(app: AppMaster): void {
  const lineItems = app.workspace?.lineItems || app.bac?.lineItems || []

  const headers = [
    'Description',
    'Quantity',
    'Unit Cost',
    'Total Amount',
    'Mode of Procurement',
    'Fund Source',
    'Office',
    'Category',
  ]

  const rows = lineItems.map((item) => [
    item.description || '',
    item.quantity || 0,
    item.unitCost || 0,
    item.totalAmount || 0,
    item.modeOfProcurement || 'N/A',
    item.fundSource || 'N/A',
    item.office || 'N/A',
    (item as any).category || 'N/A',
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or quotes
          const str = String(cell)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        })
        .join(',')
    ),
  ].join('\n')

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `APP-${app.appCode}-Items-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export lineage audit report as PDF
 */
export function exportLineageReportAsPDF(app: AppMaster): void {
  const pdf = new jsPDF()
  const lineItems = app.workspace?.lineItems || app.bac?.lineItems || []

  // Title
  pdf.setFontSize(16)
  pdf.text('Lineage Audit Report', 14, 20)

  // APP Details
  pdf.setFontSize(10)
  pdf.text(`APP Code: ${app.appCode}`, 14, 30)
  pdf.text(`APP Name: ${app.appName}`, 14, 36)
  pdf.text(`Report Generated: ${new Date().toISOString().split('T')[0]}`, 14, 42)

  let currentY = 55

  // Add lineage report for each item
  lineItems.forEach((item, index) => {
    if (currentY > 250) {
      pdf.addPage()
      currentY = 20
    }

    // Item header
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.text(`Item ${index + 1}: ${item.description}`, 14, currentY)
    currentY += 6

    // Lineage report
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    const report = generateLineageReport(item as any)
    const lines = pdf.splitTextToSize(report, 180)
    pdf.text(lines, 14, currentY)
    currentY += lines.length * 4 + 6
  })

  // Download
  pdf.save(`Lineage-Report-${app.appCode}-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Export complete APP package (PDF + Lineage CSV)
 */
export async function exportCompleteAPPPackage(app: AppMaster): Promise<void> {
  return new Promise((resolve) => {
    // Export PDF
    exportAPPAsPDF(app)

    // Export CSV after a short delay
    setTimeout(() => {
      exportAPPAsCSV(app)
      resolve()
    }, 500)
  })
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Generate APP summary for display/export
 */
export function generateAPPSummary(app: AppMaster): {
  appCode: string
  appName: string
  fiscalYear: number
  status: string
  type: string
  itemCount: number
  totalBudget: number
  createdBy: string
  createdAt: string
  updatedAt: string
  fundSources: string[]
  offices: string[]
  modesOfProcurement: string[]
} {
  const lineItems = app.workspace?.lineItems || app.bac?.lineItems || []

  return {
    appCode: app.appCode,
    appName: app.appName,
    fiscalYear: app.fiscalYear,
    status: app.status,
    type: app.type || 'Indicative',
    itemCount: lineItems.length,
    totalBudget: lineItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    createdBy: app.createdBy || 'N/A',
    createdAt: app.createdAt || '',
    updatedAt: app.updatedAt || '',
    fundSources: Array.from(new Set(lineItems.map((item) => item.fundSource || 'N/A'))),
    offices: Array.from(new Set(lineItems.map((item) => item.office || 'N/A'))),
    modesOfProcurement: Array.from(new Set(lineItems.map((item) => item.modeOfProcurement || 'N/A'))),
  }
}

/**
 * Generate comparison report between two APPs
 */
export function generateComparisonReport(
  appA: AppMaster,
  appB: AppMaster
): {
  similarities: string[]
  differences: string[]
  budgetDifference: number
  itemCountDifference: number
} {
  const summaryA = generateAPPSummary(appA)
  const summaryB = generateAPPSummary(appB)

  const similarities: string[] = []
  const differences: string[] = []

  // Compare basic fields
  if (summaryA.fiscalYear === summaryB.fiscalYear) {
    similarities.push('Same fiscal year')
  } else {
    differences.push(`Different fiscal years: ${summaryA.fiscalYear} vs ${summaryB.fiscalYear}`)
  }

  if (summaryA.type === summaryB.type) {
    similarities.push(`Both ${summaryA.type} APPs`)
  } else {
    differences.push(`Different types: ${summaryA.type} vs ${summaryB.type}`)
  }

  // Budget comparison
  const budgetDiff = Math.abs(summaryA.totalBudget - summaryB.totalBudget)
  if (budgetDiff === 0) {
    similarities.push('Same total budget')
  } else {
    differences.push(
      `Budget difference: ${formatCurrency(budgetDiff)} (${((budgetDiff / summaryA.totalBudget) * 100).toFixed(1)}%)`
    )
  }

  // Item count comparison
  const itemCountDiff = Math.abs(summaryA.itemCount - summaryB.itemCount)
  if (itemCountDiff === 0) {
    similarities.push('Same number of items')
  } else {
    differences.push(`Item count difference: ${itemCountDiff} items`)
  }

  return {
    similarities,
    differences,
    budgetDifference: summaryA.totalBudget - summaryB.totalBudget,
    itemCountDifference: summaryA.itemCount - summaryB.itemCount,
  }
}
