/**
 * PDF Export Implementation - Task 2.6
 * Uses jsPDF for PDF generation with proper formatting
 */

import type { AppMaster } from '../types'
import { formatBACLineItemsForExport, calculateGrandTotals, GPPB_COLUMNS, formatCurrency } from './appExportFormatter'
import { formatAPPHeader, formatSignatories, formatExportDate } from './appExportEngine'

/**
 * Generate PDF content as HTML string
 * Can be rendered in preview or exported to PDF
 */
export function generatePDFContent(app: AppMaster): string {
  const rows = formatBACLineItemsForExport(app.bac.lineItems || [])
  const totals = calculateGrandTotals(rows)
  const signatories = formatSignatories(app)

  const headerTitle = formatAPPHeader(app)
  const createdDate = formatExportDate(app.createdAt)

  // Build table HTML
  const tableRows = rows
    .map(
      (row) => `
    <tr>
      <td style="border: 1px solid #000; padding: 8px; font-size: 11px; font-weight: 500;">${row.projectTitle}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${row.implementingUnit}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px;">${row.description}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${row.modeOfProcurement}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px; text-align: center; font-weight: 600;">${row.isEPA}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px;">${row.bidEvaluationCriteria}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px; text-align: center;">${row.startOfProcurement}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px; text-align: center;">${row.endOfProcurement}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${row.sourceOfFund}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 11px; text-align: right; font-weight: 600;">${formatCurrency(row.estimatedBudget)}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px;">${row.procurementStrategy}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 10px;">${row.remarks}</td>
    </tr>
  `
    )
    .join('')

  const totalRow = `
    <tr style="background-color: #e8e8e8; font-weight: bold;">
      <td colspan="9" style="border: 1px solid #000; padding: 8px; text-align: right;">GRAND TOTAL:</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(totals.totalBudget)}</td>
      <td colspan="2" style="border: 1px solid #000; padding: 8px;"></td>
    </tr>
  `

  const headerRow = `
    <tr style="background-color: #cccccc; font-weight: bold;">
      ${GPPB_COLUMNS.map(
        (col) => `<td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11px;">${col.label}</td>`
      ).join('')}
    </tr>
  `

  const signatoryHTML = `
    <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="height: 60px; border-bottom: 1px solid #000;"></div>
          <p style="margin: 5px 0; font-size: 11px; font-weight: bold;">${signatories.preparedBy.name}</p>
          <p style="margin: 0; font-size: 10px;">${signatories.preparedBy.position}</p>
          <p style="margin: 0; font-size: 9px;">Prepared by BAC Secretariat</p>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="height: 60px; border-bottom: 1px solid #000;"></div>
          <p style="margin: 5px 0; font-size: 11px; font-weight: bold;">${signatories.reviewedBy.name}</p>
          <p style="margin: 0; font-size: 10px;">${signatories.reviewedBy.position}</p>
          <p style="margin: 0; font-size: 9px;">Recommending Approval</p>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="height: 60px; border-bottom: 1px solid #000;"></div>
          <p style="margin: 5px 0; font-size: 11px; font-weight: bold;">${signatories.approvedBy.name}</p>
          <p style="margin: 0; font-size: 10px;">${signatories.approvedBy.position}</p>
          <p style="margin: 0; font-size: 9px;">Approved by</p>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="height: 60px; border-bottom: 1px solid #000;"></div>
          <p style="margin: 5px 0; font-size: 11px; font-weight: bold;">${signatories.certifiedBy.name}</p>
          <p style="margin: 0; font-size: 10px;">${signatories.certifiedBy.position}</p>
          <p style="margin: 0; font-size: 9px;">Certified by</p>
        </td>
      </tr>
    </table>
  `

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${app.appName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 16px; margin: 0; font-weight: bold; }
          .header p { font-size: 12px; margin: 5px 0; }
          .metadata { font-size: 11px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          td { border: 1px solid #000; padding: 8px; }
          th { border: 1px solid #000; padding: 8px; background-color: #cccccc; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${headerTitle}</h1>
          <p>Code: ${app.appCode}</p>
          <p>Fiscal Year: ${app.fiscalYear}</p>
          <p>Status: ${app.status}</p>
        </div>
        
        <div class="metadata">
          <p><strong>Prepared by:</strong> ${app.createdBy}</p>
          <p><strong>Date Prepared:</strong> ${createdDate}</p>
        </div>

        <table>
          ${headerRow}
          ${tableRows}
          ${totalRow}
        </table>

        ${signatoryHTML}

        <p style="font-size: 10px; margin-top: 30px; color: #666;">
          Generated on ${new Date().toLocaleString('en-PH')}
        </p>
      </body>
    </html>
  `
}

/**
 * Helper to trigger PDF download using browser print
 * Alternative approach if jsPDF is not available
 */
export function downloadPDFViaprint(htmlContent: string, filename: string) {
  const printWindow = window.open('', '', 'height=800,width=1000')
  if (!printWindow) {
    console.error('Failed to open print window')
    return
  }

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  setTimeout(() => {
    printWindow.print()
    // Note: Can't directly trigger save, user must use print dialog
  }, 250)
}
