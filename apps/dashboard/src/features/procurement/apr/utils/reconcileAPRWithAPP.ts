/**
 * APR vs APP Reconciliation Utility
 * 
 * Compares APR items against original APP items to identify:
 * - Items added to APR from APP
 * - Quantity/budget modifications
 * - Items not included in APR
 * - Deviations from approved plan
 */

import type { ConsolidatedAPRItem } from '../types'
import type { BACLineItem } from '@/features/planning/app-consolidation/types'

export type ReconciliationItemStatus = 'INCLUDED' | 'MODIFIED' | 'EXCLUDED'

export interface ReconciliationItem {
  appLineItemId: string
  description: string
  status: ReconciliationItemStatus
  appQuantity: number
  aprQuantity: number
  quantityDelta: number
  appBudget: number
  aprBudget: number
  budgetDelta: number
  reason?: string
}

export interface APRVsAPPReconciliation {
  appId: string
  appTotalBudget: number
  appTotalItems: number
  aprTotalBudget: number
  aprTotalItems: number
  items: ReconciliationItem[]
  // Summary metrics
  itemsIncluded: number
  itemsModified: number
  itemsExcluded: number
  budgetVariance: number
  budgetVariancePercent: number
  isFullyAligned: boolean // All APP items included with no modifications
  hasDeviations: boolean // Any items excluded or modified
}

/**
 * Reconcile APR items against original APP line items
 * Generates detailed comparison report
 */
export function reconcileAPRWithAPP(
  appLineItems: BACLineItem[],
  aprItems: ConsolidatedAPRItem[],
  appId: string,
  appTotalBudget: number
): APRVsAPPReconciliation {
  const reconciliationItems: ReconciliationItem[] = []
  
  // Build map of APR items by app line item ID for quick lookup
  const aprItemMap = new Map<string, ConsolidatedAPRItem>()
  aprItems.forEach((item) => {
    if (item.appLineItemId) {
      aprItemMap.set(item.appLineItemId, item)
    }
  })

  // Compare each APP line item with corresponding APR item (if exists)
  appLineItems.forEach((appItem) => {
    const aprItem = aprItemMap.get(appItem.id)

    if (!aprItem) {
      // ❌ Item in APP but NOT in APR (excluded)
      reconciliationItems.push({
        appLineItemId: appItem.id,
        description: appItem.description,
        status: 'EXCLUDED',
        appQuantity: appItem.quantity,
        aprQuantity: 0,
        quantityDelta: -appItem.quantity,
        appBudget: appItem.totalAmount,
        aprBudget: 0,
        budgetDelta: -appItem.totalAmount,
        reason: 'Not included in APR',
      })
    } else if (
      aprItem.quantity !== appItem.quantity ||
      aprItem.totalAmount !== appItem.totalAmount
    ) {
      // ⚠️ Item in both APP and APR but with modifications
      reconciliationItems.push({
        appLineItemId: appItem.id,
        description: appItem.description,
        status: 'MODIFIED',
        appQuantity: appItem.quantity,
        aprQuantity: aprItem.quantity,
        quantityDelta: aprItem.quantity - appItem.quantity,
        appBudget: appItem.totalAmount,
        aprBudget: aprItem.totalAmount,
        budgetDelta: aprItem.totalAmount - appItem.totalAmount,
        reason: 'Modified from approved plan',
      })
    } else {
      // ✅ Item in both APP and APR with no modifications
      reconciliationItems.push({
        appLineItemId: appItem.id,
        description: appItem.description,
        status: 'INCLUDED',
        appQuantity: appItem.quantity,
        aprQuantity: aprItem.quantity,
        quantityDelta: 0,
        appBudget: appItem.totalAmount,
        aprBudget: aprItem.totalAmount,
        budgetDelta: 0,
      })
    }
  })

  // Count statuses
  const itemsIncluded = reconciliationItems.filter((i) => i.status === 'INCLUDED').length
  const itemsModified = reconciliationItems.filter((i) => i.status === 'MODIFIED').length
  const itemsExcluded = reconciliationItems.filter((i) => i.status === 'EXCLUDED').length

  // Calculate budget variance
  const aprTotalBudget = aprItems.reduce((sum, item) => sum + item.totalAmount, 0)
  const budgetVariance = aprTotalBudget - appTotalBudget
  const budgetVariancePercent = appTotalBudget > 0 ? (budgetVariance / appTotalBudget) * 100 : 0

  // Determine alignment status
  const isFullyAligned = itemsExcluded === 0 && itemsModified === 0
  const hasDeviations = itemsExcluded > 0 || itemsModified > 0

  return {
    appId,
    appTotalBudget,
    appTotalItems: appLineItems.length,
    aprTotalBudget,
    aprTotalItems: aprItems.length,
    items: reconciliationItems,
    itemsIncluded,
    itemsModified,
    itemsExcluded,
    budgetVariance,
    budgetVariancePercent,
    isFullyAligned,
    hasDeviations,
  }
}

/**
 * Generate reconciliation summary text
 */
export function getReconciliationSummary(reconciliation: APRVsAPPReconciliation): string {
  if (reconciliation.isFullyAligned) {
    return `✅ APR is fully aligned with APP - all ${reconciliation.appTotalItems} items included with no modifications`
  }

  const parts: string[] = []

  if (reconciliation.itemsIncluded > 0) {
    parts.push(`${reconciliation.itemsIncluded} items included`)
  }

  if (reconciliation.itemsModified > 0) {
    parts.push(`${reconciliation.itemsModified} items modified`)
  }

  if (reconciliation.itemsExcluded > 0) {
    parts.push(`${reconciliation.itemsExcluded} items excluded`)
  }

  const summary = parts.join(', ')
  const budgetNote =
    reconciliation.budgetVariancePercent > 0
      ? `Budget ${reconciliation.budgetVariancePercent.toFixed(2)}% over`
      : `Budget ${Math.abs(reconciliation.budgetVariancePercent).toFixed(2)}% under`

  return `⚠️ APR deviates from APP: ${summary}. ${budgetNote}.`
}

/**
 * Get reconciliation status badge text
 */
export function getReconciliationStatus(
  reconciliation: APRVsAPPReconciliation
): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (reconciliation.isFullyAligned) {
    return { label: 'Fully Aligned', variant: 'default' }
  }

  if (reconciliation.itemsExcluded > 0 || Math.abs(reconciliation.budgetVariancePercent) > 10) {
    return { label: 'Significant Deviation', variant: 'destructive' }
  }

  return { label: 'Minor Deviation', variant: 'secondary' }
}

/**
 * Check if reconciliation requires approval/review
 * Approval required if there are significant deviations
 */
export function isReconciliationReviewRequired(
  reconciliation: APRVsAPPReconciliation,
  deviationThresholdPercent = 5
): { required: boolean; reason: string | null } {
  if (reconciliation.isFullyAligned) {
    return { required: false, reason: null }
  }

  if (reconciliation.itemsExcluded > 0) {
    return {
      required: true,
      reason: `${reconciliation.itemsExcluded} approved items are excluded from APR`,
    }
  }

  if (
    reconciliation.itemsModified > 0 &&
    Math.abs(reconciliation.budgetVariancePercent) > deviationThresholdPercent
  ) {
    return {
      required: true,
      reason: `Budget variance ${reconciliation.budgetVariancePercent.toFixed(2)}% exceeds ${deviationThresholdPercent}% threshold`,
    }
  }

  return { required: false, reason: null }
}
