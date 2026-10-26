/**
 * Client-Side PDF Exporter for Market Scoping Form using jsPDF
 * Location: src/features/planning/market-scoping/utils/
 */

import jsPDF from 'jspdf'
import type { MarketScopingForm } from '../types/marketScopingTypes'

export function generateClientSidePdf(form?: MarketScopingForm): Blob {
  const doc = new jsPDF()

  // Header Title
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('REPUBLIC OF THE PHILIPPINES', 105, 15, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const headerAgency = (form?.agencyName || '').trim()
  if (headerAgency) {
    doc.text(headerAgency.toUpperCase(), 105, 21, { align: 'center' })
  }
  doc.setFontSize(12)
  doc.text('MARKET SCOPING FORM (NGPA RA 12009)', 105, headerAgency ? 28 : 23, {
    align: 'center',
  })

  // Decorative Rule
  doc.setLineWidth(0.5)
  doc.setDrawColor(79, 70, 229) // Indigo accent
  doc.line(14, 32, 196, 32)

  // Project Overview Section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECT OVERVIEW', 14, 40)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Project Name:', 14, 47)
  doc.setFont('helvetica', 'normal')
  doc.text(form?.projectName || 'N/A', 50, 47)

  doc.setFont('helvetica', 'bold')
  doc.text('Estimated Budget:', 14, 53)
  doc.setFont('helvetica', 'normal')
  doc.text(`PHP ${(form?.estimatedBudget || 0).toLocaleString()}`, 50, 53)

  doc.setFont('helvetica', 'bold')
  doc.text('Scoping Period:', 14, 59)
  doc.setFont('helvetica', 'normal')
  doc.text(`${form?.periodFrom || 'N/A'} - ${form?.periodTo || 'N/A'}`, 50, 59)

  doc.setFont('helvetica', 'bold')
  doc.text('Expected Delivery:', 14, 65)
  doc.setFont('helvetica', 'normal')
  doc.text(form?.expectedDeliveryDate || 'N/A', 50, 65)

  doc.setFont('helvetica', 'bold')
  doc.text('Agency Name:', 14, 71)
  doc.setFont('helvetica', 'normal')
  doc.text(form?.agencyName || 'N/A', 50, 71)

  doc.setFont('helvetica', 'bold')
  doc.text('Department / Unit:', 14, 77)
  doc.setFont('helvetica', 'normal')
  doc.text(form?.departmentUnit || '', 50, 77)

  // Section 1: Activities Conducted
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('1. MARKET SCOPING ACTIVITIES CONDUCTED', 14, 87)

  doc.setFontSize(9)
  let y = 94
  const activeActivities = form?.activities?.filter((a) => a.checked) || []
  if (activeActivities.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.text('No market research activities selected.', 14, y)
    y += 8
  } else {
    activeActivities.forEach((act, index) => {
      doc.setFont('helvetica', 'bold')
      const label = `${index + 1}. [✓] ${act.label || act.activityType}`
      doc.text(label, 14, y)
      y += 5
      if (act.description) {
        doc.setFont('helvetica', 'normal')
        const descLines = doc.splitTextToSize(`Notes: ${act.description}`, 175)
        doc.text(descLines, 20, y)
        y += descLines.length * 4 + 2
      }
    })
  }

  // Section 2: NGPA Parameter Evaluations
  y += 4
  if (y > 250) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('2. NGPA EVALUATION PARAMETERS', 14, y)
  y += 7

  doc.setFontSize(9)
  const params = form?.parameters || []
  params.forEach((param, index) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${param.displayName || param.parameterName}`, 14, y)
    doc.text(`[ ${param.considered} ]`, 170, y)
    y += 5

    if (param.recommendations) {
      doc.setFont('helvetica', 'normal')
      const recLines = doc.splitTextToSize(
        `Remarks: ${param.recommendations}`,
        175,
      )
      doc.text(recLines, 18, y)
      y += recLines.length * 4 + 3
    } else {
      y += 2
    }
  })

  // Signatures
  if (y > 240) {
    doc.addPage()
    y = 30
  } else {
    y += 12
  }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PREPARED BY:', 14, y)
  doc.text('APPROVED BY:', 120, y)

  y += 16
  doc.setFont('helvetica', 'bold')
  doc.text(form?.representativeName || '__________________________', 14, y)
  doc.text('__________________________', 120, y)

  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(form?.representativeDesignation || 'End-User Representative', 14, y)
  doc.text('Approving Authority / Department Head', 120, y)

  return doc.output('blob')
}
