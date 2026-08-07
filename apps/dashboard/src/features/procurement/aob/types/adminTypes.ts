/**
 * AOB Admin Types
 * Type definitions for AOB admin dashboard statistics and management
 */

import type { AOBStatus } from './aobTypes'

export interface AOBStatistics {
  totalSubmitted: number
  totalApproved: number
  totalPending: number
  totalRejected: number
  totalDraft: number
  totalCancelled: number
  statisticsByStatus: Record<AOBStatus, number>
  statisticsByAwardCriterion: Record<string, number>
}
