/**
 * Get Admin APR List Request Handler
 * Query blueprint for fetching all APRs with statistics for admin dashboard
 * ✅ Production-safe: Mock data only loaded in development
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 * Current: Uses mockAPRList and calculates statistics
 * Production: Replace with api.get<APIResponse<AdminAPRListResponse>>(finalUrl)
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { AdminAPRListResponse, APRStatistics } from '../types/adminTypes'
import { APRStatus } from '../types'

const endpoint = '/admin/aprs' as const

interface GetAdminAPRsParams extends QueryParams {
  page?: number
  pageSize?: number
  status?: string
  fiscalYear?: number
  office?: string
  sourceAPPId?: string  // ✅ SPMS: Filter APRs by source APP
}

/**
 * Calculate statistics from APR list
 */
function calculateStatistics(aprList: any[]): APRStatistics {
  const stats: APRStatistics = {
    totalSubmitted: 0,
    totalApproved: 0,
    totalPending: 0,
    totalReturned: 0,
    totalDraft: 0,
    totalBudgetRequested: 0,
    totalBudgetApproved: 0,
    statisticsByStatus: {
      DRAFT: 0,
      FOR_APPROVAL: 0,
      RETURNED: 0,
      APPROVED: 0,
      PARTIALLY_AVAILABLE: 0,
      OUT_OF_STOCK: 0,
    },
    statisticsByFiscalYear: {},
  }

  aprList.forEach((apr: any) => {
    // Count by status
    stats.statisticsByStatus[apr.status as APRStatus] += 1

    // Count totals
    stats.totalBudgetRequested += apr.totalAmount
    if (apr.status === 'APPROVED') {
      stats.totalApproved += 1
      stats.totalBudgetApproved += apr.totalAmount
    } else if (apr.status === 'FOR_APPROVAL') {
      stats.totalPending += 1
    } else if (apr.status === 'RETURNED') {
      stats.totalReturned += 1
    } else if (apr.status === 'DRAFT') {
      stats.totalDraft += 1
    }

    if (apr.submittedAt) {
      stats.totalSubmitted += 1
    }

    // Count by fiscal year
    if (!stats.statisticsByFiscalYear[apr.fiscalYear]) {
      stats.statisticsByFiscalYear[apr.fiscalYear] = 0
    }
    stats.statisticsByFiscalYear[apr.fiscalYear] += 1
  })

  return stats
}

export const getAdminAPRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AdminAPRListResponse>,
  GetAdminAPRsParams,
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
    // const response = await api.get<APIResponse<AdminAPRListResponse>>(finalUrl)
    // return response.data

    // ✅ FALLBACK: Only use mock data in development
    if (!import.meta.env.DEV) {
      console.error('[getAdminAPRsRequest] Backend API not implemented')
      return {
        data: {
          aprList: [],
          statistics: {
            totalSubmitted: 0,
            totalApproved: 0,
            totalPending: 0,
            totalReturned: 0,
            totalDraft: 0,
            totalBudgetRequested: 0,
            totalBudgetApproved: 0,
            statisticsByStatus: {
              DRAFT: 0,
              FOR_APPROVAL: 0,
              RETURNED: 0,
              APPROVED: 0,
              PARTIALLY_AVAILABLE: 0,
              OUT_OF_STOCK: 0,
            },
            statisticsByFiscalYear: {},
          },
          totalCount: 0,
          page,
          pageSize,
        },
        succeeded: true,
        errors: [],
      } as unknown as APIResponse<AdminAPRListResponse>
    }

    // Load mock data (dev only)
    const { mockAPRList } = await import('../mocks')

    // Apply mock filtering based on URL query parameters
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

    const statistics = calculateStatistics(filtered)

    return {
      data: {
        aprList: filtered,
        statistics,
        totalCount: filtered.length,
        page,
        pageSize,
      },
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<AdminAPRListResponse>
  },
}
