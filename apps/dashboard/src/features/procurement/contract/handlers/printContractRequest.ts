/**
 * printContractRequest
 * High-fidelity print/export utility for Contract Agreement (RA 12009 NGPA Compliant).
 * Tries the server-rendered QuestPDF endpoint first, with client-side jsPDF fallback.
 */

import { jsPDF } from 'jspdf'
import api from '@/services/api'
import type { ContractDetail } from '../types'
import { numberToPhilippinePesoWords } from '../../notice-of-award/utils/numberToWords'

export interface PrintContractResult {
  fileName: string
  blob: Blob
}

function formatDateFormal(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const printContractRequest = {
  endpoint: '/contracts/:id/pdf',
  fetcher: async (contract: ContractDetail): Promise<PrintContractResult> => {
    const fileName = `${contract.contractNumber}_Contract_Agreement.pdf`

    // 1. Attempt server-side QuestPDF stream
    try {
      const response = await api.get<Blob>(`/contracts/${contract.id}/pdf`, {
        responseType: 'blob',
      })
      if (response.data && response.data.size > 0) {
        return {
          fileName,
          blob: response.data,
        }
      }
    } catch {
      // Fall through to client jsPDF fallback
    }

    // 2. Client-side fallback rendering
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let cursorY = 22

    // Header
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(80, 80, 80)
    doc.text('Republic of the Philippines', pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 4.5

    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 8

    // Form label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text('Contract Form', pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 4

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 100)
    doc.text('[Note: The duly accomplished form is not required to be submitted with the Bid but shall be submitted within ten (10) days after receiving the Notice of Award]', pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 8

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    const projectTitle = contract.projectTitle || contract.description || 'PROCUREMENT PROJECT'
    doc.text(`CONTRACT FOR ${projectTitle.toUpperCase()}`, pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 5

    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.text(`Contract Reference No. ${contract.contractNumber}`, pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 10

    // Body
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(20, 20, 20)

    const formalDate = formatDateFormal(contract.contractDate)
    const amountInWords = numberToPhilippinePesoWords(contract.totalAmount || 0)
    const supplierName = contract.supplierName || 'Winning Supplier'

    const preamble = `This CONTRACT executed on ${formalDate} by and between the Procuring Entity, a government agency of the Republic of the Philippines, hereinafter called "the Entity"; and ${supplierName}, hereinafter called "the Supplier".`
    const p1 = doc.splitTextToSize(preamble, contentWidth)
    doc.text(p1, margin, cursorY)
    cursorY += p1.length * 4.5 + 4

    const recitals = `WHEREAS, the Entity invited Bids for ${projectTitle}, and the Supplier submitted a responsive bid and was awarded the contract for the Contract Price equivalent to ${amountInWords} (PHP ${(contract.totalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}).`
    const p2 = doc.splitTextToSize(recitals, contentWidth)
    doc.text(p2, margin, cursorY)
    cursorY += p2.length * 4.5 + 6

    doc.setFont('helvetica', 'bold')
    doc.text('NOW, THEREFORE, the parties hereby agree as follows:', margin, cursorY)
    cursorY += 5

    doc.setFont('helvetica', 'normal')
    const terms = [
      '1. Words and expressions in this Contract shall have the same meanings as assigned in Conditions of Contract.',
      '2. The Philippine Bidding Documents (PBD), Bidder\'s Proposal, Performance Security, Notice of Award, and other required documents shall form part of this Contract.',
      `3. In consideration of the Contract Price of PHP ${(contract.totalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}, the Supplier agrees to deliver and perform all items in accordance with the Contract.`,
      '4. The Entity agrees to pay the contract sum in accordance with the Bidding Documents.',
      '5. Any dispute arising from this Contract shall be resolved under Republic Act No. 9285.',
    ]

    terms.forEach(t => {
      const split = doc.splitTextToSize(t, contentWidth)
      doc.text(split, margin, cursorY)
      cursorY += split.length * 4.2 + 2
    })

    cursorY += 8
    doc.text('IN WITNESS WHEREOF, the parties have caused this Contract to be executed.', margin, cursorY)
    cursorY += 16

    // Signatures
    doc.setFont('helvetica', 'bold')
    doc.text('For the Procuring Entity:', margin, cursorY)
    doc.text('For the Bidder / Supplier:', margin + 95, cursorY)
    cursorY += 14

    doc.text((contract.approvedByName || 'HEAD OF THE PROCURING ENTITY').toUpperCase(), margin, cursorY)
    doc.text((contract.supplierContactPerson || supplierName).toUpperCase(), margin + 95, cursorY)
    cursorY += 4

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Head of the Procuring Entity', margin, cursorY)
    doc.text('Authorized Representative', margin + 95, cursorY)

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(130, 130, 130)
    doc.text('Standard Form: SF-GOOD-66 | Contract Agreement (RA 12009 NGPA Compliant)', pageWidth / 2, pageHeight - 10, { align: 'center' })

    return {
      fileName,
      blob: doc.output('blob'),
    }
  },
}