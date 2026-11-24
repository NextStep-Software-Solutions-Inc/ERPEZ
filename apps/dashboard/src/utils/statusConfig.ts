/**
 * Generic Status Badge & Configuration Utility
 * Centralized registry for status styles, badge styling, and labels across modules.
 */

export interface StatusConfigItem {
  label: string
  className: string
  variant?: 'default' | 'secondary' | 'outline' | 'soft'
  textColor?: string
  badgeColor?: string
}

export const GENERIC_STATUS_MAP: Record<string, StatusConfigItem> = {
  draft: {
    label: 'DRAFT',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-100 text-gray-700',
  },
  submitted: {
    label: 'SUBMITTED',
    className: 'bg-blue-50 text-blue-800 border-blue-300',
    textColor: 'text-blue-800',
    badgeColor: 'bg-blue-50 text-blue-800',
  },
  for_review: {
    label: 'FOR REVIEW',
    className: 'bg-amber-100 text-amber-700 border-amber-300',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  submitted_to_supplier: {
    label: 'SUBMITTED TO SUPPLIER',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  pending_for_approval: {
    label: 'PENDING APPROVAL',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
    textColor: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  approved: {
    label: 'APPROVED',
    className: 'bg-green-100 text-green-700 border-green-300',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
  },
  returned: {
    label: 'RETURNED',
    className: 'bg-rose-100 text-rose-700 border-rose-300',
    textColor: 'text-rose-700',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
  rejected: {
    label: 'REJECTED',
    className: 'bg-red-100 text-red-700 border-red-300',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
  },
  cancelled: {
    label: 'CANCELLED',
    className: 'bg-slate-100 text-slate-600 border-slate-300',
    textColor: 'text-slate-600',
    badgeColor: 'bg-slate-100 text-slate-600',
  },
  pending: {
    label: 'PENDING',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    textColor: 'text-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  in_progress: {
    label: 'IN PROGRESS',
    className: 'bg-sky-100 text-sky-800 border-sky-300',
    textColor: 'text-sky-800',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  completed: {
    label: 'COMPLETED',
    className: 'bg-green-100 text-green-700 border-green-300',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
  },
  active: {
    label: 'ACTIVE',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  inactive: {
    label: 'INACTIVE',
    className: 'bg-gray-100 text-gray-500 border-gray-300',
    textColor: 'text-gray-500',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
}

/**
 * Normalizes a status string into a uniform snake_case lookup key.
 * Handles uppercase, camelCase, kebab-case, and spaces.
 * E.g., 'FOR_REVIEW' -> 'for_review', 'for-review' -> 'for_review', 'For Review' -> 'for_review'
 */
export const normalizeStatusKey = (status?: string): string => {
  if (!status) return ''
  return status
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')
}

/**
 * Retrieves the badge configuration for a given status string.
 * Falls back to a clean default styling if the status is unrecognized.
 */
export const getStatusConfig = (
  status?: string,
  fallbackStatus = 'draft',
): StatusConfigItem => {
  const normalizedKey = normalizeStatusKey(status)
  if (normalizedKey && GENERIC_STATUS_MAP[normalizedKey]) {
    return GENERIC_STATUS_MAP[normalizedKey]
  }

  const fallback = GENERIC_STATUS_MAP[fallbackStatus] || GENERIC_STATUS_MAP.draft

  if (status && status.trim()) {
    return {
      label: status.trim().toUpperCase(),
      className: fallback.className,
      textColor: fallback.textColor,
      badgeColor: fallback.badgeColor,
    }
  }

  return fallback
}

/**
 * Direct Contracting specific status options for dropdown selectors.
 */
export const DIRECT_CONTRACTING_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'draft', label: 'DRAFT' },
  { value: 'submitted', label: 'SUBMITTED' },
  { value: 'for_review', label: 'FOR REVIEW' },
  { value: 'submitted_to_supplier', label: 'SUBMITTED TO SUPPLIER' },
  { value: 'pending_for_approval', label: 'PENDING APPROVAL' },
  { value: 'approved', label: 'APPROVED' },
  { value: 'returned', label: 'RETURNED' },
]
