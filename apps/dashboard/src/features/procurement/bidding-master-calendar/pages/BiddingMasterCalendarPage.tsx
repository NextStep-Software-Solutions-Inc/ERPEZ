import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { CalendarRange, Download, FileSpreadsheet, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { BiddingMasterCalendarAgendaView } from '../components/BiddingMasterCalendarAgendaView'
import { BiddingMasterCalendarAlertBanner } from '../components/BiddingMasterCalendarAlertBanner'
import { BiddingMasterCalendarDetailDrawer } from '../components/BiddingMasterCalendarDetailDrawer'
import { BiddingMasterCalendarFiltersPanel } from '../components/BiddingMasterCalendarFilters'
import { BiddingMasterCalendarLegend } from '../components/BiddingMasterCalendarLegend'
import { BiddingMasterCalendarMonthView } from '../components/BiddingMasterCalendarMonthView'
import { BiddingMasterCalendarSummary } from '../components/BiddingMasterCalendarSummary'
import { useBiddingMasterCalendarData } from '../hooks'
import { useSetMilestoneCompletion } from '../../bidding-schedule/handlers/hooks'
import {
  type BiddingMasterCalendarDrawerTab,
  DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
  type BiddingMasterCalendarFilters,
  type BiddingMasterCalendarEvent,
} from '../types'
import { DEFAULT_OFFICER_NAME } from '../../bidding-schedule/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainerDashtail } from '@/components/v2'
import {
  exportCalendarAgendaPrint,
  exportCalendarAgendaTable,
  exportCalendarMonthPrint,
} from '../utils'

const MASTER_CALENDAR_TABS = [
  {
    id: 'month',
    label: 'Month View',
    description: 'Calendar grid for conflict and workload scanning.',
  },
  {
    id: 'agenda',
    label: 'Agenda View',
    description: 'Chronological list for operational review.',
  },
] as const

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
  const [activeTab, setActiveTab] =
    useState<(typeof MASTER_CALENDAR_TABS)[number]['id']>('month')
  const [filters, setFilters] = useState<BiddingMasterCalendarFilters>(
    DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [previewEvent, setPreviewEvent] =
    useState<BiddingMasterCalendarEvent | null>(null)
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

  useEffect(() => {
    if (drawerTab && drawerTab !== rememberedDrawerTab) {
      setRememberedDrawerTab(drawerTab)
    }
  }, [drawerTab, rememberedDrawerTab, setRememberedDrawerTab])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return (
      calendarData.events.find((event) => event.id === selectedEventId) ?? null
    )
  }, [calendarData.events, selectedEventId])

  const effectiveSelectedResolutionId =
    selectedResolutionId ?? selectedEvent?.bacResolutionId ?? null

  const selectedEvents = useMemo(() => {
    if (!effectiveSelectedResolutionId) return []
    return calendarData.events.filter(
      (event) => event.bacResolutionId === effectiveSelectedResolutionId,
    )
  }, [calendarData.events, effectiveSelectedResolutionId])

  const effectiveSelectedEvent = selectedEvent ?? selectedEvents[0] ?? null

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
          procurementCategory:
            leadEvent?.procurementCategory ?? 'goods',
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

  const drawerOpen = effectiveSelectedResolutionId !== null

  const updateDrawerSearch = (
    nextSearch: Partial<{
      selectedResolutionId: string | undefined
      selectedEventId: string | undefined
      drawerTab: BiddingMasterCalendarDrawerTab | undefined
    }>,
  ) => {
    void navigate({
      to: '/v2/bidding-master-calendar',
      search: (previous) => ({
        ...previous,
        ...nextSearch,
      }),
    })
  }

  const handleOpenMilestone = (event: BiddingMasterCalendarEvent) => {
    updateDrawerSearch({
      selectedResolutionId: event.bacResolutionId,
      selectedEventId: event.id,
      drawerTab: activeDrawerTab,
    })
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

  const handleAgendaPrint = () => {
    exportCalendarAgendaPrint(calendarData.agendaGroups)
  }

  const handleAgendaExcelExport = () => {
    exportCalendarAgendaTable(calendarData.agendaGroups)
  }

  return (
    <PageContainerDashtail
      title="Master BAC Calendar"
      description="Aggregate bidding schedules into one operational calendar for conflict detection, workload review, and milestone navigation."
      headerVariant="branded"
      headerSize="large"
      mode="tabbed"
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as 'month' | 'agenda')}
      tabs={MASTER_CALENDAR_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        description: tab.description,
      }))}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-fit gap-2">
            <CalendarRange className="h-3.5 w-3.5" />
            BAC Ops
          </Badge>
          {activeTab === 'month' ? (
            <Button
              type="button"
              variant="outline"
              color="secondary"
              className="gap-2"
              onClick={handleMonthExport}
            >
              <Printer className="h-4 w-4" />
              Print Month Snapshot
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                className="gap-2"
                onClick={handleAgendaPrint}
              >
                <Download className="h-4 w-4" />
                Print Agenda
              </Button>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                className="gap-2"
                onClick={handleAgendaExcelExport}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </Button>
            </>
          )}
        </div>
      }
      contentClassName="space-y-4 pt-4"
    >
      <BiddingMasterCalendarSummary summary={calendarData.summary} />

      <BiddingMasterCalendarAlertBanner
        summary={calendarData.summary}
        dayBuckets={calendarData.dayBuckets}
        conflictGroups={conflictGroups}
      />

      <BiddingMasterCalendarFiltersPanel
        filters={filters}
        milestoneOptions={calendarData.options.milestoneOptions}
        officeOptions={calendarData.options.officeOptions}
        fiscalYearOptions={calendarData.options.fiscalYearOptions}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS)}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {activeTab === 'month' ? (
            <BiddingMasterCalendarMonthView
              currentMonth={currentMonth}
              dayBuckets={calendarData.dayBuckets}
              onMonthChange={setCurrentMonth}
              selectedEventId={selectedEventId ?? null}
              onPreviewMilestone={setPreviewEvent}
              onOpenMilestone={handleOpenMilestone}
              isLoading={calendarData.isLoading}
            />
          ) : (
            <BiddingMasterCalendarAgendaView
              filters={filters}
              selectedEventId={selectedEventId ?? null}
              onPreviewMilestone={setPreviewEvent}
              onOpenMilestone={handleOpenMilestone}
            />
          )}
        </div>

        <div className="space-y-4">
          {previewEvent && !drawerOpen ? (
            <Card className="border border-info/30 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hover preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="font-semibold text-foreground">
                  {previewEvent.primaryProjectName}
                </div>
                <div>{previewEvent.milestoneName}</div>
                <div>
                  {previewEvent.bacResolutionNumber} •{' '}
                  {format(new Date(previewEvent.eventDate), 'MMM d, yyyy')}
                  {previewEvent.eventTime ? ` • ${previewEvent.eventTime}` : ''}
                </div>
              </CardContent>
            </Card>
          ) : null}
          <BiddingMasterCalendarLegend />
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live refresh model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Confirmed and locked schedules are updated from the backend.
              </p>
              <p>
                Milestone completion and schedule mutations instantly invalidate and refresh both schedule and calendar views.
              </p>
              <p>
                Milestone click-through opens the workspace with row highlighting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <BiddingMasterCalendarDetailDrawer
        open={drawerOpen}
        activeTab={activeDrawerTab}
        selectedResolution={null}
        selectedSchedule={null}
        selectedEvent={effectiveSelectedEvent}
        selectedEvents={selectedEvents}
        projectConflicts={projectConflicts}
        allProjects={allProjects}
        onOpenChange={(open) => {
          if (!open) {
            updateDrawerSearch({
              selectedResolutionId: undefined,
              selectedEventId: undefined,
            })
          }
        }}
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
