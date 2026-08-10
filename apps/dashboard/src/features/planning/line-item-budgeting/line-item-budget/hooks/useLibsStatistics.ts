import { useMemo } from 'react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { calculateStats, LibStats } from '../utils/libStatsUtils'

/**
 * Custom hook for calculating statistics from LIB list
 */
export const useLibsStatistics = (libs: LIB[]): LibStats => {
  const stats = useMemo(() => {
    return calculateStats(libs)
  }, [libs])

  return stats
}
