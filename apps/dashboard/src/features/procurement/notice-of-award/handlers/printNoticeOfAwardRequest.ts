import { jsPDF } from 'jspdf'
import { findNoticeOfAward } from '../data/mockNoticeOfAwardData'
import type { PrintNoticeOfAwardResult } from '../types'

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight = 4.5,
) {
  const lines = doc.splitTextToSize(text, width) as string[]
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function formatNoticeOfAwardType(type: string) {
  switch (type) {
    case 'goods-services':
      return 'Goods and Services'
    case 'infrastructure':
      return 'Infrastructure'
    case 'consulting':
      return 'Consulting'
    default:
      return type
  }
}

export const printNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/print',
  key: null,
  fetcher: async ({
    noaId,
  }: {
    noaId: string
  }): Promise<PrintNoticeOfAwardResult> => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    const fileName =
      noticeOfAward.printFileName ?? `${noticeOfAward.noaNumber}.pdf`

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 16
    const contentWidth = pageWidth - margin * 2
    const leftColWidth = 44
    const rightColWidth = contentWidth - leftColWidth - 8
    let cursorY = 12

    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(120, 120, 120)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('USTP', margin, cursorY)

    doc.setFontSize(12)
    doc.text(
      'University of Science and Technology of Southern Philippines',
      pageWidth / 2,
      cursorY,
      { align: 'center' },
    )

    cursorY += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(
      'Alubijid | Balubal | Cagayan de Oro | Claveria | Jasaan | Oroquieta | Panaon | Villanueva',
      pageWidth / 2,
      cursorY,
      { align: 'center' },
    )

    cursorY += 12
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('NOTICE OF AWARD', pageWidth / 2, cursorY, { align: 'center' })

    cursorY += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(noticeOfAward.date, margin, cursorY)

    cursorY += 12
    doc.setFont('helvetica', 'bold')
    doc.text(noticeOfAward.supplierName.toUpperCase(), margin, cursorY)
    cursorY += 5
    doc.setFont('helvetica', 'normal')
    doc.text('Dear Sir/Madam:', margin, cursorY)
    cursorY += 7

    const introParagraph =
      `We are happy to notify you that your bid dated ${noticeOfAward.dateBid} ` +
      `for the ${noticeOfAward.description} for the project ${noticeOfAward.linkedConsolidatedPr.projectName} ` +
      `is hereby accepted for a contract price equivalent to ${noticeOfAward.totalAmount.toLocaleString(
        'en-PH',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}.`

    cursorY = drawWrappedText(
      doc,
      introParagraph,
      margin + 8,
      cursorY,
      contentWidth - 8,
      4.8,
    )
    cursorY += 5

    const awardSummary = [
      ['NOA No.', noticeOfAward.noaNumber],
      ['BAC Resolution', noticeOfAward.linkedBacResolution.bacResolutionNumber],
      ['Consolidated PR', noticeOfAward.linkedConsolidatedPr.prNumber],
      ['Project', noticeOfAward.linkedConsolidatedPr.projectName],
      ['Type', formatNoticeOfAwardType(noticeOfAward.type)],
      ['Supplier', noticeOfAward.supplierName],
      [
        'Awarded Amount',
        noticeOfAward.totalAmount.toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ],
    ] as const

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Award Summary', margin, cursorY)
    cursorY += 4
    doc.setFont('helvetica', 'normal')

    awardSummary.forEach(([label, value]) => {
      if (cursorY > pageHeight - 55) {
        doc.addPage()
        cursorY = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.text(label, margin, cursorY)
      doc.setFont('helvetica', 'normal')
      cursorY = drawWrappedText(
        doc,
        value,
        margin + leftColWidth,
        cursorY,
        rightColWidth,
        4.5,
      )
      cursorY += 2
    })

    cursorY += 2
    const closingParagraph =
      'You are hereby required within Ten (10) calendar days from the receipt of this Notice of Award to post and submit the performance security in the form and amount stipulated in Section 39 of the IRR of RA 9184. Failure to comply with all the foregoing shall constitute a sufficient ground for cancellation of this award and forfeiture of your bid security.'

    cursorY = drawWrappedText(
      doc,
      closingParagraph,
      margin,
      cursorY,
      contentWidth,
      4.8,
    )
    cursorY += 9

    doc.setFont('helvetica', 'normal')
    doc.text('Very truly yours,', margin, cursorY)
    cursorY += 12

    const signatoryName = noticeOfAward.approvedBy ?? 'AUTHORIZED SIGNATORY'
    doc.setFont('helvetica', 'bold')
    doc.text(signatoryName, margin, cursorY)
    doc.setFont('helvetica', 'normal')
    doc.text('President, USTP-System', margin, cursorY + 4)

    cursorY += 16
    doc.line(margin, cursorY, pageWidth - margin, cursorY)

    cursorY += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Authorized Signature:', margin, cursorY)
    doc.setFont('helvetica', 'normal')
    doc.line(margin + 40, cursorY + 1, pageWidth - margin, cursorY + 1)

    cursorY += 7
    doc.setFont('helvetica', 'bold')
    doc.text('Name of Bidder:', margin, cursorY)
    doc.setFont('helvetica', 'normal')
    doc.text(noticeOfAward.supplierName, margin + 40, cursorY)

    cursorY += 7
    doc.setFont('helvetica', 'bold')
    doc.text('Date:', margin, cursorY)
    doc.setFont('helvetica', 'normal')
    doc.text(noticeOfAward.date, margin + 40, cursorY)

    return {
      fileName,
      blob: doc.output('blob'),
    }
  },
}
