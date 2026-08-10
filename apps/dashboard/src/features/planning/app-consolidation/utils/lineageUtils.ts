import type { ConsolidatedLineItem, BACLineItem } from '../types'

/**
 * Data Lineage Tracking - Audit trail for APP consolidation
 *
 * Tracks complete provenance of consolidated items:
 * - Which original PPMPs contributed to each item
 * - Quantity and cost breakdown per office
 * - Percentage of total for each contribution
 * - Critical for RA 9184 regulatory compliance
 *
 * Documentation: documentations/data-lineage-tracking.md
 */

/**
 * Lineage entry - Represents one PPMP's contribution to a consolidated item
 */
export interface LineageEntry {
  ppmpId: string
  ppmpNumber: string
  office: string
  quantity: number
  unitCost: number
  totalAmount: number
  percentage: number
}

/**
 * Validate lineage data integrity
 * Ensures percentages sum to ~100% and amounts match
 */
export function validateLineage(item: ConsolidatedLineItem): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!item.lineageDetails || item.lineageDetails.length === 0) {
    errors.push('No lineage details found')
    return { isValid: false, errors }
  }

  // Check percentage sum
  const percentageSum = item.lineageDetails.reduce((sum, entry) => sum + entry.percentage, 0)
  if (Math.abs(percentageSum - 100) > 0.5) {
    // Allow 0.5% tolerance for rounding
    errors.push(`Percentages sum to ${percentageSum.toFixed(1)}%, expected ~100%`)
  }

  // Check total amount sum
  const amountSum = item.lineageDetails.reduce((sum, entry) => sum + entry.totalAmount, 0)
  if (Math.abs(amountSum - item.totalAmount) > 1) {
    // Allow ₱1 tolerance for rounding
    errors.push(`Total amounts sum to ₱${amountSum}, expected ₱${item.totalAmount}`)
  }

  // Check quantity sum
  const quantitySum = item.lineageDetails.reduce((sum, entry) => sum + entry.quantity, 0)
  if (quantitySum !== item.quantity) {
    errors.push(`Quantities sum to ${quantitySum}, expected ${item.quantity}`)
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Calculate lineage percentages
 * Used during consolidation to track contribution percentage
 */
export function calculateLineagePercentages(entries: Omit<LineageEntry, 'percentage'>[]): LineageEntry[] {
  const totalAmount = entries.reduce((sum, entry) => sum + entry.totalAmount, 0)

  return entries.map((entry) => ({
    ...entry,
    percentage: totalAmount > 0 ? (entry.totalAmount / totalAmount) * 100 : 0,
  }))
}

/**
 * Format lineage for display
 */
export function formatLineageForDisplay(lineage: LineageEntry): {
  ppmpLabel: string
  officeLabel: string
  quantityLabel: string
  costLabel: string
  percentageLabel: string
} {
  return {
    ppmpLabel: `${lineage.ppmpNumber} (${lineage.ppmpId})`,
    officeLabel: lineage.office,
    quantityLabel: `${lineage.quantity.toLocaleString()}`,
    costLabel: `₱${lineage.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`,
    percentageLabel: `${lineage.percentage.toFixed(1)}%`,
  }
}

/**
 * Get lineage summary
 * Used for quick reference without expanding details
 */
export function getLineageSummary(item: ConsolidatedLineItem): string {
  if (!item.lineageDetails || item.lineageDetails.length === 0) {
    return 'No lineage data'
  }

  if (item.lineageDetails.length === 1) {
    const entry = item.lineageDetails[0]
    return `From ${entry.ppmpNumber} (${entry.office})`
  }

  return `Consolidated from ${item.lineageDetails.length} PPMPs`
}

/**
 * Group lineage entries by PPMP
 * Used to show PPMP grouping in UI
 */
export function groupLineageByPPMP(lineage: LineageEntry[]): Map<string, LineageEntry[]> {
  const grouped = new Map<string, LineageEntry[]>()

  lineage.forEach((entry) => {
    if (!grouped.has(entry.ppmpId)) {
      grouped.set(entry.ppmpId, [])
    }
    grouped.get(entry.ppmpId)!.push(entry)
  })

  return grouped
}

/**
 * Group lineage entries by office
 * Used to show office grouping in UI
 */
export function groupLineageByOffice(lineage: LineageEntry[]): Map<string, LineageEntry[]> {
  const grouped = new Map<string, LineageEntry[]>()

  lineage.forEach((entry) => {
    if (!grouped.has(entry.office)) {
      grouped.set(entry.office, [])
    }
    grouped.get(entry.office)!.push(entry)
  })

  return grouped
}

/**
 * Get top contributors to a consolidated item
 * Returns top N offices by total amount
 */
export function getTopContributors(item: ConsolidatedLineItem, limit: number = 5): LineageEntry[] {
  if (!item.lineageDetails) return []

  return item.lineageDetails
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
}

/**
 * Calculate total contribution by office
 */
export function calculateOfficeContribution(lineage: LineageEntry[]): Map<string, number> {
  const contribution = new Map<string, number>()

  lineage.forEach((entry) => {
    const current = contribution.get(entry.office) || 0
    contribution.set(entry.office, current + entry.totalAmount)
  })

  return contribution
}

/**
 * Create audit log entry for lineage changes
 */
export interface LineageAuditEntry {
  timestamp: Date
  action: 'created' | 'updated' | 'verified' | 'approved'
  actor: string
  ppmpIds: string[]
  itemId: string
  details?: string
}

/**
 * Validate lineage before consolidation
 * Ensures all referenced PPMPs exist and have valid data
 */
export function validateLineageSources(
  lineage: LineageEntry[],
  availablePPMPs: Map<string, any>
): {
  isValid: boolean
  missingPPMPs: string[]
  invalidEntries: string[]
} {
  const missingPPMPs: string[] = []
  const invalidEntries: string[] = []

  lineage.forEach((entry, index) => {
    // Check if PPMP exists
    if (!availablePPMPs.has(entry.ppmpId)) {
      missingPPMPs.push(entry.ppmpId)
    }

    // Validate entry data
    if (entry.quantity < 0) {
      invalidEntries.push(`Entry ${index}: Invalid quantity (${entry.quantity})`)
    }
    if (entry.totalAmount < 0) {
      invalidEntries.push(`Entry ${index}: Invalid amount (₱${entry.totalAmount})`)
    }
    if (entry.percentage < 0 || entry.percentage > 100) {
      invalidEntries.push(`Entry ${index}: Invalid percentage (${entry.percentage}%)`)
    }
  })

  return {
    isValid: missingPPMPs.length === 0 && invalidEntries.length === 0,
    missingPPMPs,
    invalidEntries,
  }
}

/**
 * Export lineage as CSV
 */
export function exportLineageAsCSV(item: ConsolidatedLineItem): string {
  const headers = ['PPMP Number', 'Office', 'Quantity', 'Unit Cost', 'Total Amount', 'Percentage']
  const rows =
    item.lineageDetails?.map((entry) => [
      entry.ppmpNumber,
      entry.office,
      entry.quantity,
      entry.unitCost,
      entry.totalAmount,
      `${entry.percentage.toFixed(1)}%`,
    ]) || []

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Generate lineage report
 */
export function generateLineageReport(item: ConsolidatedLineItem): string {
  const validation = validateLineage(item)
  const summary = getLineageSummary(item)

  let report = `CONSOLIDATION LINEAGE REPORT\n`
  report += `================================\n\n`
  report += `Item: ${item.description}\n`
  report += `Code: ${item.id}\n`
  report += `Total Quantity: ${item.quantity}\n`
  report += `Total Budget: ₱${item.totalAmount.toLocaleString('en-PH')}\n\n`
  report += `Summary: ${summary}\n\n`

  if (item.lineageDetails && item.lineageDetails.length > 0) {
    report += `CONTRIBUTING SOURCES:\n`
    report += `-------------------\n`
    item.lineageDetails.forEach((entry) => {
      report += `\nPPMP: ${entry.ppmpNumber}\n`
      report += `  Office: ${entry.office}\n`
      report += `  Quantity: ${entry.quantity}\n`
      report += `  Unit Cost: ₱${entry.unitCost.toLocaleString('en-PH')}\n`
      report += `  Total: ₱${entry.totalAmount.toLocaleString('en-PH')}\n`
      report += `  % of Total: ${entry.percentage.toFixed(1)}%\n`
    })
  }

  report += `\nDATA INTEGRITY:\n`
  report += `---------------\n`
  report += `Valid: ${validation.isValid ? 'YES' : 'NO'}\n`
  if (!validation.isValid) {
    report += `Errors:\n`
    validation.errors.forEach((error) => {
      report += `  - ${error}\n`
    })
  }

  return report
}
