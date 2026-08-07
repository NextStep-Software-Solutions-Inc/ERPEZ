import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import { jsPDF } from 'jspdf'
import type { PrintBacResolutionResult } from '../types'
import {
  cloneResolution,
  getBacResolutionIdFromFinalUrl,
  getMockBacResolutionDatabase,
} from '../data/mockBacResolutionData'
import { USE_MOCK_BAC_RESOLUTIONS } from '../config'

const endpoint = '/bac-resolutions/:id/print'

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function addSignatureBlock(
  doc: jsPDF,
  label: string,
  name: string,
  roleLine: string,
  x: number,
  y: number,
  width: number,
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(label, x, y)
  doc.line(x, y + 16, x + width, y + 16)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(name, x, y + 21)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(roleLine, x, y + 25)
}

export const printBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  PrintBacResolutionResult
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    // TODO: replace with real API call when backend contract is available.
    if (!USE_MOCK_BAC_RESOLUTIONS) {
      void finalUrl
      throw new Error('Real API not implemented for printBacResolutionRequest.')
    }
    await new Promise((resolve) => setTimeout(resolve, 150))

    const bacResolutionId = getBacResolutionIdFromFinalUrl(finalUrl)
    const resolution = getMockBacResolutionDatabase().find(
      (item) => item.id === bacResolutionId,
    )

    if (!resolution) {
      throw new Error('BAC Resolution not found.')
    }

    const printable = cloneResolution(resolution)

    if (printable.linkedConsolidatedPrs.length !== 1) {
      throw new Error(
        'BAC Resolution printing requires exactly one linked Consolidated PR.',
      )
    }

    const linkedPr = printable.linkedConsolidatedPrs[0]
    const fileName =
      printable.printFileName ?? `${printable.bacResolutionNumber}.pdf`

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
    let cursorY = 12

    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(0, 0, 0)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(
      'UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES',
      pageWidth / 2,
      cursorY,
      {
        align: 'center',
      },
    )

    cursorY += 8
    doc.setFontSize(11)
    doc.text(
      `BAC RESOLUTION NO. ${printable.bacResolutionNumber}`,
      pageWidth / 2,
      cursorY,
      {
        align: 'center',
      },
    )

    cursorY += 8
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 6

    doc.setFontSize(8.5)

    const clauses =
      printable.whereasClauses.length > 0
        ? printable.whereasClauses
        : [
            {
              id: 'default-whereas-1',
              name: 'Legal Basis',
              body: 'WHEREAS, Section 12 of the Revised IRR of R.A. 9184 provides that the BAC shall recommend to the Head of the Procuring Entity the use of Alternative Methods of Procurement as provided for in the Rules;',
            },
            {
              id: 'default-whereas-2',
              name: 'Requirement Review',
              body: 'WHEREAS, the BAC has reviewed the procurement requirement reflected in the selected BAC Resolution and has confirmed that the linked Consolidated PRs support the recommended mode of procurement;',
            },
          ]

    clauses.forEach((clause) => {
      const clauseText = clause.body.trim().startsWith('WHEREAS')
        ? clause.body
        : `WHEREAS, ${clause.body}`
      cursorY = drawWrappedText(doc, clauseText, margin, cursorY, contentWidth, 4.1)
      cursorY += 2
    })

    cursorY += 2

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('NOW, THEREFORE,', margin, cursorY)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'the members of the BAC hereby RESOLVE as follows:',
      margin + 26,
      cursorY,
    )
    cursorY += 8

    const procurementMode = linkedPr?.modeOfProcurement ?? 'Not specified'
    const resolutionDetails = [
      ['Method', procurementMode],
      ['PR Number', linkedPr?.prNumber ?? 'N/A'],
      ['End-user', linkedPr?.endUser ?? 'N/A'],
      ['Amount', `₱${printable.totalAmount.toLocaleString('en-PH')}`],
      ['Name of Project', linkedPr?.projectName ?? printable.description],
    ] as const

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    resolutionDetails.forEach(([label, value]) => {
      doc.text(`${label}:`, margin, cursorY)
      doc.setFont('helvetica', 'normal')
      cursorY = drawWrappedText(
        doc,
        value,
        margin + 32,
        cursorY,
        contentWidth - 32,
        4.1,
      )
      cursorY += 1.5
      doc.setFont('helvetica', 'bold')
    })

    cursorY += 1
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    cursorY = drawWrappedText(
      doc,
      `RESOLVED this ${printable.resolvedDateText} at ${printable.resolvedLocationText}.`,
      margin,
      cursorY,
      contentWidth,
      4.1,
    )
    cursorY += 3

    doc.setFont('helvetica', 'italic')
    doc.text(
      'Note: Reference to this Resolution shall be indicated in the corresponding purchase request.',
      margin,
      cursorY,
    )
    cursorY += 9

    const endUserRep = printable.provisionalMembers[0] ?? {
      id: 'fallback-end-user-rep',
      role: 'End-user Rep',
      name: 'End-user Representative',
      position: 'End-user Representative',
    }
    const techRep = printable.provisionalMembers[1] ?? {
      id: 'fallback-tech-rep',
      role: 'Tech Rep',
      name: 'Technical Representative',
      position: 'Technical Representative',
    }
    const chairpersonName =
      printable.signatoryOverrides?.chairperson ?? 'BAC IV Chairperson'

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Approved by:', margin, cursorY)
    cursorY += 3

    addSignatureBlock(
      doc,
      endUserRep.role,
      endUserRep.name,
      endUserRep.position,
      margin,
      cursorY,
      72,
    )
    addSignatureBlock(
      doc,
      techRep.role,
      techRep.name,
      techRep.position,
      pageWidth / 2 + 4,
      cursorY,
      72,
    )

    cursorY += 36
    addSignatureBlock(
      doc,
      'Regular Member',
      'BAC IV Regular Member',
      'BAC IV Regular Member',
      margin,
      cursorY,
      72,
    )
    addSignatureBlock(
      doc,
      'Chairperson',
      chairpersonName,
      'BAC IV Chairperson',
      pageWidth / 2 + 4,
      cursorY,
      72,
    )

    cursorY += 38
    doc.setLineDashPattern([3, 3], 0)
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    doc.setLineDashPattern([], 0)

    cursorY += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(
      `BAC Resolution No. ${printable.bacResolutionNumber}`,
      margin,
      cursorY,
    )
    cursorY += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('Recommendation:', margin, cursorY)

    const recommendationY = cursorY + 6
    doc.rect(margin + 28, recommendationY - 4, 6, 6)
    doc.line(margin + 29, recommendationY - 1, margin + 31, recommendationY + 1)
    doc.line(margin + 31, recommendationY + 1, margin + 34, recommendationY - 4)
    doc.text('Approved', margin + 38, recommendationY)
    doc.rect(margin + 70, recommendationY - 4, 6, 6)
    doc.text('Disapproved', margin + 80, recommendationY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(
      printable.approvedBy ?? 'BAC Chairperson',
      pageWidth / 2,
      recommendationY + 16,
      {
        align: 'center',
      },
    )
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('PRESIDENT / HOPE-SYSTEM', pageWidth / 2, recommendationY + 21, {
      align: 'center',
    })

    if (pageHeight - recommendationY < 30) {
      doc.addPage()
    }

    return {
      fileName,
      blob: doc.output('blob'),
    }
  },
}
