import { useRef, useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { useVirtualizer } from '@tanstack/react-virtual'
import { BiddingMasterCalendarConflictBadge } from './BiddingMasterCalendarConflictBadge'
import { BiddingMasterCalendarOverloadBadge } from './BiddingMasterCalendarOverloadBadge'
import type {
  BiddingMasterCalendarAgendaGroup,
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
} from '../types'
import { getStatusLabel, getStatusTone } from '../utils/statusUtils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/services/api'
import { buildAgendaGroups, applyCalendarFilters } from '../utils'

interface BiddingMasterCalendarAgendaViewProps {
  filters: BiddingMasterCalendarFilters
  onOpenMilestone: (event: BiddingMasterCalendarEvent) => void
  onPreviewMilestone?: (event: BiddingMasterCalendarEvent | null) => void
  selectedEventId?: string | null
}

export function BiddingMasterCalendarAgendaView({
  filters,
  onOpenMilestone,
  onPreviewMilestone,
  selectedEventId = null,
}: BiddingMasterCalendarAgendaViewProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const [accumulatedEvents, setAccumulatedEvents] = useState<BiddingMasterCalendarEvent[]>([])
  const [loadedMonths, setLoadedMonths] = useState<string[]>([])
  const [nextMonthToFetch, setNextMonthToFetch] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const fetchMonth = async (monthDate: Date) => {
    const monthStr = format(monthDate, 'yyyy-MM')
    if (loadedMonths.includes(monthStr)) return
    
    setIsLoading(true)
    try {
      const from = startOfMonth(monthDate).toISOString()
      const to = endOfMonth(monthDate).toISOString()
      const response = await api.get<any>(
        `/bac/calendar-events?From=${encodeURIComponent(from)}&To=${encodeURIComponent(to)}`
      )
      if (response.data?.succeeded) {
        const rawData = response.data.data
        const rawEvents = rawData && Array.isArray(rawData.events)
          ? rawData.events
          : (Array.isArray(rawData) ? rawData : [])
        
        const mappedEvents: BiddingMasterCalendarEvent[] = rawEvents.map((evt: any) => ({
          id: evt.id,
          bacResolutionId: evt.projectId,
          bacResolutionNumber: evt.status || 'Pending',
          scheduleId: evt.projectId,
          scheduleStatus: 'confirmed',
          fiscalYear: '2026',
          procurementCategory: 'goods',
          projectNames: [evt.projectTitle],
          primaryProjectName: evt.projectTitle,
          officeLabel: evt.venue || 'N/A',
          linkedCprCount: 0,
          milestoneId: evt.procurementActivityTypeId,
          milestoneKey: evt.procurementActivityTypeId,
          milestoneName: evt.procurementActivityTypeName,
          milestoneOrder: 0,
          eventDate: evt.startDate,
          eventTime: format(new Date(evt.startDate), 'HH:mm'),
          isEdited: false,
          executionStatus: 'pending',
          sourceType: 'confirmed',
          derivedProjectStatus: 'in-progress',
          appTargetMonth: null,
          isDueSoon: false,
          isOverdue: false,
          isProvisional: false,
        }))

        setAccumulatedEvents((prev) => {
          const existingIds = new Set(prev.map(e => e.id))
          const newEvents = mappedEvents.filter(e => !existingIds.has(e.id))
          return [...prev, ...newEvents]
        })
        setLoadedMonths((prev) => [...prev, monthStr])
      }
    } catch (error) {
      console.error('Failed to fetch agenda events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch initial month on mount
  useEffect(() => {
    fetchMonth(nextMonthToFetch)
    setNextMonthToFetch(addMonths(nextMonthToFetch, 1))
  }, [])

  const agendaGroups = useMemo(() => {
    const filtered = applyCalendarFilters(accumulatedEvents, filters)
    return buildAgendaGroups(filtered, [])
  }, [accumulatedEvents, filters])

  const rowVirtualizer = useVirtualizer({
    count: agendaGroups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 4,
  })

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const threshold = 150 // pixels from bottom to trigger fetch
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + threshold
    
    if (isAtBottom && !isLoading) {
      fetchMonth(nextMonthToFetch)
      setNextMonthToFetch(addMonths(nextMonthToFetch, 1))
    }
  }

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Agenda View</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={parentRef}
          onScroll={handleScroll}
          className="h-[720px] overflow-auto rounded-lg border border-default-200 bg-default-50/30"
        >
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const group = agendaGroups[virtualRow.index]

              return (
                <div
                  key={group.date}
                  className="absolute left-0 top-0 w-full px-4 py-3"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="rounded-xl border border-default-200 bg-background p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">
                          {group.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {group.bucket.events.length} milestone
                          {group.bucket.events.length === 1 ? '' : 's'}{' '}
                          scheduled
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.bucket.hardConflictCount > 0 ? (
                          <BiddingMasterCalendarConflictBadge
                            count={group.bucket.hardConflictCount}
                          />
                        ) : null}
                        {group.bucket.isOverloaded ? (
                          <BiddingMasterCalendarOverloadBadge
                            count={group.bucket.overloadCount}
                          />
                        ) : null}
                        {group.bucket.appBands.length > 0 ? (
                          <Badge variant="outline" color="secondary">
                            APP target month
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {group.bucket.hardConflictGroups.length > 0 ? (
                      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <div className="font-semibold">
                          Hard conflict detected
                        </div>
                        <div className="mt-1">
                          {group.bucket.hardConflictGroups
                            .map((conflict) => conflict.milestoneName)
                            .join(', ')}
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {group.bucket.events.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onMouseEnter={() => onPreviewMilestone?.(event)}
                          onMouseLeave={() => onPreviewMilestone?.(null)}
                          onClick={() => onOpenMilestone(event)}
                          className={[
                            'flex w-full flex-col gap-2 rounded-lg border border-default-200 bg-background px-3 py-3 text-left transition-colors hover:bg-default-50 md:flex-row md:items-center md:justify-between',
                            selectedEventId === event.id
                              ? 'ring-2 ring-info/40'
                              : '',
                          ].join(' ')}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                {event.milestoneName}
                              </span>
                              <Badge
                                variant="outline"
                                color={getStatusTone(event)}
                              >
                                {getStatusTone(event) ? getStatusLabel(event) : 'Scheduled'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {event.primaryProjectName} •{' '}
                              {event.bacResolutionNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.officeLabel} • {event.linkedCprCount}{' '}
                              linked CPR{event.linkedCprCount === 1 ? '' : 's'}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:justify-end">
                            <Badge variant="outline" color="secondary">
                              {event.procurementCategory}
                            </Badge>
                            <Badge variant="outline" color="secondary">
                              {format(parseISO(event.eventDate), 'MMM d, yyyy')}
                              {event.eventTime ? ` • ${event.eventTime}` : ''}
                            </Badge>
                            {event.appTargetMonth ? (
                              <Badge variant="outline" color="secondary">
                                APP {event.appTargetMonth}
                              </Badge>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading more events...
            </div>
          )}
          {!isLoading && agendaGroups.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No agenda items match the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
