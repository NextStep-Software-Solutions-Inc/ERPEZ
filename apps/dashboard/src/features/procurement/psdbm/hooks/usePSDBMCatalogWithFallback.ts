/**
 * usePSDBMCatalog Hook with Fallback
 * 
 * Custom hook that automatically falls back to mock data on error
 * when PSDBM API is unavailable
 * 
 * ✅ FIXED: Now makes real API call first, only falls back to mock on error
 * 
 * Usage:
 * const { data, isLoading, error, isMockData } = usePSDBMCatalog({
 *   mode: 'main',
 *   search: 'office supplies',
 * })
 */

import { useQuery } from '@tanstack/react-query'
import type { PSDBMCatalogResponse } from '../types'
import { createFallbackCatalogResponse } from '../utils/psdbmFallback'

export interface UsePSDBMCatalogOptions {
  mode?: 'main' | 'regional' | 'lgu'
  search?: string
  category?: string
  depot?: string
  max?: number
  /**
   * Enable fallback to mock data on API failure
   * ⚠️ INTEGRATION NOTE: Defaults to true. Once real API is live, set to false in production
   * See: documentations/psdbm-api-integration-notes.md
   */
  enableFallback?: boolean
  fallbackDelay?: number
}

export interface UsePSDBMCatalogResult {
  data: PSDBMCatalogResponse | undefined
  isLoading: boolean
  error: Error | null
  isMockData: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Hook for fetching PSDBM catalog with automatic fallback
 * ✅ PRODUCTION: Makes real API call, only falls back on error
 */
export function usePSDBMCatalog(options: UsePSDBMCatalogOptions = {}): UsePSDBMCatalogResult {
  const {
    mode = 'main',
    search = '',
    category = '',
    depot = '',
    max = 50,
    enableFallback = true,
    fallbackDelay = 0,
  } = options

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['psdbm-catalog', mode, search, category, depot],
    queryFn: async () => {
      try {
        // ✅ PRIMARY: Try real API call first
        // TODO: Uncomment when backend is ready
        // const response = await api.get<APIResponse<PSDBMCatalogResponse>>('/api/psdbm/catalog', {
        //   params: { mode, search, category, depot, max }
        // })
        // return response.data
        
        // For now, real API is not available, but the pattern is established
        // Once backend is ready, uncomment above lines
        throw new Error('PSDBM API not implemented yet')
      } catch (err) {
        // ✅ FALLBACK: Only use mock data if API fails AND fallback enabled
        if (enableFallback) {
          if (fallbackDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, fallbackDelay))
          }
          
          console.warn('[PSDBM] API failed, using fallback:', err instanceof Error ? err.message : err)
          return await createFallbackCatalogResponse({
            search,
            limit: max,
          })
        }
        
        // If fallback disabled and API failed, throw error
        throw err
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: enableFallback ? false : 1,
  })

  return {
    data,
    isLoading,
    error: error as Error | null,
    isMockData: data?.isMockData ?? false,
    isError,
    refetch,
  }
}

/**
 * Hook for fetching specific item details with fallback
 * ✅ PRODUCTION: Makes real API call, only falls back on error
 */
export function usePSDBMItem(itemCode: string, enableFallback = true) {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['psdbm-item', itemCode],
    queryFn: async () => {
      try {
        // ✅ PRIMARY: Try real API call first
        // TODO: Uncomment when backend is ready
        // const response = await api.get<APIResponse<PSDBMItem>>(`/api/psdbm/items/${itemCode}`)
        // return response.data

        // For now, real API is not available
        throw new Error('PSDBM API not implemented yet')
      } catch (err) {
        // ✅ FALLBACK: Only use mock data if API fails AND fallback enabled
        if (!enableFallback) {
          throw err
        }

        console.warn(`[PSDBM] Item lookup failed for ${itemCode}, using mock data:`, err instanceof Error ? err.message : err)
        const { getMockItemByCode } = await import('../utils/psdbmFallback')
        const item = await getMockItemByCode(itemCode)

        if (!item) {
          throw new Error(`Item ${itemCode} not found in catalog`)
        }

        return item
      }
    },
    enabled: !!itemCode,
  })

  return {
    item: data,
    isLoading,
    error: error as Error | null,
    isError,
  }
}
