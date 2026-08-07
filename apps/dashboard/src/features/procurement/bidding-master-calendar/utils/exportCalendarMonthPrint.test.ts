import { describe, expect, it } from 'vitest'
import type { BiddingMasterCalendarDayBucket } from '../types'
import { buildCalendarMonthPrintHtml } from './exportCalendarMonthPrint'

const mockDayBuckets: Array<BiddingMasterCalendarDayBucket> = [
  {
    date: '<2026-05-22>',
    events: [
      {
        id: 'event-1',
        bacResolutionId: 'bac-resolution-001',
        bacResolutionNumber: 'BAC-<001>',
        scheduleId: 'schedule-001',
        scheduleStatus: 'confirmed',
        fiscalYear: '2026',
        procurementCategory: 'goods-and-services',
        projectNames: ['Unsafe'],
        primaryProjectName: 'Project <Unsafe>',
        officeLabel: 'Engineering',
        linkedCprCount: 1,
        milestoneId: 'milestone-1',
        milestoneKey: 'ib-posting',
        milestoneName: '<Milestone>',
        milestoneOrder: 0,
        eventDate: '2026-05-22',
        eventTime: null,
        isEdited: false,
        sourceType: 'confirmed',
        derivedProjectStatus: 'due-soon',
        appTargetMonth: null,
        isDueSoon: true,
        isOverdue: false,
      },
    ],
    hardConflictGroups: [],
    hardConflictCount: 0,
    isOverloaded: false,
    overloadCount: 0,
    appBands: [],
    dueSoonCount: 1,
    overdueCount: 0,
  },
]

describe('buildCalendarMonthPrintHtml', () => {
  it('escapes bucket and event labels before generating month print html', () => {
    const html = buildCalendarMonthPrintHtml({
      currentMonth: new Date('2026-05-01T00:00:00.000Z'),
      dayBuckets: mockDayBuckets,
    })

    expect(html).toContain('&lt;2026-05-22&gt;')
    expect(html).toContain(
      '&lt;Milestone&gt; - Project &lt;Unsafe&gt; (BAC-&lt;001&gt;)',
    )
    expect(html).not.toContain('<Milestone> - Project <Unsafe> (BAC-<001>)')
  })
})
