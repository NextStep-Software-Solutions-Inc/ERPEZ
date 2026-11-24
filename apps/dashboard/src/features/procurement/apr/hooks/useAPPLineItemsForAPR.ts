/**
 * Hook: Use APP Line Items for APR Creation
 * 
 * Fetches selected APP details and converts line items to APR format
 * Handles APP data loading, error states, and item pre-population
 */

import { useMemo } from 'react'
import { useApprovedAPPs } from '../handlers/hooks'
import {
  convertAppLineItemsToAPRItems,
  calculateTotalVariance,
} from '../utils/convertAppItemsToAPR'
import type { ConsolidatedAPRItem } from '../types'

interface UseAPPLineItemsForAPROptions {
  appId?: string
  selectedLineItemIds?: string[]
  fiscalYear?: number
  enabled?: boolean
}

interface UseAPPLineItemsForAPRResult {
  app: any | null
  selectedLineItems: any[]
  aprItems: ConsolidatedAPRItem[]
  totalBudget: number
  totalApprovedBudget: number
  totalVariance: number
  totalVariancePercent: number
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for pre-populating APR items from selected APP line items
 * Manages data fetching, conversion, and variance calculation
 */
export function useAPPLineItemsForAPR({
  appId,
  selectedLineItemIds = [],
  fiscalYear,
  enabled = true,
}: UseAPPLineItemsForAPROptions): UseAPPLineItemsForAPRResult {
  // Fetch available APPs when an APP id is provided
  const { data: appsResponse, isLoading, error } = useApprovedAPPs({
    queryParams: {
      PageSize: 100,
      fiscalYear,
    },
    enabled: enabled && !!appId,
  } as any)

  // Find selected APP from response
  const app = useMemo(() => {
    if (!appId || !appsResponse) return null
    const list = Array.isArray(appsResponse)
      ? appsResponse
      : (appsResponse as any).data || (appsResponse as any).items || []
    return list.find((a: any) => a.id === appId) || null
  }, [appId, appsResponse])

  const rawLineItems: any[] = useMemo(() => {
    if (!app) return []
    return app.appItems || app.bac?.lineItems || []
  }, [app])

  // Extract selected line items from APP
  const selectedLineItems = useMemo(() => {
    if (!app || selectedLineItemIds.length === 0) return []
    return rawLineItems.filter((item: any) => selectedLineItemIds.includes(item.id))
  }, [app, rawLineItems, selectedLineItemIds])

  // Convert APP items to APR format
  const aprItems = useMemo(() => {
    if (!app || selectedLineItems.length === 0) return []
    return convertAppLineItemsToAPRItems(
      selectedLineItems,
      app.id,
      app.bac?.id || ''
    )
  }, [app, selectedLineItems])

  // Calculate totals and variance
  const { totalVariance, totalVariancePercent, totalApprovedBudget } = useMemo(() => {
    if (aprItems.length === 0) {
      return { totalVariance: 0, totalVariancePercent: 0, totalApprovedBudget: 0 }
    }
    return calculateTotalVariance(aprItems)
  }, [aprItems])

  const totalBudget = useMemo(() => {
    return aprItems.reduce((sum, item) => sum + item.totalAmount, 0)
  }, [aprItems])

  return {
    app,
    selectedLineItems,
    aprItems,
    totalBudget,
    totalApprovedBudget,
    totalVariance,
    totalVariancePercent,
    isLoading,
    error: error as Error | null,
  }
}
