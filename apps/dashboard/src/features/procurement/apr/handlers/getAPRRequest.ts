/**
 * Get APR Details Request Handler
 * Query blueprint for fetching a single APR by ID
 * ✅ Production-safe: Uses real API, mock data only in development
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { APRMaster } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRDetail = async (aprId: string) => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRDetail } = await import('../mocks')
  return mockAPRDetail(aprId)
}

const endpoint = '/aprs/:aprId' as const

interface GetAPRParams extends QueryParams {
  aprId: string
}

export const getAPRRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  GetAPRParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.get<APIResponse<APRMaster>>(finalUrl)
    // return response.data
    
    const aprId = finalUrl.split('/').pop()
    
    // ✅ Production-safe: Only use mock data in development
    if (!import.meta.env.DEV) {
      console.error('[APR] Backend API for /aprs/:aprId not yet implemented')
      throw new Error('APR API not available')
    }
    
    const apr = await getMockAPRDetail(aprId!)
    
    if (!apr) {
      throw new Error(`APR with ID ${aprId} not found`)
    }
    
    return {
      data: apr,
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRMaster>
  },
}
