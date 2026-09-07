import { useRef, useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { useVirtualizer } from '@tanstack/react-virtual'
import { BiddingMasterCalendarConflictBadge } from './BiddingMasterCalendarConflictBadge'
import { BiddingMasterCalendarOverloadBadge } from './BiddingMasterCalendarOverloadBadge'
import type {
  BiddingMasterCalendarAgendaGroup,
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
} from '../types'
import type {
  ApiResponse,
  CalendarEventsWithSummary,
  CalendarEvent,
  MilestoneExecutionStatus,
  ProcurementCategory,
  BiddingScheduleStatus,
} from '../../bidding-schedule/types'
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
  const [accumulatedEvents, setAccumulatedEvents] = useState<
    BiddingMasterCalendarEvent[]
  >([])
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
      const response = await api.get<ApiResponse<CalendarEventsWithSummary>>(
        `/bac/calendar-events?From=${encodeURIComponent(from)}&To=${encodeURIComponent(to)}`,
      )
      if (response.data?.succeeded && response.data.data) {
        const rawData = response.data.data
        const rawEvents: CalendarEvent[] = Array.isArray(rawData.events)
          ? rawData.events
          : []

        const mappedEvents: BiddingMasterCalendarEvent[] = rawEvents.map(
          (evt) => {
            const eventDate = evt.startDate.includes('T')
              ? evt.startDate.split('T')[0]
              : evt.startDate
            let eventTime: string | null = null
            try {
              eventTime = format(new Date(evt.startDate), 'HH:mm')
            } catch {
              eventTime = null
            }

            const executionStatus =
              (evt.status.toLowerCase() as MilestoneExecutionStatus) ||
              'pending'
            const procurementCategory: ProcurementCategory =
              evt.procurementCategory || 'goods'
            const scheduleStatus: BiddingScheduleStatus =
              evt.scheduleStatus || 'draft'

            return {
              id: evt.id,
              bacResolutionId: evt.bacResolutionId || evt.projectId,
              bacResolutionNumber:
                evt.bacResolutionNumber || evt.status || 'Pending',
              scheduleId: evt.projectId,
              scheduleStatus,
              fiscalYear: evt.fiscalYear
                ? String(evt.fiscalYear)
                : String(new Date(evt.startDate).getFullYear()),
              procurementCategory,
              projectNames: [evt.projectTitle],
              primaryProjectName: evt.projectTitle,
              officeLabel: evt.officeLabel || evt.venue || 'BAC Office',
              linkedCprCount: 0,
              milestoneId: evt.procurementActivityTypeId,
              milestoneKey: evt.milestoneKey || evt.procurementActivityTypeId,
              milestoneName: evt.procurementActivityTypeName,
              milestoneOrder: 0,
              eventDate,
              eventTime,
              isEdited: false,
              executionStatus,
              sourceType: scheduleStatus,
              derivedProjectStatus: 'in-progress',
              appTargetMonth: null,
              isDueSoon: false,
              isOverdue: false,
              isProvisional: scheduleStatus === 'draft',
            }
          },
        )

        setAccumulatedEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id))
          const newEvents = mappedEvents.filter((e) => !existingIds.has(e.id))
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
    setNextMonthToFetch((prev) => addMonths(prev, 1))
  }, [])

  // Filter the accumulated events by the active UI filters
  const filteredEvents = useMemo(() => {
    return applyCalendarFilters(accumulatedEvents, filters)
  }, [accumulatedEvents, filters])

  // Group filtered events into agenda day buckets
  const agendaGroups: BiddingMasterCalendarAgendaGroup[] = useMemo(() => {
    return buildAgendaGroups(filteredEvents, [])
  }, [filteredEvents])

  const rowVirtualizer = useVirtualizer({
    count: agendaGroups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  })

  // Infinite scroll threshold check
  const handleScroll = () => {
    if (!parentRef.current || isLoading) return
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    if (scrollHeight - scrollTop - clientHeight < 300) {
      fetchMonth(nextMonthToFetch)
      setNextMonthToFetch((prev) => addMonths(prev, 1))
    }
  }

  if (agendaGroups.length === 0 && !isLoading) {
    return (
      <Card className="border-dashed p-8 text-center text-muted-foreground">
        No calendar events match the selected filters.
      </Card>
    )
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="max-h-[700px] overflow-auto rounded-lg border border-default-200 bg-background"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const group = agendaGroups[virtualRow.index]
          if (!group) return null

          return (
            <div
              key={group.date}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full p-3"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <Card className="border border-default-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold text-default-800">
                      {group.label}
                    </CardTitle>
                    {group.bucket.hardConflictCount > 0 && (
                      <BiddingMasterCalendarConflictBadge
                        count={group.bucket.hardConflictCount}
                      />
                    )}
                    {group.bucket.isOverloaded && (
                      <BiddingMasterCalendarOverloadBadge
                        count={group.bucket.overloadCount}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {group.bucket.events.length} event
                    {group.bucket.events.length === 1 ? '' : 's'}
                  </span>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1 space-y-2">
                  {group.bucket.events.map((event) => {
                    const isSelected = selectedEventId === event.id
                    return (
                      <div
                        key={event.id}
                        onClick={() => onOpenMilestone(event)}
                        onMouseEnter={() => onPreviewMilestone?.(event)}
                        onMouseLeave={() => onPreviewMilestone?.(null)}
                        className={`flex items-center justify-between rounded-md border p-2.5 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-default-100 hover:border-default-300 hover:bg-muted/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-default-800">
                              {event.primaryProjectName}
                            </span>
                            <Badge
                              variant="outline"
                              color={getStatusTone(event)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {getStatusLabel(event)}
                            </Badge>
                          </div>
                          <p className="text-default-600">
                            {event.milestoneName} •{' '}
                            <span className="text-muted-foreground font-mono">
                              {event.officeLabel}
                            </span>
                          </p>
                        </div>
                        <div className="text-right font-mono text-muted-foreground shrink-0">
                          {event.eventTime ? event.eventTime : 'All Day'}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
      {isLoading && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          Loading more events…
        </div>
      )}
    </div>
  )
}
