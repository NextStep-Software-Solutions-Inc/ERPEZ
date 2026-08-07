import type { BiddingMasterCalendarSummaryMetrics } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BiddingMasterCalendarSummaryProps {
  summary: BiddingMasterCalendarSummaryMetrics
}

const SUMMARY_CARDS = [
  {
    key: 'totalSchedules',
    label: 'Active Schedules',
  },
  {
    key: 'totalVisibleMilestones',
    label: 'Visible Milestones',
  },
  {
    key: 'conflictDays',
    label: 'Conflict Days',
  },
  {
    key: 'overloadedDays',
    label: 'Overloaded Days',
  },
  {
    key: 'dueSoonItems',
    label: 'Due Soon',
  },
  {
    key: 'overdueItems',
    label: 'Overdue',
  },
] as const

export function BiddingMasterCalendarSummary({
  summary,
}: BiddingMasterCalendarSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {SUMMARY_CARDS.map((card) => (
        <Card key={card.key} className="border border-default-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {summary[card.key]}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
