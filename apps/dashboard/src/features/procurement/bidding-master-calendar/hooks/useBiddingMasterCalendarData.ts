import { useMemo } from 'react'
import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'
import { useCalendarEvents } from '../handlers/hooks'
import {
  applyCalendarFilters,
  buildAgendaGroups,
} from '../utils'
import type {
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
} from '../types'
import type {
  CalendarEvent,
  GetCalendarEventsParams,
  MilestoneExecutionStatus,
} from '../../bidding-schedule/types'

export function useBiddingMasterCalendarData(
  filters: BiddingMasterCalendarFilters,
  _refreshToken = 0,
) {
  const queryParams: GetCalendarEventsParams = useMemo(() => {
    const params: GetCalendarEventsParams = {}
    if (filters.searchTerm) params.search = filters.searchTerm
    if (filters.procurementCategories && filters.procurementCategories.length > 0) {
      params.category = filters.procurementCategories[0]
    }
    if (filters.offices && filters.offices.length > 0) {
      params.office = filters.offices[0]
    }
    if (filters.fiscalYears && filters.fiscalYears.length > 0) {
      params.fiscalYear = Number(filters.fiscalYears[0])
    }
    if (filters.milestoneKeys && filters.milestoneKeys.length > 0) {
      params.milestoneKey = filters.milestoneKeys[0]
    }
    if (filters.dateRangeStart) params.from = filters.dateRangeStart
    if (filters.dateRangeEnd) params.to = filters.dateRangeEnd
    return params
  }, [filters])

  const { data: apiResponse, isLoading, error } = useCalendarEvents({
    pathParams: {},
    queryParams,
  })

  return useMemo(() => {
    const rawData = apiResponse?.data
    const calendarEvents: CalendarEvent[] = rawData?.events ?? []
    const summaryData = rawData?.summary
    const today = startOfDay(new Date())

    const events: BiddingMasterCalendarEvent[] = calendarEvents.map((evt) => {
      const eventDate = evt.startDate.includes('T')
        ? evt.startDate.split('T')[0]
        : evt.startDate
      let eventTime: string | null = null
      try {
        eventTime = format(new Date(evt.startDate), 'HH:mm')
      } catch {
        eventTime = null
      }

      const dayDelta = differenceInCalendarDays(parseISO(eventDate), today)
      const isCompleted = evt.status.toLowerCase() === 'completed'
      const isDueSoon = !isCompleted && dayDelta >= 0 && dayDelta <= 3
      const isOverdue = !isCompleted && dayDelta < 0

      let executionStatus: MilestoneExecutionStatus = 'pending'
      if (isCompleted) executionStatus = 'completed'
      else if (isOverdue) executionStatus = 'overdue'
      else if (isDueSoon) executionStatus = 'due-soon'

      return {
        id: evt.id,
        bacResolutionId: evt.bacResolutionId || evt.projectId,
        bacResolutionNumber: evt.bacResolutionNumber || evt.status || 'Pending',
        scheduleId: evt.projectId,
        scheduleStatus: evt.scheduleStatus || 'draft',
        fiscalYear: evt.fiscalYear ? String(evt.fiscalYear) : String(new Date(evt.startDate).getFullYear()),
        procurementCategory: evt.procurementCategory || 'goods',
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
        sourceType: evt.scheduleStatus || 'draft',
        derivedProjectStatus: isCompleted
          ? 'completed-locked'
          : isOverdue
            ? 'overdue'
            : isDueSoon
              ? 'due-soon'
              : 'in-progress',
        appTargetMonth: null,
        isDueSoon,
        isOverdue,
        isProvisional: evt.scheduleStatus === 'draft',
      }
    })

    const filteredEvents = applyCalendarFilters(events, filters)
    const agendaGroups = buildAgendaGroups(filteredEvents, [])

    const summary = {
      totalSchedules:
        summaryData?.activeSchedules ??
        new Set(filteredEvents.map((event) => event.bacResolutionId)).size,
      totalVisibleMilestones:
        summaryData?.visibleMilestones ?? filteredEvents.length,
      conflictDays:
        summaryData?.conflictDays ??
        agendaGroups.filter((group) => group.bucket.hardConflictCount > 0)
          .length,
      overloadedDays:
        summaryData?.overloadedDays ??
        agendaGroups.filter((group) => group.bucket.isOverloaded).length,
      dueSoonItems:
        summaryData?.dueSoon ??
        filteredEvents.filter((event) => event.isDueSoon).length,
      overdueItems:
        summaryData?.overdue ??
        filteredEvents.filter((event) => event.isOverdue).length,
    }

    return {
      isLoading,
      error,
      sourceSchedules: [],
      resolutions: [],
      appBands: [],
      events,
      filteredEvents,
      agendaGroups,
      dayBuckets: agendaGroups.map((group) => group.bucket),
      summary,
      conflictDetails: summaryData?.conflictDetails ?? [],
      options: {
        milestoneOptions: Array.from(
          new Map(
            events.map((event) => [event.milestoneKey, event.milestoneName]),
          ).entries(),
        ).map(([value, label]) => ({ value, label })),
        officeOptions: Array.from(
          new Set(events.map((event) => event.officeLabel)),
        ).sort(),
        fiscalYearOptions: Array.from(
          new Set(events.map((event) => event.fiscalYear)),
        ).sort(),
      },
    }
  }, [apiResponse, filters, isLoading, error])
}
