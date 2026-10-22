import { jsPDF } from 'jspdf'
import api from '@/services/api'
import { getNoticeOfAwardRequest } from './getNoticeOfAwardRequest'
import { numberToPhilippinePesoWords } from '../utils/numberToWords'
import type { PrintNoticeOfAwardResult } from '../types'

function formatDateToFormal(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const printNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/print',
  key: null,
  fetcher: async ({
    noaId,
  }: {
    noaId: string
  }): Promise<PrintNoticeOfAwardResult> => {
    const noticeOfAward = await getNoticeOfAwardRequest.fetcher({ noaId })

    if (!noticeOfAward) {
      throw new Error('Notice of Award record not found.')
    }

    const fileName =
      noticeOfAward.printFileName ?? `${noticeOfAward.noaNumber}_Notice_of_Award.pdf`

    // Attempt backend QuestPDF streaming endpoint first
    try {
      const response = await api.get<Blob>(`/notice-of-awards/${noaId}/pdf`, {
        responseType: 'blob',
      })
      if (response.data && response.data.size > 0) {
        return {
          fileName,
          blob: response.data,
        }
      }
    } catch {
      // Gracefully fall back to client-side jsPDF document rendering
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 25.4 // Standard 1-inch margins
    const contentWidth = pageWidth - margin * 2
    let cursorY = 24

    // -- 1. UNIVERSAL AGENCY HEADER WITH LOGO ---------------------------------
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('Republic of the Philippines', pageWidth / 2, cursorY, {
      align: 'center',
    })
    cursorY += 5

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text('[Agency Letterhead with Logo]', pageWidth / 2, cursorY, {
      align: 'center',
    })
    cursorY += 5


    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.4)
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 12

    // -- 2. DOCUMENT TITLE ---------------------------------------------------
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13.5)
    doc.setTextColor(0, 0, 0)
    doc.text('NOTICE OF AWARD', pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 12

    // -- 3. DATE OF ISSUANCE -------------------------------------------------
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    const formalDate = formatDateToFormal(noticeOfAward.date)
    doc.text(formalDate, margin, cursorY)
    cursorY += 10

    // -- 4. ADDRESSEE BLOCK (WINNING SUPPLIER) -------------------------------
    doc.setFont('helvetica', 'bold')
    doc.text('THE PROPRIETOR / AUTHORIZED REPRESENTATIVE', margin, cursorY)
    cursorY += 5

    doc.text(noticeOfAward.supplierName.toUpperCase(), margin, cursorY)
    cursorY += 5

    doc.setFont('helvetica', 'normal')
    doc.text('Philippines', margin, cursorY)
    cursorY += 10

    // -- 5. SALUTATION -------------------------------------------------------
    doc.text('Dear Sir / Madam:', margin, cursorY)
    cursorY += 8

    // -- 6. BODY PARAGRAPH 1 (AWARD ACCEPTANCE) ------------------------------
    const formalBidDate = formatDateToFormal(noticeOfAward.dateBid)
    const amountInWords = numberToPhilippinePesoWords(noticeOfAward.totalAmount)
    const projectName = noticeOfAward.projectName || noticeOfAward.description

    const paragraph1 =
      `    We are happy to notify you that your bid dated ${formalBidDate} for the ${projectName} ` +
      `for a Contract Price equivalent to ${amountInWords} is hereby accepted.`

    doc.text(paragraph1, margin, cursorY, {
      maxWidth: contentWidth,
      align: 'justify',
      lineHeightFactor: 1.55,
    })

    const p1Lines = doc.splitTextToSize(paragraph1, contentWidth)
    cursorY += p1Lines.length * (10.5 * 0.3528 * 1.55) + 7

    // -- 7. BODY PARAGRAPH 2 (NGPA / RA 12009 STATUTORY 10-DAY SLA & SECURITY) -
    const paragraph2 =
      '    You are hereby required within Ten (10) calendar days from the receipt of this Notice of Award to ' +
      'post and submit the performance security in the form and amount stipulated in the Implementing Rules and Regulations ' +
      'of Republic Act No. 12009. Failure to comply with all the foregoing shall constitute a sufficient ground for ' +
      'cancellation of this award and forfeiture of your bid security.'

    doc.text(paragraph2, margin, cursorY, {
      maxWidth: contentWidth,
      align: 'justify',
      lineHeightFactor: 1.55,
    })

    const p2Lines = doc.splitTextToSize(paragraph2, contentWidth)
    cursorY += p2Lines.length * (10.5 * 0.3528 * 1.55) + 12

    // Check if we need page break or if everything fits nicely on page 1
    if (cursorY > pageHeight - 65) {
      doc.addPage()
      cursorY = 25
    }

    // -- 8. SIGN-OFF BLOCK (HEAD OF PROCURING ENTITY) -------------------------
    doc.setFont('helvetica', 'normal')
    doc.text('Very truly yours,', margin, cursorY)
    cursorY += 22

    const rawHope = noticeOfAward.approvedBy?.trim() ?? ''
    const isTechnicalAccount =
      /^(SUPER\s*ADMIN|ADMIN|DEV|SYSTEM|TEST|USER)/i.test(rawHope) ||
      rawHope.toLowerCase().includes('admin') ||
      rawHope.toLowerCase().includes('dev') ||
      rawHope.toLowerCase().includes('head of')

    if (rawHope && !isTechnicalAccount) {
      doc.setFont('helvetica', 'bold')
      doc.text(rawHope.toUpperCase(), margin, cursorY)
      cursorY += 5
    }

    doc.setFont('helvetica', 'normal')
    doc.text('Head of the Procuring Entity', margin, cursorY)
    cursorY += 16

    // -- 9. CONFORME / RECEIPT BLOCK -----------------------------------------
    doc.setFont('helvetica', 'bold')
    doc.text('Conforme:', margin, cursorY)
    cursorY += 7

    doc.setFont('helvetica', 'normal')
    doc.text(
      'Authorized Signature: _______________________________________________',
      margin,
      cursorY,
    )
    cursorY += 6

    doc.text(`Name of Bidder:        ${noticeOfAward.supplierName}`, margin, cursorY)
    cursorY += 6

    doc.text(
      'Date:                  _______________________________________________',
      margin,
      cursorY,
    )

    // -- 10. PAGE FOOTER -----------------------------------------------------
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(140, 140, 140)
    doc.text(
      'Standard Form: SF-GOOD-65 | Notice of Award (RA 12009 NGPA Compliant)',
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' },
    )

    return {
      fileName,
      blob: doc.output('blob'),
    }
  },
}
