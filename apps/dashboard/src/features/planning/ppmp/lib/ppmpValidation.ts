/**
 * PPMP Validation Utilities
 * Checks for data completeness before submission
 */

import type {
  PPMPActivityBlock,
  PPMPLineItem,
  NonProcurableCost,
} from '../types'
import {
  isValidProcurementPeriod,
  isValidProcurementRange,
} from './ppmpProcurementMetadata'

/**
 * Check if a line item has at least one month with quantity > 0
 */
export function hasItemScheduleFilled(item: PPMPLineItem): boolean {
  return Object.values(item.monthlyQuantities).some((qty) => qty > 0)
}

/**
 * Check if a line item has a linked Market Scoping Form (RA 12009 Sec. 10)
 */
export function hasItemMsfLinked(item: PPMPLineItem): boolean {
  return !!item.marketScopingId
}

export function hasItemProcurementMetadata(item: PPMPLineItem): boolean {
  const sizeSpecification = item.sizeSpecification?.trim() ?? ''
  const procurementStart = item.procurementStart?.trim() ?? ''
  const procurementEnd = item.procurementEnd?.trim() ?? ''
  const expectedDelivery = item.expectedDelivery?.trim() ?? ''

  if (!sizeSpecification) return false
  if (item.preProcurementConference == null) return false
  if (!procurementStart || !procurementEnd) return false
  if (!isValidProcurementPeriod(procurementStart)) return false
  if (!isValidProcurementPeriod(procurementEnd)) return false
  if (!expectedDelivery) return false

  return isValidProcurementRange(procurementStart, procurementEnd)
}
/**
 * Check if all procurable line items across all activity blocks have an MSF linked
 */
export function hasAllItemsMsfLinked(
  activityBlocks: PPMPActivityBlock[],
): boolean {
  const allItems = activityBlocks.flatMap((a) =>
    a.ioEBlocks.filter((b) => b.isProcurable).flatMap((b) => b.items),
  )
  if (allItems.length === 0) return true
  return allItems.every(hasItemMsfLinked)
}

/**
 * Check if all items in an activity have at least one month filled
 */
export function hasActivityItemsScheduleFilled(
  activity: PPMPActivityBlock,
): boolean {
  const allItems = activity.ioEBlocks.flatMap((b) => b.items)
  if (allItems.length === 0) return false
  return allItems.every((item) => hasItemScheduleFilled(item))
}

export function hasActivityItemsProcurementMetadata(
  activity: PPMPActivityBlock,
): boolean {
  const allItems = activity.ioEBlocks.flatMap((b) => b.items)
  if (allItems.length === 0) return false
  return allItems.every((item) => hasItemProcurementMetadata(item))
}

/**
 * Check if a non-procurable cost has at least one month with value > 0
 * (same rule as procurable items)
 */
export function hasCostScheduleFilled(cost: NonProcurableCost): boolean {
  return Object.values(cost.monthlyAllocations).some(
    (val) => val !== null && val !== undefined && val > 0,
  )
}

/**
 * Check if a cost item is empty (no months filled, total = 0)
 */
export function isCostItemEmpty(cost: NonProcurableCost): boolean {
  return !hasCostScheduleFilled(cost)
}

/**
 * Check if all non-procurable costs in an activity have at least one month filled
 * Empty rows (with no months filled) are excluded from validation
 */
export function hasActivityCostsScheduleFilled(
  activity: PPMPActivityBlock,
): boolean {
  const allCosts = activity.ioEBlocks
    .filter((b) => !b.isProcurable)
    .flatMap((b) => b.costs || [])

  // Filter out completely empty costs
  const filledCosts = allCosts.filter((cost) => !isCostItemEmpty(cost))

  if (filledCosts.length === 0) return false // No costs with data = invalid
  return filledCosts.every((cost) => hasCostScheduleFilled(cost))
}

/**
 * Check if PPMP is ready for submission
 * Requirements:
 * - At least 1 activity with data
 * - All procurable items must have at least 1 month filled
 * - All non-procurable costs must have at least 1 month filled
 * - No empty cost rows allowed
 * - No over-budget blocks
 */
export function isPpmpReadyForSubmission(
  activityBlocks: PPMPActivityBlock[],
  hasOverBudgetBlocks: boolean,
): boolean {
  if (hasOverBudgetBlocks) return false
  if (activityBlocks.length === 0) return false

  // All procurable items must have an MSF linked (RA 12009 Sec. 10)
  if (!hasAllItemsMsfLinked(activityBlocks)) return false

  // Check all activities have proper schedule/cost data
  return activityBlocks.every((activity) => {
    const hasProcurableItems = activity.ioEBlocks.some(
      (b) => b.isProcurable && b.items.length > 0,
    )
    const nonProcurableBlocks = activity.ioEBlocks.filter(
      (b) => !b.isProcurable,
    )
    const hasNonProcurableCosts = nonProcurableBlocks.some(
      (b) => (b.costs?.length ?? 0) > 0,
    )

    // Check for empty cost rows (costs with 0 all months)
    const hasEmptyCosts = nonProcurableBlocks.some((b) =>
      (b.costs || []).some((cost) => isCostItemEmpty(cost)),
    )

    let isValid = true

    // If activity has procurable items, all must have schedule filled
    if (hasProcurableItems) {
      isValid =
        isValid &&
        hasActivityItemsScheduleFilled(activity) &&
        hasActivityItemsProcurementMetadata(activity)
    }

    // If activity has non-procurable costs, all filled ones must have at least 1 month
    // AND there must not be any completely empty cost rows
    if (hasNonProcurableCosts) {
      isValid =
        isValid && !hasEmptyCosts && hasActivityCostsScheduleFilled(activity)
    }

    // At least one type of data must exist
    isValid = isValid && (hasProcurableItems || hasNonProcurableCosts)

    return isValid
  })
}

/**
 * Get detailed validation errors for UI feedback
 */
export interface ValidationError {
  type:
    | 'no-activities'
    | 'empty-schedule'
    | 'incomplete-costs'
    | 'over-budget'
    | 'lib-overflow'
    | 'missing-msf'
    | 'missing-procurement-metadata'
  message: string
}

export function getValidationErrors(
  activityBlocks: PPMPActivityBlock[],
  hasOverBudgetBlocks: boolean,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (hasOverBudgetBlocks) {
    errors.push({
      type: 'over-budget',
      message: 'Remove over-budget items before submission',
    })
  }

  if (activityBlocks.length === 0) {
    errors.push({
      type: 'no-activities',
      message: 'Add at least one activity to your PPMP',
    })
    return errors
  }

  // Check each activity
  activityBlocks.forEach((activity) => {
    const procurableBlocks = activity.ioEBlocks.filter((b) => b.isProcurable)
    const nonprocurableBlocks = activity.ioEBlocks.filter(
      (b) => !b.isProcurable,
    )

    // Check procurable items
    procurableBlocks.forEach((block) => {
      block.items.forEach((item) => {
        if (!hasItemScheduleFilled(item)) {
          errors.push({
            type: 'empty-schedule',
            message: `${activity.activityName} → ${block.ioEName}: "${item.itemName}" has no monthly quantities. Add at least 1 unit to a month.`,
          })
        }
        if (!hasItemMsfLinked(item)) {
          errors.push({
            type: 'missing-msf',
            message: `${activity.activityName} → ${block.ioEName}: "${item.itemName}" is missing a linked Market Scoping Form. Link an approved MSF before submitting.`,
          })
        }
        if (!hasItemProcurementMetadata(item)) {
          const missingFields: string[] = []
          const procurementStart = item.procurementStart?.trim() ?? ''
          const procurementEnd = item.procurementEnd?.trim() ?? ''

          if (!(item.sizeSpecification?.trim() ?? '')) {
            missingFields.push(
              'Quantity and Size of the Project to be Procured',
            )
          }
          if (item.preProcurementConference == null) {
            missingFields.push('Pre-Procurement Conference')
          }
          if (!procurementStart) {
            missingFields.push('Start of Procurement Activity')
          } else if (!isValidProcurementPeriod(procurementStart)) {
            missingFields.push('valid Start of Procurement Activity (MM/YYYY)')
          }
          if (!procurementEnd) {
            missingFields.push('End of Procurement Activity')
          } else if (!isValidProcurementPeriod(procurementEnd)) {
            missingFields.push('valid End of Procurement Activity (MM/YYYY)')
          }
          if (
            procurementStart &&
            procurementEnd &&
            isValidProcurementPeriod(procurementStart) &&
            isValidProcurementPeriod(procurementEnd) &&
            !isValidProcurementRange(procurementStart, procurementEnd)
          ) {
            missingFields.push('chronological procurement activity range')
          }

          errors.push({
            type: 'missing-procurement-metadata',
            message: `${activity.activityName} → ${block.ioEName}: "${item.itemName}" is missing required procurement metadata. Complete ${missingFields.join(', ')}.`,
          })
        }
      })
    })

    // Check non-procurable costs
    nonprocurableBlocks.forEach((block) => {
      ;(block.costs || []).forEach((cost) => {
        if (isCostItemEmpty(cost)) {
          errors.push({
            type: 'incomplete-costs',
            message: `${activity.activityName} → ${block.ioEName}: "${cost.costItemName}" is empty. Add at least 1 month with a value.`,
          })
        } else if (!hasCostScheduleFilled(cost)) {
          errors.push({
            type: 'incomplete-costs',
            message: `${activity.activityName} → ${block.ioEName}: "${cost.costItemName}" has no monthly allocations. Add at least 1 month with a value.`,
          })
        }
      })
    })
  })

  return errors
}

/**
 * Validate PPMP is complete enough to mark as final
 * Less strict than submission validation - just ensures PPMP has data
 *
 * Requirements for finalization:
 * - At least 1 activity with items or costs
 * - All items/costs must have at least 1 month filled
 * - No completely empty cost rows
 */
export interface FinalizationValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePpmpForFinalization(
  activityBlocks: PPMPActivityBlock[],
): FinalizationValidationResult {
  const errors: string[] = []

  // Check if PPMP has any activities
  if (activityBlocks.length === 0) {
    errors.push('PPMP must have at least one activity')
    return { isValid: false, errors }
  }

  // Check each activity has some data and no empty rows
  let hasAnyData = false

  for (const activity of activityBlocks) {
    // Count procurable items with schedules
    const procurableItems = activity.ioEBlocks
      .filter((b) => b.isProcurable)
      .flatMap((b) => b.items)
    const filledProcurableItems = procurableItems.filter((item) =>
      hasItemScheduleFilled(item),
    )

    // Count non-procurable costs with allocations
    const nonProcurableCosts = activity.ioEBlocks
      .filter((b) => !b.isProcurable)
      .flatMap((b) => b.costs || [])
    const filledCosts = nonProcurableCosts.filter((cost) =>
      hasCostScheduleFilled(cost),
    )
    const emptyCosts = nonProcurableCosts.filter((cost) =>
      isCostItemEmpty(cost),
    )

    // Check for empty rows
    if (emptyCosts.length > 0) {
      errors.push(
        `${activity.activityName}: Remove empty cost rows before finalizing (${emptyCosts.length} empty row${emptyCosts.length > 1 ? 's' : ''})`,
      )
    }

    // Track if activity has any data
    if (filledProcurableItems.length > 0 || filledCosts.length > 0) {
      hasAnyData = true
    }

    // Check all non-empty items have schedules
    const unfilledProcurableItems = procurableItems.filter(
      (item) => !hasItemScheduleFilled(item),
    )
    if (unfilledProcurableItems.length > 0) {
      errors.push(
        `${activity.activityName}: All procurable items must have at least 1 month with quantity > 0 (${unfilledProcurableItems.length} item${unfilledProcurableItems.length > 1 ? 's' : ''} without schedule)`,
      )
    }

    // Check all non-empty costs have allocations
    const unfilledCosts = filledCosts.filter(
      (cost) => !hasCostScheduleFilled(cost),
    )
    if (unfilledCosts.length > 0) {
      errors.push(
        `${activity.activityName}: All non-procurable costs must have at least 1 month with value > 0 (${unfilledCosts.length} cost${unfilledCosts.length > 1 ? 's' : ''} without allocation)`,
      )
    }
  }

  // Check PPMP has at least some data
  if (!hasAnyData) {
    errors.push('PPMP must have at least one item or cost with data')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
