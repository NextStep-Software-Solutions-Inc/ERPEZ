import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format, parseISO, startOfMonth } from 'date-fns'
import { AlertTriangle, CalendarRange, Printer, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { BiddingMasterCalendarDetailDrawer } from '../components/BiddingMasterCalendarDetailDrawer'
import { BiddingMasterCalendarFiltersPanel } from '../components/BiddingMasterCalendarFilters'
import { BiddingMasterCalendarMonthView } from '../components/BiddingMasterCalendarMonthView'
import { useBiddingMasterCalendarData } from '../hooks'
import {
  useSetMilestoneCompletion,
  useBiddingSchedule,
} from '../../bidding-schedule/handlers/hooks'
import { useBacResolution } from '../../bac-resolution/handlers/hooks'
import type { BacResolution } from '../../bac-resolution/types'
import {
  type BiddingMasterCalendarDrawerTab,
  DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
  type BiddingMasterCalendarFilters,
  type BiddingMasterCalendarEvent,
} from '../types'
import {
  DEFAULT_OFFICER_NAME,
  type BiddingSchedule,
} from '../../bidding-schedule/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageContainerDashtail } from '@/components/v2'
import { cn } from '@/lib/utils'
import { exportCalendarMonthPrint } from '../utils'

const DEFAULT_DRAWER_TAB: BiddingMasterCalendarDrawerTab = 'project-detail'
const DRAWER_TAB_STORAGE_KEY = 'procurement.master-bac-calendar.drawer-tab'

interface BiddingMasterCalendarPageProps {
  selectedResolutionId?: string
  selectedEventId?: string
  drawerTab?: BiddingMasterCalendarDrawerTab
}

export function BiddingMasterCalendarPage({
  selectedResolutionId,
  selectedEventId,
  drawerTab,
}: BiddingMasterCalendarPageProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BiddingMasterCalendarFilters>(
    DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [lastNavigatedResolutionId, setLastNavigatedResolutionId] = useState<
    string | null
  >(null)
  const [rememberedDrawerTab, setRememberedDrawerTab] =
    useLocalStorage<BiddingMasterCalendarDrawerTab>(
      DRAWER_TAB_STORAGE_KEY,
      DEFAULT_DRAWER_TAB,
    )
  const deferredFilters = useDeferredValue(filters)
  const calendarData = useBiddingMasterCalendarData(deferredFilters)
  const {
    mutateAsync: setMilestoneCompletion,
    isPending: isUpdatingMilestoneStatus,
  } = useSetMilestoneCompletion()

  const visibleMonthBuckets = useMemo(
    () =>
      calendarData.dayBuckets.filter(
        (bucket) => bucket.date.slice(0, 7) === format(currentMonth, 'yyyy-MM'),
      ),
    [calendarData.dayBuckets, currentMonth],
  )

  const activeDrawerTab = drawerTab ?? rememberedDrawerTab ?? DEFAULT_DRAWER_TAB
  const [isDrawerOpen, setIsDrawerOpen] = useState(
    Boolean(selectedResolutionId || selectedEventId),
  )

  useEffect(() => {
    if (drawerTab && drawerTab !== rememberedDrawerTab) {
      setRememberedDrawerTab(drawerTab)
    }
  }, [drawerTab, rememberedDrawerTab, setRememberedDrawerTab])

  useEffect(() => {
    if (selectedResolutionId || selectedEventId) {
      setIsDrawerOpen(true)
    }
  }, [selectedResolutionId, selectedEventId])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return (
      calendarData.events.find((event) => event.id === selectedEventId) ?? null
    )
  }, [calendarData.events, selectedEventId])

  const drawerResolutionId =
    selectedResolutionId ?? selectedEvent?.bacResolutionId ?? null

  const effectiveSelectedResolutionId = drawerResolutionId

  const effectiveSingleResolutionId = useMemo(() => {
    if (filters.bacResolutionId) return filters.bacResolutionId
    if (drawerResolutionId) return drawerResolutionId
    const visibleResolutionIds = Array.from(
      new Set(calendarData.filteredEvents.map((e) => e.bacResolutionId)),
    )
    if (visibleResolutionIds.length === 1) return visibleResolutionIds[0]
    return null
  }, [filters.bacResolutionId, drawerResolutionId, calendarData.filteredEvents])

  const activeResolutionIdForSchedule =
    filters.bacResolutionId ??
    drawerResolutionId ??
    effectiveSingleResolutionId ??
    ''

  const { data: scheduleResponse } = useBiddingSchedule({
    pathParams: { resolutionId: activeResolutionIdForSchedule },
    enabled: Boolean(activeResolutionIdForSchedule),
  })
  const realSchedule = scheduleResponse?.data ?? null

  const { data: resolutionResponse } = useBacResolution({
    pathParams: { id: activeResolutionIdForSchedule },
    queryParams: {},
    enabled: Boolean(activeResolutionIdForSchedule),
  })
  const realResolution = resolutionResponse?.data ?? null

  // Auto-navigate currentMonth to resolution's starting month when a resolution is selected
  useEffect(() => {
    if (!effectiveSingleResolutionId) return
    if (lastNavigatedResolutionId === effectiveSingleResolutionId) return

    let targetDateStr: string | null = null

    if (
      realSchedule &&
      realSchedule.bacResolutionId === effectiveSingleResolutionId
    ) {
      if (realSchedule.ibPostingDate) {
        targetDateStr = realSchedule.ibPostingDate
      } else if (realSchedule.milestones?.length) {
        const sorted = [...realSchedule.milestones].sort(
          (a, b) => a.order - b.order,
        )
        targetDateStr = sorted[0].overrideDate ?? sorted[0].computedDate
      }
    }

    if (!targetDateStr) {
      const matchingEvents = calendarData.events.filter(
        (e) => e.bacResolutionId === effectiveSingleResolutionId,
      )
      if (matchingEvents.length > 0) {
        const sorted = [...matchingEvents].sort((a, b) =>
          a.eventDate.localeCompare(b.eventDate),
        )
        targetDateStr = sorted[0].startDate || sorted[0].eventDate
      }
    }

    if (targetDateStr) {
      const parsed = parseISO(targetDateStr.split('T')[0])
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(startOfMonth(parsed))
        setLastNavigatedResolutionId(effectiveSingleResolutionId)
      }
    }
  }, [
    effectiveSingleResolutionId,
    realSchedule,
    calendarData.events,
    lastNavigatedResolutionId,
  ])

  const selectedEvents = useMemo(() => {
    if (!effectiveSelectedResolutionId) return []
    return calendarData.events.filter(
      (event) => event.bacResolutionId === effectiveSelectedResolutionId,
    )
  }, [calendarData.events, effectiveSelectedResolutionId])

  const effectiveSelectedEvent = selectedEvent ?? selectedEvents[0] ?? null

  const selectedResolution: BacResolution | null = useMemo(() => {
    if (realResolution) {
      return realResolution as unknown as BacResolution
    }
    if (!effectiveSelectedEvent) return null

    return {
      id: drawerResolutionId ?? effectiveSelectedEvent.bacResolutionId,
      resolutionNumber: effectiveSelectedEvent.bacResolutionNumber,
      title: effectiveSelectedEvent.primaryProjectName,
      dateResolved: effectiveSelectedEvent.eventDate,
      status: effectiveSelectedEvent.scheduleStatus,
      createdBy: DEFAULT_OFFICER_NAME,
      createdAt: effectiveSelectedEvent.eventDate,
      updatedAt: effectiveSelectedEvent.eventDate,
    } as unknown as BacResolution
  }, [realResolution, drawerResolutionId, effectiveSelectedEvent])

  const selectedSchedule: BiddingSchedule | null = useMemo(() => {
    if (realSchedule) {
      return realSchedule
    }
    if (!effectiveSelectedEvent) return null

    const ibEvent = selectedEvents.find((e) => e.milestoneKey === 'ib-posting')
    const earliestDate =
      selectedEvents[0]?.eventDate ?? effectiveSelectedEvent.eventDate

    return {
      id: effectiveSelectedEvent.scheduleId || `sched-${drawerResolutionId}`,
      bacResolutionId:
        drawerResolutionId ?? effectiveSelectedEvent.bacResolutionId,
      bacResolutionNumber: effectiveSelectedEvent.bacResolutionNumber,
      procurementCategory: effectiveSelectedEvent.procurementCategory,
      status: effectiveSelectedEvent.scheduleStatus,
      ibPostingDate: ibEvent?.eventDate ?? earliestDate,
      createdAt: effectiveSelectedEvent.eventDate,
      createdBy: DEFAULT_OFFICER_NAME,
      milestones: selectedEvents.map((e, idx) => ({
        id: e.milestoneId || e.id,
        order: e.milestoneOrder ?? idx,
        milestoneKey: e.milestoneKey,
        name: e.milestoneName,
        computedDate: e.eventDate,
        overrideDate: null,
        time: e.eventTime ?? null,
        status: e.isEdited ? 'manual-override' : 'auto-generated',
        isEdited: e.isEdited,
        completedAt: e.executionStatus === 'completed' ? e.eventDate : null,
        editHistory: [],
      })),
      confirmedAt: null,
      confirmedBy: null,
      lockedAt: null,
      lockedBy: null,
    } as unknown as BiddingSchedule
  }, [realSchedule, drawerResolutionId, effectiveSelectedEvent, selectedEvents])

  const conflictGroups = useMemo(
    () =>
      calendarData.agendaGroups.flatMap(
        (group) => group.bucket.hardConflictGroups,
      ),
    [calendarData.agendaGroups],
  )

  const projectConflicts = useMemo(
    () =>
      effectiveSelectedResolutionId
        ? conflictGroups.filter((conflict) =>
            conflict.events.some(
              (event) =>
                event.bacResolutionId === effectiveSelectedResolutionId,
            ),
          )
        : [],
    [conflictGroups, effectiveSelectedResolutionId],
  )

  const allProjects = useMemo(() => {
    const grouped = new Map<string, BiddingMasterCalendarEvent[]>()

    for (const event of calendarData.events) {
      const existing = grouped.get(event.bacResolutionId) ?? []
      existing.push(event)
      grouped.set(event.bacResolutionId, existing)
    }

    return Array.from(grouped.entries())
      .map(([bacResolutionId, events]) => {
        const sortedEvents = [...events].sort((left, right) => {
          if (left.eventDate !== right.eventDate) {
            return left.eventDate.localeCompare(right.eventDate)
          }

          return left.milestoneOrder - right.milestoneOrder
        })
        const nextStage =
          sortedEvents.find((event) => !event.isOverdue) ?? sortedEvents.at(-1)
        const leadEvent = sortedEvents[0]

        return {
          bacResolutionId,
          bacResolutionNumber:
            leadEvent?.bacResolutionNumber ?? bacResolutionId,
          projectTitle: leadEvent?.primaryProjectName ?? bacResolutionId,
          procurementCategory: leadEvent?.procurementCategory ?? 'goods',
          derivedProjectStatus: nextStage?.derivedProjectStatus ?? 'upcoming',
          nextStageLabel: nextStage
            ? `${nextStage.milestoneName} • ${format(new Date(nextStage.eventDate), 'MMM d')}`
            : 'No scheduled milestones',
          hasConflict: conflictGroups.some((conflict) =>
            conflict.events.some(
              (event) => event.bacResolutionId === bacResolutionId,
            ),
          ),
        }
      })
      .sort((left, right) =>
        left.projectTitle.localeCompare(right.projectTitle),
      )
  }, [calendarData.events, conflictGroups])

  const updateDrawerSearch = (
    nextSearch: Partial<{
      selectedResolutionId: string | undefined
      selectedEventId: string | undefined
      drawerTab: BiddingMasterCalendarDrawerTab | undefined
    }>,
  ) => {
    void navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        ...nextSearch,
      }),
    })
  }

  const handleOpenMilestone = (event: BiddingMasterCalendarEvent) => {
    setIsDrawerOpen(true)
    updateDrawerSearch({
      selectedResolutionId: event.bacResolutionId,
      selectedEventId: event.id,
      drawerTab: activeDrawerTab,
    })
  }

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      updateDrawerSearch({
        selectedResolutionId: undefined,
        selectedEventId: undefined,
      })
    }
  }

  const handleOpenSchedule = () => {
    if (!effectiveSelectedEvent) {
      return
    }

    void navigate({
      to: '/v2/bac-resolutions/$resolutionId/bidding-schedule',
      params: { resolutionId: effectiveSelectedEvent.bacResolutionId },
      search: { highlightMilestoneKey: effectiveSelectedEvent.milestoneKey },
    })
  }

  const handleOpenBiddingDocument = () => {
    if (!effectiveSelectedResolutionId) {
      return
    }

    void navigate({
      to: '/v2/bidding-documents',
    })
  }

  const handleOpenBacResolutions = () => {
    void navigate({
      to: '/v2/bac-resolutions',
      search: {
        id: effectiveSelectedResolutionId ?? undefined,
      },
    })
  }

  const handleToggleMilestoneCompletion = async (
    event: BiddingMasterCalendarEvent,
    completed: boolean,
  ) => {
    try {
      await setMilestoneCompletion({
        pathParams: {
          scheduleId: event.scheduleId,
          milestoneId: event.milestoneId,
        },
        payload: {
          scheduleId: event.scheduleId,
          milestoneId: event.milestoneId,
          completed,
          updatedBy: DEFAULT_OFFICER_NAME,
          bacResolutionId: event.bacResolutionId,
        },
      })
      toast.success(
        completed
          ? 'Milestone marked as completed.'
          : 'Milestone returned to pending.',
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update milestone status.',
      )
    }
  }

  const handleMonthExport = () => {
    exportCalendarMonthPrint({
      currentMonth,
      dayBuckets: visibleMonthBuckets,
    })
  }

  return (
    <PageContainerDashtail
      title="Master BAC Calendar"
      description="Aggregate bidding schedules into one operational calendar for conflict detection, workload review, and milestone navigation."
      headerVariant="branded"
      headerSize="default"
      mode="simple"
      containerClassName="min-h-[calc(100vh-4rem)] flex flex-col"
      contentClassName="flex-1 min-h-0 flex flex-col space-y-2 pt-1 pb-2"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-1.5 h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            onClick={() => navigate({ to: '/v2/bidding-master-calendar' })}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Switch to Modern Calendar
          </Button>
          <Badge
            variant="outline"
            className="h-fit gap-1.5 py-1 px-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold"
          >
            <CalendarRange className="h-3.5 w-3.5" />
            Legacy Calendar
          </Badge>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            className="gap-2 h-8 text-xs font-medium"
            onClick={handleMonthExport}
          >
            <Printer className="h-3.5 w-3.5" />
            Print Month Snapshot
          </Button>
        </div>
      }
    >
      {/* 1-line Compact Operational Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200 text-xs text-slate-700 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-500">Active Schedules:</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-xs font-bold bg-slate-200/80"
            >
              {calendarData.summary.totalSchedules}
            </Badge>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-500">Total Milestones:</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-xs font-bold bg-slate-200/80"
            >
              {calendarData.summary.totalVisibleMilestones}
            </Badge>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-500">Due Soon:</span>
            <Badge
              variant="secondary"
              className={cn(
                'px-1.5 py-0 text-xs font-bold',
                calendarData.summary.dueSoonItems > 0
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-200/80',
              )}
            >
              {calendarData.summary.dueSoonItems}
            </Badge>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-500">Overdue:</span>
            <Badge
              variant="secondary"
              className={cn(
                'px-1.5 py-0 text-xs font-bold',
                calendarData.summary.overdueItems > 0
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : 'bg-slate-200/80',
              )}
            >
              {calendarData.summary.overdueItems}
            </Badge>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-500">Conflicts:</span>
            <Badge
              variant="secondary"
              className={cn(
                'px-1.5 py-0 text-xs font-bold',
                conflictGroups.length > 0
                  ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                  : 'bg-slate-200/80',
              )}
            >
              {conflictGroups.length}
            </Badge>
          </div>
        </div>

        {conflictGroups.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>
              Schedule conflict detected across {conflictGroups.length} slot(s)
            </span>
          </div>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="shrink-0">
        <BiddingMasterCalendarFiltersPanel
          filters={filters}
          resolutionOptions={calendarData.options.resolutionOptions}
          milestoneOptions={calendarData.options.milestoneOptions}
          officeOptions={calendarData.options.officeOptions}
          fiscalYearOptions={calendarData.options.fiscalYearOptions}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS)}
        />
      </div>

      {/* Full-Width Full-Height Month Calendar View */}
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <BiddingMasterCalendarMonthView
          currentMonth={currentMonth}
          dayBuckets={calendarData.dayBuckets}
          onMonthChange={setCurrentMonth}
          selectedEventId={selectedEventId ?? null}
          selectedResolutionId={effectiveSingleResolutionId}
          allEvents={calendarData.filteredEvents}
          onOpenMilestone={handleOpenMilestone}
          isLoading={calendarData.isLoading}
          schedule={realSchedule}
        />
      </div>

      {/* 7-tab Detail Drawer */}
      <BiddingMasterCalendarDetailDrawer
        open={isDrawerOpen}
        activeTab={activeDrawerTab}
        selectedResolution={selectedResolution}
        selectedSchedule={selectedSchedule}
        selectedEvent={effectiveSelectedEvent}
        selectedEvents={selectedEvents}
        projectConflicts={projectConflicts}
        allProjects={allProjects}
        onOpenChange={handleDrawerOpenChange}
        onTabChange={(tab) => {
          setRememberedDrawerTab(tab)
          updateDrawerSearch({ drawerTab: tab })
        }}
        onOpenSchedule={handleOpenSchedule}
        onOpenBiddingDocument={handleOpenBiddingDocument}
        onOpenBacResolutions={handleOpenBacResolutions}
        onToggleMilestoneCompletion={handleToggleMilestoneCompletion}
        isUpdatingMilestoneStatus={isUpdatingMilestoneStatus}
      />
    </PageContainerDashtail>
  )
}
