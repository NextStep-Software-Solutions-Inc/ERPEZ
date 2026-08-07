/**
 * React Query hook for fetching PSDBM categories
 * Uses the factory pattern from erpez-shared-lib
 * 
 * Categories vary by catalog mode (main, regional, lgu)
 * Results are cached for entire session
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMCategoriesRequest } from '../handlers'
import type { PSDBMCatalogMode } from '../types'
import type { UseQueryResult } from '@tanstack/react-query'
import type { APIResponse } from 'erpez-shared-lib'
import type { PSDBMCategory } from '../types'

const baseHook = createQueryHookFromTemplate(
  getPSDBMCategoriesRequest
)

/**
 * Hook for fetching categories by catalog mode
 */
export function usePSDBMCategories(options: {
  pathParams: { mode: PSDBMCatalogMode }
  enabled?: boolean
}): UseQueryResult<APIResponse<PSDBMCategory[]>> {
  return baseHook(options)
}

