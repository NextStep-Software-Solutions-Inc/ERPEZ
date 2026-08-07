/**
 * Print NTP Utility
 * Generates and prints NTP documents in professional letter format
 */

import type { NTP } from '../types/ntpTypes'

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Generate professional NTP print HTML
 * Includes HOPE signature block and supplier acknowledgment
 */
export function generateNTPPrintHTML(ntp: NTP): string {
  const totalAmount = ntp.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const lineItemsHtml = ntp.lineItems
    .map(
      (item, index) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 10px;">${escapeHtml(item.description)}</td>
      ${item.specs ? `<td style="border: 1px solid #ddd; padding: 10px; font-size: 0.9em; color: #666;">${escapeHtml(item.specs)}</td>` : ''}
      <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₱ ${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₱ ${(item.quantity * item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
    </tr>
  `
    )
    .join('')

  const approvedDate = ntp.approvedAt
    ? new Date(ntp.approvedAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notice to Proceed - ${ntp.ntpNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 40px;
        }
        .container {
          max-width: 8.5in;
          height: 11in;
          margin: 0 auto;
          padding: 40px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1a1a1a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
          color: #666;
        }
        .document-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          font-size: 12px;
        }
        .document-info strong {
          display: block;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .document-info span {
          color: #666;
        }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 8px 12px;
          margin: 20px 0 10px 0;
          border-left: 3px solid #1a1a1a;
        }
        .supplier-info {
          background: #f9f9f9;
          border: 1px solid #ddd;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .supplier-info strong {
          display: block;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 11px;
        }
        table thead {
          background: #1a1a1a;
          color: white;
        }
        table th {
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        table td {
          padding: 8px 10px;
          border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
          background: #f9f9f9;
        }
        .total-row {
          background: #1a1a1a;
          color: white;
          font-weight: bold;
        }
        .total-row td {
          border-color: #1a1a1a;
          padding: 12px 10px;
        }
        .instructions {
          background: #fffacd;
          border-left: 3px solid #ffa500;
          padding: 12px;
          margin: 20px 0;
          font-size: 11px;
          line-height: 1.5;
        }
        .signature-block {
          margin-top: 30px;
          page-break-inside: avoid;
        }
        .signature-lines {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
          font-size: 11px;
        }
        .signature-line {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .signature-line .line {
          border-top: 1px solid #1a1a1a;
          padding-top: 5px;
          min-height: 80px;
        }
        .signature-line .name {
          font-weight: bold;
        }
        .signature-line .title {
          font-size: 10px;
          color: #666;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
          .container {
            box-shadow: none;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>NOTICE TO PROCEED</h1>
          <p>Office of the Head of Procurement and Evaluation (HOPE)</p>
        </div>

        <!-- Document Info -->
        <div class="document-info">
          <div>
            <strong>NTP Number:</strong>
            <span>${escapeHtml(ntp.ntpNumber)}</span>
          </div>
          <div>
            <strong>Date:</strong>
            <span>${new Date(ntp.date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>
          <div>
            <strong>Source Document:</strong>
            <span>${ntp.sourceType === 'PO' ? 'Purchase Order' : 'Contract'} (ID: ${escapeHtml(ntp.sourceDocumentId)})</span>
          </div>
          <div>
            <strong>Status:</strong>
            <span>${escapeHtml(ntp.status)}</span>
          </div>
        </div>

        <!-- Supplier Information -->
        <div class="section-title">Supplier Information</div>
        <div class="supplier-info">
          <strong>Supplier Name:</strong>
          <span>${escapeHtml(ntp.supplierName)}</span>
        </div>

        <!-- Line Items Table -->
        <div class="section-title">Procured Items</div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 35%;">Item Description</th>
              ${ntp.lineItems.some((item) => item.specs) ? '<th style="width: 20%;">Specifications</th>' : ''}
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Unit Price</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
            <tr class="total-row">
              <td colspan="${ntp.lineItems.some((item) => item.specs) ? 4 : 3}" style="text-align: right;">TOTAL AMOUNT:</td>
              <td style="text-align: right;">₱ ${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <!-- Instructions -->
        <div class="instructions">
          <strong>Instructions:</strong>
          <p>The supplier is hereby notified to proceed with the delivery of the above-listed items in accordance with the terms and conditions of the ${ntp.sourceType === 'PO' ? 'Purchase Order' : 'Contract'}. Failure to comply with the agreed terms may result in contract cancellation and forfeiture of performance security.</p>
        </div>

        ${ntp.description ? `<div class="instructions"><strong>Additional Notes:</strong><p>${escapeHtml(ntp.description)}</p></div>` : ''}

        <!-- Signature Block -->
        <div class="signature-block">
          <p style="font-size: 11px; margin-bottom: 10px;"><strong>APPROVED BY:</strong></p>
          <div class="signature-lines">
            <div class="signature-line">
              <div class="line"></div>
              <div class="name">${ntp.approvedBy ? escapeHtml(ntp.approvedBy) : '_________________________'}</div>
              <div class="title">Approving Authority</div>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <div class="name">_________________________</div>
              <div class="title">Supplier Representative</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>This is a digitally generated document. Generated on ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-PH')}</p>
          ${ntp.approvedAt ? `<p>Approved on: ${approvedDate}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Print NTP document
 * Opens print dialog or downloads as PDF
 */
export function printNTP(ntp: NTP): void {
  const html = generateNTPPrintHTML(ntp)
  const printWindow = window.open('', '', 'width=900,height=700')
  
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Use setTimeout to ensure content is rendered before printing
    // This prevents double dialogs and ensures reliability
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      // Close the preview window after printing is done (user can cancel)
      // printWindow.close() will close the window, but users often want to keep it for reference
    }, 250)
  } else {
    console.error('Failed to open print window. Please check your browser settings.')
  }
}
