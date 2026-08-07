/**
 * AOB Statistics Calculations
 * Shared utility for calculating statistics from AOB data
 */

import type { AOB, AOBStatistics } from '../types'
import { AOBStatus } from '../types/aobTypes'

/**
 * Calculate statistics from AOB data
 * Used by both user and manager/approver views
 */
export function calculateStatistics(aobList: AOB[]): AOBStatistics {
  const stats: AOBStatistics = {
    totalSubmitted: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    totalDraft: 0,
    totalCancelled: 0,
    statisticsByStatus: {
      Draft: 0,
      'For Approval': 0,
      Approved: 0,
      Rejected: 0,
      Cancelled: 0,
    },
    statisticsByAwardCriterion: {},
  }

  aobList.forEach((aob) => {
    stats.statisticsByStatus[aob.status] += 1

    if (aob.status === AOBStatus.APPROVED) {
      stats.totalApproved += 1
    } else if (aob.status === AOBStatus.FOR_APPROVAL) {
      stats.totalPending += 1
    } else if (aob.status === AOBStatus.REJECTED) {
      stats.totalRejected += 1
    } else if (aob.status === AOBStatus.DRAFT) {
      stats.totalDraft += 1
    } else if (aob.status === AOBStatus.CANCELLED) {
      stats.totalCancelled += 1
    }

    if (aob.submittedAt) {
      stats.totalSubmitted += 1
    }

    // Track by award criterion
    if (aob.awardCriterion) {
      if (!stats.statisticsByAwardCriterion[aob.awardCriterion]) {
        stats.statisticsByAwardCriterion[aob.awardCriterion] = 0
      }
      stats.statisticsByAwardCriterion[aob.awardCriterion] += 1
    }
  })

  return stats
}
