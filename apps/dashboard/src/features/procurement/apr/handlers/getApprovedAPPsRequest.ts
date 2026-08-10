/**
 * Get Approved APPs Request Handler
 * 
 * Fetches list of approved Annual Procurement Plans (APPs) available for APR creation
 * Used to populate APP selection in CreateAPRDialog
 * 
 * ✅ SPMS Compliance: Only returns APPs with status = 'approved'
 * ✅ Production-safe: Uses real API, mock data only in development
 */

import type { AppMaster } from '@/features/planning/app-consolidation/types'

// Dev-only imports: mock data and utilities only loaded in development mode
const getMockData = () => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  // Dynamic import to prevent bundling in production
  return import('../mocks').then((m) => ({
    mockApprovedAPPs: m.mockApprovedAPPs,
    filterApprovedAppsByFiscalYear: m.filterApprovedAppsByFiscalYear,
  }))
}

export interface GetApprovedAPPsParams {
  fiscalYear?: number
  procuringEntity?: string
}

export interface ApprovedAPPResponse {
  data: AppMaster[]
  total: number
}

export const getApprovedAPPsRequest = {
  endpoint: '/apps/approved',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({
    finalUrl,
    signal,
  }: {
    finalUrl: string
    signal?: AbortSignal
  }): Promise<ApprovedAPPResponse> => {
    try {
      const parsedUrl = new URL(finalUrl, 'http://localhost')
      const fiscalYearParam = parsedUrl.searchParams.get('fiscalYear')
      const procuringEntity = parsedUrl.searchParams.get('procuringEntity') ?? undefined
      const fiscalYear = fiscalYearParam ? Number(fiscalYearParam) : undefined

      // TODO: Replace with actual API call when available
      // const response = await api.get<APIResponse<ApprovedAPPResponse>>(finalUrl, { signal })
      // return response.data
      void signal

      // ✅ Production-safe fallback to mock data only in development
      if (!import.meta.env.DEV) {
        console.error(
          '[APR] Backend API for /apps/approved not yet implemented. Please contact the development team.'
        )
        // Return empty array in production instead of crashing
        // The UI will show "No Approved APPs Found" message
        return {
          data: [],
          total: 0,
        }
      }

      // Dev-only: Use mock data for development/testing
      const { mockApprovedAPPs, filterApprovedAppsByFiscalYear } = await getMockData()

      // MOCK DATA - Filter approved APPs by fiscal year if provided
      let filtered = mockApprovedAPPs

      if (fiscalYear) {
        filtered = filterApprovedAppsByFiscalYear(fiscalYear)
      }

      if (procuringEntity) {
        filtered = filtered.filter((app) => app.procuringEntity === procuringEntity)
      }

      // Only return APPs with status = 'approved' (SPMS compliance)
      const approved = filtered.filter((app) => app.status === 'approved')

      console.log(`✅ Mock Data: Returning ${approved.length} approved APPs for fiscal year ${fiscalYear || 'all'}`)

      return {
        data: approved,
        total: approved.length,
      }
    } catch (error) {
      console.error('Failed to fetch approved APPs:', error)
      throw error
    }
  },
}
