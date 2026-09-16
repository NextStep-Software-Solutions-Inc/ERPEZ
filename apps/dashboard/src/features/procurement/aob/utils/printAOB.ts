/**
 * Print & Export AOB Utility
 * Generates an official Philippine Government "ABSTRACT OF QUOTATION" document
 * matching Republic Act 9184 and standard agency procurement templates.
 * 
 * Strict Guideline: Any non-live backend field MUST use explicit [PLACEHOLDER]
 * fallback tags (e.g. [DELIVERY LOCATION], [BAC CHAIRPERSON]) and NEVER
 * realistic-sounding fake data to avoid legal or user confusion.
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
 * Format currency for display in Philippine Peso
 */
function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Generate HTML for printable Abstract of Quotation document
 * Exactly matches the government standard template
 */
export function generateAOBPrintHTML(aob: AOB, bidMatrix: BidMatrix | null | undefined): string {
  const lineItems = bidMatrix?.lineItems || []
  const suppliers = bidMatrix?.suppliers || []

  const projectName =
    aob.projectName ||
    aob.description ||
    (bidMatrix?.rfqNumber ? `Procurement for ${bidMatrix.rfqNumber}` : '[PROJECT NAME]')
  const modeOfProcurement =
    aob.modeOfProcurement ||
    aob.procurementMode ||
    'Negotiated Procurement - Small Value Procurement - Section 53.9'
  const deliveryLocation = aob.deliveryLocation || '[DELIVERY LOCATION]'
  const implementingOffice = aob.implementingOffice || aob.department || aob.endUser || '[IMPLEMENTING OFFICE]'

  // Calculate total ABC
  const totalABC = lineItems.reduce((sum, item) => {
    const unitABC = item.abcUnitPrice || item.approvedBudgetForContract || 0
    const qty = item.quantity || 1
    return sum + (item.totalABC || unitABC * qty)
  }, 0)

  // Calculate totals per supplier
  const supplierTotals: Record<string, number> = {}
  suppliers.forEach((s) => {
    let total = 0
    lineItems.forEach((item) => {
      const bid = item.lineItems?.find((b) => b.supplierId === s.id)
      if (bid) {
        const qty = item.quantity || 1
        const bidTotal = bid.totalBid ?? (bid.unitBid ? bid.unitBid * qty : 0)
        total += bidTotal
      }
    })
    supplierTotals[s.id] = total
  })

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abstract of Quotation - ${escapeHtml(aob.aobNumber || '[AOB NUMBER]')}</title>
        <style>
          @page {
            size: landscape;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            padding: 10px;
            font-size: 9px;
            line-height: 1.25;
          }
          .document-title {
            text-align: center;
            margin-bottom: 12px;
          }
          .document-title h1 {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .document-title h2 {
            font-size: 10.5px;
            font-weight: bold;
            color: #111;
          }
          .metadata-block {
            margin-bottom: 8px;
            font-size: 8.5px;
            line-height: 1.35;
          }
          .meta-row {
            display: flex;
            margin-bottom: 1px;
          }
          .meta-label {
            font-weight: bold;
            width: 140px;
            flex-shrink: 0;
            text-transform: uppercase;
          }
          .meta-value {
            flex: 1;
            font-weight: bold;
          }
          table.abstract-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            font-size: 8.5px;
          }
          table.abstract-table th, table.abstract-table td {
            border: 1px solid #000;
            padding: 3.5px 4px;
            vertical-align: top;
          }
          table.abstract-table th {
            background-color: #fff;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            text-transform: uppercase;
            font-size: 8px;
          }
          .th-supplier-name {
            font-size: 8.5px;
            font-weight: bold;
            text-align: center;
            line-height: 1.15;
          }
          .th-supplier-contact {
            font-size: 7.5px;
            font-weight: normal;
            text-align: center;
            margin-top: 1px;
            line-height: 1.1;
          }
          .boxed-price {
            border: 1.5px solid #000;
            padding: 1px 4px;
            font-weight: bold;
            display: inline-block;
            text-align: right;
          }
          .recommendation-note {
            margin-top: 5px;
            font-size: 8px;
            font-style: italic;
            font-weight: bold;
          }
          .signatories-container {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            text-align: center;
          }
          .signatory-box {
            flex: 1;
            min-width: 0;
          }
          .signatory-name {
            font-weight: bold;
            font-size: 9px;
            text-decoration: underline;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .signatory-title {
            font-size: 8px;
            color: #111;
          }
          .approval-container {
            margin-top: 18px;
            padding-left: 20px;
          }
          .approval-label {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .approval-name {
            font-weight: bold;
            font-size: 10px;
            text-decoration: underline;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .approval-title {
            font-size: 8.5px;
          }
          .footer-references {
            margin-top: 20px;
            font-size: 7.5px;
            line-height: 1.35;
            color: #222;
          }
          .document-footer {
            margin-top: 12px;
            border-top: 1px solid #999;
            padding-top: 3px;
            display: flex;
            justify-content: space-between;
            font-size: 7px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="document-title">
          <h1>ABSTRACT OF QUOTATION</h1>
          <h2>(${escapeHtml(modeOfProcurement)})</h2>
        </div>

        <div class="metadata-block">
          <div class="meta-row">
            <span class="meta-label">PROJECT NAME:</span>
            <span class="meta-value">${escapeHtml(projectName)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">DELIVERY LOCATION:</span>
            <span class="meta-value">${escapeHtml(deliveryLocation)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">IMPLEMENTING OFFICE:</span>
            <span class="meta-value">${escapeHtml(implementingOffice)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">APPROVED TOTAL COST:</span>
            <span class="meta-value">${formatCurrency(totalABC)}</span>
          </div>
        </div>

        <table class="abstract-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 30px;">ITEM #</th>
              <th rowspan="2" style="width: 32px;">QTY</th>
              <th rowspan="2" style="width: 34px;">UNIT</th>
              <th rowspan="2" style="width: 210px;">DESCRIPTIONS AND SPECIFICATIONS</th>
              <th rowspan="2" style="width: 70px;">UNIT COST</th>
              ${suppliers.map((s) => `
                <th colspan="2" style="text-align: center;">
                  <div class="th-supplier-name">${escapeHtml(s.supplierName || s.name || 'SUPPLIER')}</div>
                  <div class="th-supplier-contact">${escapeHtml(s.address || s.contactNumber || '[ADDRESS / CONTACT]')}</div>
                </th>
              `).join('')}
            </tr>
            <tr>
              ${suppliers.map(() => `
                <th style="width: 120px;">OFFER</th>
                <th style="width: 75px;">UNIT PRICE</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item, idx) => {
              const abcUnit = item.abcUnitPrice || item.approvedBudgetForContract || 0
              const displayName = item.itemName || item.description || item.name || `Item #${idx + 1}`
              const itemCode = item.itemCode || `${idx + 1}`
              const specs = item.description && item.description !== displayName
                ? `<div style="font-size: 7.5px; color: #333; margin-top: 2px;">${escapeHtml(item.description)}</div>`
                : ''

              return `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: center;">${escapeHtml(item.unit || '[UNIT]')}</td>
                  <td>
                    <div style="font-weight: bold;">${escapeHtml(displayName)}</div>
                    ${specs}
                  </td>
                  <td style="text-align: right; font-weight: bold;">${formatCurrency(abcUnit)}</td>
                  ${suppliers.map((s) => {
                    const bid = item.lineItems?.find((b) => b.supplierId === s.id)
                    if (!bid || (!bid.unitBid && !bid.totalBid)) {
                      return `
                        <td style="text-align: center; color: #888;">—</td>
                        <td style="text-align: center; font-weight: bold; font-size: 7.5px;">DID NOT SUBMIT</td>
                      `
                    }

                    const unitPrice = bid.unitBid ?? (bid.totalBid ? bid.totalBid / (item.quantity || 1) : 0)
                    const isWinner = Boolean(bid.isWinner)

                    const offerTextParts = [
                      bid.remarks || bid.brand ? escapeHtml(bid.remarks || bid.brand) : 'As per specifications',
                      bid.deliveryPeriod ? `Delivery Period: ${escapeHtml(bid.deliveryPeriod)}` : null,
                      `Qty: ${item.quantity}`,
                      bid.totalBid ? `Subtotal: ${formatCurrency(bid.totalBid)}` : null,
                    ].filter(Boolean)

                    return `
                      <td style="font-size: 7.5px; line-height: 1.25;">
                        ${offerTextParts.join('<br>')}
                      </td>
                      <td style="text-align: right; vertical-align: middle;">
                        ${isWinner 
                          ? `<div class="boxed-price">${formatCurrency(unitPrice)}</div>`
                          : `<span style="font-weight: 600;">${formatCurrency(unitPrice)}</span>`
                        }
                      </td>
                    `
                  }).join('')}
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold; padding-right: 8px;">Total</td>
              <td style="text-align: right; font-weight: bold;">${formatCurrency(totalABC)}</td>
              ${suppliers.map((s) => {
                const total = supplierTotals[s.id] || 0
                const hasWonItems = lineItems.some((i) => i.lineItems?.find((b) => b.supplierId === s.id)?.isWinner)
                if (total === 0) {
                  return `
                    <td></td>
                    <td style="text-align: center; color: #888;">—</td>
                  `
                }
                return `
                  <td></td>
                  <td style="text-align: right; vertical-align: middle;">
                    ${hasWonItems
                      ? `<div class="boxed-price">${formatCurrency(total)}</div>`
                      : `<span style="font-weight: bold;">${formatCurrency(total)}</span>`
                    }
                  </td>
                `
              }).join('')}
            </tr>
          </tfoot>
        </table>

        <div class="recommendation-note">
          The Bids and Awards Committee recommends the award to the supplier with the lowest complying proposal that is boxed
        </div>

        <div class="signatories-container">
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[0]?.name || '[BAC CHAIRPERSON]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[0]?.title || 'BAC Chairperson')}</div>
          </div>
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[1]?.name || '[BAC VICE CHAIRPERSON]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[1]?.title || 'BAC Vice Chairperson')}</div>
          </div>
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[2]?.name || '[BAC REGULAR MEMBER]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[2]?.title || 'BAC Regular Member')}</div>
          </div>
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[3]?.name || '[BAC REGULAR MEMBER]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[3]?.title || 'BAC Regular Member')}</div>
          </div>
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[4]?.name || '[PROVISIONAL MEMBER]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[4]?.title || 'Provisional Member, End-user Rep')}</div>
          </div>
          <div class="signatory-box">
            <div class="signatory-name">${escapeHtml(aob.signatories?.[5]?.name || '[PROVISIONAL MEMBER]')}</div>
            <div class="signatory-title">${escapeHtml(aob.signatories?.[5]?.title || 'Provisional Member, Tech Rep')}</div>
          </div>
        </div>

        <div class="approval-container">
          <div class="approval-label">APPROVED BY:</div>
          <div class="approval-name">${escapeHtml(aob.approvedBy || '[HEAD OF PROCURING ENTITY / APPROVING AUTHORITY]')}</div>
          <div class="approval-title">${escapeHtml(aob.approverTitle || '[POSITION / DESIGNATION]')}</div>
        </div>

        <div class="footer-references">
          <div><b>RFQ No.:</b> ${escapeHtml(aob.rfqNumber || bidMatrix?.rfqNumber || aob.rfqs?.[0]?.rfqNumber || '[RFQ NUMBER]')}</div>
          <div><b>BAC RES. NO.:</b> ${escapeHtml(aob.bacResolutionNumber || '[BAC RES. NO.]')}</div>
          <div><b>PR No.:</b> ${escapeHtml(aob.prNumber || '[PR NUMBER]')}</div>
          <div><b>Code (PAP):</b> ${escapeHtml(aob.papCode || '[PAP CODE]')}</div>
        </div>

        <div class="document-footer">
          <div>ERP-EZ · Procurement Management System</div>
          <div>1 of 1</div>
        </div>
      </body>
    </html>
  `
}

/**
 * Open print dialog with the official Abstract of Quotation document
 */
export function printAOB(aob: AOB, bidMatrix: BidMatrix | null | undefined): void {
  if (typeof window === 'undefined') {
    console.error('Print functionality is only available in browser environment')
    return
  }

  try {
    const htmlContent = generateAOBPrintHTML(aob, bidMatrix)
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      console.error('Failed to open print window. Check if pop-ups are blocked.')
      // Fallback to iframe printing if window.open is blocked by browser
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)

      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => document.body.removeChild(iframe), 2000)
      } else {
        alert('Unable to open print preview. Please check browser pop-up permissions.')
      }
      return
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  } catch (error) {
    console.error('Error printing Abstract of Quotation:', error)
    alert('Failed to print Abstract of Quotation. Please try again.')
  }
}

/**
 * Export AOB Tabulation as CSV
 */
export function exportAOBCSV(aob: AOB, bidMatrix: BidMatrix | null | undefined): void {
  const lineItems = bidMatrix?.lineItems || []
  const suppliers = bidMatrix?.suppliers || []

  const rows: string[][] = []

  // Document Headers
  rows.push(['ABSTRACT OF QUOTATION'])
  rows.push([`(${aob.modeOfProcurement || aob.procurementMode || 'Negotiated Procurement - Small Value Procurement - Section 53.9'})`])
  rows.push([])
  rows.push(['PROJECT NAME:', aob.projectName || aob.description || '[PROJECT NAME]'])
  rows.push(['DELIVERY LOCATION:', aob.deliveryLocation || '[DELIVERY LOCATION]'])
  rows.push(['IMPLEMENTING OFFICE:', aob.implementingOffice || aob.department || '[IMPLEMENTING OFFICE]'])
  const totalABC = lineItems.reduce((s, i) => s + (i.totalABC || (i.abcUnitPrice || i.approvedBudgetForContract || 0) * (i.quantity || 1)), 0)
  rows.push(['APPROVED TOTAL COST:', totalABC.toFixed(2)])
  rows.push([])

  // Table Column Headers
  const header1 = ['ITEM #', 'QTY', 'UNIT', 'DESCRIPTIONS AND SPECIFICATIONS', 'UNIT COST']
  suppliers.forEach((s) => {
    header1.push(s.supplierName || s.name || 'SUPPLIER', '')
  })
  rows.push(header1)

  const header2 = ['', '', '', '', '']
  suppliers.forEach(() => {
    header2.push('OFFER', 'UNIT PRICE')
  })
  rows.push(header2)

  // Table Body Rows
  lineItems.forEach((item, idx) => {
    const row = [
      (idx + 1).toString(),
      (item.quantity || 1).toString(),
      item.unit || '[UNIT]',
      item.itemName || item.description || `Item #${idx + 1}`,
      (item.abcUnitPrice || item.approvedBudgetForContract || 0).toFixed(2),
    ]

    suppliers.forEach((s) => {
      const bid = item.lineItems?.find((b) => b.supplierId === s.id)
      if (bid && (bid.unitBid || bid.totalBid)) {
        const offer = [
          bid.remarks || bid.brand || 'As per specifications',
          bid.deliveryPeriod ? `Delivery: ${bid.deliveryPeriod}` : null,
          `Qty: ${item.quantity}`,
          bid.totalBid ? `Subtotal: ${bid.totalBid}` : null,
        ].filter(Boolean).join('; ')
        const price = (bid.unitBid ?? (bid.totalBid ? bid.totalBid / (item.quantity || 1) : 0)).toFixed(2)
        row.push(offer, bid.isWinner ? `[WINNER] ${price}` : price)
      } else {
        row.push('—', 'DID NOT SUBMIT')
      }
    })
    rows.push(row)
  })

  // Signatories & References
  rows.push([])
  rows.push(['RECOMMENDATION:', 'The Bids and Awards Committee recommends the award to the supplier with the lowest complying proposal that is boxed/marked [WINNER]'])
  rows.push([])
  rows.push(['RFQ No.:', aob.rfqNumber || bidMatrix?.rfqNumber || '[RFQ NUMBER]'])
  rows.push(['BAC RES. NO.:', aob.bacResolutionNumber || '[BAC RES. NO.]'])
  rows.push(['PR No.:', aob.prNumber || '[PR NUMBER]'])
  rows.push(['Code (PAP):', aob.papCode || '[PAP CODE]'])

  // Convert to CSV string and download
  const csvContent = rows
    .map((r) => r.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Abstract_of_Quotation_${aob.aobNumber || 'AOB'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Trigger browser print dialog for current page
 */
export function triggerBrowserPrint(): void {
  if (typeof window === 'undefined') {
    console.error('Print functionality is only available in browser environment')
    return
  }

  window.print()
}
