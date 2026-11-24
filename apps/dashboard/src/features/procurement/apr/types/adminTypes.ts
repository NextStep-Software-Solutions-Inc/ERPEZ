/**
 * Admin APR Management Types
 * 
 * Types for admin dashboard statistics and filtering
 */

import type { APRMaster, APRStatus } from '../types'

/**
 * APR Statistics for Admin Dashboard
 */
export interface APRStatistics {
  totalSubmitted: number
  totalApproved: number
  totalPending: number
  totalReturned: number
  totalDraft: number
  totalBudgetRequested: number
  totalBudgetApproved: number
  statisticsByStatus: Record<string, number>
  statisticsByFiscalYear: Record<number, number>
}

/**
 * Admin APR List Response with Statistics
 */
export interface AdminAPRListResponse {
  aprList: APRMaster[]
  statistics: APRStatistics
  totalCount: number
  page: number
  pageSize: number
}

/**
 * Filter Options for Admin APR List
 */
export interface AdminAPRFilters {
  status?: APRStatus | 'ALL' | string
  fiscalYear?: number
  office?: string
  procuringEntity?: string
  searchQuery?: string
}
