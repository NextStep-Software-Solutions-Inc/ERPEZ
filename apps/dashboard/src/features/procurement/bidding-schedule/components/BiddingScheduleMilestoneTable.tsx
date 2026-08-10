import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, CheckCircle2, Pencil, RotateCcw } from 'lucide-react'
import { EditMilestoneDialog } from '../dialogs/EditMilestoneDialog'
import {
  MOCK_HOLIDAYS_2026,
  MOCK_INTERVAL_CONFIGS,
} from '../data/mockBiddingScheduleData'
import {
  formatScheduleTime,
  getAllowedWindow,
  getEffectiveMilestoneDate,
  getMilestoneExecutionLabel,
  getMilestoneExecutionTone,
  resolveMilestoneExecutionStatus,
} from '../utils/milestonePresentation'
import type {
  BiddingMilestone,
  BiddingSchedule,
  SetMilestoneCompletionPayload,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface BiddingScheduleMilestoneTableProps {
  schedule: BiddingSchedule
  /** Passed to the edit handler. Defaults to 'current-user' in mock context. */
  currentUser?: string
  highlightMilestoneKey?: string
  /**
   * When provided, edit clicks are delegated upward instead of opening the
   * table's own internal dialog. The parent is responsible for rendering
   * EditMilestoneDialog. When omitted the table manages its own edit state.
   */
  onEditMilestone?: (milestone: BiddingMilestone) => void
  onSetMilestoneCompletion?: (
    payload: SetMilestoneCompletionPayload,
  ) => Promise<void> | void
}

/**
 * Returns true when an edited (overrideDate-bearing) milestone's overrideDate
 * is strictly earlier than its own cascaded computedDate — a downstream conflict.
 * Uses ISO string comparison which is safe for YYYY-MM-DD values.
 */
function hasConflict(milestone: BiddingMilestone): boolean {
  if (!milestone.overrideDate) return false
  return milestone.overrideDate < milestone.computedDate
}

function formatDisplayDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy')
  } catch {
    return isoDate
  }
}

function formatTimestamp(isoTs: string): string {
  try {
    return format(parseISO(isoTs), 'MMM d, yyyy h:mm a')
  } catch {
    return isoTs
  }
}

export function BiddingScheduleMilestoneTable({
  schedule,
  currentUser = 'current-user',
  highlightMilestoneKey,
  onEditMilestone,
  onSetMilestoneCompletion,
}: BiddingScheduleMilestoneTableProps) {
  // Internal edit state is only used in standalone mode (no onEditMilestone callback).
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  )

  const { milestones } = schedule
  const isDraft = schedule.status === 'draft'
  const isConfirmed = schedule.status === 'confirmed'
  const showActions = schedule.status !== 'locked'
  const intervalConfig = MOCK_INTERVAL_CONFIGS[schedule.procurementCategory]

  if (milestones.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-sm text-muted-foreground">
        No milestones have been generated yet. Generate a schedule above to
        populate the timeline.
      </div>
    )
  }

  const editingMilestone =
    editingMilestoneId != null
      ? (milestones.find((m) => m.id === editingMilestoneId) ?? null)
      : null

  const handleEditClick = (milestone: BiddingMilestone) => {
    if (onEditMilestone) {
      onEditMilestone(milestone)
    } else {
      setEditingMilestoneId(milestone.id)
    }
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-default-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-default-50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Schedule Date</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="w-44">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone, index) => {
              const conflict = hasConflict(milestone)
              const executionStatus = resolveMilestoneExecutionStatus(milestone)
              const previousEffectiveDate =
                index === 0
                  ? schedule.ibPostingDate
                  : getEffectiveMilestoneDate(milestones[index - 1])
              const intervalEntry = intervalConfig.milestones[index]
              const allowedWindow =
                index === 0 || !intervalEntry
                  ? null
                  : getAllowedWindow({
                      previousEffectiveDate,
                      minDaysFromPrevious: intervalEntry.minDaysFromPrevious,
                      maxDaysFromPrevious: intervalEntry.maxDaysFromPrevious,
                      holidays: MOCK_HOLIDAYS_2026,
                    })
              const effectiveDate = getEffectiveMilestoneDate(milestone)
              const hasOverride = Boolean(milestone.overrideDate)

              return (
                <TableRow
                  key={milestone.id}
                  id={`milestone-row-${milestone.milestoneKey}`}
                  className={cn(
                    highlightMilestoneKey === milestone.milestoneKey &&
                      'bg-info/10 ring-1 ring-info/40',
                    conflict &&
                      'bg-warning/10 border-l-2 border-l-warning hover:bg-warning/20',
                  )}
                >
                  {/* Order */}
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {milestone.order}
                  </TableCell>

                  {/* Milestone name + conflict indicator */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-default-800">
                        {milestone.name}
                      </span>
                      {conflict && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent color="warning" side="right">
                            Override date ({milestone.overrideDate}) is earlier
                            than the cascaded computed date (
                            {milestone.computedDate}). Consider updating this
                            milestone.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  {/* Computed date */}
                  <TableCell className="text-default-600">
                    {hasOverride ? (
                      <div className="flex items-start gap-1.5">
                        <div className="space-y-0.5">
                          <div className="font-medium text-default-800">
                            {formatDisplayDate(effectiveDate)}
                            {milestone.time && (
                              <span className="text-muted-foreground">
                                {' '}
                                • {formatScheduleTime(milestone.time)}
                              </span>
                            )}
                          </div>
                          {allowedWindow ? (
                            <div className="text-xs text-muted-foreground">
                              Window: {format(allowedWindow.start, 'MMM d')} –{' '}
                              {format(allowedWindow.end, 'MMM d, yyyy')}
                            </div>
                          ) : null}
                        </div>
                        <HoverCard openDelay={150}>
                          <HoverCardTrigger asChild>
                            <button
                              type="button"
                              aria-label="View override details"
                              className={cn(
                                'mt-0.5 shrink-0 text-muted-foreground hover:text-default-800 transition-colors',
                                conflict && 'text-warning hover:text-warning',
                              )}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-80 text-sm space-y-2"
                            align="start"
                          >
                            <div className="font-semibold text-default-800">
                              Override Detail
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs text-default-600">
                              <span className="font-medium text-default-700">
                                Suggested:
                              </span>
                              <span>
                                {formatDisplayDate(milestone.computedDate)}
                              </span>
                              <span className="font-medium text-default-700">
                                Effective:
                              </span>
                              <span>{formatDisplayDate(effectiveDate)}</span>
                              {milestone.editHistory.length > 0 ? (
                                <>
                                  <span className="font-medium text-default-700">
                                    By:
                                  </span>
                                  <span>
                                    {
                                      milestone.editHistory[
                                        milestone.editHistory.length - 1
                                      ]?.editedBy
                                    }
                                  </span>
                                  <span className="font-medium text-default-700">
                                    When:
                                  </span>
                                  <span>
                                    {formatTimestamp(
                                      milestone.editHistory[
                                        milestone.editHistory.length - 1
                                      ]?.timestamp ?? milestone.computedDate,
                                    )}
                                  </span>
                                  <span className="font-medium text-default-700">
                                    Reason:
                                  </span>
                                  <span>
                                    {
                                      milestone.editHistory[
                                        milestone.editHistory.length - 1
                                      ]?.reason
                                    }
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    ) : index === 0 ? (
                      <div className="space-y-0.5">
                        <div className="font-medium text-default-800">
                          {formatDisplayDate(effectiveDate)}
                          {milestone.time && (
                            <span className="text-muted-foreground">
                              {' '}
                              • {formatScheduleTime(milestone.time)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="font-medium text-default-800">
                          {formatDisplayDate(effectiveDate)}
                          {milestone.time && (
                            <span className="text-muted-foreground">
                              {' '}
                              • {formatScheduleTime(milestone.time)}
                            </span>
                          )}
                        </div>
                        {allowedWindow ? (
                          <div className="text-xs text-muted-foreground">
                            Window: {format(allowedWindow.start, 'MMM d')} –{' '}
                            {format(allowedWindow.end, 'MMM d, yyyy')}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      color={getMilestoneExecutionTone(executionStatus)}
                      className="whitespace-nowrap"
                    >
                      {getMilestoneExecutionLabel(executionStatus)}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  {showActions && (
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        {isDraft && milestone.order !== 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEditClick(milestone)}
                            aria-label={`Edit ${milestone.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        ) : null}

                        {isConfirmed && onSetMilestoneCompletion ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              void onSetMilestoneCompletion({
                                scheduleId: schedule.id,
                                milestoneId: milestone.id,
                                completed: milestone.completedAt == null,
                                updatedBy: currentUser,
                              })
                            }
                          >
                            {milestone.completedAt ? (
                              <>
                                <RotateCcw className="h-4 w-4" />
                                Mark Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Standalone mode: render own dialog when no onEditMilestone callback is provided */}
      {!onEditMilestone && editingMilestone && (
        <EditMilestoneDialog
          open={editingMilestoneId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingMilestoneId(null)
          }}
          schedule={schedule}
          milestone={editingMilestone}
          currentUser={currentUser}
          onSuccess={() => setEditingMilestoneId(null)}
        />
      )}
    </TooltipProvider>
  )
}
