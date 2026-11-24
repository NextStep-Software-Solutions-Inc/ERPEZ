import type {
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarIntervalBar,
  BiddingMasterCalendarDrawerTab,
  ProcurementModeAbbr,
} from '../bidding-master-calendar/types'
import type { BiddingSchedule, BiddingMilestone } from '../bidding-schedule/types'

export type CalendarViewMode = 'agenda' | 'day' | 'week' | 'month' | 'year'

export type ColorTaxonomyMode = 'project' | 'category' | 'status' | 'mode'

export type { ProcurementModeAbbr }

export interface DraggedMilestoneState {
  event: BiddingMasterCalendarEvent
  originalDate: string
  newDate: string
  hour?: number
  minute?: number
}

export interface CascadeCalculationResult {
  draggedEvent: BiddingMasterCalendarEvent
  originalDate: string
  newDate: string
  dateDeltaDays: number
  affectedMilestones: Array<{
    milestoneId: string
    milestoneKey: string
    milestoneName: string
    originalDate: string
    computedNewDate: string
    isStatutoryBreach?: boolean
  }>
}

export type {
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarIntervalBar,
  BiddingMasterCalendarDrawerTab,
  BiddingSchedule,
  BiddingMilestone,
}
