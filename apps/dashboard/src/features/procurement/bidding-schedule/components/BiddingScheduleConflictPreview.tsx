import { Link } from '@tanstack/react-router'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import type { ScheduleConflictPreview } from '../utils/buildScheduleConflictPreview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BiddingScheduleConflictPreviewProps {
  bacResolutionId: string
  preview: ScheduleConflictPreview
}

export function BiddingScheduleConflictPreview({
  bacResolutionId,
  preview,
}: BiddingScheduleConflictPreviewProps) {
  if (
    preview.hardConflicts.length === 0 &&
    preview.overloadedDates.length === 0
  ) {
    return (
      <Alert variant="outline" color="success">
        <CalendarClock className="h-4 w-4" />
        <div>
          <AlertTitle>No projected calendar conflicts</AlertTitle>
          <AlertDescription>
            Confirming this schedule will not introduce any current hard
            conflict or overloaded-day warning in TC-03.
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <Alert variant="outline" color="warning">
      <AlertTriangle className="h-4 w-4" />
      <div className="space-y-3">
        <div>
          <AlertTitle>TC-03 conflict preview</AlertTitle>
          <AlertDescription>
            Review projected same-day collisions before confirming this bidding
            schedule.
          </AlertDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {preview.hardConflicts.length > 0 ? (
            <Badge variant="outline" color="destructive">
              {preview.hardConflicts.length} hard conflict
              {preview.hardConflicts.length === 1 ? '' : 's'}
            </Badge>
          ) : null}
          {preview.overloadedDates.length > 0 ? (
            <Badge variant="outline" color="warning">
              {preview.overloadedDates.length} overloaded date
              {preview.overloadedDates.length === 1 ? '' : 's'}
            </Badge>
          ) : null}
        </div>

        {preview.hardConflicts.length > 0 ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            {preview.hardConflicts.slice(0, 3).map((conflict) => (
              <p key={`${conflict.date}-${conflict.milestoneName}`}>
                {conflict.milestoneName} on {conflict.date} also appears in{' '}
                {conflict.otherResolutionNumbers.join(', ')}.
              </p>
            ))}
          </div>
        ) : null}

        <Button asChild variant="outline" className="gap-2">
          <Link
            to="/v2/bidding-master-calendar"
            search={{ selectedResolutionId: bacResolutionId }}
          >
            Open Master Calendar
          </Link>
        </Button>
      </div>
    </Alert>
  )
}
