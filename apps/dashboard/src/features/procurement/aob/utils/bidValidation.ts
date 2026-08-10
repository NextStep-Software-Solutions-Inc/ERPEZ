/**
 * Bid Validation Utilities
 * Functions for validating bids and AOB data
 */

import type { AOB, LineItem, SupplierBid } from '../types/aobTypes'

/**
 * Validate that all line items have selected winners
 */
export function validateAllWinnersSelected(lineItems: LineItem[]): {
  isValid: boolean
  missingWinners: string[] // Line item descriptions without winners
} {
  const missingWinners = lineItems
    .filter((item) => !item.selectedWinnerId)
    .map((item) => item.description || item.itemCode)

  return {
    isValid: missingWinners.length === 0,
    missingWinners,
  }
}

/**
 * Validate AOB before submission
 * REQUIRED: Checks all line items have winners before allowing submission
 * Validates: AOB Number, Date, Opening Date, RFQ Link, and Winner selection
 * @param aob - The AOB to validate
 * @param lineItems - REQUIRED: All line items to validate winner selection
 * @throws Error if lineItems is empty/missing (winners MUST be validated)
 */
export function validateAOBBeforeSubmission(
  aob: AOB,
  lineItems: LineItem[]
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!aob.aobNumber?.trim()) {
    errors.push('AOB Number is required')
  }

  if (!aob.date) {
    errors.push('AOB Date is required')
  }

  if (!aob.openingDate) {
    errors.push('Opening Date is required')
  }

  if (!aob.rfqId) {
    errors.push('RFQ must be linked before submission')
  }

  // ALWAYS validate that all line items have selected winners (mandatory)
  if (!lineItems || lineItems.length === 0) {
    errors.push('At least one line item is required')
  } else {
    const { isValid: winnersValid, missingWinners } = validateAllWinnersSelected(lineItems)
    if (!winnersValid) {
      errors.push(`No winner selected for: ${missingWinners.join(', ')}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate bid matrix data
 */
export function validateBidMatrix(bids: SupplierBid[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!bids || bids.length === 0) {
    errors.push('No bids found in matrix')
    return { isValid: false, errors }
  }

  // Check for duplicate bids (same line item + supplier)
  const bidKeys = new Set<string>()
  for (const bid of bids) {
    const key = `${bid.lineItemId}-${bid.supplierId}`
    if (bidKeys.has(key)) {
      errors.push(`Duplicate bid found: Line Item ${bid.lineItemId} from supplier ${bid.supplierName}`)
    }
    bidKeys.add(key)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if manual entry is required for a supplier
 * Manual entry is required for PHYSICAL submissions
 */
export function isManualEntryRequired(submissionType: string | undefined): boolean {
  return submissionType === 'Physical' || submissionType === 'Manual'
}
