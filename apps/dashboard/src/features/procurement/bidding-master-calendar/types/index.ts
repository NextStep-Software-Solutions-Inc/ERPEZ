import type {
  BiddingScheduleStatus,
  MilestoneExecutionStatus,
  ProcurementCategory,
} from '../../bidding-schedule/types'

export type DerivedCalendarProjectStatus =
  | 'upcoming'
  | 'in-progress'
  | 'due-soon'
  | 'overdue'
  | 'completed-locked'

export type BiddingMasterCalendarDrawerTab =
  | 'project-detail'
  | 'milestones'
  | 'conflicts'
  | 'notifications'
  | 'audit-log'
  | 'linked-actions'
  | 'all-projects'

export type ProcurementModeAbbr = 'PB' | 'DA' | 'DC' | 'RFQ'

export interface BiddingMasterCalendarEvent {
  id: string
  bacResolutionId: string
  bacResolutionNumber: string
  scheduleId: string
  scheduleStatus: BiddingScheduleStatus
  fiscalYear: string
  procurementCategory: ProcurementCategory
  procurementMode?: string | null
  projectNames: string[]
  primaryProjectName: string
  officeLabel: string
  linkedCprCount: number
  milestoneId: string
  milestoneKey: string
  milestoneName: string
  milestoneOrder: number
  eventDate: string
  eventTime: string | null
  isEdited: boolean
  executionStatus: MilestoneExecutionStatus
  sourceType: 'draft' | 'confirmed' | 'locked'
  derivedProjectStatus: DerivedCalendarProjectStatus
  appTargetMonth: string | null
  isDueSoon: boolean
  isOverdue: boolean
  isProvisional?: boolean
  startDate?: string
  endDate?: string
}

export interface BiddingMasterCalendarResolutionOption {
  id: string
  number: string
  title: string
}

export interface BiddingMasterCalendarIntervalBar {
  id: string
  eventId: string
  bacResolutionId: string
  milestoneKey: string
  milestoneName: string
  startDate: Date
  endDate: Date
  startCol: number // 1 to 7
  span: number // 1 to 7
  isStartEdge: boolean
  isEndEdge: boolean
  event: BiddingMasterCalendarEvent
}

export interface BiddingMasterCalendarConflictGroup {
  date: string
  milestoneKey: string
  milestoneName: string
  events: BiddingMasterCalendarEvent[]
}

export interface BiddingMasterCalendarAppBand {
  id: string
  label: string
  monthKey: string
  bacResolutionId: string
  fiscalYear: string
}

export interface BiddingMasterCalendarAgendaGroup {
  date: string
  label: string
  bucket: BiddingMasterCalendarDayBucket
}

export interface BiddingMasterCalendarDayBucket {
  date: string
  events: BiddingMasterCalendarEvent[]
  hardConflictGroups: BiddingMasterCalendarConflictGroup[]
  hardConflictCount: number
  isOverloaded: boolean
  overloadCount: number
  appBands: BiddingMasterCalendarAppBand[]
  dueSoonCount: number
  overdueCount: number
}

export interface BiddingMasterCalendarFilters {
  searchTerm: string
  bacResolutionId?: string | null
  milestoneKeys: string[]
  procurementCategories: ProcurementCategory[]
  offices: string[]
  derivedStatuses: DerivedCalendarProjectStatus[]
  fiscalYears: string[]
  dateRangeStart: string | null
  dateRangeEnd: string | null
  procurementModes?: ProcurementModeAbbr[]
}

export interface BiddingMasterCalendarSummaryMetrics {
  totalSchedules: number
  totalVisibleMilestones: number
  conflictDays: number
  overloadedDays: number
  dueSoonItems: number
  overdueItems: number
}

export const DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS: BiddingMasterCalendarFilters =
  {
    searchTerm: '',
    bacResolutionId: null,
    milestoneKeys: [],
    procurementCategories: [],
    offices: [],
    derivedStatuses: [],
    fiscalYears: [],
    dateRangeStart: null,
    dateRangeEnd: null,
    procurementModes: [],
  }
