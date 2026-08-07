import { describe, expect, it } from 'vitest'
import type { BiddingMasterCalendarAgendaGroup } from '../types'
import { buildCalendarAgendaPrintHtml } from './exportCalendarAgendaPrint'

const mockAgendaGroups: BiddingMasterCalendarAgendaGroup[] = [
  {
    date: '2026-05-22',
    label: 'May 22, 2026',
    bucket: {
      date: '2026-05-22',
      hardConflictGroups: [],
      hardConflictCount: 0,
      isOverloaded: true,
      overloadCount: 3,
      appBands: [],
      dueSoonCount: 1,
      overdueCount: 0,
      events: [
        {
          id: 'event-1',
          bacResolutionId: 'bac-resolution-009',
          bacResolutionNumber: 'BAC-2026-009',
          scheduleId: 'schedule-009',
          scheduleStatus: 'confirmed',
          fiscalYear: '2026',
          procurementCategory: 'goods-and-services',
          projectNames: ['Road rehabilitation — Phase 1'],
          primaryProjectName: 'Road rehabilitation — Phase 1',
          officeLabel: 'Engineering Office',
          linkedCprCount: 2,
          milestoneId: 'milestone-1',
          milestoneKey: 'bid-submission-opening',
          milestoneName: 'Bid submission deadline',
          milestoneOrder: 4,
          eventDate: '2026-05-22',
          eventTime: '10:00',
          isEdited: false,
          sourceType: 'confirmed',
          derivedProjectStatus: 'due-soon',
          appTargetMonth: '2026-05',
          isDueSoon: true,
          isOverdue: false,
        },
      ],
    },
  },
]

describe('buildCalendarAgendaPrintHtml', () => {
  it('renders agenda-oriented headings and milestone rows', () => {
    const html = buildCalendarAgendaPrintHtml(mockAgendaGroups)

    expect(html).toContain('Agenda snapshot')
    expect(html).toContain('May 22, 2026')
    expect(html).toContain(
      'Bid submission deadline - Road rehabilitation — Phase 1 (BAC-2026-009)',
    )
    expect(html).toContain('Engineering Office')
    expect(html).toContain('due-soon')
  })

  it('escapes user-controlled event fields before writing print html', () => {
    const html = buildCalendarAgendaPrintHtml([
      {
        ...mockAgendaGroups[0],
        label: '<May & Agenda>',
        bucket: {
          ...mockAgendaGroups[0].bucket,
          events: [
            {
              ...mockAgendaGroups[0].bucket.events[0],
              milestoneName: '<script>alert(1)</script>',
              primaryProjectName: 'Project & Sons',
              bacResolutionNumber: 'BAC-"009"',
              officeLabel: "Office 'A'",
              eventTime: '<09:00>',
              derivedProjectStatus: '<pending>',
            },
          ],
        },
      },
    ])

    expect(html).toContain('&lt;May &amp; Agenda&gt;')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Project &amp; Sons')
    expect(html).toContain('BAC-&quot;009&quot;')
    expect(html).toContain('Office &#39;A&#39;')
    expect(html).toContain('&lt;09:00&gt;')
    expect(html).toContain('&lt;pending&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
