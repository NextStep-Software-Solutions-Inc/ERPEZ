import { describe, expect, it } from 'vitest'
import type { BiddingMasterCalendarAgendaGroup } from '../types'
import { buildCalendarAgendaTableHtml } from './exportCalendarAgendaTable'

const mockAgendaGroups: Array<BiddingMasterCalendarAgendaGroup> = [
  {
    date: '2026-05-22',
    label: 'May 22, 2026',
    bucket: {
      date: '2026-05-22',
      hardConflictGroups: [],
      hardConflictCount: 0,
      isOverloaded: false,
      overloadCount: 0,
      appBands: [],
      dueSoonCount: 0,
      overdueCount: 0,
      events: [
        {
          id: 'event-1',
          bacResolutionId: 'bac-resolution-001',
          bacResolutionNumber: 'BAC-2026-001',
          scheduleId: 'schedule-001',
          scheduleStatus: 'confirmed',
          fiscalYear: '2026',
          procurementCategory: 'goods-and-services',
          projectNames: ['=cmd'],
          primaryProjectName: '=cmd',
          officeLabel: '<Finance>',
          linkedCprCount: 1,
          milestoneId: 'milestone-1',
          milestoneKey: 'ib-posting',
          milestoneName: '@danger',
          milestoneOrder: 0,
          eventDate: '2026-05-22',
          eventTime: '+09:00',
          isEdited: false,
          sourceType: 'confirmed',
          derivedProjectStatus: '-overdue',
          appTargetMonth: '2026-05',
          isDueSoon: false,
          isOverdue: false,
        },
      ],
    },
  },
]

describe('buildCalendarAgendaTableHtml', () => {
  it('escapes html and neutralizes spreadsheet formula prefixes', () => {
    const html = buildCalendarAgendaTableHtml(mockAgendaGroups)

    expect(html).toContain('<td>&#39;@danger</td>')
    expect(html).toContain('<td>&#39;=cmd</td>')
    expect(html).toContain('<td>&lt;Finance&gt;</td>')
    expect(html).toContain('<td>&#39;+09:00</td>')
    expect(html).toContain('<td>&#39;-overdue</td>')
    expect(html).not.toContain('<td>@danger</td>')
    expect(html).not.toContain('<td>=cmd</td>')
  })
})
