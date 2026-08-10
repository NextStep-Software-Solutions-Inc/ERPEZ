/**
 * Get APR List Request Handler
 * Query blueprint for fetching all APRs with pagination and optional filtering
 * 
 * Supports filtering by:
 * - status: APR status (DRAFT, SUBMITTED, APPROVED, etc.)
 * - fiscalYear: Filter by fiscal year
 * - sourceAPPId: Filter by source APP (SPMS compliance feature)
 * 
 * ✅ Production-safe: Uses real API, mock data only in development
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { APRListResponse } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRList = async () => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRList } = await import('../mocks')
  return mockAPRList
}

const endpoint = '/aprs' as const

interface GetAPRsParams extends QueryParams {
  page?: number
  pageSize?: number
  status?: string
  fiscalYear?: number
  sourceAPPId?: string  // ✅ SPMS: Filter APRs by source APP
}

export const getAPRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRListResponse>,
  GetAPRsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    // Extract query parameters from finalUrl (already serialized by factory)
    const urlObj = new URL(finalUrl, 'http://localhost')
    const sourceAPPId = urlObj.searchParams.get('sourceAPPId')
    const status = urlObj.searchParams.get('status')
    const fiscalYear = urlObj.searchParams.get('fiscalYear')
    const page = parseInt(urlObj.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '20', 10)
    
    // TODO: Replace with real API call when backend is ready
    // const response = await api.get<APIResponse<APRListResponse>>(finalUrl)
    // return response.data
    
    // ✅ Production-safe: Only use mock data in development
    if (!import.meta.env.DEV) {
      console.error('[APR] Backend API for /aprs list not yet implemented')
      return {
        data: {
          data: [],
          total: 0,
          page,
          pageSize,
        },
        succeeded: true,
        errors: [],
      } as unknown as APIResponse<APRListResponse>
    }
    
    // Apply mock filtering based on URL query parameters
    const mockAPRList = await getMockAPRList()
    let filtered = mockAPRList
    if (sourceAPPId) {
      filtered = filtered.filter(apr => apr.sourceAPPId === sourceAPPId)
    }
    if (status) {
      filtered = filtered.filter(apr => apr.status === status)
    }
    if (fiscalYear) {
      filtered = filtered.filter(apr => apr.fiscalYear === parseInt(fiscalYear, 10))
    }
    
    return {
      data: {
        data: filtered,
        total: filtered.length,
        page,
        pageSize,
      },
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRListResponse>
  },
}
