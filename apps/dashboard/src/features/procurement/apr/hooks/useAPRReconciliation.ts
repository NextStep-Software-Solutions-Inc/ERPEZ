/**
 * Hook for APR vs APP reconciliation
 * Provides real-time reconciliation state and analysis
 */

import { useMemo } from 'react'
import type { ConsolidatedAPRItem } from '../types'
import type { BACLineItem } from '@/features/planning/app-consolidation/types'
import {
  reconcileAPRWithAPP,
  type APRVsAPPReconciliation,
  getReconciliationSummary,
  getReconciliationStatus,
  isReconciliationReviewRequired,
} from '../utils/reconcileAPRWithAPP'

export interface UseAPRReconciliationOptions {
  appLineItems: BACLineItem[]
  aprItems: ConsolidatedAPRItem[]
  appId: string
  appTotalBudget: number
  enabled?: boolean
  deviationThresholdPercent?: number
}

export interface UseAPRReconciliationResult {
  reconciliation: APRVsAPPReconciliation | null
  summary: string | null
  status: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } | null
  reviewRequired: { required: boolean; reason: string | null }
  isLoading: boolean
}

/**
 * Hook for comparing APR items against original APP line items
 * Useful for audit trail and compliance validation
 */
export function useAPRReconciliation({
  appLineItems,
  aprItems,
  appId,
  appTotalBudget,
  enabled = true,
  deviationThresholdPercent = 5,
}: UseAPRReconciliationOptions): UseAPRReconciliationResult {
  const reconciliation = useMemo(() => {
    if (!enabled || !appLineItems || !aprItems) {
      return null
    }

    return reconcileAPRWithAPP(appLineItems, aprItems, appId, appTotalBudget)
  }, [enabled, appLineItems, aprItems, appId, appTotalBudget])

  const summary = useMemo(() => {
    if (!reconciliation) return null
    return getReconciliationSummary(reconciliation)
  }, [reconciliation])

  const status = useMemo(() => {
    if (!reconciliation) return null
    return getReconciliationStatus(reconciliation)
  }, [reconciliation])

  const reviewRequired = useMemo(() => {
    if (!reconciliation) return { required: false, reason: null }
    return isReconciliationReviewRequired(reconciliation, deviationThresholdPercent)
  }, [reconciliation, deviationThresholdPercent])

  return {
    reconciliation,
    summary,
    status,
    reviewRequired,
    isLoading: false,
  }
}
