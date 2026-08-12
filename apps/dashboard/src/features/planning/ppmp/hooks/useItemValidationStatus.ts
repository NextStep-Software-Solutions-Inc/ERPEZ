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
export function useItemValidationStatus(
  item: PPMPItem | null | undefined,
): ItemValidationStatus {
  return useMemo(() => {
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

    // Check if has at least one monthly allocation
    const hasAllocations =
      !!item.PPMPItemAllocations && item.PPMPItemAllocations.length > 0

    const isDetailsComplete = missingFields.length === 0

    const completionPercentage = Math.round(
      ((REQUIRED_ITEM_FIELDS.length - missingFields.length) /
        REQUIRED_ITEM_FIELDS.length) *
        100,
    )

    return {
      isComplete: isDetailsComplete && hasAllocations,
      isDetailsComplete,
      hasAllocations,
      missingFields,
      completionPercentage,
    } as ItemValidationStatus
  }, [item])
}

/**
 * Get CSS classes for row styling based on completion status
 */
export function getRowCompletionClasses(status: ItemValidationStatus): string {
  if (status.isComplete) {
    return 'bg-emerald-50/30 border-l-4 border-l-emerald-500 hover:bg-emerald-50/50'
  }
  if (status.isDetailsComplete) {
    return 'bg-amber-50/20 border-l-4 border-l-amber-500 hover:bg-amber-50/30'
  }
  return 'bg-red-50/30 border-l-4 border-l-red-500 hover:bg-red-50/50'
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
  if (status.isDetailsComplete) {
    return 'warning'
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
  if (status.isDetailsComplete && !status.hasAllocations) {
    return 'Allocations Required'
  }
  return `${status.completionPercentage ?? 0}% Complete`
}
