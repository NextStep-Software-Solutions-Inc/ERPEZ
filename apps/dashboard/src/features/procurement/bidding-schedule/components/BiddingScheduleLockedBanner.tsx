import { format, parseISO } from 'date-fns'
import { Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BiddingScheduleLockedBannerProps {
  lockedAt: string
  lockedBy: string
}

export function BiddingScheduleLockedBanner({
  lockedAt,
  lockedBy,
}: BiddingScheduleLockedBannerProps) {
  return (
    <Alert variant="outline" color="warning" className="border-warning/30">
      <Lock className="h-5 w-5" />
      <div>
        <AlertTitle>Schedule Locked — PBD Posted to PhilGEPS</AlertTitle>
        <AlertDescription>
          Locked on {format(parseISO(lockedAt), 'MMM d, yyyy h:mm a')} by{' '}
          {lockedBy}. This lock is applied after the downstream PBD posting
          step. To amend dates, initiate a Supplemental Bid Bulletin.
        </AlertDescription>
      </div>
    </Alert>
  )
}
