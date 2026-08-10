import { useQuery } from '@tanstack/react-query'
import { fetchPositionsStatistics, type PositionsStatisticsResponse } from '@/services/api/positionsStatistics'

/**
 * Hook to fetch positions statistics
 * 
 * Returns KPI metrics:
 * - totalPositions: Total positions
 * - totalActiveIncumbents: Active incumbents
 * - vacancyVariance: Vacancy percentage
 * - filledPositions: Filled positions count
 * - vacantPositions: Vacant positions count
 * - abolishedPositions: Abolished positions count
 */
export function usePositionsStatistics() {
  return useQuery<PositionsStatisticsResponse, Error>({
    queryKey: ['positionsStatistics'],
    queryFn: fetchPositionsStatistics,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
