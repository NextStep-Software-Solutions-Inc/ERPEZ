/**
 * React Query hook for fetching PSDBM depots
 * Uses the factory pattern from erpez-shared-lib
 * 
 * Returns list of regional depots and LGU locations
 * Cached for entire session (depots don't change during user session)
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMDepotsRequest } from '../handlers'
import type { PSDBMDepot } from '../types'
import type { UseQueryResult } from '@tanstack/react-query'
import type { APIResponse } from 'erpez-shared-lib'

interface UsePSDBMDepotsOptions {
  enabled?: boolean
}

const baseHook = createQueryHookFromTemplate(getPSDBMDepotsRequest)

/**
 * Hook for fetching PSDBM depots list
 */
export function usePSDBMDepots(options?: UsePSDBMDepotsOptions): UseQueryResult<APIResponse<PSDBMDepot[]>> {
  return baseHook({ enabled: options?.enabled })
}

