/**
 * APR Status Normalization Utility
 * 
 * Provides unified normalization and comparison logic for APR statuses
 * across admin management, user list, cards, badges, and filters.
 */

/**
 * Normalizes an APR status string to a standard uppercase key.
 * 
 * Handles:
 * - Case insensitivity ('draft' -> 'DRAFT', 'forApproval' -> 'FOR_APPROVAL')
 * - Formats with underscores, hyphens, spaces, or camelCase/PascalCase
 * - Equivalent status aliases ('Submitted', 'Pending', 'ForApproval' -> 'FOR_APPROVAL')
 */
export function normalizeAPRStatus(status?: string | null): string {
  if (!status) return ''
  const clean = String(status).toUpperCase().replace(/[-_\s]/g, '')

  if (clean === 'FORAPPROVAL' || clean === 'SUBMITTED' || clean === 'PENDING') {
    return 'FOR_APPROVAL'
  }
  if (clean === 'DRAFT') {
    return 'DRAFT'
  }
  if (clean === 'APPROVED') {
    return 'APPROVED'
  }
  if (clean === 'RETURNED') {
    return 'RETURNED'
  }
  if (clean === 'PARTIALLYAVAILABLE') {
    return 'PARTIALLY_AVAILABLE'
  }
  if (clean === 'OUTOFSTOCK') {
    return 'OUT_OF_STOCK'
  }
  if (clean === 'ACTIVE') {
    return 'ACTIVE'
  }
  if (clean === 'ARCHIVED') {
    return 'ARCHIVED'
  }
  if (clean === 'COMPLETED') {
    return 'COMPLETED'
  }
  if (clean === 'FAILED') {
    return 'FAILED'
  }

  return clean
}

/**
 * Checks whether an APR's status matches a given filter status.
 * Returns true if filter is 'ALL'/'all' or empty, or if normalized statuses match.
 */
export function matchesAPRStatus(aprStatus?: string | null, filterStatus?: string | null): boolean {
  if (!filterStatus || filterStatus.toUpperCase() === 'ALL') {
    return true
  }
  return normalizeAPRStatus(aprStatus) === normalizeAPRStatus(filterStatus)
}
