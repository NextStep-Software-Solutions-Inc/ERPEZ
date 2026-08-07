/**
 * Catalog Formatters
 * Utility functions for formatting dates, prices, and display values.
 */

/**
 * Format a number as Philippine Peso currency.
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format an ISO date string to "Mar 17, 2026".
 */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format an ISO datetime string to "Mar 17, 2026 at 10:30 AM".
 */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate the number of days between an ISO date and today.
 */
export function getDaysAgo(isoDate: string): number {
  return Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24),
  )
}

/**
 * Returns a human-readable "X days ago" string.
 */
export function formatDaysAgo(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  if (days < 60) return '1 month ago'
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  if (days < 730) return '1 year ago'
  return `${Math.floor(days / 365)} years ago`
}

/**
 * Returns true if the last survey date is older than the stale threshold (default 180 days).
 */
export function isPriceStale(
  lastSurveyDate: string,
  thresholdDays = 180,
): boolean {
  return getDaysAgo(lastSurveyDate) > thresholdDays
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format an audit action to a human-readable label.
 */
export function formatAuditAction(action: string): string {
  const map: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    deactivate: 'Deactivated',
    reactivate: 'Reactivated',
    bulk_adjust: 'Bulk Adjusted',
    duplicate: 'Duplicated',
  }
  return map[action] ?? capitalize(action)
}
