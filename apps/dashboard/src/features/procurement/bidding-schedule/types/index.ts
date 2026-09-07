// ─── Domain union types ───────────────────────────────────────────────────────

/** Which RA 9184 interval table to apply. Distinct from `mop`. */
export type ProcurementCategory = 'goods' | 'infrastructure' | 'consulting'

export const PROCUREMENT_CATEGORY_LABELS: Record<ProcurementCategory, string> = {
  goods: 'Goods',
  infrastructure: 'Infrastructure',
  consulting: 'Consulting Services',
}

/** Lifecycle states of a BiddingSchedule. */
export type BiddingScheduleStatus = 'draft' | 'confirmed' | 'locked'

/** Whether a milestone was produced by the algorithm or manually overridden. */
export type MilestoneAuditStatus = 'auto-generated' | 'edited'

/** Business-facing execution status shown in schedule and calendar UIs. */
export type MilestoneExecutionStatus =
  | 'pending'
  | 'due-soon'
  | 'overdue'
  | 'completed'

export type Holiday = {
  date: string
  name?: string
  type?: 'regular' | 'special'
}

export const DEFAULT_OFFICER_NAME = 'Procurement Officer'

// ─── Milestone types ──────────────────────────────────────────────────────────

/** Single audit log entry for a milestone date change. */
export type MilestoneEditEntry = {
  originalDate: string
  newDate: string
  editedBy: string
  timestamp: string
  reason: string
}

/** One row in the bidding calendar. */
export type BiddingMilestone = {
  id: string
  /** Zero-based position in the timeline. */
  order: number
  /** Stable identifier (e.g. 'pre-bid-conference'). */
  milestoneKey: string
  /** Human-readable display label. */
  name: string
  /** ISO date — result of the algorithm; updated on cascade. */
  computedDate: string
  /** Manual override; takes display precedence over computedDate when set. */
  overrideDate: string | null
  /** Optional HH:mm time string. */
  time: string | null
  status: MilestoneAuditStatus
  isEdited: boolean
  completedAt: string | null
  completedBy: string | null
  /** Ordered oldest-to-newest. */
  editHistory: Array<MilestoneEditEntry>
}

// ─── Schedule entity ──────────────────────────────────────────────────────────

/** Top-level schedule; one-to-one with a BAC Resolution. */
export type BiddingSchedule = {
  id: string
  bacResolutionId: string
  bacResolutionNumber: string
  procurementCategory: ProcurementCategory
  /** ISO date — Day 0 (intended IB posting date). */
  ibPostingDate: string
  status: BiddingScheduleStatus
  milestones: Array<BiddingMilestone>
  createdBy: string
  createdAt: string
  confirmedAt: string | null
  confirmedBy: string | null
  lockedAt: string | null
  lockedBy: string | null
}

// ─── API Response wrapper ───────────────────────────────────────────────────

export type ApiResponse<T> = {
  succeeded: boolean
  data: T
  message: string | null
}

// ─── Payload types ────────────────────────────────────────────────────────────

export type GenerateSchedulePayload = {
  bacResolutionId: string
  bacResolutionNumber?: string
  ibPostingDate: string
  procurementCategory: ProcurementCategory
  createdBy?: string
}

export type RegenerateSchedulePayload = {
  bacResolutionId: string
  ibPostingDate: string
  procurementCategory: ProcurementCategory
  createdBy?: string
}

/** Extended with `bacResolutionId` to enable precise cache invalidation */
export type UpdateMilestonePayload = {
  bacResolutionId: string
  scheduleId: string
  milestoneId: string
  overrideDate: string
  time: string | null
  reason: string
  editedBy?: string
}

export type SetMilestoneCompletionPayload = {
  bacResolutionId: string
  scheduleId: string
  milestoneId: string
  completed: boolean
  updatedBy?: string
}

export type ConfirmSchedulePayload = {
  bacResolutionId: string
  scheduleId: string
  confirmedBy?: string
}

export type LockSchedulePayload = {
  bacResolutionId: string
  scheduleId: string
  lockedBy?: string
}

// Legacy payload type aliases for backward compatibility where needed
export type CreateSchedulePayload = GenerateSchedulePayload

// ─── Calendar API types ─────────────────────────────────────────────────────

export type ConflictType = 'venue' | 'quorum'

export type ConflictDetail = {
  date: string // YYYY-MM-DD
  conflictType: ConflictType
  venue: string
  eventIds: string[]
}

export type CalendarEvent = {
  id: string
  projectId: string
  projectTitle: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  startDate: string // ISO datetime
  endDate: string // ISO datetime
  venue: string
  status: string
  remarks: string | null
  bacResolutionId: string | null
  bacResolutionNumber: string | null
  scheduleStatus: BiddingScheduleStatus
  officeLabel: string
  procurementCategory: ProcurementCategory
  milestoneKey: string | null
  fiscalYear: number | null
}

export type CalendarSummary = {
  activeSchedules: number
  visibleMilestones: number
  conflictDays: number
  overloadedDays: number
  dueSoon: number
  overdue: number
  venueConflicts: number
  quorumConflicts: number
  conflictDetails: ConflictDetail[]
}

export type CalendarEventsWithSummary = {
  events: CalendarEvent[]
  summary: CalendarSummary
}

export type GetCalendarEventsParams = {
  filter?: string
  search?: string
  from?: string // ISO date
  to?: string // ISO date
  office?: string
  category?: ProcurementCategory
  scheduleStatus?: BiddingScheduleStatus
  milestoneKey?: string
  fiscalYear?: number
}
