import { computeMilestones } from '../utils/computeMilestones'
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
