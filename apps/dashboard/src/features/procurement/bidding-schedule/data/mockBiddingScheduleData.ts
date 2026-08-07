import { computeMilestones } from '../utils/computeMilestones'
import { getMockBacResolutionDatabase } from '../../bac-resolution/data/mockBacResolutionData'
import type {
  BiddingSchedule,
  Holiday,
  IntervalConfig,
  MockPrerequisiteGates,
  ProcurementCategory,
} from '../types'

// ─── Philippine public holidays 2026 ─────────────────────────────────────────

export const MOCK_HOLIDAYS_2026: Array<Holiday> = [
  { date: '2026-01-01', name: "New Year's Day", type: 'regular' },
  { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
  { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
  { date: '2026-04-04', name: 'Black Saturday', type: 'special' },
  { date: '2026-04-09', name: 'Araw ng Kagitingan', type: 'regular' },
  { date: '2026-05-01', name: 'Labor Day', type: 'regular' },
  { date: '2026-06-12', name: 'Independence Day', type: 'regular' },
  { date: '2026-08-27', name: 'National Heroes Day', type: 'regular' },
  { date: '2026-11-01', name: 'All Saints Day', type: 'special' },
  { date: '2026-11-02', name: 'All Souls Day', type: 'special' },
  { date: '2026-11-30', name: 'Bonifacio Day', type: 'regular' },
  {
    date: '2026-12-08',
    name: 'Feast of the Immaculate Conception',
    type: 'special',
  },
  { date: '2026-12-24', name: 'Christmas Eve', type: 'special' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'regular' },
  { date: '2026-12-30', name: 'Rizal Day', type: 'regular' },
  { date: '2026-12-31', name: "New Year's Eve", type: 'special' },
]

// ─── Milestone sequence (shared key list) ─────────────────────────────────────

const MILESTONE_NAMES: Record<string, string> = {
  'ib-posting': 'IB Posting / Advertisement (Day 0)',
  'bid-documents-issuance': 'Issuance / Availability of Bid Documents',
  'pre-bid-conference': 'Pre-Bid Conference',
  'clarification-deadline': 'Deadline for Submission of Clarifications',
  'bid-submission-opening': 'Deadline for Submission and Opening of Bids',
  'bid-evaluation': 'Bid Evaluation',
  'post-qualification': 'Post-Qualification',
  'bac-resolution-award': 'BAC Resolution of Award',
  'approval-resolution': 'Approval of BAC Resolution',
  'notice-of-award': 'Issuance of Notice of Award (NOA)',
  'contract-signing': 'Contract Signing',
  'notice-to-proceed': 'Issuance of Notice to Proceed (NTP)',
}

type RawInterval = { key: string; minDays: number }

function buildIntervalConfig(
  category: ProcurementCategory,
  intervals: Array<RawInterval>,
): IntervalConfig {
  return {
    category,
    milestones: intervals.map(({ key, minDays }, index) => ({
      id: `${category}-${key}`,
      milestoneKey: key,
      milestoneName: MILESTONE_NAMES[key] ?? key,
      minDaysFromPrevious: minDays,
      maxDaysFromPrevious: minDays === 0 ? 1 : minDays + 3,
      order: index,
      isOptional: false,
    })),
  }
}

// ─── Interval configs ─────────────────────────────────────────────────────────

export const MOCK_INTERVAL_CONFIGS: Record<
  ProcurementCategory,
  IntervalConfig
> = {
  goods: buildIntervalConfig('goods', [
    { key: 'ib-posting', minDays: 0 },
    { key: 'bid-documents-issuance', minDays: 0 },
    { key: 'pre-bid-conference', minDays: 7 },
    { key: 'clarification-deadline', minDays: 3 },
    { key: 'bid-submission-opening', minDays: 12 },
    { key: 'bid-evaluation', minDays: 7 },
    { key: 'post-qualification', minDays: 7 },
    { key: 'bac-resolution-award', minDays: 7 },
    { key: 'approval-resolution', minDays: 5 },
    { key: 'notice-of-award', minDays: 3 },
    { key: 'contract-signing', minDays: 10 },
    { key: 'notice-to-proceed', minDays: 7 },
  ]),

  infrastructure: buildIntervalConfig('infrastructure', [
    { key: 'ib-posting', minDays: 0 },
    { key: 'bid-documents-issuance', minDays: 0 },
    { key: 'pre-bid-conference', minDays: 12 },
    { key: 'clarification-deadline', minDays: 5 },
    { key: 'bid-submission-opening', minDays: 30 },
    { key: 'bid-evaluation', minDays: 7 },
    { key: 'post-qualification', minDays: 30 },
    { key: 'bac-resolution-award', minDays: 7 },
    { key: 'approval-resolution', minDays: 7 },
    { key: 'notice-of-award', minDays: 3 },
    { key: 'contract-signing', minDays: 10 },
    { key: 'notice-to-proceed', minDays: 7 },
  ]),

  consulting: buildIntervalConfig('consulting', [
    { key: 'ib-posting', minDays: 0 },
    { key: 'bid-documents-issuance', minDays: 0 },
    { key: 'pre-bid-conference', minDays: 12 },
    { key: 'clarification-deadline', minDays: 5 },
    { key: 'bid-submission-opening', minDays: 30 },
    { key: 'bid-evaluation', minDays: 15 },
    { key: 'post-qualification', minDays: 15 },
    { key: 'bac-resolution-award', minDays: 7 },
    { key: 'approval-resolution', minDays: 7 },
    { key: 'notice-of-award', minDays: 3 },
    { key: 'contract-signing', minDays: 10 },
    { key: 'notice-to-proceed', minDays: 7 },
  ]),
}

// ─── Additional constants ─────────────────────────────────────────────────────

export const PROCUREMENT_CATEGORY_LABELS: Record<ProcurementCategory, string> =
  {
    goods: 'Goods',
    infrastructure: 'Infrastructure',
    consulting: 'Consulting',
  }

/** Initial gate state for any resolution not yet tracked in the store. */
export const DEFAULT_MOCK_GATES: MockPrerequisiteGates = {
  consolidatedPrLinked: true,
  bacResolutionApproved: true,
  bacResolutionPublicBidding: true,
  bacResolutionIssued: true,
  intervalConfigExists: true,
  holidaysTableExists: true,
  pbCprLinked: true,
}

type MockScheduleSeed = {
  bacResolutionId: string
  procurementCategory: ProcurementCategory
  ibPostingDate: string
  status: BiddingSchedule['status']
  createdBy: string
  confirmedBy?: string | null
  lockedBy?: string | null
  milestoneOverrides?: Array<{
    milestoneKey: string
    overrideDate: string
    time?: string | null
    reason: string
    editedBy: string
  }>
  completedMilestones?: Array<{
    milestoneKey: string
    completedAt: string
    completedBy: string
  }>
}

const MOCK_SCHEDULE_SEEDS: Array<MockScheduleSeed> = [
  {
    bacResolutionId: 'bac-resolution-011',
    procurementCategory: 'infrastructure',
    ibPostingDate: '2026-05-29',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
  },
  {
    bacResolutionId: 'bac-resolution-014',
    procurementCategory: 'goods',
    ibPostingDate: '2026-03-01',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
  },
  {
    bacResolutionId: 'bac-resolution-015',
    procurementCategory: 'goods',
    ibPostingDate: '2026-04-15',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
    completedMilestones: [
      {
        milestoneKey: 'ib-posting',
        completedAt: '2026-04-15T08:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-documents-issuance',
        completedAt: '2026-04-15T08:20:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'pre-bid-conference',
        completedAt: '2026-04-22T09:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'clarification-deadline',
        completedAt: '2026-04-25T05:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-submission-opening',
        completedAt: '2026-05-07T10:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-evaluation',
        completedAt: '2026-05-14T04:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'post-qualification',
        completedAt: '2026-05-21T03:30:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
    ],
  },
  {
    bacResolutionId: 'bac-resolution-016',
    procurementCategory: 'infrastructure',
    ibPostingDate: '2026-03-20',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
    completedMilestones: [
      {
        milestoneKey: 'ib-posting',
        completedAt: '2026-03-20T08:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-documents-issuance',
        completedAt: '2026-03-20T08:15:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'pre-bid-conference',
        completedAt: '2026-04-01T09:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'clarification-deadline',
        completedAt: '2026-04-06T05:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-submission-opening',
        completedAt: '2026-05-06T10:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-evaluation',
        completedAt: '2026-05-13T04:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
    ],
  },
  {
    bacResolutionId: 'bac-resolution-017',
    procurementCategory: 'consulting',
    ibPostingDate: '2026-01-20',
    status: 'locked',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
    lockedBy: 'BAC Secretariat Demo',
    completedMilestones: [
      {
        milestoneKey: 'ib-posting',
        completedAt: '2026-01-20T08:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-documents-issuance',
        completedAt: '2026-01-20T08:15:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'pre-bid-conference',
        completedAt: '2026-02-02T09:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'clarification-deadline',
        completedAt: '2026-02-09T05:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-submission-opening',
        completedAt: '2026-03-09T10:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-evaluation',
        completedAt: '2026-03-24T04:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'post-qualification',
        completedAt: '2026-04-08T02:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bac-resolution-award',
        completedAt: '2026-04-15T09:30:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'approval-resolution',
        completedAt: '2026-04-22T10:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'notice-of-award',
        completedAt: '2026-04-27T03:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'contract-signing',
        completedAt: '2026-05-07T01:30:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'notice-to-proceed',
        completedAt: '2026-05-14T11:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
    ],
  },
  {
    bacResolutionId: 'bac-resolution-012',
    procurementCategory: 'goods',
    ibPostingDate: '2026-05-20',
    status: 'locked',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
    lockedBy: 'BAC Secretariat Demo',
    completedMilestones: [
      {
        milestoneKey: 'ib-posting',
        completedAt: '2026-05-20T08:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'bid-documents-issuance',
        completedAt: '2026-05-20T08:30:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
      {
        milestoneKey: 'pre-bid-conference',
        completedAt: '2026-05-28T09:00:00.000Z',
        completedBy: 'BAC Secretariat Demo',
      },
    ],
  },
  {
    bacResolutionId: 'bac-resolution-013',
    procurementCategory: 'goods',
    ibPostingDate: '2026-05-27',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
  },
  {
    bacResolutionId: 'bac-resolution-018',
    procurementCategory: 'goods',
    ibPostingDate: '2026-06-01',
    status: 'draft',
    createdBy: 'Procurement Staff Demo',
    completedMilestones: [
      {
        milestoneKey: 'ib-posting',
        completedAt: '2026-06-01T08:00:00.000Z',
        completedBy: 'Procurement Staff Demo',
      },
      {
        milestoneKey: 'bid-documents-issuance',
        completedAt: '2026-06-01T08:30:00.000Z',
        completedBy: 'Procurement Staff Demo',
      },
    ],
  },
  {
    bacResolutionId: 'bac-resolution-019',
    procurementCategory: 'infrastructure',
    ibPostingDate: '2026-06-05',
    status: 'confirmed',
    createdBy: 'Procurement Staff Demo',
    confirmedBy: 'BAC Secretariat Demo',
  },
]

function applyMilestoneOverrides(
  schedule: BiddingSchedule,
  overrides: MockScheduleSeed['milestoneOverrides'],
): BiddingSchedule {
  if (!overrides || overrides.length === 0) {
    return schedule
  }

  const milestoneMap = new Map(
    overrides.map((item) => [item.milestoneKey, item]),
  )

  return {
    ...schedule,
    milestones: schedule.milestones.map((milestone) => {
      const override = milestoneMap.get(milestone.milestoneKey)

      if (!override) {
        return milestone
      }

      return {
        ...milestone,
        overrideDate: override.overrideDate,
        time: override.time ?? null,
        status: 'edited',
        isEdited: true,
        editHistory: [
          {
            originalDate: milestone.computedDate,
            newDate: override.overrideDate,
            editedBy: override.editedBy,
            timestamp: '2026-05-01T08:00:00.000Z',
            reason: override.reason,
          },
        ],
      }
    }),
  }
}

function applyMilestoneCompletion(
  schedule: BiddingSchedule,
  completedMilestones: MockScheduleSeed['completedMilestones'],
): BiddingSchedule {
  if (!completedMilestones || completedMilestones.length === 0) {
    return schedule
  }

  const completedMap = new Map(
    completedMilestones.map((item) => [item.milestoneKey, item]),
  )

  return {
    ...schedule,
    milestones: schedule.milestones.map((milestone) => {
      const completion = completedMap.get(milestone.milestoneKey)

      if (!completion) {
        return milestone
      }

      return {
        ...milestone,
        completedAt: completion.completedAt,
        completedBy: completion.completedBy,
      }
    }),
  }
}

function buildMockSchedule(seed: MockScheduleSeed): BiddingSchedule | null {
  const resolution = getMockBacResolutionDatabase().find(
    (item) => item.id === seed.bacResolutionId,
  )

  if (!resolution) {
    return null
  }

  const milestones = computeMilestones(
    seed.ibPostingDate,
    MOCK_INTERVAL_CONFIGS[seed.procurementCategory],
    MOCK_HOLIDAYS_2026,
  ).map((milestone) => ({
    ...milestone,
    id: `${seed.bacResolutionId}-${milestone.milestoneKey}`,
  }))

  const baseSchedule: BiddingSchedule = {
    id: `schedule-${seed.bacResolutionId}`,
    bacResolutionId: resolution.id,
    bacResolutionNumber: resolution.bacResolutionNumber,
    procurementCategory: seed.procurementCategory,
    ibPostingDate: seed.ibPostingDate,
    status: seed.status,
    milestones,
    createdBy: seed.createdBy,
    createdAt: '2026-05-01T08:00:00.000Z',
    confirmedAt:
      seed.status === 'confirmed' || seed.status === 'locked'
        ? '2026-05-02T09:00:00.000Z'
        : null,
    confirmedBy:
      seed.status === 'confirmed' || seed.status === 'locked'
        ? (seed.confirmedBy ?? seed.createdBy)
        : null,
    lockedAt: seed.status === 'locked' ? '2026-05-03T10:30:00.000Z' : null,
    lockedBy:
      seed.status === 'locked' ? (seed.lockedBy ?? seed.createdBy) : null,
  }

  return applyMilestoneCompletion(
    applyMilestoneOverrides(baseSchedule, seed.milestoneOverrides),
    seed.completedMilestones,
  )
}

export const getMockBiddingScheduleDatabase = (): Array<BiddingSchedule> =>
  MOCK_SCHEDULE_SEEDS.map(buildMockSchedule).filter(
    (schedule): schedule is BiddingSchedule => schedule !== null,
  )
