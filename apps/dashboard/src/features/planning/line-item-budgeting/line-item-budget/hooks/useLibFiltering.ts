import { useMemo } from 'react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { filterLibs, FilterCriteria } from '../utils/libFilteringUtils'

/**
 * Custom hook for filtering LIB list based on criteria
 */
export const useLibFiltering = (
  libs: LIB[],
  searchQuery: string = '',
  selectedStatuses: string[] = [],
  selectedSourceTypes: string[] = [],
  selectedYear: string = '',
): LIB[] => {
  const allFilteredLibs = useMemo(() => {
    const criteria: FilterCriteria = {
      searchQuery,
      selectedStatuses,
      selectedSourceTypes,
      selectedYear,
    }
    return filterLibs(libs, criteria)
  }, [libs, searchQuery, selectedStatuses, selectedSourceTypes, selectedYear])

  return allFilteredLibs
}
