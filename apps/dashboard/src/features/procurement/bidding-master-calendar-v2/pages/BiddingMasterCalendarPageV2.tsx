import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageContainerDashtail } from '@/components/v2'
import { CalendarProviderV2, useCalendarV2 } from '../contexts/calendar-context'
import { DndProviderV2 } from '../contexts/dnd-context'
import { CalendarHeaderV2 } from '../header/CalendarHeaderV2'
import { MonthViewV2 } from '../views/MonthViewV2'
import { WeekViewV2 } from '../views/WeekViewV2'
import { DayViewV2 } from '../views/DayViewV2'
import { AgendaViewV2 } from '../views/AgendaViewV2'
import { YearViewV2 } from '../views/YearViewV2'
import { MilestoneDetailModalV2 } from '../dialogs/MilestoneDetailModalV2'
import { CascadeRescheduleModalV2 } from '../dialogs/CascadeRescheduleModalV2'
import { DayEventListModalV2 } from '../dialogs/DayEventListModalV2'
import { BiddingMasterCalendarDetailDrawer } from '../../bidding-master-calendar/components/BiddingMasterCalendarDetailDrawer'
import {
  useBiddingSchedule,
  useSetMilestoneCompletion,
} from '../../bidding-schedule/handlers/hooks'
import { useBacResolution } from '../../bac-resolution/handlers/hooks'
import type { BacResolution } from '../../bac-resolution/types'
import type { BiddingSchedule } from '../../bidding-schedule/types'
import type {
  BiddingMasterCalendarDrawerTab,
  BiddingMasterCalendarEvent,
} from '../../bidding-master-calendar/types'

export interface BiddingMasterCalendarPageV2Props {
  selectedResolutionId?: string
  resolutionId?: string
  selectedEventId?: string
  openDrawer?: boolean
  drawerTab?: BiddingMasterCalendarDrawerTab
}

function CalendarContentV2() {
  const navigate = useNavigate()
  const {
    currentView,
    activeDrawerEvent,
    isDrawerOpen,
    closeDrawer,
    events,
    conflictGroups,
  } = useCalendarV2()

  const [drawerTab, setDrawerTab] = useState<BiddingMasterCalendarDrawerTab>('project-detail')

  const { mutateAsync: setMilestoneCompletion, isPending: isUpdatingMilestoneStatus } =
    useSetMilestoneCompletion()

  const drawerResolutionId = activeDrawerEvent?.bacResolutionId ?? ''

  const { data: scheduleResponse } = useBiddingSchedule({
    pathParams: { resolutionId: drawerResolutionId },
    enabled: Boolean(isDrawerOpen && drawerResolutionId),
  })
  const realSchedule = scheduleResponse?.data ?? null

  const { data: resolutionResponse } = useBacResolution({
    pathParams: { id: drawerResolutionId },
    queryParams: {},
    enabled: Boolean(isDrawerOpen && drawerResolutionId),
  })
  const realResolution = resolutionResponse?.data ?? null

  const selectedEvents = useMemo(() => {
    if (!drawerResolutionId) return []
    return events.filter((e) => e.bacResolutionId === drawerResolutionId)
  }, [events, drawerResolutionId])

  const selectedResolution: BacResolution | null = useMemo(() => {
    if (realResolution) return realResolution as unknown as BacResolution
    if (!activeDrawerEvent) return null
    return {
      id: activeDrawerEvent.bacResolutionId,
      resolutionNumber: activeDrawerEvent.bacResolutionNumber,
      title: activeDrawerEvent.primaryProjectName,
      dateResolved: activeDrawerEvent.eventDate,
      status: activeDrawerEvent.scheduleStatus,
      createdBy: 'BAC Secretariat',
      createdAt: activeDrawerEvent.eventDate,
      updatedAt: activeDrawerEvent.eventDate,
    } as unknown as BacResolution
  }, [realResolution, activeDrawerEvent])

  const selectedSchedule: BiddingSchedule | null = useMemo(() => {
    if (realSchedule) return realSchedule
    if (!activeDrawerEvent) return null
    return {
      id: activeDrawerEvent.scheduleId || `sched-${drawerResolutionId}`,
      bacResolutionId: drawerResolutionId,
      bacResolutionNumber: activeDrawerEvent.bacResolutionNumber,
      procurementCategory: activeDrawerEvent.procurementCategory,
      status: activeDrawerEvent.scheduleStatus,
      ibPostingDate: activeDrawerEvent.eventDate,
      createdAt: activeDrawerEvent.eventDate,
      createdBy: 'BAC Secretariat',
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
    } as unknown as BiddingSchedule
  }, [realSchedule, drawerResolutionId, activeDrawerEvent, selectedEvents])

  const projectConflicts = useMemo(() => {
    if (!drawerResolutionId) return []
    return conflictGroups.filter((conflict) =>
      conflict.events.some((e) => e.bacResolutionId === drawerResolutionId),
    )
  }, [conflictGroups, drawerResolutionId])

  const allProjects = useMemo(() => {
    const map = new Map<string, BiddingMasterCalendarEvent[]>()
    for (const evt of events) {
      const list = map.get(evt.bacResolutionId) ?? []
      list.push(evt)
      map.set(evt.bacResolutionId, list)
    }

    return Array.from(map.entries()).map(([resId, evts]) => {
      const lead = evts[0]
      return {
        bacResolutionId: resId,
        bacResolutionNumber: lead?.bacResolutionNumber ?? resId,
        projectTitle: lead?.primaryProjectName ?? resId,
        procurementCategory: lead?.procurementCategory ?? 'goods',
        derivedProjectStatus: lead?.derivedProjectStatus ?? 'upcoming',
        nextStageLabel: `${lead?.milestoneName ?? 'Milestone'}`,
        hasConflict: conflictGroups.some((c) =>
          c.events.some((e) => e.bacResolutionId === resId),
        ),
      }
    })
  }, [events, conflictGroups])

  const handleToggleCompletion = async (
    event: BiddingMasterCalendarEvent,
    completed: boolean,
  ) => {
    await setMilestoneCompletion({
      pathParams: {
        scheduleId: event.scheduleId,
        milestoneId: event.milestoneId,
      },
      payload: {
        bacResolutionId: event.bacResolutionId,
        scheduleId: event.scheduleId,
        milestoneId: event.milestoneId,
        completed,
      },
    })
  }

  const handleOpenSchedule = () => {
    if (!activeDrawerEvent) return
    void navigate({
      to: '/v2/bac-resolutions/$resolutionId/bidding-schedule',
      params: { resolutionId: activeDrawerEvent.bacResolutionId },
    })
  }

  const handleOpenBiddingDocument = () => {
    void navigate({ to: '/v2/bidding-documents' })
  }

  const handleOpenBacResolutions = () => {
    void navigate({
      to: '/v2/bac-resolutions',
      search: { id: drawerResolutionId || undefined },
    })
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-background">
      {/* Header Bar */}
      <CalendarHeaderV2 />

      {/* Main Full-Size Body */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {currentView === 'month' && <MonthViewV2 />}
        {currentView === 'week' && <WeekViewV2 />}
        {currentView === 'day' && <DayViewV2 />}
        {currentView === 'agenda' && <AgendaViewV2 />}
        {currentView === 'year' && <YearViewV2 />}
      </div>

      {/* Interactive Modals */}
      <MilestoneDetailModalV2 />
      <CascadeRescheduleModalV2 />
      <DayEventListModalV2 />

      {/* Comprehensive 7-Tab Project Drawer */}
      <BiddingMasterCalendarDetailDrawer
        open={isDrawerOpen}
        activeTab={drawerTab}
        selectedResolution={selectedResolution}
        selectedSchedule={selectedSchedule}
        selectedEvent={activeDrawerEvent}
        selectedEvents={selectedEvents}
        projectConflicts={projectConflicts}
        allProjects={allProjects}
        onOpenChange={(open) => !open && closeDrawer()}
        onTabChange={setDrawerTab}
        onOpenSchedule={handleOpenSchedule}
        onOpenBiddingDocument={handleOpenBiddingDocument}
        onOpenBacResolutions={handleOpenBacResolutions}
        onToggleMilestoneCompletion={handleToggleCompletion}
        isUpdatingMilestoneStatus={isUpdatingMilestoneStatus}
      />
    </div>
  )
}

export function BiddingMasterCalendarPageV2({
  selectedResolutionId,
  resolutionId,
  selectedEventId,
  openDrawer,
  drawerTab,
}: BiddingMasterCalendarPageV2Props) {
  const effectiveResolutionId = resolutionId || selectedResolutionId

  return (
    <PageContainerDashtail
      containerClassName="p-0 h-[calc(100vh-4rem)] flex flex-col overflow-hidden"
      contentClassName="p-0 flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      <CalendarProviderV2 initialResolutionId={effectiveResolutionId}>
        <DndProviderV2>
          <CalendarContentV2 />
        </DndProviderV2>
      </CalendarProviderV2>
    </PageContainerDashtail>
  )
}
