import { format, parseISO } from 'date-fns'
import { PROCUREMENT_CATEGORY_LABELS } from '../data/mockBiddingScheduleData'
import { BiddingScheduleActionBar } from './BiddingScheduleActionBar'
import { BiddingScheduleConflictPreview } from './BiddingScheduleConflictPreview'
import { BiddingScheduleLockedBanner } from './BiddingScheduleLockedBanner'
import { BiddingScheduleMilestoneTable } from './BiddingScheduleMilestoneTable'
import { BiddingSchedulePrerequisiteChecklist } from './BiddingSchedulePrerequisiteChecklist'
import { BiddingScheduleResolutionBanner } from './BiddingScheduleResolutionBanner'
import { DialogsController } from './DialogsController'
import type { UseBiddingScheduleService } from '../hooks/useBiddingScheduleService'
import { getMockBiddingScheduleDatabase } from '../data/mockBiddingScheduleData'
import { useBiddingScheduleStore } from '../store/biddingScheduleStore'
import { buildScheduleConflictPreview } from '../utils/buildScheduleConflictPreview'
import type { BacResolutionListRoutePath } from '../../bac-resolution/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BiddingScheduleWorkspaceProps {
  service: UseBiddingScheduleService
  highlightMilestoneKey?: string
  bacListRoutePath?: BacResolutionListRoutePath
}

function formatDateLabel(isoDate: string) {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy')
  } catch {
    return isoDate
  }
}

function formatDateTimeLabel(isoTs: string) {
  try {
    return format(parseISO(isoTs), 'MMM d, yyyy h:mm a')
  } catch {
    return isoTs
  }
}

export function BiddingScheduleWorkspace({
  service,
  highlightMilestoneKey,
  bacListRoutePath = '/v2/bac-resolutions',
}: BiddingScheduleWorkspaceProps) {
  const { ws, isLoading, schedule, gates, bacResolution, isDraftPbMode } =
    service
  const liveSchedules = useBiddingScheduleStore((state) => state.schedules)

  if (!bacResolution) {
    return null
  }

  const allSchedules =
    liveSchedules.length > 0 ? liveSchedules : getMockBiddingScheduleDatabase()
  const conflictPreview = schedule
    ? buildScheduleConflictPreview({
        schedule,
        otherSchedules: allSchedules.filter(
          (candidate) =>
            candidate.id !== schedule.id &&
            (candidate.status === 'confirmed' || candidate.status === 'locked'),
        ),
      })
    : null

  return (
    <div className="space-y-4">
      <BiddingScheduleResolutionBanner bacResolution={bacResolution} />

      <BiddingSchedulePrerequisiteChecklist
        gates={gates}
        schedule={schedule}
        onGenerate={ws.handleOpenGenerate}
        isGenerating={isLoading}
        mockGates={ws.mockGates}
        onToggleGate={ws.handleToggleMockGate}
        isDraftPbMode={isDraftPbMode}
      />

      {schedule?.status === 'locked' &&
        schedule.lockedAt &&
        schedule.lockedBy && (
          <BiddingScheduleLockedBanner
            lockedAt={schedule.lockedAt}
            lockedBy={schedule.lockedBy}
          />
        )}

      {schedule && (
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-base">Bidding Calendar</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {PROCUREMENT_CATEGORY_LABELS[schedule.procurementCategory]}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  IB Posting: {formatDateLabel(schedule.ibPostingDate)}
                </Badge>
                <Badge
                  variant="outline"
                  color={schedule.status === 'draft' ? 'info' : 'success'}
                >
                  {schedule.status === 'draft'
                    ? 'Draft'
                    : schedule.status === 'confirmed'
                      ? 'Confirmed'
                      : 'Locked'}
                </Badge>
                {isDraftPbMode && schedule.status === 'draft' && (
                  <Badge variant="outline" color="secondary">
                    Provisional
                  </Badge>
                )}
              </div>
            </div>

            <BiddingScheduleActionBar
              schedule={schedule}
              onConfirm={ws.handleOpenConfirm}
              isLoading={isLoading}
              bacListRoutePath={bacListRoutePath}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            {(schedule.status === 'confirmed' ||
              schedule.status === 'locked') && (
              <Alert variant="outline" color="success">
                <div>
                  <AlertTitle>Schedule confirmed</AlertTitle>
                  <AlertDescription>
                    Schedule confirmed on{' '}
                    {schedule.confirmedAt
                      ? formatDateTimeLabel(schedule.confirmedAt)
                      : '—'}{' '}
                    by {schedule.confirmedBy ?? '—'}. PBD finalization is now
                    unblocked, and posting from the PBD workspace will lock this
                    schedule.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {schedule.status === 'draft' && conflictPreview ? (
              <BiddingScheduleConflictPreview
                bacResolutionId={schedule.bacResolutionId}
                preview={conflictPreview}
              />
            ) : null}

            <BiddingScheduleMilestoneTable
              schedule={schedule}
              currentUser={ws.currentUser}
              onEditMilestone={ws.handleOpenEdit}
              onSetMilestoneCompletion={ws.handleSetMilestoneCompletion}
              highlightMilestoneKey={highlightMilestoneKey}
            />
          </CardContent>
        </Card>
      )}

      <DialogsController
        schedule={schedule}
        selectedMilestone={ws.selectedMilestone}
        currentUser={ws.currentUser}
        generateOpen={ws.generateOpen}
        setGenerateOpen={ws.setGenerateOpen}
        editOpen={ws.editOpen}
        setEditOpen={ws.setEditOpen}
        confirmOpen={ws.confirmOpen}
        setConfirmOpen={ws.setConfirmOpen}
        onGenerate={ws.handleCreateSchedule}
        onRegenerate={ws.handleRegenerateSchedule}
        onConfirm={ws.handleConfirmSchedule}
      />
    </div>
  )
}
