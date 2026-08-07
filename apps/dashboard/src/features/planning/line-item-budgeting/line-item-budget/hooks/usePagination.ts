import { useMemo } from 'react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import {
  calculateTotalPages,
  calculatePaginationIndices,
} from '../utils/libPaginationUtils'

export interface UsePaginationReturn {
  totalPages: number
  filteredLibs: LIB[]
}

/**
 * Custom hook for handling pagination logic
 */
export const usePagination = (
  allFilteredLibs: LIB[],
  currentPage: number,
  itemsPerPage: number,
): UsePaginationReturn => {
  const totalPages = useMemo(
    () => calculateTotalPages(allFilteredLibs.length, itemsPerPage),
    [allFilteredLibs.length, itemsPerPage],
  )

  const filteredLibs = useMemo(() => {
    const { startIdx, endIdx } = calculatePaginationIndices(
      currentPage,
      itemsPerPage,
    )
    return allFilteredLibs.slice(startIdx, endIdx)
  }, [allFilteredLibs, currentPage, itemsPerPage])

  return {
    totalPages,
    filteredLibs,
  }
}
