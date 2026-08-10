// ─── Domain union types ───────────────────────────────────────────────────────

/** Which RA 9184 interval table to apply. Distinct from `mop`. */
export type ProcurementCategory = 'goods' | 'infrastructure' | 'consulting'

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

/** Backwards-compatible alias for internal audit status. */
export type MilestoneStatus = MilestoneAuditStatus

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

// ─── Interval configuration types ────────────────────────────────────────────

/** One milestone's position in the timeline for a given category. */
export type MilestoneIntervalConfig = {
  id: string
  milestoneKey: string
  milestoneName: string
  minDaysFromPrevious: number
  maxDaysFromPrevious: number | null
  order: number
  isOptional: boolean
}

/** Full set of milestones for one procurement category. */
export type IntervalConfig = {
  category: ProcurementCategory
  milestones: Array<MilestoneIntervalConfig>
}

/** A single declared non-working day. */
export type Holiday = {
  /** YYYY-MM-DD */
  date: string
  name: string
  type: 'regular' | 'special'
}

// ─── Gate / UI types ──────────────────────────────────────────────────────────

/** QA dev panel toggle state per resolution. */
export type MockPrerequisiteGates = {
  consolidatedPrLinked: boolean
  bacResolutionApproved: boolean
  bacResolutionPublicBidding: boolean
  bacResolutionIssued: boolean
  intervalConfigExists: boolean
  holidaysTableExists: boolean
  pbCprLinked?: boolean
}

/** Computed checklist state shown in the UI. */
export type PrerequisiteGateResult = MockPrerequisiteGates & {
  allPassed: boolean
}

/** One row in the prerequisite checklist. */
export type GateCheckItem = {
  key: keyof MockPrerequisiteGates
  label: string
  description: string
  passed: boolean
  completeNowHref: string | null
}

// ─── Payload types ────────────────────────────────────────────────────────────

export type CreateSchedulePayload = {
  bacResolutionId: string
  /** Human-readable resolution number (e.g. "BAC-RES-2026-004"). */
  bacResolutionNumber: string
  ibPostingDate: string
  procurementCategory: ProcurementCategory
  createdBy: string
}

/** Same shape as create; guarded to only apply when status === 'draft'. */
export type RegenerateSchedulePayload = CreateSchedulePayload

export type UpdateMilestonePayload = {
  scheduleId: string
  milestoneId: string
  overrideDate: string
  time: string | null
  reason: string
  editedBy: string
}

export type ConfirmSchedulePayload = {
  scheduleId: string
  confirmedBy: string
}

export type LockSchedulePayload = {
  scheduleId: string
  lockedBy: string
}

export type SetMilestoneCompletionPayload = {
  scheduleId: string
  milestoneId: string
  completed: boolean
  updatedBy: string
}
