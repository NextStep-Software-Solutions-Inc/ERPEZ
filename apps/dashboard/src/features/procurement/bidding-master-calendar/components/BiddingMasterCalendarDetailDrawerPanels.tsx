import { format, parseISO } from 'date-fns'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  FileClock,
  Files,
  FolderOpen,
} from 'lucide-react'
import type { BacResolution } from '../../bac-resolution/types'
import type { BiddingSchedule } from '../../bidding-schedule/types'
import {
  getMilestoneExecutionLabel,
  getMilestoneExecutionTone,
} from '../../bidding-schedule/utils/milestonePresentation'
import type {
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarEvent,
} from '../types'
import { PROCUREMENT_CATEGORY_LABELS } from '../../bidding-schedule/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface BiddingMasterCalendarProjectListItem {
  bacResolutionId: string
  bacResolutionNumber: string
  projectTitle: string
  procurementCategory: BiddingMasterCalendarEvent['procurementCategory']
  derivedProjectStatus: BiddingMasterCalendarEvent['derivedProjectStatus']
  nextStageLabel: string
  hasConflict: boolean
}

interface AuditEntry {
  id: string
  label: string
  actor: string
  timestamp: string
  note: string | null
}

interface DrawerProjectDetailTabProps {
  projectOverride: { contractId?: string } | undefined
  selectedResolution: BacResolution
  selectedSchedule: BiddingSchedule
  selectedEvent: BiddingMasterCalendarEvent
  selectedEvents: Array<BiddingMasterCalendarEvent>
}

interface DrawerMilestonesTabProps {
  sortedEvents: Array<BiddingMasterCalendarEvent>
  selectedEvent: BiddingMasterCalendarEvent
  onToggleMilestoneCompletion: (
    event: BiddingMasterCalendarEvent,
    completed: boolean,
  ) => void
  isUpdatingMilestoneStatus?: boolean
}

interface DrawerConflictsTabProps {
  projectConflicts: Array<BiddingMasterCalendarConflictGroup>
}

interface DrawerNotificationsTabProps {
  overdueItems: Array<BiddingMasterCalendarEvent>
  dueSoonItems: Array<BiddingMasterCalendarEvent>
  projectConflicts: Array<BiddingMasterCalendarConflictGroup>
}

interface DrawerAuditLogTabProps {
  auditEntries: Array<AuditEntry>
}

interface DrawerLinkedActionsTabProps {
  onOpenSchedule: () => void
  onOpenBiddingDocument: () => void
  onOpenBacResolutions: () => void
}

interface DrawerAllProjectsTabProps {
  allProjects: Array<BiddingMasterCalendarProjectListItem>
}

export function getStatusTone(event: BiddingMasterCalendarEvent | null) {
  if (!event) {
    return 'secondary' as const
  }

  return getMilestoneExecutionTone(event.executionStatus)
}

export function getStatusLabel(event: BiddingMasterCalendarEvent | null) {
  if (!event) {
    return 'No selection'
  }

  return getMilestoneExecutionLabel(event.executionStatus)
}

function getProgressMetrics(events: Array<BiddingMasterCalendarEvent>) {
  const completedCount = events.filter(
    (event) => event.executionStatus === 'completed',
  ).length
  const totalCount = Math.max(events.length, 1)

  return {
    completedCount,
    totalCount,
    percentage: Math.round((completedCount / totalCount) * 100),
  }
}

export function DrawerProjectDetailTab({
  projectOverride,
  selectedResolution,
  selectedSchedule,
  selectedEvent,
  selectedEvents,
}: DrawerProjectDetailTabProps) {
  const progress = getProgressMetrics(selectedEvents)
  const sortedEvents = [...selectedEvents].sort((left, right) => {
    if (left.eventDate !== right.eventDate) {
      return left.eventDate.localeCompare(right.eventDate)
    }

    return left.milestoneOrder - right.milestoneOrder
  })

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xl font-semibold">
              {selectedEvent.primaryProjectName}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedResolution?.resolutionNumber ??
                selectedEvent.bacResolutionNumber}{' '}
              • {selectedEvent.officeLabel}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" color="secondary">
              {PROCUREMENT_CATEGORY_LABELS[selectedEvent.procurementCategory]}
            </Badge>
            <Badge variant="outline" color={getStatusTone(selectedEvent)}>
              {getStatusLabel(selectedEvent)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Contract ID
            </div>
            <div className="mt-1 text-lg font-semibold">
              {projectOverride?.contractId ??
                selectedResolution?.resolutionNumber ??
                selectedEvent.bacResolutionNumber}
            </div>
          </div>
          <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Procurement Office
            </div>
            <div className="mt-1 text-lg font-semibold">
              {selectedEvent.officeLabel}
            </div>
          </div>
          <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              IB posting date
            </div>
            <div className="mt-1 text-lg font-semibold">
              {format(parseISO(selectedSchedule.ibPostingDate), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Schedule generated
            </div>
            <div className="mt-1 text-lg font-semibold">
              {format(parseISO(selectedSchedule.createdAt), 'MMM d, yyyy')} •{' '}
              {selectedSchedule.createdBy}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {progress.completedCount} / {progress.totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-default-200">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Milestone timeline</div>
          {sortedEvents.slice(0, 6).map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg border border-default-200 p-3"
            >
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{event.milestoneName}</span>
                  <Badge
                    variant="outline"
                    color={event.id === selectedEvent.id ? 'info' : 'secondary'}
                  >
                    {event.id === selectedEvent.id ? 'Selected' : 'Milestone'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(event.eventDate), 'MMM d, yyyy')}
                  {event.eventTime ? ` • ${event.eventTime}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DrawerMilestonesTab({
  sortedEvents,
  selectedEvent,
  onToggleMilestoneCompletion,
  isUpdatingMilestoneStatus = false,
}: DrawerMilestonesTabProps) {
  return (
    <>
      {sortedEvents.map((event) => (
        <Card key={event.id} className="border border-default-200 shadow-sm">
          <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{event.milestoneName}</span>
                <Badge
                  variant="outline"
                  color={event.id === selectedEvent.id ? 'info' : 'secondary'}
                >
                  {event.id === selectedEvent.id ? 'Focused' : 'Scheduled'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(parseISO(event.eventDate), 'MMM d, yyyy')}
                {event.eventTime ? ` • ${event.eventTime}` : ''}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" color={getStatusTone(event)}>
                {getStatusLabel(event)}
              </Badge>
              {event.scheduleStatus === 'confirmed' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isUpdatingMilestoneStatus}
                  onClick={() =>
                    onToggleMilestoneCompletion(
                      event,
                      event.executionStatus !== 'completed',
                    )
                  }
                >
                  {event.executionStatus === 'completed'
                    ? 'Mark Pending'
                    : 'Mark Complete'}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export function DrawerConflictsTab({
  projectConflicts,
}: DrawerConflictsTabProps) {
  if (projectConflicts.length === 0) {
    return (
      <Card className="border border-dashed border-default-300 shadow-sm">
        <CardContent className="py-10 text-sm text-muted-foreground">
          No hard conflicts are currently linked to this project.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {projectConflicts.map((conflict) => (
        <Card
          key={`${conflict.date}-${conflict.milestoneKey}`}
          className="border border-amber-200 shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-900">
              {format(parseISO(conflict.date), 'MMM d, yyyy')} •{' '}
              {conflict.milestoneName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {conflict.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-default-200 px-3 py-2"
              >
                <div>
                  <div className="font-medium">{event.primaryProjectName}</div>
                  <div className="text-muted-foreground">
                    {event.bacResolutionNumber}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {event.eventTime ?? 'No time set'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export function DrawerNotificationsTab({
  overdueItems,
  dueSoonItems,
  projectConflicts,
}: DrawerNotificationsTabProps) {
  if (
    overdueItems.length === 0 &&
    dueSoonItems.length === 0 &&
    projectConflicts.length === 0
  ) {
    return (
      <Card className="border border-dashed border-default-300 shadow-sm">
        <CardContent className="py-10 text-sm text-muted-foreground">
          No active notifications for this project right now.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {overdueItems.map((event) => (
        <Card key={event.id} className="border border-red-200 shadow-sm">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
            <div>
              <div className="font-semibold text-red-800">
                Overdue milestone
              </div>
              <div className="text-muted-foreground">
                {event.milestoneName} should have completed on{' '}
                {format(parseISO(event.eventDate), 'MMM d, yyyy')}.
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {dueSoonItems.map((event) => (
        <Card key={event.id} className="border border-amber-200 shadow-sm">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <Bell className="mt-0.5 h-4 w-4 text-amber-700" />
            <div>
              <div className="font-semibold text-amber-900">
                Due soon milestone
              </div>
              <div className="text-muted-foreground">
                {event.milestoneName} is scheduled for{' '}
                {format(parseISO(event.eventDate), 'MMM d, yyyy')}.
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {projectConflicts.length > 0 ? (
        <Card className="border border-blue-200 shadow-sm">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <CalendarClock className="mt-0.5 h-4 w-4 text-blue-700" />
            <div>
              <div className="font-semibold text-blue-900">
                Conflict attention needed
              </div>
              <div className="text-muted-foreground">
                {projectConflicts.length} hard conflict group
                {projectConflicts.length === 1 ? '' : 's'} currently affect this
                project.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}

export function DrawerAuditLogTab({ auditEntries }: DrawerAuditLogTabProps) {
  if (auditEntries.length === 0) {
    return (
      <Card className="border border-dashed border-default-300 shadow-sm">
        <CardContent className="py-10 text-sm text-muted-foreground">
          No audit activity is available in the current frontend dataset.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {auditEntries.map((entry) => (
        <Card key={entry.id} className="border border-default-200 shadow-sm">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <FileClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <div className="font-semibold">{entry.label}</div>
              <div className="text-muted-foreground">
                {entry.actor} •{' '}
                {format(parseISO(entry.timestamp), 'MMM d, yyyy h:mm a')}
              </div>
              {entry.note ? (
                <div className="text-muted-foreground">{entry.note}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export function DrawerLinkedActionsTab({
  onOpenSchedule,
  onOpenBiddingDocument,
  onOpenBacResolutions,
}: DrawerLinkedActionsTabProps) {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardContent className="grid gap-3 pt-4 md:grid-cols-2">
        <Button
          type="button"
          className="justify-between"
          onClick={onOpenSchedule}
        >
          Open full schedule
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          color="secondary"
          className="justify-between"
          onClick={onOpenBiddingDocument}
        >
          View PBD
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          color="secondary"
          className="justify-between"
          onClick={onOpenBacResolutions}
        >
          Open BAC Resolutions
          <Files className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function DrawerAllProjectsTab({
  allProjects,
}: DrawerAllProjectsTabProps) {
  return (
    <>
      {allProjects.map((project) => (
        <Card
          key={project.bacResolutionId}
          className="border border-default-200 shadow-sm"
        >
          <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-4">
            <div className="space-y-1">
              <div className="font-semibold">{project.projectTitle}</div>
              <div className="text-sm text-muted-foreground">
                Current stage: {project.nextStageLabel}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" color="secondary">
                {PROCUREMENT_CATEGORY_LABELS[project.procurementCategory]}
              </Badge>
              <Badge
                variant="outline"
                color={
                  project.derivedProjectStatus === 'overdue'
                    ? 'destructive'
                    : project.derivedProjectStatus === 'due-soon'
                      ? 'warning'
                      : project.derivedProjectStatus === 'completed-locked'
                        ? 'success'
                        : 'info'
                }
              >
                {project.derivedProjectStatus}
              </Badge>
              {project.hasConflict ? (
                <Badge variant="outline" color="warning">
                  Conflict
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
