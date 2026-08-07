import { format, parseISO } from 'date-fns'
import { AlertTriangle, CalendarClock, Flame } from 'lucide-react'
import type {
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarSummaryMetrics,
} from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface BiddingMasterCalendarAlertBannerProps {
  summary: BiddingMasterCalendarSummaryMetrics
  dayBuckets: Array<BiddingMasterCalendarDayBucket>
  conflictGroups: Array<BiddingMasterCalendarConflictGroup>
}

export function BiddingMasterCalendarAlertBanner({
  summary,
  dayBuckets,
  conflictGroups,
}: BiddingMasterCalendarAlertBannerProps) {
  if (
    summary.conflictDays === 0 &&
    summary.overloadedDays === 0 &&
    summary.overdueItems === 0
  ) {
    return null
  }

  const busiestDays = [...dayBuckets]
    .filter((bucket) => bucket.events.length > 0)
    .sort((left, right) => right.events.length - left.events.length)
    .slice(0, 3)
  const nextConflict = conflictGroups.at(0)

  return (
    <Alert variant="outline" color="warning">
      <AlertTriangle className="h-4 w-4" />
      <div className="space-y-3">
        <div>
          <AlertTitle>TC-03 operational alerts</AlertTitle>
          <AlertDescription>
            Surface conflict-heavy and overloaded calendar days before scanning
            individual month cells.
          </AlertDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" color="destructive">
            {summary.conflictDays} conflict day
            {summary.conflictDays === 1 ? '' : 's'}
          </Badge>
          <Badge variant="outline" color="warning">
            {summary.overloadedDays} overloaded day
            {summary.overloadedDays === 1 ? '' : 's'}
          </Badge>
          <Badge variant="outline" color="secondary">
            {summary.dueSoonItems} due soon
          </Badge>
          <Badge variant="outline" color="destructive">
            {summary.overdueItems} overdue
          </Badge>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-default-200 bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-primary" />
              Highest workload days
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {busiestDays.map((bucket) => (
                <p key={bucket.date}>
                  {format(parseISO(bucket.date), 'MMM d')}:{' '}
                  {bucket.events.length} milestone events
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-default-200 bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-warning" />
              Next hard conflict
            </div>
            <div className="text-sm text-muted-foreground">
              {nextConflict ? (
                <p>
                  {nextConflict.milestoneName} on{' '}
                  {format(parseISO(nextConflict.date), 'MMM d, yyyy')} has{' '}
                  {nextConflict.events.length} overlapping BAC workflows.
                </p>
              ) : (
                <p>
                  No hard conflicts are currently visible in the filtered view.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Alert>
  )
}
