/**
 * useItemValidationStatus
 * Hook to determine item completion status based on required field validation
 */

import { useMemo } from 'react'
import type { BadgeProps } from '@/components/ui/badge'
import type { PPMPItem } from '../types'

export interface ItemValidationStatus {
  isComplete: boolean
  isDetailsComplete: boolean
  hasAllocations: boolean
  missingFields: string[]
  completionPercentage: number
}

/**
 * List of required fields for a complete PPMP item
 */
const REQUIRED_ITEM_FIELDS = [
  'name',
  'unit',
  'unitPrice',
  'plannedQuantity',
  'procurementModeId',
  'projectType',
  'preProcurementConference',
  'procurementStartDate',
  'procurementEndDate',
  'expectedDeliveryStart',
  'expectedDeliveryEnd',
] as const

/**
 * Check if an item has all required fields filled
 */
export function getItemValidationStatus(
  item: PPMPItem | null | undefined,
): ItemValidationStatus {
  if (!item) {
    return {
      isComplete: false,
      isDetailsComplete: false,
      hasAllocations: false,
      missingFields: REQUIRED_ITEM_FIELDS as unknown as string[],
      completionPercentage: 0,
    }
  }

  const missingFields: string[] = []

  // Check each required field
  if (!item.name?.trim()) missingFields.push('Item Name')
  if (!item.unit?.trim()) missingFields.push('Unit of Measure')
  if (!item.unitPrice || item.unitPrice <= 0) missingFields.push('Unit Price')
  if (!item.plannedQuantity || item.plannedQuantity <= 0) missingFields.push('Planned Quantity')
  if (!item.procurementModeId?.trim()) missingFields.push('Procurement Mode')
  if (!item.projectType?.trim()) missingFields.push('Project Type')
  if (
    item.preProcurementConference === null ||
    item.preProcurementConference === undefined
  )
    missingFields.push('Pre-Procurement Conference')
  if (!item.procurementStartDate?.trim())
    missingFields.push('Procurement Start Date')
  if (!item.procurementEndDate?.trim())
    missingFields.push('Procurement End Date')
  if (!item.expectedDeliveryStart?.trim())
    missingFields.push('Expected Delivery Start')
  if (!item.expectedDeliveryEnd?.trim())
    missingFields.push('Expected Delivery End')

  // Check monthly allocations against planned quantity
  const totalAllocated = (item.PPMPItemAllocations || []).reduce(
    (sum, a) => sum + (a.quantity || 0),
    0,
  )
  const plannedQty = item.plannedQuantity ?? 0
  const isOverAllocated = plannedQty > 0 && totalAllocated > plannedQty
  if (isOverAllocated) {
    missingFields.push(`Allocations exceed planned quantity (${totalAllocated}/${plannedQty})`)
  }

  const hasAllocations =
    !!item.PPMPItemAllocations && item.PPMPItemAllocations.length > 0

  const isDetailsComplete = missingFields.length === 0
  // Planned Quantity is authoritative; monthly allocations are optional distribution
  const isComplete = isDetailsComplete

  const completionPercentage = Math.round(
    ((REQUIRED_ITEM_FIELDS.length - Math.min(missingFields.length, REQUIRED_ITEM_FIELDS.length)) /
      REQUIRED_ITEM_FIELDS.length) *
      100,
  )

  return {
    isComplete,
    isDetailsComplete,
    hasAllocations,
    missingFields,
    completionPercentage,
  } as ItemValidationStatus
}

export function useItemValidationStatus(
  item: PPMPItem | null | undefined,
): ItemValidationStatus {
  return useMemo(() => getItemValidationStatus(item), [item])
}

/**
 * Get CSS classes for row styling based on completion status
 */
export function getRowCompletionClasses(status: ItemValidationStatus): string {
  if (status.isComplete) {
    return 'border-l-4 border-l-emerald-500'
  }
  return 'border-l-4 border-l-red-500'
}

/**
 * Get badge color based on completion status
 * Supports: default (complete), success, warning, destructive
 */
export function getCompletionBadgeColor(
  status: ItemValidationStatus,
): NonNullable<BadgeProps['color']> {
  if (status.isComplete) {
    return 'success'
  }
  return 'destructive'
}

/**
 * Get badge variant (outline or soft style)
 */
export function getCompletionBadgeVariant(): NonNullable<
  BadgeProps['variant']
> {
  return 'outline'
}

/**
 * Get badge label based on completion status
 */
export function getCompletionBadgeLabel(
  status: ItemValidationStatus,
): string {
  if (status.isComplete) {
    return '✓ Complete'
  }
  return `${status.completionPercentage ?? 0}% Complete`
}
