import type { MouseEventHandler } from 'react'
import { Clock3 } from 'lucide-react'
import type { BiddingMasterCalendarEvent } from '../types'
import { cn } from '@/lib/utils'

interface BiddingMasterCalendarEventChipProps {
  event: BiddingMasterCalendarEvent
  onClick: MouseEventHandler<HTMLButtonElement>
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>
  isSelected?: boolean
}

function getEventChipTone(event: BiddingMasterCalendarEvent) {
  if (event.isProvisional) {
    return 'border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100'
  }

  if (event.isOverdue) {
    return 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
  }

  if (event.isDueSoon) {
    return 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
  }

  if (event.sourceType === 'locked') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
  }

  if (event.sourceType === 'draft') {
    return 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
  }

  return 'border-default-200 bg-background text-default-700 hover:bg-default-50'
}

export function BiddingMasterCalendarEventChip({
  event,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected = false,
}: BiddingMasterCalendarEventChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors',
        getEventChipTone(event),
        isSelected && 'ring-2 ring-info/40',
      )}
      title={`${event.milestoneName} • ${event.bacResolutionNumber}`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{event.milestoneName}</div>
        <div className="truncate text-[11px] opacity-80">
          {event.primaryProjectName}
        </div>
        <div className="truncate text-[11px] opacity-70">
          {event.bacResolutionNumber}
        </div>
        {event.isProvisional && (
          <div className="mt-0.5 text-[10px] italic opacity-60">
            Provisional
          </div>
        )}
      </div>
      {event.eventTime && (
        <span className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap text-[10px] opacity-80">
          <Clock3 className="h-3 w-3" />
          {event.eventTime}
        </span>
      )}
    </button>
  )
}
