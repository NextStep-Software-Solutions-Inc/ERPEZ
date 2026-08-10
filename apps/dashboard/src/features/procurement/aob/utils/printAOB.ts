/**
 * Print AOB Utility
 * Generates a printable AOB document
 * Handles printing via browser print dialog
 */

import type { AOB, BidMatrix } from '../types/aobTypes'

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Generate HTML for printable AOB document
 */
function generateAOBPrintHTML(aob: AOB, bidMatrix: BidMatrix | null | undefined): string {
  const lineItems = bidMatrix?.lineItems || []
  const suppliers = bidMatrix?.suppliers || []

  const printDate = new Date().toLocaleDateString('en-PH')
  const tableRows = lineItems
    .map((item) => {
      const bids = item.lineItems || []
      const winner = bids.find((b) => b.isWinner)
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(item.itemCode)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(item.description)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(item.unit)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.approvedBudgetForContract)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: ${winner ? '#fef3c7' : '#fff'};">
            ${winner ? `${escapeHtml(winner.supplierName)} - ${formatCurrency(winner.totalBid)}` : '-'}
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AOB - ${aob.aobNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            padding: 20px;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 14px;
            color: #666;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-item {
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 4px;
          }
          
          .info-label {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            color: #333;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin: 25px 0 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background-color: #fff;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: 600;
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: 13px;
          }
          
          td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            font-size: 13px;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .winner-cell {
            background-color: #fef3c7 !important;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 40px;
            border-top: 2px solid #333;
            padding-top: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .status-draft {
            background-color: #e5e7eb;
            color: #374151;
          }
          
          .status-for-approval {
            background-color: #fed7aa;
            color: #92400e;
          }
          
          .status-approved {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ABSTRACT OF BIDS (AOB)</h1>
          <p>Official Tabulation Document for Bid Evaluation</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">AOB Number</div>
            <div class="info-value">${escapeHtml(aob.aobNumber)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="status-badge status-${escapeHtml(aob.status.toLowerCase().replace(/ /g, '-'))}">
                ${escapeHtml(aob.status)}
              </span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Award Criterion</div>
            <div class="info-value">${escapeHtml(aob.awardCriterion)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">RFQ Number</div>
            <div class="info-value">${aob.rfqNumber ? escapeHtml(aob.rfqNumber) : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">AOB Date</div>
            <div class="info-value">${new Date(aob.date).toLocaleDateString('en-PH')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Opening Date</div>
            <div class="info-value">${new Date(aob.openingDate).toLocaleDateString('en-PH')}</div>
          </div>
          ${aob.description ? `
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Description</div>
              <div class="info-value">${escapeHtml(aob.description)}</div>
            </div>
          ` : ''}
        </div>
        
        <h2 class="section-title">Bid Tabulation Matrix</h2>
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>ABC</th>
              <th>Selected Winner</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <h2 class="section-title">Supplier Information</h2>
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Submission Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map((supplier) => `
              <tr>
                <td>${escapeHtml(supplier.supplierName)}</td>
                <td>${escapeHtml(supplier.submissionType)}</td>
                <td>${supplier.isResponsive ? 'Responsive' : 'Non-Responsive'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Document printed on ${printDate}</p>
          <p>This is an official document. Unauthorized reproduction is prohibited.</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Open print dialog with AOB document
 */
export function printAOB(aob: AOB, bidMatrix: BidMatrix | null | undefined): void {
  // Guard against SSR and non-browser environments
  if (typeof window === 'undefined') {
    console.error('Print functionality is only available in browser environment')
    return
  }

  try {
    const htmlContent = generateAOBPrintHTML(aob, bidMatrix)
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      console.error('Failed to open print window. Check if pop-ups are blocked.')
      alert('Unable to open print window. Please check if pop-ups are blocked.')
      return
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print()
    }
  } catch (error) {
    console.error('Error printing AOB:', error)
    alert('Failed to print AOB. Please try again.')
  }
}

/**
 * Trigger browser print dialog for current page
 * Use this as a simpler alternative to window.open
 */
export function triggerBrowserPrint(): void {
  // Guard against SSR and non-browser environments
  if (typeof window === 'undefined') {
    console.error('Print functionality is only available in browser environment')
    return
  }

  window.print()
}
