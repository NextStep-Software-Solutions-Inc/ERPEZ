// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { cascadeRecalculate } from './cascadeRecalculate'
import { computeMilestones } from './computeMilestones'
import type { BiddingMilestone, Holiday, IntervalConfig } from '../types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NO_HOLIDAYS: Array<Holiday> = []

const SOME_HOLIDAYS: Array<Holiday> = [
  { date: '2026-05-01', name: 'Labor Day', type: 'regular' },
  { date: '2026-06-12', name: 'Independence Day', type: 'regular' },
]

/** Minimal two-milestone config: Day 0 anchor + one milestone 7 days later. */
function buildTwoMilestoneConfig(minDays: number): IntervalConfig {
  return {
    category: 'goods-and-services',
    milestones: [
      {
        id: 'goods-and-services-ib-posting',
        milestoneKey: 'ib-posting',
        milestoneName: 'IB Posting (Day 0)',
        minDaysFromPrevious: 0,
        maxDaysFromPrevious: null,
        order: 0,
        isOptional: false,
      },
      {
        id: 'goods-and-services-pre-bid-conference',
        milestoneKey: 'pre-bid-conference',
        milestoneName: 'Pre-Bid Conference',
        minDaysFromPrevious: minDays,
        maxDaysFromPrevious: null,
        order: 1,
        isOptional: false,
      },
    ],
  }
}

function buildThreeMilestoneConfig(
  firstGapDays: number,
  secondGapDays: number,
): IntervalConfig {
  return {
    category: 'goods-and-services',
    milestones: [
      {
        id: 'goods-and-services-ib-posting',
        milestoneKey: 'ib-posting',
        milestoneName: 'IB Posting (Day 0)',
        minDaysFromPrevious: 0,
        maxDaysFromPrevious: null,
        order: 0,
        isOptional: false,
      },
      {
        id: 'goods-and-services-pre-bid-conference',
        milestoneKey: 'pre-bid-conference',
        milestoneName: 'Pre-Bid Conference',
        minDaysFromPrevious: firstGapDays,
        maxDaysFromPrevious: null,
        order: 1,
        isOptional: false,
      },
      {
        id: 'goods-and-services-bid-submission-opening',
        milestoneKey: 'bid-submission-opening',
        milestoneName: 'Bid Submission Opening',
        minDaysFromPrevious: secondGapDays,
        maxDaysFromPrevious: null,
        order: 2,
        isOptional: false,
      },
    ],
  }
}

function buildMilestone(
  overrides: Partial<BiddingMilestone>,
): BiddingMilestone {
  return {
    id: overrides.id ?? 'milestone-id',
    order: overrides.order ?? 0,
    milestoneKey: overrides.milestoneKey ?? 'ib-posting',
    name: overrides.name ?? 'Milestone',
    computedDate: overrides.computedDate ?? '2026-05-01',
    overrideDate: overrides.overrideDate ?? null,
    time: overrides.time ?? null,
    status: overrides.status ?? 'auto-generated',
    isEdited: overrides.isEdited ?? false,
    editHistory: overrides.editHistory ?? [],
  }
}

/** Full goods-and-services config (12 milestones). */
const GOODS_CONFIG: IntervalConfig = {
  category: 'goods-and-services',
  milestones: [
    {
      id: 'g-0',
      milestoneKey: 'ib-posting',
      milestoneName: 'IB Posting',
      minDaysFromPrevious: 0,
      maxDaysFromPrevious: null,
      order: 0,
      isOptional: false,
    },
    {
      id: 'g-1',
      milestoneKey: 'bid-documents-issuance',
      milestoneName: 'Bid Documents Issuance',
      minDaysFromPrevious: 0,
      maxDaysFromPrevious: null,
      order: 1,
      isOptional: false,
    },
    {
      id: 'g-2',
      milestoneKey: 'pre-bid-conference',
      milestoneName: 'Pre-Bid Conference',
      minDaysFromPrevious: 7,
      maxDaysFromPrevious: null,
      order: 2,
      isOptional: false,
    },
    {
      id: 'g-3',
      milestoneKey: 'clarification-deadline',
      milestoneName: 'Clarification Deadline',
      minDaysFromPrevious: 3,
      maxDaysFromPrevious: null,
      order: 3,
      isOptional: false,
    },
    {
      id: 'g-4',
      milestoneKey: 'bid-submission-opening',
      milestoneName: 'Bid Submission Opening',
      minDaysFromPrevious: 12,
      maxDaysFromPrevious: null,
      order: 4,
      isOptional: false,
    },
    {
      id: 'g-5',
      milestoneKey: 'bid-evaluation',
      milestoneName: 'Bid Evaluation',
      minDaysFromPrevious: 7,
      maxDaysFromPrevious: null,
      order: 5,
      isOptional: false,
    },
    {
      id: 'g-6',
      milestoneKey: 'post-qualification',
      milestoneName: 'Post-Qualification',
      minDaysFromPrevious: 7,
      maxDaysFromPrevious: null,
      order: 6,
      isOptional: false,
    },
    {
      id: 'g-7',
      milestoneKey: 'bac-resolution-award',
      milestoneName: 'BAC Resolution of Award',
      minDaysFromPrevious: 7,
      maxDaysFromPrevious: null,
      order: 7,
      isOptional: false,
    },
    {
      id: 'g-8',
      milestoneKey: 'approval-resolution',
      milestoneName: 'Approval of BAC Resolution',
      minDaysFromPrevious: 5,
      maxDaysFromPrevious: null,
      order: 8,
      isOptional: false,
    },
    {
      id: 'g-9',
      milestoneKey: 'notice-of-award',
      milestoneName: 'Notice of Award',
      minDaysFromPrevious: 3,
      maxDaysFromPrevious: null,
      order: 9,
      isOptional: false,
    },
    {
      id: 'g-10',
      milestoneKey: 'contract-signing',
      milestoneName: 'Contract Signing',
      minDaysFromPrevious: 10,
      maxDaysFromPrevious: null,
      order: 10,
      isOptional: false,
    },
    {
      id: 'g-11',
      milestoneKey: 'notice-to-proceed',
      milestoneName: 'Notice to Proceed',
      minDaysFromPrevious: 7,
      maxDaysFromPrevious: null,
      order: 11,
      isOptional: false,
    },
  ],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeMilestones', () => {
  it('returns milestones with the correct count', () => {
    const milestones = computeMilestones(
      '2026-05-26',
      GOODS_CONFIG,
      NO_HOLIDAYS,
    )
    expect(milestones).toHaveLength(GOODS_CONFIG.milestones.length)
  })

  it('sets milestone 0 (IB Posting) to the provided ibPostingDate', () => {
    const milestones = computeMilestones(
      '2026-05-26',
      GOODS_CONFIG,
      NO_HOLIDAYS,
    )
    expect(milestones[0].computedDate).toBe('2026-05-26')
    expect(milestones[0].milestoneKey).toBe('ib-posting')
    expect(milestones[0].order).toBe(0)
  })

  it('each milestone has correct order, milestoneKey, and initial state', () => {
    const milestones = computeMilestones(
      '2026-05-26',
      GOODS_CONFIG,
      NO_HOLIDAYS,
    )
    milestones.forEach((m, i) => {
      expect(m.order).toBe(i)
      expect(m.milestoneKey).toBe(GOODS_CONFIG.milestones[i].milestoneKey)
      expect(m.overrideDate).toBeNull()
      expect(m.status).toBe('auto-generated')
      expect(m.isEdited).toBe(false)
      expect(m.editHistory).toHaveLength(0)
    })
  })

  it('adds minDaysFromPrevious BEFORE skipping weekends (algorithm order)', () => {
    // 2026-04-24 is a Friday; +7 days = 2026-05-01 (Friday, but Labor Day if holiday present)
    // Without holidays: 2026-05-01 is Friday → valid working day
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-04-24', config, NO_HOLIDAYS)
    // 2026-04-24 + 7 = 2026-05-01 (Friday, no holiday) → stays 2026-05-01
    expect(milestones[1].computedDate).toBe('2026-05-01')
  })

  it('skips weekends: advances past Saturday and Sunday', () => {
    // 2026-05-20 is a Wednesday; +7 = 2026-05-27 (Wednesday) → no skip needed
    // 2026-05-21 is a Thursday; +7 = 2026-05-28 (Thursday) → no skip needed
    // 2026-05-22 is a Friday; +7 = 2026-05-29 (Friday) → no skip needed
    // 2026-05-18 is a Monday; +7 = 2026-05-25 (Monday) → no skip needed
    // For a case landing on Saturday:
    // 2026-05-19 is a Tuesday; +7 = 2026-05-26 (Tuesday) → no skip
    // 2026-05-16 is a Saturday; +7 = 2026-05-23 (Saturday) → advance to Monday 2026-05-25
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-05-16', config, NO_HOLIDAYS)
    // 2026-05-16 + 7 = 2026-05-23 (Saturday) → skip Sat/Sun → 2026-05-25 (Monday)
    expect(milestones[1].computedDate).toBe('2026-05-25')
  })

  it('skips Sunday correctly', () => {
    // 2026-05-17 is a Sunday; +7 = 2026-05-24 (Sunday) → advance to Monday 2026-05-25
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-05-17', config, NO_HOLIDAYS)
    expect(milestones[1].computedDate).toBe('2026-05-25')
  })

  it('skips declared holidays', () => {
    // 2026-04-24 is Friday; +7 = 2026-05-01 (Labor Day holiday + Friday)
    // Should advance past 2026-05-01 → 2026-05-04 (next Monday, no holiday)
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-04-24', config, SOME_HOLIDAYS)
    expect(milestones[1].computedDate).toBe('2026-05-04')
  })

  it('skips weekends AND holidays in combination', () => {
    // 2026-06-05 (Friday) + 7 = 2026-06-12 (Friday, Independence Day)
    // Should advance past 2026-06-12 → 2026-06-15 (Monday)
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-06-05', config, SOME_HOLIDAYS)
    expect(milestones[1].computedDate).toBe('2026-06-15')
  })

  it('preserves ibPostingDate for Day 0 even when it falls on a weekend', () => {
    // IB Posting date is always used as-is (Day 0 anchor) regardless of day-of-week
    const config = buildTwoMilestoneConfig(7)
    const milestones = computeMilestones('2026-05-16', config, NO_HOLIDAYS) // Saturday
    expect(milestones[0].computedDate).toBe('2026-05-16')
  })

  it('generates unique IDs for all milestones', () => {
    const milestones = computeMilestones(
      '2026-05-26',
      GOODS_CONFIG,
      NO_HOLIDAYS,
    )
    const ids = milestones.map((m) => m.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('produces monotonically non-decreasing computed dates', () => {
    const milestones = computeMilestones(
      '2026-05-26',
      GOODS_CONFIG,
      NO_HOLIDAYS,
    )
    for (let i = 1; i < milestones.length; i++) {
      expect(milestones[i].computedDate >= milestones[i - 1].computedDate).toBe(
        true,
      )
    }
  })

  it('handles civil-works category with different interval values', () => {
    const civilConfig: IntervalConfig = {
      category: 'civil-works',
      milestones: [
        {
          id: 'c-0',
          milestoneKey: 'ib-posting',
          milestoneName: 'IB Posting',
          minDaysFromPrevious: 0,
          maxDaysFromPrevious: null,
          order: 0,
          isOptional: false,
        },
        {
          id: 'c-1',
          milestoneKey: 'pre-bid-conference',
          milestoneName: 'Pre-Bid Conference',
          minDaysFromPrevious: 12,
          maxDaysFromPrevious: null,
          order: 1,
          isOptional: false,
        },
        {
          id: 'c-2',
          milestoneKey: 'bid-submission-opening',
          milestoneName: 'Bid Submission Opening',
          minDaysFromPrevious: 30,
          maxDaysFromPrevious: null,
          order: 2,
          isOptional: false,
        },
      ],
    }
    const milestones = computeMilestones('2026-05-26', civilConfig, NO_HOLIDAYS)
    expect(milestones).toHaveLength(3)
    expect(milestones[0].computedDate).toBe('2026-05-26')
    // 2026-05-26 + 12 = 2026-06-07 (Sunday) → advance to 2026-06-08 (Monday)
    expect(milestones[1].computedDate).toBe('2026-06-08')
  })
})

describe('cascadeRecalculate', () => {
  it('preserves downstream overrideDate while recomputing downstream computedDate', () => {
    const config = buildThreeMilestoneConfig(7, 7)
    const milestones: Array<BiddingMilestone> = [
      buildMilestone({
        id: 'm-0',
        order: 0,
        milestoneKey: 'ib-posting',
        name: 'IB Posting',
        computedDate: '2026-05-01',
      }),
      buildMilestone({
        id: 'm-1',
        order: 1,
        milestoneKey: 'pre-bid-conference',
        name: 'Pre-Bid Conference',
        computedDate: '2026-05-07',
        overrideDate: '2026-05-12',
        status: 'edited',
        isEdited: true,
        editHistory: [
          {
            originalDate: '2026-05-08',
            newDate: '2026-05-12',
            editedBy: 'tester',
            timestamp: '2026-05-01T08:00:00.000Z',
            reason: 'Adjusted to match committee availability',
          },
        ],
      }),
      buildMilestone({
        id: 'm-2',
        order: 2,
        milestoneKey: 'bid-submission-opening',
        name: 'Bid Submission Opening',
        computedDate: '2026-05-15',
        overrideDate: '2026-05-22',
        status: 'edited',
        isEdited: true,
        editHistory: [
          {
            originalDate: '2026-05-19',
            newDate: '2026-05-22',
            editedBy: 'tester',
            timestamp: '2026-05-02T08:00:00.000Z',
            reason: 'Adjusted for bid committee schedule',
          },
        ],
      }),
    ]

    const recalculated = cascadeRecalculate(milestones, 0, config, NO_HOLIDAYS)

    expect(recalculated[1].computedDate).toBe('2026-05-08')
    expect(recalculated[1].overrideDate).toBe('2026-05-12')
    expect(recalculated[2].computedDate).toBe('2026-05-19')
    expect(recalculated[2].overrideDate).toBe('2026-05-22')
  })

  it('uses the previous overrideDate as the cascade anchor for downstream milestones', () => {
    const config = buildThreeMilestoneConfig(7, 7)
    const milestones: Array<BiddingMilestone> = [
      buildMilestone({
        id: 'm-0',
        order: 0,
        milestoneKey: 'ib-posting',
        name: 'IB Posting',
        computedDate: '2026-05-01',
      }),
      buildMilestone({
        id: 'm-1',
        order: 1,
        milestoneKey: 'pre-bid-conference',
        name: 'Pre-Bid Conference',
        computedDate: '2026-05-08',
        overrideDate: '2026-05-12',
        status: 'edited',
        isEdited: true,
        editHistory: [
          {
            originalDate: '2026-05-08',
            newDate: '2026-05-12',
            editedBy: 'tester',
            timestamp: '2026-05-01T08:00:00.000Z',
            reason: 'Adjusted to match committee availability',
          },
        ],
      }),
      buildMilestone({
        id: 'm-2',
        order: 2,
        milestoneKey: 'bid-submission-opening',
        name: 'Bid Submission Opening',
        computedDate: '2026-05-16',
      }),
    ]

    const recalculated = cascadeRecalculate(milestones, 0, config, NO_HOLIDAYS)

    expect(recalculated[2].computedDate).toBe('2026-05-19')
  })

  it('throws a clear error when milestone config is missing for a downstream row', () => {
    const config = buildTwoMilestoneConfig(7)
    const milestones: Array<BiddingMilestone> = [
      buildMilestone({
        id: 'm-0',
        order: 0,
        milestoneKey: 'ib-posting',
        name: 'IB Posting',
        computedDate: '2026-05-01',
      }),
      buildMilestone({
        id: 'm-1',
        order: 1,
        milestoneKey: 'pre-bid-conference',
        name: 'Pre-Bid Conference',
        computedDate: '2026-05-08',
      }),
      buildMilestone({
        id: 'm-2',
        order: 2,
        milestoneKey: 'bid-submission-opening',
        name: 'Bid Submission Opening',
        computedDate: '2026-05-15',
      }),
    ]

    expect(() =>
      cascadeRecalculate(milestones, 0, config, NO_HOLIDAYS),
    ).toThrow('Missing milestone config for recalculation at index 2.')
  })
})
