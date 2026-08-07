import { Link } from '@tanstack/react-router'
import { ArrowLeft, BadgeCheck, CirclePlay, Lock, Map } from 'lucide-react'
import type { BiddingSchedule } from '../types'
import type { BacResolutionListRoutePath } from '../../bac-resolution/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BiddingScheduleActionBarProps {
  schedule: BiddingSchedule | null
  onConfirm: () => void
  isLoading?: boolean
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BiddingScheduleActionBar({
  schedule,
  onConfirm,
  isLoading = false,
  bacListRoutePath = '/v2/bac-resolutions',
}: BiddingScheduleActionBarProps) {
  if (!schedule) {
    return null
  }

  if (schedule.status === 'locked') {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 text-muted-foreground">
        <Button asChild variant="outline" className="gap-2">
          <Link
            to={bacListRoutePath}
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <ArrowLeft className="h-4 w-4" />
            Open BAC
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link
            to="/v2/bidding-master-calendar"
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <Map className="h-4 w-4" />
            Open Calendar
          </Link>
        </Button>
        <Lock className="h-4 w-4" />
        <Badge variant="outline" color="warning">
          Schedule Locked
        </Badge>
      </div>
    )
  }

  if (schedule.status === 'confirmed') {
    return (
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link
            to={bacListRoutePath}
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <ArrowLeft className="h-4 w-4" />
            Open BAC
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link
            to="/v2/bidding-master-calendar"
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <Map className="h-4 w-4" />
            Open Calendar
          </Link>
        </Button>
        <Badge variant="outline" color="success">
          Confirmed
        </Badge>
        <p className="text-sm text-muted-foreground">
          Posting the PBD to PhilGEPS will lock this schedule downstream.
        </p>
        <Button asChild variant="outline" className="gap-2">
          <Link
            to="/v2/bidding-documents/$bacResolutionId"
            params={{ bacResolutionId: schedule.bacResolutionId }}
          >
            <CirclePlay className="h-4 w-4" />
            Proceed to PBD
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button asChild variant="outline" className="gap-2">
        <Link
          to={bacListRoutePath}
          search={{ selectedResolutionId: schedule.bacResolutionId }}
        >
          <ArrowLeft className="h-4 w-4" />
          Open BAC
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link
          to="/v2/bidding-master-calendar"
          search={{ selectedResolutionId: schedule.bacResolutionId }}
        >
          <Map className="h-4 w-4" />
          Open Calendar
        </Link>
      </Button>
      <p className="text-sm text-muted-foreground">
        Confirm the schedule after reviewing the milestone dates.
      </p>
      <Button onClick={onConfirm} disabled={isLoading} className="gap-2">
        <BadgeCheck className="h-4 w-4" />
        Confirm Schedule
      </Button>
    </div>
  )
}
