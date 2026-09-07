import { useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  computeRemainingDays,
  getRemainingDaysBadgeClass,
} from '@/features/procurement/bac-resolution'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'
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

const DEFAULT_MAX_DAYS_BY_KEY: Record<string, number | null> = {
  'ib-posting': null,
  'bid-documents-issuance': 1,
  'pre-bid-conference': 12,
  'clarification-deadline': 5,
  'bid-submission-opening': 30,
  'bid-evaluation': 15,
  'post-qualification': 30,
  'bac-resolution-award': 7,
  'approval-resolution': 7,
  'notice-of-award': 3,
  'contract-signing': 10,
  'notice-to-proceed': 7,
}

const DEFAULT_MAX_DAYS_BY_NAME: Array<{ pattern: RegExp; maxDays: number | null }> = [
  { pattern: /advertisement|posting of ib/i, maxDays: null },
  { pattern: /issuance|availability of bid doc/i, maxDays: 1 },
  { pattern: /pre-bid/i, maxDays: 12 },
  { pattern: /clarification/i, maxDays: 5 },
  { pattern: /submission.*opening/i, maxDays: 30 },
  { pattern: /bid evaluation/i, maxDays: 15 },
  { pattern: /post-qualification/i, maxDays: 30 },
  { pattern: /resolution of award/i, maxDays: 7 },
  { pattern: /approval of bac resolution/i, maxDays: 7 },
  { pattern: /notice of award/i, maxDays: 3 },
  { pattern: /contract signing/i, maxDays: 10 },
  { pattern: /notice to proceed/i, maxDays: 7 },
]

function resolveFallbackMaxDays(milestone: BiddingMilestone): number | null | undefined {
  if (milestone.milestoneKey in DEFAULT_MAX_DAYS_BY_KEY) {
    return DEFAULT_MAX_DAYS_BY_KEY[milestone.milestoneKey]
  }
  const byName = DEFAULT_MAX_DAYS_BY_NAME.find((d) => d.pattern.test(milestone.name))
  if (byName) {
    return byName.maxDays
  }
  return null
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

  const { data: activityTypesData } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })

  const activityTypeMap = useMemo(() => {
    const map = new Map<string, ProcurementActivityType>()
    for (const item of activityTypesData?.data || []) {
      if (item.id) map.set(item.id, item)
      if ((item as any).milestoneKey) {
        map.set(String((item as any).milestoneKey).toLowerCase(), item)
      }
      if (item.name) {
        map.set(item.name.toLowerCase().trim(), item)
      }
    }
    return map
  }, [activityTypesData])

  const findActivityType = (milestone: BiddingMilestone): ProcurementActivityType | undefined => {
    if (!milestone) return undefined
    if (milestone.milestoneKey && activityTypeMap.has(milestone.milestoneKey.toLowerCase())) {
      return activityTypeMap.get(milestone.milestoneKey.toLowerCase())
    }
    if (milestone.name && activityTypeMap.has(milestone.name.toLowerCase().trim())) {
      return activityTypeMap.get(milestone.name.toLowerCase().trim())
    }
    const nameLower = (milestone.name || '').toLowerCase()
    for (const [key, val] of activityTypeMap.entries()) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return val
      }
    }
    return undefined
  }

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
              <TableHead>Remaining Days</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="w-44 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone, index) => {
              const conflict = hasConflict(milestone)
              const executionStatus = resolveMilestoneExecutionStatus(milestone)
              const effectiveDate = getEffectiveMilestoneDate(milestone)
              const hasOverride = Boolean(milestone.overrideDate)

              const previousMilestone = index > 0 ? milestones[index - 1] : null
              const startDate = previousMilestone
                ? getEffectiveMilestoneDate(previousMilestone)
                : (schedule.ibPostingDate || effectiveDate)
              const endDate = effectiveDate

              const actType = findActivityType(milestone)
              const maxDays =
                actType?.maxDays !== undefined && actType?.maxDays !== null
                  ? actType.maxDays
                  : resolveFallbackMaxDays(milestone)

              const isCompleted =
                executionStatus === 'completed' || Boolean(milestone.completedAt)
              const remainingInfo = computeRemainingDays(effectiveDate, {
                isCompleted,
                maxDays,
              })

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

                  {/* Remaining Days */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 border',
                          getRemainingDaysBadgeClass(remainingInfo.variant),
                        )}
                      >
                        {remainingInfo.label}
                      </Badge>
                      {remainingInfo.maxDays !== null && (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          (max {remainingInfo.maxDays}d)
                        </span>
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
                        {isDraft && onEditMilestone ? (
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
