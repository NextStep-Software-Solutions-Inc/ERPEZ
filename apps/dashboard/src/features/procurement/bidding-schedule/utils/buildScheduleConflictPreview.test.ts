import { describe, expect, it } from 'vitest'
import type { BiddingSchedule } from '../types'
import { buildScheduleConflictPreview } from './buildScheduleConflictPreview'

function createSchedule(overrides: Partial<BiddingSchedule>): BiddingSchedule {
  return {
    id: 'schedule-test',
    bacResolutionId: 'bac-resolution-test',
    bacResolutionNumber: 'BAC-RES-2026-TEST',
    procurementCategory: 'goods-and-services',
    ibPostingDate: '2026-05-01',
    status: 'draft',
    milestones: [
      {
        id: 'milestone-a',
        order: 0,
        milestoneKey: 'ib-posting',
        name: 'IB Posting',
        computedDate: '2026-05-10',
        overrideDate: null,
        time: null,
        status: 'auto-generated',
        isEdited: false,
        editHistory: [],
      },
      {
        id: 'milestone-b',
        order: 1,
        milestoneKey: 'bid-submission-opening',
        name: 'Bid Submission and Opening',
        computedDate: '2026-05-22',
        overrideDate: null,
        time: null,
        status: 'auto-generated',
        isEdited: false,
        editHistory: [],
      },
    ],
    createdBy: 'Tester',
    createdAt: '2026-05-01T00:00:00.000Z',
    confirmedAt: null,
    confirmedBy: null,
    lockedAt: null,
    lockedBy: null,
    ...overrides,
  }
}

describe('buildScheduleConflictPreview', () => {
  it('detects hard conflicts and overloaded dates against other schedules', () => {
    const currentSchedule = createSchedule({})
    const otherSchedules = [
      createSchedule({
        id: 'schedule-other-1',
        bacResolutionId: 'bac-resolution-009',
        bacResolutionNumber: 'BAC-RES-2026-009',
        status: 'confirmed',
        milestones: [
          {
            id: 'other-1',
            order: 0,
            milestoneKey: 'bid-submission-opening',
            name: 'Bid Submission and Opening',
            computedDate: '2026-05-22',
            overrideDate: null,
            time: null,
            status: 'auto-generated',
            isEdited: false,
            editHistory: [],
          },
        ],
      }),
      createSchedule({
        id: 'schedule-other-2',
        bacResolutionId: 'bac-resolution-010',
        bacResolutionNumber: 'BAC-RES-2026-010',
        status: 'confirmed',
        milestones: [
          {
            id: 'other-2',
            order: 0,
            milestoneKey: 'pre-bid-conference',
            name: 'Pre-Bid Conference',
            computedDate: '2026-05-22',
            overrideDate: null,
            time: null,
            status: 'auto-generated',
            isEdited: false,
            editHistory: [],
          },
        ],
      }),
    ]

    const preview = buildScheduleConflictPreview({
      schedule: currentSchedule,
      otherSchedules,
    })

    expect(preview.hardConflicts).toEqual([
      {
        date: 'May 22, 2026',
        milestoneName: 'Bid Submission and Opening',
        otherResolutionNumbers: ['BAC-RES-2026-009'],
      },
    ])
    expect(preview.overloadedDates).toContainEqual({
      date: 'May 22, 2026',
      eventCount: 3,
    })
  })
})
