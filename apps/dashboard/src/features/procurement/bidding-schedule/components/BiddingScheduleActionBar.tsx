import { Link } from '@tanstack/react-router'
import { ArrowLeft, BadgeCheck, CirclePlay, Lock, Map, RefreshCw } from 'lucide-react'
import type { BiddingSchedule } from '../types'
import type { BacResolutionListRoutePath } from '../../bac-resolution/types'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'
import { Button } from '@/components/ui/button'

interface BiddingScheduleActionBarProps {
  schedule: BiddingSchedule | null
  onConfirm: () => void
  onLock?: () => void
  onRegenerate?: () => void
  isLoading?: boolean
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BiddingScheduleActionBar({
  schedule,
  onConfirm,
  onLock,
  onRegenerate,
  isLoading = false,
  bacListRoutePath = '/v2/bac-resolutions',
}: BiddingScheduleActionBarProps) {
  if (!schedule) {
    return null
  }

  if (schedule.status === 'locked') {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link
            to={bacListRoutePath}
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <ArrowLeft className="h-4 w-4" />
            Open BAC
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link
            to="/v2/bidding-master-calendar"
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <Map className="h-4 w-4" />
            Open Calendar
          </Link>
        </Button>
        <ScheduleStatusBadge status="locked" />
      </div>
    )
  }

  if (schedule.status === 'confirmed') {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link
            to={bacListRoutePath}
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <ArrowLeft className="h-4 w-4" />
            Open BAC
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link
            to="/v2/bidding-master-calendar"
            search={{ selectedResolutionId: schedule.bacResolutionId }}
          >
            <Map className="h-4 w-4" />
            Open Calendar
          </Link>
        </Button>
        <ScheduleStatusBadge status="confirmed" />
        {onLock && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLock}
            disabled={isLoading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Lock className="h-4 w-4" />
            Lock Schedule
          </Button>
        )}
        <Button asChild variant="default" size="sm" className="gap-2">
          <Link to="/v2/bidding-documents">
            <CirclePlay className="h-4 w-4" />
            Proceed to PBD
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link
          to={bacListRoutePath}
          search={{ selectedResolutionId: schedule.bacResolutionId }}
        >
          <ArrowLeft className="h-4 w-4" />
          Open BAC
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link
          to="/v2/bidding-master-calendar"
          search={{ selectedResolutionId: schedule.bacResolutionId }}
        >
          <Map className="h-4 w-4" />
          Open Calendar
        </Link>
      </Button>
      {onRegenerate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      )}
      <Button
        size="sm"
        onClick={onConfirm}
        disabled={isLoading}
        className="gap-2"
      >
        <BadgeCheck className="h-4 w-4" />
        Confirm Schedule
      </Button>
    </div>
  )
}
