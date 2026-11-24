/**
 * printPurchaseOrder.ts
 * Generates and prints the official Philippine Government Commission on Audit (COA)
 * Government Accounting Manual (GAM) Appendix 61 "PURCHASE ORDER" document.
 *
 * Mappings dynamically bind all live PO fields:
 * - PO Number, Date, Procurement Mode, Source Document Type & Number
 * - Winning Supplier Name, Address, TIN
 * - Place of Delivery, Date of Delivery, Delivery Term, Payment Term
 * - Line Items (Unit, Description, Quantity, Unit Cost, Amount)
 * - Dynamic Amount in Words (Philippine Peso representation)
 * - Signatures: Conforme (Supplier), Authorized Official, Chief Accountant
 */

import type { PurchaseOrder, PurchaseOrderLineItem } from '../types'

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Format currency for display in Philippine Peso (e.g. ₱ 49,000.00)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₱ 0.00'
  return `₱ ${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format dates to standard government readable format (YYYY-MM-DD or Month DD, YYYY)
 */
export function formatDate(dateString: string | null | undefined, formal = false): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  if (formal) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format as YYYY-MM-DD (as shown in standard Appendix 61 forms)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Map procurement mode to official Republic Act 9184 / 12009 designation
 */
export function mapProcurementMode(mode?: string | null, source?: string | null): string {
  const normalized = (mode || source || '').toString().toLowerCase()

  if (normalized.includes('svp') || normalized.includes('small value')) {
    return 'Negotiated Procurement - Small Value Procurement (Sec. 53.9)'
  }
  if (normalized.includes('public') || normalized.includes('bidding')) {
    return 'Competitive Public Bidding (Sec. 10)'
  }
  if (normalized.includes('direct') || normalized.includes('acquisition') || normalized.includes('contracting')) {
    return 'Direct Acquisition / Direct Contracting (Sec. 50)'
  }

  return mode || source || 'Negotiated Procurement - Small Value Procurement (Sec. 53.9)'
}

/**
 * Map Type of PO designation
 */
export function mapTypeOfPo(mode?: string | null, source?: string | null): string {
  const normalized = (mode || source || '').toString().toLowerCase()

  if (normalized.includes('svp')) return 'SVP'
  if (normalized.includes('public')) return 'Public Bidding'
  if (normalized.includes('direct')) return 'Direct Acquisition'

  return mode || 'SVP'
}

const ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
]

const TENS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
]

const SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION']

function convertChunk(num: number): string {
  let result = ''
  const hundreds = Math.floor(num / 100)
  const remainder = num % 100

  if (hundreds > 0) {
    result += `${ONES[hundreds]} HUNDRED `
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ONES[remainder]
    } else {
      const ten = Math.floor(remainder / 10)
      const one = remainder % 10
      result += TENS[ten]
      if (one > 0) {
        result += `-${ONES[one]}`
      }
    }
  }

  return result.trim()
}

/**
 * Converts a numeric currency amount into official Philippine Peso words format
 * strictly matching Appendix 61 COA standard:
 * e.g. "FORTY-NINE THOUSAND PESOS ONLY***********"
 * or "FORTY-NINE THOUSAND PESOS AND 50/100 ONLY***********"
 */
export function numberToPhilippinePesoWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'ZERO PESOS ONLY***********'
  }

  const absoluteAmount = Math.abs(amount)
  const integerPart = Math.floor(absoluteAmount)
  const cents = Math.round((absoluteAmount - integerPart) * 100)

  let words = ''

  if (integerPart === 0) {
    words = 'ZERO'
  } else {
    let currentNumber = integerPart
    let scaleIndex = 0
    const parts: string[] = []

    while (currentNumber > 0) {
      const chunk = currentNumber % 1000
      if (chunk > 0) {
        const chunkWords = convertChunk(chunk)
        const scale = SCALES[scaleIndex]
        parts.unshift(scale ? `${chunkWords} ${scale}` : chunkWords)
      }
      currentNumber = Math.floor(currentNumber / 1000)
      scaleIndex++
    }

    words = parts.join(' ')
  }

  const currencyUnit = integerPart === 1 ? 'PESO' : 'PESOS'

  if (cents > 0) {
    const centsString = cents.toString().padStart(2, '0')
    return `${words} ${currencyUnit} AND ${centsString}/100 ONLY***********`
  }

  return `${words} ${currencyUnit} ONLY***********`
}

export type GeneratePOHTMLOptions = {
  entityName?: string
  entityOffice?: string
}

/**
 * Generate official COA GAM Appendix 61 HTML document for Purchase Order
 */
export function generatePurchaseOrderPrintHTML(
  purchaseOrder: PurchaseOrder,
  options?: GeneratePOHTMLOptions
): string {
  const lineItems: PurchaseOrderLineItem[] =
    purchaseOrder.lineItems ?? purchaseOrder.items ?? []

  const rawEntity = options?.entityName?.trim()
  const isFiltered =
    !rawEntity ||
    rawEntity.toLowerCase().includes('ustp') ||
    rawEntity.toLowerCase().includes('superadmin') ||
    rawEntity.toLowerCase().includes('workspace')

  const entityName = isFiltered ? 'Agency Name' : rawEntity
  const poNumber = purchaseOrder.poNumber || 'PO-DRAFT'
  const poDate = formatDate(purchaseOrder.date)
  const modeOfProcurement = mapProcurementMode(
    purchaseOrder.procurementMode,
    purchaseOrder.source
  )
  const typeOfPo = mapTypeOfPo(
    purchaseOrder.procurementMode,
    purchaseOrder.source
  )

  const supplierName = purchaseOrder.supplierName || '—'
  const supplierAddress = purchaseOrder.supplierAddress || 'Philippines'
  const supplierTin = purchaseOrder.supplierTin || '—'

  const placeOfDelivery = purchaseOrder.placeOfDelivery || '—'
  const dateOfDelivery = purchaseOrder.dateOfDelivery
    ? formatDate(purchaseOrder.dateOfDelivery)
    : '—'
  const deliveryTerm = purchaseOrder.deliveryTerm || '—'
  const paymentTerm = purchaseOrder.paymentTerm || '—'

  const totalAmount =
    purchaseOrder.totalAmount > 0
      ? purchaseOrder.totalAmount
      : lineItems.reduce((acc, it) => acc + (it.amount || it.quantity * it.unitPrice || 0), 0)

  const amountInWords = numberToPhilippinePesoWords(totalAmount)

  // Approved by (HOPE or Authorized Official)
  const authorizedOfficial = purchaseOrder.approvedBy?.trim() || ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Order - ${escapeHtml(poNumber)}</title>
  <style>
    @page {
      size: portrait;
      margin: 10mm 14mm 10mm 14mm;
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
      font-size: 9.5pt;
      line-height: 1.3;
      padding: 16px;
    }
    .appendix-label {
      text-align: right;
      font-style: italic;
      font-size: 10pt;
      margin-bottom: 8px;
    }
    .po-title-section {
      text-align: center;
      margin-bottom: 12px;
    }
    .po-title-section h1 {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .po-title-section h2 {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      padding-bottom: 4px;
      border-bottom: 2px solid #000;
      display: inline-block;
      min-width: 200px;
    }
    .po-entity-office {
      font-size: 9pt;
      color: #222;
      margin-top: 3px;
    }

    /* Standard Two-Column Box */
    .info-box {
      width: 100%;
      border: 1.5px solid #000;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 8.5pt;
    }
    .info-box td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
    }
    .info-label {
      font-weight: normal;
      color: #000;
    }
    .info-value {
      font-weight: bold;
    }

    .salutation-block {
      margin: 8px 0 6px 0;
      font-size: 8.5pt;
      line-height: 1.35;
    }
    .salutation-block .greeting {
      margin-bottom: 2px;
    }
    .salutation-block .directive {
      text-indent: 14px;
    }

    /* Line Items Table */
    table.items-table {
      width: 100%;
      border: 1.5px solid #000;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 8.5pt;
    }
    table.items-table th {
      border: 1px solid #000;
      background-color: #fff;
      padding: 6px 4px;
      text-align: center;
      font-weight: bold;
      font-size: 8pt;
    }
    table.items-table td {
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-top: none;
      border-bottom: none;
      padding: 4px 6px;
      vertical-align: top;
    }
    table.items-table tr.item-row td {
      height: 20px;
    }
    table.items-table tr.nothing-follows td {
      text-align: center;
      font-weight: bold;
      font-size: 8pt;
      padding: 6px;
    }
    table.items-table tr.blank-filler td {
      height: 22px;
    }
    table.items-table tr.total-row td {
      border-top: 1px solid #000;
      border-bottom: 1.5px solid #000;
      font-weight: bold;
      padding: 6px;
    }

    /* Penalty Clause */
    .penalty-clause {
      margin: 8px 0 14px 0;
      font-size: 8pt;
      text-align: justify;
      line-height: 1.35;
    }

    /* Signatories Two-Column Layout */
    .signatories-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 8.5pt;
    }
    .signatories-table td {
      width: 50%;
      vertical-align: top;
      padding: 0 10px;
    }
    .sig-line-container {
      margin-top: 34px;
      text-align: center;
    }
    .sig-line {
      border-top: 1px solid #000;
      padding-top: 3px;
      font-weight: bold;
      font-size: 8.5pt;
    }
    .sig-subtext {
      font-weight: normal;
      font-size: 7.5pt;
      color: #111;
    }
    .sig-date-line {
      margin-top: 20px;
      border-top: 1px solid #000;
      width: 60%;
      margin-left: auto;
      margin-right: auto;
      padding-top: 3px;
      text-align: center;
      font-size: 8pt;
    }

    /* Bottom Accounting Box */
    .funds-box {
      width: 100%;
      border: 1.5px solid #000;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .funds-box td {
      border: 1px solid #000;
      padding: 6px 8px;
      vertical-align: top;
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

  <!-- Top Right Appendix 61 designation -->
  <div class="appendix-label">Appendix 61</div>

  <!-- Header -->
  <div class="po-title-section">
    <h1>PURCHASE ORDER</h1>
    <h2>${escapeHtml(entityName)}</h2>
    ${options?.entityOffice ? `<div class="po-entity-office">${escapeHtml(options.entityOffice)}</div>` : ''}
  </div>

  <!-- Box 1: Supplier & PO Details -->
  <table class="info-box">
    <tr>
      <td style="width: 55%;">
        <div><span class="info-label">Supplier :</span> <span class="info-value">${escapeHtml(supplierName)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Address :</span> <span class="info-value">${escapeHtml(supplierAddress)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">TIN :</span> <span class="info-value">${escapeHtml(supplierTin)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Type Of PO :</span> <span class="info-value">${escapeHtml(typeOfPo)}</span></div>
      </td>
      <td style="width: 45%;">
        <div><span class="info-label">P.O. No. :</span> <span class="info-value">${escapeHtml(poNumber)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Date :</span> <span class="info-value">${escapeHtml(poDate)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Mode of Procurement :</span> <span class="info-value">${escapeHtml(modeOfProcurement)}</span></div>
      </td>
    </tr>
  </table>

  <!-- Salutation & Directive -->
  <div class="salutation-block">
    <div class="greeting">Gentlemen:</div>
    <div class="directive">Please furnish this Office the following articles subject to the terms and conditions contained herein:</div>
  </div>

  <!-- Box 2: Delivery & Payment Details -->
  <table class="info-box" style="margin-top: 6px;">
    <tr>
      <td style="width: 55%;">
        <div><span class="info-label">Place of Delivery :</span> <span class="info-value">${escapeHtml(placeOfDelivery)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Date of Delivery :</span> <span class="info-value">${escapeHtml(dateOfDelivery)}</span></div>
      </td>
      <td style="width: 45%;">
        <div><span class="info-label">Delivery Term :</span> <span class="info-value">${escapeHtml(deliveryTerm)}</span></div>
        <div style="margin-top: 3px;"><span class="info-label">Payment Term :</span> <span class="info-value">${escapeHtml(paymentTerm)}</span></div>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 14%;">Stock/<br>Property No.</th>
        <th style="width: 10%;">Unit</th>
        <th style="width: 44%;">Description</th>
        <th style="width: 10%;">Quantity</th>
        <th style="width: 11%;">Unit Cost</th>
        <th style="width: 11%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map((item, idx) => {
        const unitCost = item.unitPrice || 0
        const amount = item.amount || (item.quantity * unitCost)
        return `
          <tr class="item-row">
            <td style="text-align: center;">${idx + 1}</td>
            <td style="text-align: center;">${escapeHtml(item.unit || 'unit')}</td>
            <td>
              <div style="font-weight: bold;">${escapeHtml(item.description || 'Procurement Item')}</div>
            </td>
            <td style="text-align: center;">${item.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="text-align: right;">${formatCurrency(unitCost)}</td>
            <td style="text-align: right;">${formatCurrency(amount)}</td>
          </tr>
        `
      }).join('')}

      <!-- ***NOTHING FOLLOWS*** row -->
      <tr class="nothing-follows">
        <td>-</td>
        <td>-</td>
        <td>***NOTHING FOLLOWS***</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>

      <!-- Spacer rows to maintain standard form height -->
      ${Array.from({ length: Math.max(0, 5 - lineItems.length) }).map(() => `
        <tr class="blank-filler">
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `).join('')}

      <!-- Total & Amount in words row -->
      <tr class="total-row">
        <td colspan="5" style="vertical-align: middle;">
          <span style="font-weight: normal; font-size: 8pt;">Amount In Words:</span>
          <span style="font-weight: bold; margin-left: 4px;">${escapeHtml(amountInWords)}</span>
        </td>
        <td style="text-align: right; vertical-align: middle; font-size: 9pt;">
          ${formatCurrency(totalAmount)}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Penalty Clause -->
  <div class="penalty-clause">
    In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.
  </div>

  <!-- Signatories Block -->
  <table class="signatories-table">
    <tr>
      <td>
        <div style="font-weight: bold;">Conforme:</div>
        <div class="sig-line-container">
          <div style="height: 24px;"></div>
          <div class="sig-line">
            <div style="height: 14px;"></div>
            Signature over Printed Name of Supplier
          </div>
          <div class="sig-date-line">
            Date
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: bold;">Very truly yours,</div>
        <div class="sig-line-container">
          <div style="height: 24px;"></div>
          <div class="sig-line">
            <div style="height: 14px; text-transform: uppercase;">${escapeHtml(authorizedOfficial)}</div>
            <div class="sig-subtext">Signature over Printed Name of Authorized Official</div>
          </div>
          <div class="sig-date-line">
            Designation
          </div>
        </div>
      </td>
    </tr>
  </table>

  <!-- Funds Available / ORS Box -->
  <table class="funds-box">
    <tr>
      <td style="width: 60%;">
        <div style="margin-bottom: 6px;"><span class="info-label">Fund Cluster :</span> ___________________________________</div>
        <div><span class="info-label">Funds Available :</span> _________________________________</div>
        <div style="margin-top: 36px; text-align: center;">
          <div style="border-top: 1px solid #000; width: 90%; margin: 0 auto; padding-top: 3px;">
            Signature over Printed Name of Chief Accountant/Head of Accounting Division/Unit
          </div>
        </div>
      </td>
      <td style="width: 40%;">
        <div><span class="info-label">ORS/BURS No. :</span> ______________________</div>
        <div style="margin-top: 6px;"><span class="info-label">Date of the ORS/BURS:</span> _______________</div>
        <div style="margin-top: 6px;"><span class="info-label">Amount :</span> <span class="info-value">${formatCurrency(totalAmount)}</span></div>
      </td>
    </tr>
  </table>

</body>
</html>`
}

/**
 * Open print dialog with the official Appendix 61 Purchase Order document
 */
export function printPurchaseOrder(
  purchaseOrder: PurchaseOrder,
  options?: GeneratePOHTMLOptions
): void {
  if (typeof window === 'undefined') {
    console.error('Print functionality is only available in browser environment')
    return
  }

  try {
    const htmlContent = generatePurchaseOrderPrintHTML(purchaseOrder, options)
    const printWindow = window.open('', '_blank', 'width=900,height=800')

    if (!printWindow) {
      // Fallback: hidden iframe print if pop-ups are blocked
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
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 2000)
      } else {
        alert('Unable to open print preview. Please check browser pop-up permissions.')
      }
      return
    }

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  } catch (error) {
    console.error('Error printing Purchase Order:', error)
    alert('Failed to print Purchase Order. Please try again.')
  }
}

/**
 * Download generated Appendix 61 HTML file for offline archival or viewing
 */
export function downloadPurchaseOrderHtml(
  purchaseOrder: PurchaseOrder,
  options?: GeneratePOHTMLOptions
): void {
  const htmlContent = generatePurchaseOrderPrintHTML(purchaseOrder, options)
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Purchase_Order_${purchaseOrder.poNumber || 'PO'}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
