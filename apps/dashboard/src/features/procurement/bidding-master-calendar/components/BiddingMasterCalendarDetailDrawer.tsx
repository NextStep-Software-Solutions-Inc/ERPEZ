import { format, parseISO } from 'date-fns'
import { MASTER_CALENDAR_PROJECT_OVERRIDES } from '../data/mockBiddingMasterCalendarData'
import { PROCUREMENT_CATEGORY_LABELS } from '../../bidding-schedule/types'
import { getStatusLabel, getStatusTone } from '../utils/statusUtils'
import {
  DrawerAllProjectsTab,
  DrawerAuditLogTab,
  DrawerConflictsTab,
  DrawerLinkedActionsTab,
  DrawerMilestonesTab,
  DrawerNotificationsTab,
  DrawerProjectDetailTab,
} from './BiddingMasterCalendarDetailDrawerPanels'
import type { BacResolution } from '../../bac-resolution/types'
import type { BiddingSchedule } from '../../bidding-schedule/types'
import type {
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarDrawerTab,
  BiddingMasterCalendarEvent,
} from '../types'
import type { BiddingMasterCalendarProjectListItem } from './BiddingMasterCalendarDetailDrawerPanels'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface BiddingMasterCalendarDetailDrawerProps {
  open: boolean
  activeTab: BiddingMasterCalendarDrawerTab
  selectedResolution: BacResolution | null
  selectedSchedule: BiddingSchedule | null
  selectedEvent: BiddingMasterCalendarEvent | null
  selectedEvents: Array<BiddingMasterCalendarEvent>
  projectConflicts: Array<BiddingMasterCalendarConflictGroup>
  allProjects: Array<BiddingMasterCalendarProjectListItem>
  onOpenChange: (open: boolean) => void
  onTabChange: (tab: BiddingMasterCalendarDrawerTab) => void
  onOpenSchedule: () => void
  onOpenBiddingDocument: () => void
  onOpenBacResolutions: () => void
  onToggleMilestoneCompletion: (
    event: BiddingMasterCalendarEvent,
    completed: boolean,
  ) => void
  isUpdatingMilestoneStatus?: boolean
}

const DRAWER_TABS: Array<{
  id: BiddingMasterCalendarDrawerTab
  label: string
}> = [
  { id: 'project-detail', label: 'Project detail' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'conflicts', label: 'Conflicts' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'audit-log', label: 'Audit log' },
  { id: 'linked-actions', label: 'Linked actions' },
  { id: 'all-projects', label: 'All projects' },
]

export function BiddingMasterCalendarDetailDrawer({
  open,
  activeTab,
  selectedResolution,
  selectedSchedule,
  selectedEvent,
  selectedEvents,
  projectConflicts,
  allProjects,
  onOpenChange,
  onTabChange,
  onOpenSchedule,
  onOpenBiddingDocument,
  onOpenBacResolutions,
  onToggleMilestoneCompletion,
  isUpdatingMilestoneStatus = false,
}: BiddingMasterCalendarDetailDrawerProps) {
  const projectOverride = selectedResolution
    ? MASTER_CALENDAR_PROJECT_OVERRIDES[selectedResolution.id]
    : undefined
  const auditEntries = [
    ...(selectedSchedule?.milestones
      .flatMap((milestone) =>
        milestone.editHistory.map((entry, index) => ({
          id: `${milestone.id}-${index}`,
          label: `${milestone.name} updated`,
          actor: entry.editedBy,
          timestamp: entry.timestamp,
          note: `${entry.originalDate} -> ${entry.newDate}${entry.reason ? ` • ${entry.reason}` : ''}`,
        })),
      )
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp)) ??
      []),
  ]
  const dueSoonItems = selectedEvents.filter((event) => event.isDueSoon)
  const overdueItems = selectedEvents.filter((event) => event.isOverdue)
  const sortedEvents = [...selectedEvents].sort((left, right) => {
    if (left.eventDate !== right.eventDate) {
      return left.eventDate.localeCompare(right.eventDate)
    }

    return left.milestoneOrder - right.milestoneOrder
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[720px] max-w-[96vw] overflow-y-auto p-0"
      >
        <SheetHeader className="border-b border-default-200 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="space-y-2">
              <SheetTitle>
                {selectedEvent?.primaryProjectName ?? 'Master BAC Calendar'}
              </SheetTitle>
              <SheetDescription>
                {selectedResolution
                  ? `${selectedResolution.resolutionNumber ?? selectedResolution.id} • ${selectedResolution.dateResolved ? format(parseISO(selectedResolution.dateResolved), 'MMM d, yyyy') : ''}`
                  : 'Select a project from the calendar to inspect its schedule context.'}
              </SheetDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedEvent ? (
                <>
                  <Badge variant="outline" color="secondary">
                    {
                      PROCUREMENT_CATEGORY_LABELS[
                        selectedEvent.procurementCategory
                      ]
                    }
                  </Badge>
                  <Badge variant="outline" color={getStatusTone(selectedEvent)}>
                    {getStatusLabel(selectedEvent)}
                  </Badge>
                </>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 py-5">
          {!selectedResolution || !selectedSchedule || !selectedEvent ? (
            <Card className="border border-dashed border-default-300 shadow-sm">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Select a calendar item to open project detail, milestones,
                conflicts, notifications, and linked actions.
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                onTabChange(value as BiddingMasterCalendarDrawerTab)
              }
              className="space-y-4"
            >
              <TabsList
                variant="underline"
                className="w-full justify-start overflow-x-auto"
              >
                {DRAWER_TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} variant="underline">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent
                value="project-detail"
                animated
                className="space-y-4"
              >
                <DrawerProjectDetailTab
                  projectOverride={projectOverride}
                  selectedResolution={selectedResolution}
                  selectedSchedule={selectedSchedule}
                  selectedEvent={selectedEvent}
                  selectedEvents={selectedEvents}
                />
              </TabsContent>

              <TabsContent value="milestones" animated className="space-y-3">
                <DrawerMilestonesTab
                  sortedEvents={sortedEvents}
                  selectedEvent={selectedEvent}
                  onToggleMilestoneCompletion={onToggleMilestoneCompletion}
                  isUpdatingMilestoneStatus={isUpdatingMilestoneStatus}
                />
              </TabsContent>

              <TabsContent value="conflicts" animated className="space-y-3">
                <DrawerConflictsTab projectConflicts={projectConflicts} />
              </TabsContent>

              <TabsContent value="notifications" animated className="space-y-3">
                <DrawerNotificationsTab
                  overdueItems={overdueItems}
                  dueSoonItems={dueSoonItems}
                  projectConflicts={projectConflicts}
                />
              </TabsContent>

              <TabsContent value="audit-log" animated className="space-y-3">
                <DrawerAuditLogTab auditEntries={auditEntries} />
              </TabsContent>

              <TabsContent
                value="linked-actions"
                animated
                className="space-y-3"
              >
                <DrawerLinkedActionsTab
                  onOpenSchedule={onOpenSchedule}
                  onOpenBiddingDocument={onOpenBiddingDocument}
                  onOpenBacResolutions={onOpenBacResolutions}
                />
              </TabsContent>

              <TabsContent value="all-projects" animated className="space-y-3">
                <DrawerAllProjectsTab allProjects={allProjects} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
