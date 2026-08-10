import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPPMPsRequest,
  getPPMPSummariesRequest,
  getPPMPsByStatusRequest,
} from '../handlers/getPPMPsRequest'
import type { PPMPItem } from '../types'

/**
 * React hooks for fetching PPMP data
 *
 * Provides easy access to mock PPMP data with filtering, search, and caching
 * Ready for production API integration by updating the handlers
 */

/**
 * Hook to fetch all PPMPs with optional filters
 */
export function usePPMPs(filters?: {
  status?: string
  fiscalYear?: number | string
  office?: string
  search?: string
}) {
  return useQuery({
    queryKey: getPPMPsRequest.key({
      url: getPPMPsRequest.endpoint,
      filters,
    }),
    queryFn: async () => {
      // Simulate the fetcher call with filters
      const result = await getPPMPsRequest.fetcher({
        finalUrl: getPPMPsRequest.endpoint,
        filters,
      })
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch PPMP summaries (one entry per PPMP with item counts)
 */
export function usePPMPSummaries() {
  return useQuery({
    queryKey: getPPMPSummariesRequest.key({
      url: getPPMPSummariesRequest.endpoint,
    }),
    queryFn: async () => {
      const result = await getPPMPSummariesRequest.fetcher({
        finalUrl: getPPMPSummariesRequest.endpoint,
      })
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch PPMPs filtered by status
 */
export function usePPMPsByStatus(status: string) {
  return useQuery({
    queryKey: getPPMPsByStatusRequest.key({
      url: getPPMPsByStatusRequest.endpoint,
      status,
    }),
    queryFn: async () => {
      const result = await getPPMPsByStatusRequest.fetcher({
        finalUrl: getPPMPsByStatusRequest.endpoint,
        status,
      })
      return result.data
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get approved PPMPs only
 */
export function useApprovedPPMPs() {
  return usePPMPsByStatus('Approved')
}

/**
 * Hook to get PPMPs by fiscal year
 */
export function usePPMPsByFiscalYear(fiscalYear: number) {
  return usePPMPs({
    fiscalYear,
  })
}

/**
 * Hook to search PPMPs by term
 */
export function useSearchPPMPs(searchTerm: string) {
  return usePPMPs({
    search: searchTerm,
  })
}

/**
 * Hook to get PPMPs by office
 */
export function usePPMPsByOffice(office: string) {
  return usePPMPs({
    office,
  })
}

/**
 * Hook to invalidate PPMP cache (useful after creating/updating PPMPs)
 */
export function useInvalidatePPMPsCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: [getPPMPsRequest.endpoint],
      })
    },
    invalidateSummaries: () => {
      queryClient.invalidateQueries({
        queryKey: [getPPMPSummariesRequest.endpoint],
      })
    },
    invalidateByStatus: (status: string) => {
      queryClient.invalidateQueries({
        queryKey: [getPPMPsByStatusRequest.endpoint, status],
      })
    },
  }
}

/**
 * Hook to combine multiple PPMP selections
 */
export function useSelectedPPMPs(selectedIds: string[], allPPMPs?: PPMPItem[]) {
  const { data: ppmps, isLoading } = usePPMPs()

  const selected = (allPPMPs || ppmps || []).filter((ppmp) =>
    selectedIds.includes(ppmp.ppmpId)
  )

  return {
    selectedPPMPs: selected,
    selectedCount: selected.length,
    totalBudget: selected.reduce((sum, ppmp) => sum + ppmp.totalAmount, 0),
    isLoading,
  }
}
