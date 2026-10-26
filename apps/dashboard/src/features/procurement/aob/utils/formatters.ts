/**
 * Data Formatter & Type Conversion Utilities
 */

import type { AOBStatus, AwardCriterion } from '../types/aobTypes'

/**
 * Format AOB status for display
 * - User/creator view (AOB page): 'ForApproval' -> 'Submitted', plus 'Draft', 'Approved'
 * - Admin/manager view (Manage AOB): 'ForApproval' -> 'For Approval' (with space)
 */
export function formatAOBStatus(status: AOBStatus | string, view: 'user' | 'admin' = 'user'): string {
  if (status === 'ForApproval' || status === 'For Approval' || status === 'FOR_APPROVAL') {
    return view === 'admin' ? 'For Approval' : 'Submitted'
  }
  const statusMap: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    ForApproval: view === 'admin' ? 'For Approval' : 'Submitted',
    'For Approval': view === 'admin' ? 'For Approval' : 'Submitted',
    Approved: 'Approved',
    Rejected: 'Returned',
    Returned: 'Returned',
    Cancelled: 'Cancelled',
  }
  return statusMap[status] || status
}

/**
 * Get AOB status color for UI badge
 */
export function getAOBStatusColor(status: AOBStatus | string, view: 'user' | 'admin' = 'user'): string {
  if (status === 'ForApproval' || status === 'For Approval' || status === 'FOR_APPROVAL') {
    return view === 'admin'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-blue-50 text-blue-800 border-blue-300'
  }
  const colorMap: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-300',
    Submitted: 'bg-blue-50 text-blue-800 border-blue-300',
    Approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    Rejected: 'bg-rose-50 text-rose-800 border-rose-300',
    Returned: 'bg-rose-50 text-rose-800 border-rose-300',
    Cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

/**
 * Format award criterion for display
 */
export function formatAwardCriterion(criterion: AwardCriterion | string | undefined): string {
  const criterionMap: Record<string, string> = {
    LCRB: 'Lowest Calculated and Responsive Bid',
    MEARB: 'Most Economically Advantageous Responsive Bid',
    MARB: 'Most Advantageous Responsive Bid',
  }
  return (criterion && criterionMap[criterion]) || 'Unknown'
}

/**
 * Format currency for display
 * Returns '-' for null/undefined (missing data), ₱0.00 for zero, and formatted currency for valid amounts
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'PHP'): string {
  // Null or undefined = no data available, display placeholder
  if (amount === null || amount === undefined) return '-'

  const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency === 'PHP' ? 'PHP' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 2): string {
  if (!value && value !== 0) return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (e) {
    return '-'
  }
}

/**
 * Format AOB Number with prefix
 */
export function formatAOBNumber(aobNumber: string | undefined): string {
  if (!aobNumber) return ''
  return aobNumber.startsWith('AOB-') ? aobNumber : `AOB-${aobNumber}`
}
