import type { BiddingMasterCalendarEvent } from '../types'
import {
  getMilestoneExecutionLabel,
  getMilestoneExecutionTone,
} from '../../bidding-schedule/utils/milestonePresentation'

export function getStatusTone(event: BiddingMasterCalendarEvent | null) {
  if (!event) {
    return 'secondary' as const
  }

  return getMilestoneExecutionTone(event.executionStatus)
}

export function getStatusLabel(event: BiddingMasterCalendarEvent | null) {
  if (!event) {
    return 'No selection'
  }

  return getMilestoneExecutionLabel(event.executionStatus)
}
