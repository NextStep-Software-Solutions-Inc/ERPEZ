import {
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Hourglass,
  Layers,
} from 'lucide-react'
import React from 'react'
import type { LIB } from '../types'

export type LIBStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Returned'
  | 'Proposed'
  | 'PendingCeilingApproval'
  | 'Consolidated'

/**
 * Centralized status configuration
 * Single source of truth for all status-related mappings
 */
const STATUS_CONFIG: Record<
  LIBStatus,
  {
    icon: React.ComponentType<{ className?: string }>
    textColor: string
    badgeColor: string
    label: string
    bannerColor?: string
    bannerText?: string
  }
> = {
  Draft: {
    icon: Circle,
    textColor: 'text-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    label: 'Draft',
  },
  Submitted: {
    icon: Clock,
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    label: 'Submitted',
  },
  Approved: {
    icon: CheckCircle2,
    textColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-700',
    label: 'Approved',
  },
  Returned: {
    icon: AlertCircle,
    textColor: 'text-red-600',
    badgeColor: 'bg-red-100 text-red-700',
    label: 'Returned',
  },
  Proposed: {
    icon: Send,
    textColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-700',
    label: 'Proposed',
    bannerColor: 'bg-amber-50 border-l-amber-500',
    bannerText: 'Awaiting ceiling assignment from Budget Office',
  },
  PendingCeilingApproval: {
    icon: Hourglass,
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    label: 'Pending Ceiling',
    bannerColor: 'bg-purple-50 border-l-purple-500',
    bannerText: 'Pending Budget Office ceiling approval',
  },
  Consolidated: {
    icon: Layers,
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-700',
    label: 'Consolidated',
  },
}

/**
 * All available LIB statuses (used in filter panels)
 */
export const ALL_STATUSES: LIBStatus[] = [
  'Draft',
  'Submitted',
  'Approved',
  'Returned',
  'Proposed',
  'PendingCeilingApproval',
  'Consolidated',
]

/**
 * Validate if a string is a valid LIB status
 */
export const isValidStatus = (status: unknown): status is LIBStatus => {
  return typeof status === 'string' && status in STATUS_CONFIG
}

/**
 * Get color scheme for LIB status
 */
export const getStatusColor = (status: LIBStatus): string => {
  return STATUS_CONFIG[status]?.textColor ?? 'text-gray-600'
}

/**
 * Get background color for status badge
 */
export const getStatusBadgeColor = (status: LIBStatus): string => {
  return STATUS_CONFIG[status]?.badgeColor ?? 'bg-gray-100 text-gray-700'
}

/**
 * Get status icon component
 */
export const getStatusIcon = (
  status: LIBStatus,
): React.ComponentType<{ className?: string }> => {
  return STATUS_CONFIG[status]?.icon ?? Circle
}

/**
 * Get all available statuses
 * @deprecated Use ALL_STATUSES constant directly
 */
export const getAllStatuses = (): LIBStatus[] => ALL_STATUSES

/**
 * Get status label (for display purposes)
 */
export const getStatusLabel = (status: LIBStatus): string => {
  return STATUS_CONFIG[status]?.label ?? status
}

/**
 * Get banner color classes for alert banner (Proposed/PendingCeilingApproval)
 */
export const getStatusBannerColor = (status: LIBStatus): string | undefined => {
  return STATUS_CONFIG[status]?.bannerColor
}

/**
 * Get banner text for alert banner
 */
export const getStatusBannerText = (status: LIBStatus): string | undefined => {
  return STATUS_CONFIG[status]?.bannerText
}

/**
 * Get source display text (formatted source type and name)
 * Returns icon emoji + source name for the LIB
 */
export const getSourceDisplay = (lib: LIB): string => {
  const icon = lib.sourceType === 'OPCR' ? '📋' : '📊'
  return `${icon} ${lib.sourceName}`
}
