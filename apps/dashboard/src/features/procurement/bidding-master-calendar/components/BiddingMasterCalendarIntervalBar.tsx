import React from 'react'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import type { BiddingMasterCalendarEvent } from '../types'
import type { RemainingDaysResult } from '../../bac-resolution/utils/remainingDays'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface CalendarWeekInterval {
  id: string
  eventId: string
  bacResolutionId: string
  milestoneKey: string
  milestoneName: string
  startDate: Date
  endDate: Date
  durationDays: number
  startCol: number // 1 to 7
  span: number // 1 to 7
  isStartEdge: boolean
  isEndEdge: boolean
  remainingInfo: RemainingDaysResult
  event: BiddingMasterCalendarEvent
}

interface BiddingMasterCalendarIntervalBarProps {
  interval: CalendarWeekInterval
  isSelected?: boolean
  onClick?: (event: BiddingMasterCalendarEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function getIntervalBarTheme(variant: RemainingDaysResult['variant']) {
  switch (variant) {
    case 'completed':
      return 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white shadow-xs ring-emerald-300'
    case 'destructive':
      return 'bg-red-600 hover:bg-red-700 border-red-700 text-white shadow-xs ring-red-300'
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 border-amber-700 text-white shadow-xs ring-amber-300'
    case 'success':
      return 'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white shadow-xs ring-blue-300'
    case 'none':
    default:
      return 'bg-slate-700 hover:bg-slate-800 border-slate-800 text-white shadow-xs ring-slate-300'
  }
}

export function BiddingMasterCalendarIntervalBar({
  interval,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: BiddingMasterCalendarIntervalBarProps) {
  const { isStartEdge, isEndEdge, remainingInfo, event } = interval
  const themeClass = getIntervalBarTheme(remainingInfo.variant)

  return (
    <div
      style={{
        gridColumnStart: interval.startCol,
        gridColumnEnd: `span ${interval.span}`,
      }}
      className="relative z-10 my-0.5"
    >
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onClick?.(event)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              className={cn(
                'w-full flex items-center justify-between gap-1.5 px-2 py-1 text-left text-xs font-medium border transition-all cursor-pointer select-none',
                themeClass,
                isStartEdge ? 'rounded-l-md ml-0.5' : 'rounded-l-none border-l-dashed border-l-white/70 pl-1',
                isEndEdge ? 'rounded-r-md mr-0.5' : 'rounded-r-none border-r-dashed border-r-white/70 pr-1',
                isSelected && 'ring-2 ring-offset-1 ring-primary font-semibold',
              )}
            >
              <div className="flex items-center gap-1 min-w-0 flex-1">
                {!isStartEdge && (
                  <span className="text-[10px] font-bold opacity-90 shrink-0 leading-none">
                    ◀
                  </span>
                )}
                <span className="truncate text-[11px] font-semibold tracking-tight">
                  {interval.milestoneName}
                </span>
                {event.eventTime && (
                  <span className="text-[10px] opacity-80 shrink-0 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5 inline" />
                    {event.eventTime}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] opacity-90 font-mono">
                  {interval.durationDays}d
                </span>
                <span className="bg-black/25 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight">
                  {remainingInfo.label}
                </span>
                {!isEndEdge && (
                  <span className="text-[10px] font-bold opacity-80 shrink-0 leading-none">
                    ▶
                  </span>
                )}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="p-3 text-xs max-w-sm space-y-1.5 bg-slate-900 text-white shadow-xl border-slate-800"
          >
            <div className="font-bold text-sm text-slate-100 flex items-center justify-between gap-2">
              <span>{interval.milestoneName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">
                {remainingInfo.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p className="text-slate-200">
                <strong>Project:</strong> {event.primaryProjectName}
              </p>
              <p>
                <strong>Resolution:</strong> {event.bacResolutionNumber}
              </p>
              <p>
                <strong>Period:</strong>{' '}
                {format(interval.startDate, 'MMM d, yyyy')} –{' '}
                {format(interval.endDate, 'MMM d, yyyy')}{' '}
                <span className="font-mono">({interval.durationDays} days)</span>
              </p>
              <p>
                <strong>Statutory Limit:</strong>{' '}
                {remainingInfo.maxDays !== null
                  ? `${remainingInfo.maxDays} calendar days`
                  : 'No statutory maximum (em-dash)'}
              </p>
              <p className="pt-0.5 text-[10px] text-slate-400">
                Click bar to open milestone details in drawer.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
