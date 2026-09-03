import { format, parseISO } from 'date-fns'
import { AlertTriangle, CheckCircle2, Pencil, RotateCcw } from 'lucide-react'
import {
  formatScheduleTime,
  getEffectiveMilestoneDate,
  resolveMilestoneExecutionStatus,
} from '../utils/milestonePresentation'
import type {
  BiddingMilestone,
  BiddingSchedule,
} from '../types'
import { MilestoneExecutionStatusBadge } from './MilestoneExecutionStatusBadge'
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
  highlightMilestoneKey?: string
  onEditMilestone?: (milestone: BiddingMilestone) => void
  onToggleMilestoneCompletion?: (
    milestone: BiddingMilestone,
    completed: boolean,
  ) => void
}

/**
 * Returns true when an edited (overrideDate-bearing) milestone's overrideDate
 * is strictly earlier than its own cascaded computedDate — a downstream conflict.
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
  highlightMilestoneKey,
  onEditMilestone,
  onToggleMilestoneCompletion,
}: BiddingScheduleMilestoneTableProps) {
  const { milestones } = schedule
  const isDraft = schedule.status === 'draft'
  const isConfirmed = schedule.status === 'confirmed'
  const showActions = schedule.status !== 'locked'

  if (milestones.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-sm text-muted-foreground">
        No milestones have been generated yet. Generate a schedule above to
        populate the timeline.
      </div>
    )
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
              {showActions && <TableHead className="w-44 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone) => {
              const conflict = hasConflict(milestone)
              const executionStatus = resolveMilestoneExecutionStatus(milestone)
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
                            {milestone.computedDate}).
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  {/* Computed date */}
                  <TableCell className="text-default-600">
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
                      </div>
                      {hasOverride && (
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
                      )}
                    </div>
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <MilestoneExecutionStatusBadge status={executionStatus} />
                  </TableCell>

                  {/* Actions */}
                  {showActions && (
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        {isDraft && milestone.order !== 0 && onEditMilestone ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => onEditMilestone(milestone)}
                            aria-label={`Edit ${milestone.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        ) : null}

                        {isConfirmed && onToggleMilestoneCompletion ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              onToggleMilestoneCompletion(
                                milestone,
                                milestone.completedAt == null,
                              )
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
    </TooltipProvider>
  )
}
