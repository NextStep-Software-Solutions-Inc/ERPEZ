/**
 * React Query hook for fetching PSDBM items
 * Uses the factory pattern from erpez-shared-lib
 * 
 * Supports filtering by:
 * - Catalog mode (main, regional, lgu)
 * - Search term
 * - Category
 * - Depot (for regional/lgu modes)
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMItemsRequest } from '../handlers'
import type { PSDBMCatalogMode, PSDBMCatalogResponse } from '../types'
import type { UseQueryResult } from '@tanstack/react-query'
import type { APIResponse } from 'erpez-shared-lib'

interface UsePSDBMItemsOptions {
  pathParams: { mode: PSDBMCatalogMode }
  queryParams: {
    search?: string
    category?: string
    max?: number
    depot?: string
  }
  enabled?: boolean
}

const baseHook = createQueryHookFromTemplate(getPSDBMItemsRequest)

/**
 * Hook for fetching PSDBM items with filtering
 */
export function usePSDBMItems(options: UsePSDBMItemsOptions): UseQueryResult<APIResponse<PSDBMCatalogResponse>> {
  return baseHook(options)
}

