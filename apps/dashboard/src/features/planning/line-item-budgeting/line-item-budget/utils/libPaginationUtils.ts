export interface PaginationInfo {
  totalPages: number
  startIdx: number
  endIdx: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Calculate total pages
 */
export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number,
): number => {
  return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Calculate pagination indices
 */
export const calculatePaginationIndices = (
  currentPage: number,
  itemsPerPage: number,
): { startIdx: number; endIdx: number } => {
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  return { startIdx, endIdx }
}

/**
 * Get pagination info
 */
export const getPaginationInfo = (
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
): PaginationInfo => {
  const totalPages = calculateTotalPages(totalItems, itemsPerPage)
  const { startIdx, endIdx } = calculatePaginationIndices(
    currentPage,
    itemsPerPage,
  )

  return {
    totalPages,
    startIdx,
    endIdx,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

/**
 * Validate current page
 */
export const validateCurrentPage = (
  currentPage: number,
  totalPages: number,
): number => {
  if (currentPage < 1) return 1
  if (currentPage > totalPages && totalPages > 0) return totalPages
  return currentPage
}
