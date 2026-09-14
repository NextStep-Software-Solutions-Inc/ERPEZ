import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  Calendar,
  ListOrdered,
  GanttChart,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import {
  computeRemainingDays,
  formatRemainingDaysBadgeLabel,
  getRemainingDaysBadgeClass,
} from '../utils/remainingDays'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'
import type { CalendarEvent, BiddingSchedule, BiddingMilestone } from '../../bidding-schedule/types'
import { getBacCalendarEventsRequest } from '../handlers/getBacCalendarEventsRequest'
import { useBiddingSchedule } from '../../bidding-schedule/handlers/hooks'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'

const useBacCalendarEvents = createQueryHookFromTemplate(getBacCalendarEventsRequest)

// RA 9184 statutory maximum limits in calendar days
const RA9184_STATUTORY_MAX_DAYS: Record<string, number> = {
  'ib-posting': 7, // Min 7 calendar days posting
  'bid-documents-issuance': 1,
  'pre-bid-conference': 12, // Min 12 cd before bid opening
  'clarification-deadline': 10,
  'bid-submission-opening': 30, // 30-45 cd for goods
  'bid-evaluation': 7, // Max 7 cd
  'post-qualification': 12, // Max 12 cd (up to 30/45)
  'bac-resolution-award': 7, // Max 7 cd
  'approval-resolution': 7,
  'notice-of-award': 3, // Max 3 cd
  'contract-signing': 10, // Max 10 cd
  'notice-to-proceed': 7, // Max 7 cd
}

function resolveStatutoryMaxDays(title: string, key?: string | null): number | null {
  const k = (key || '').toLowerCase()
  if (k && RA9184_STATUTORY_MAX_DAYS[k] !== undefined) {
    return RA9184_STATUTORY_MAX_DAYS[k]
  }
  const t = title.toLowerCase()
  if (/advertisement|posting of ib/i.test(t)) return 7
  if (/issuance|availability of bid doc/i.test(t)) return 1
  if (/pre-bid/i.test(t)) return 12
  if (/clarification/i.test(t)) return 10
  if (/submission.*opening/i.test(t)) return 30
  if (/bid evaluation/i.test(t)) return 7
  if (/post-qualification|post-qual/i.test(t)) return 12
  if (/resolution.*award|recommendation of award/i.test(t)) return 7
  if (/notice of award|noa/i.test(t)) return 3
  if (/contract signing|contract/i.test(t)) return 10
  if (/notice to proceed|ntp/i.test(t)) return 7
  return null
}

function resolveMilestoneTitle(
  name?: string | null,
  remarks?: string | null,
  key?: string | null,
  actTypeName?: string | null,
  index?: number,
): string {
  const isGeneric =
    !name ||
    name.trim().toLowerCase() === 'advertisement/posting of ib/rei' ||
    name.trim().toLowerCase() === 'milestone'

  if (key) {
    const k = key.toLowerCase()
    if (k === 'ib-posting' || k === 'advertisement-posting') return 'Advertisement / Posting of IB'
    if (k.includes('document') || k.includes('issuance')) return 'Issuance of Bidding Documents'
    if (k.includes('pre-bid')) return 'Pre-Bid Conference'
    if (k.includes('clarification') || k.includes('bulletin')) return 'Clarification & Bid Bulletin'
    if (k.includes('submission') || k.includes('opening')) return 'Submission & Opening of Bids'
    if (k.includes('evaluation')) return 'Bid Evaluation'
    if (k.includes('post-qual')) return 'Post-Qualification'
    if (k.includes('resolution') || k.includes('award-recom')) return 'BAC Resolution of Award'
    if (k.includes('notice-of-award') || k === 'noa') return 'Notice of Award'
    if (k.includes('contract')) return 'Contract Signing'
    if (k.includes('proceed') || k === 'ntp') return 'Notice to Proceed'
  }

  if (
    remarks &&
    remarks.trim().toLowerCase() !== 'advertisement/posting of ib/rei' &&
    remarks.trim().length > 3
  ) {
    return remarks.trim()
  }

  if (
    actTypeName &&
    actTypeName.trim().toLowerCase() !== 'advertisement/posting of ib/rei'
  ) {
    return actTypeName.trim()
  }

  if (!isGeneric && name) return name.trim()

  return `Milestone ${(index ?? 0) + 1}`
}

export interface UnifiedMilestone {
  id: string
  order: number
  key: string
  title: string
  targetDate: Date
  dateLabel: string
  timeLabel?: string | null
  venue?: string | null
  isCompleted: boolean
  isOverdue: boolean
  isToday: boolean
  remainingDays: number | null
  remainingBadgeLabel: string
  statusVariant: 'completed' | 'success' | 'warning' | 'destructive' | 'none'
  maxAllowedDays: number | null
  intervalDaysFromPrev: number | null
  prevMilestoneTitle?: string
  progressPercent: number
  isOverridden?: boolean
  remarks?: string | null
}

interface BiddingScheduleGanttStripProps {
  bacResolutionId?: string | null
  bacResolutionNumber?: string | null
  className?: string
  action?: React.ReactNode
  description?: string
}

export function BiddingScheduleGanttStrip({
  bacResolutionId,
  bacResolutionNumber,
  className,
  action,
  description,
}: BiddingScheduleGanttStripProps) {
  const [viewMode, setViewMode] = useState<'pipeline' | 'gantt'>('pipeline')

  // Fetch activity types for metadata
  const { data: activityTypesData } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })

  const activityTypeMap = useMemo(() => {
    const map = new Map<string, ProcurementActivityType>()
    for (const item of activityTypesData?.data || []) {
      map.set(item.id, item)
    }
    return map
  }, [activityTypesData])

  // Dedicated schedule hook for this resolution
  const { data: scheduleResponse, isPending: isScheduleLoading } =
    useBiddingSchedule({
      pathParams: { resolutionId: bacResolutionId || '' },
      enabled: Boolean(bacResolutionId),
    })

  // Fallback query for calendar events
  const { data: calendarEventsResponse, isPending: isEventsLoading } =
    useBacCalendarEvents({
      pathParams: {},
      queryParams: {},
      enabled: Boolean(bacResolutionId) && !scheduleResponse?.data,
    })

  const isLoading = isScheduleLoading || isEventsLoading

  // Normalize data from either the dedicated schedule or calendar events
  const milestones = useMemo<UnifiedMilestone[]>(() => {
    if (!bacResolutionId) return []

    const scheduleData = scheduleResponse?.data as BiddingSchedule | undefined
    if (scheduleData && Array.isArray(scheduleData.milestones) && scheduleData.milestones.length > 0) {
      // Map from official BiddingMilestone records
      const rawList = [...scheduleData.milestones].sort((a, b) => a.order - b.order)

      return rawList.map((m, idx) => {
        const dateStr = m.overrideDate || m.computedDate
        const targetDate = parseISO(dateStr)
        const actType = m.milestoneKey ? activityTypeMap.get(m.milestoneKey) : undefined
        const maxAllowed = actType?.maxDays ?? resolveStatutoryMaxDays(m.name, m.milestoneKey)
        const isCompleted = Boolean(m.completedAt)

        const remainingInfo = computeRemainingDays(dateStr, {
          isCompleted,
          maxDays: maxAllowed,
        })

        const prevMilestone = idx > 0 ? rawList[idx - 1] : null
        let intervalDays: number | null = null
        if (prevMilestone) {
          const prevDate = parseISO(prevMilestone.overrideDate || prevMilestone.computedDate)
          intervalDays = Math.max(0, differenceInCalendarDays(targetDate, prevDate))
        }

        const title = resolveMilestoneTitle(m.name, null, m.milestoneKey, actType?.name, idx)

        return {
          id: m.id || `m-${idx}`,
          order: m.order || idx + 1,
          key: m.milestoneKey || `milestone-${idx}`,
          title,
          targetDate,
          dateLabel: format(targetDate, 'MMM d, yyyy'),
          timeLabel: m.time || null,
          venue: 'BAC Office',
          isCompleted,
          isOverdue: remainingInfo.isOverdue,
          isToday: remainingInfo.isToday,
          remainingDays: remainingInfo.daysRemaining,
          remainingBadgeLabel: formatRemainingDaysBadgeLabel(remainingInfo),
          statusVariant: remainingInfo.variant,
          maxAllowedDays: maxAllowed,
          intervalDaysFromPrev: intervalDays,
          prevMilestoneTitle: prevMilestone ? prevMilestone.name : undefined,
          progressPercent: 0,
          isOverridden: Boolean(m.overrideDate),
        }
      })
    }

    // Fallback: extract from calendar events
    const rawEvents = calendarEventsResponse?.data?.events || []
    if (!Array.isArray(rawEvents) || rawEvents.length === 0) return []

    const filtered = rawEvents.filter(
      (e: CalendarEvent) =>
        e.bacResolutionId === bacResolutionId ||
        e.projectId === bacResolutionId ||
        (bacResolutionNumber && e.projectTitle?.includes(bacResolutionNumber)),
    )

    const listToUse = filtered.length > 0 ? filtered : rawEvents.slice(0, 8)

    // Sort strictly by start date ascending
    const sorted = [...listToUse].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

    return sorted.map((e, idx) => {
      const targetDate = new Date(e.startDate)
      const actType = activityTypeMap.get(e.procurementActivityTypeId)
      const isCompleted =
        e.status === 'Completed' ||
        e.scheduleStatus === 'locked' ||
        e.executionStatus === 'completed'

      const title = resolveMilestoneTitle(
        e.procurementActivityTypeName,
        e.remarks,
        e.milestoneKey,
        actType?.name,
        idx,
      )

      const maxAllowed = actType?.maxDays ?? resolveStatutoryMaxDays(title, e.milestoneKey)
      const remainingInfo = computeRemainingDays(e.startDate, {
        isCompleted,
        maxDays: maxAllowed,
      })

      const prevEvent = idx > 0 ? sorted[idx - 1] : null
      let intervalDays: number | null = null
      if (prevEvent) {
        const prevDate = new Date(prevEvent.startDate)
        intervalDays = Math.max(0, differenceInCalendarDays(targetDate, prevDate))
      }

      const hasSpecificTime =
        targetDate.getHours() !== 0 || targetDate.getMinutes() !== 0

      return {
        id: e.id || `ev-${idx}`,
        order: idx + 1,
        key: e.milestoneKey || `ev-key-${idx}`,
        title,
        targetDate,
        dateLabel: format(targetDate, 'MMM d, yyyy'),
        timeLabel: hasSpecificTime ? format(targetDate, 'hh:mm a') : null,
        venue: e.venue || 'BAC Office',
        isCompleted,
        isOverdue: remainingInfo.isOverdue,
        isToday: remainingInfo.isToday,
        remainingDays: remainingInfo.daysRemaining,
        remainingBadgeLabel: formatRemainingDaysBadgeLabel(remainingInfo),
        statusVariant: remainingInfo.variant,
        maxAllowedDays: maxAllowed,
        intervalDaysFromPrev: intervalDays,
        prevMilestoneTitle: prevEvent?.procurementActivityTypeName || undefined,
        progressPercent: 0,
        remarks: e.remarks,
      }
    })
  }, [
    bacResolutionId,
    bacResolutionNumber,
    scheduleResponse,
    calendarEventsResponse,
    activityTypeMap,
  ])

  // Boundary metrics
  const boundaryData = useMemo(() => {
    if (milestones.length === 0) return null

    const startTime = milestones[0].targetDate.getTime()
    const endTime = milestones[milestones.length - 1].targetDate.getTime()
    const totalDurationMs = Math.max(24 * 60 * 60 * 1000, endTime - startTime)
    const totalCalendarDays = Math.max(1, differenceInCalendarDays(milestones[milestones.length - 1].targetDate, milestones[0].targetDate))

    // Map progress percent for each milestone relative to total window
    const itemsWithPercent = milestones.map((m) => {
      const offsetMs = m.targetDate.getTime() - startTime
      const progressPercent = Math.min(100, Math.max(0, (offsetMs / totalDurationMs) * 100))
      return { ...m, progressPercent }
    })

    const completedCount = itemsWithPercent.filter((m) => m.isCompleted).length
    const nextUpcoming = itemsWithPercent.find((m) => !m.isCompleted && !m.isOverdue)

    // Today indicator offset
    const todayMs = new Date().getTime()
    const todayPercent =
      todayMs < startTime
        ? null
        : todayMs > endTime
          ? null
          : Math.min(100, Math.max(0, ((todayMs - startTime) / totalDurationMs) * 100))

    return {
      startDate: milestones[0].targetDate,
      endDate: milestones[milestones.length - 1].targetDate,
      totalCalendarDays,
      items: itemsWithPercent,
      completedCount,
      totalCount: itemsWithPercent.length,
      nextUpcoming,
      todayPercent,
    }
  }, [milestones])

  // Group milestones into RA 9184 statutory phases for the Gantt/Phase view
  const statutoryPhases = useMemo(() => {
    if (!boundaryData || boundaryData.items.length === 0) return []

    const items = boundaryData.items
    const phases: Array<{
      id: string
      title: string
      description: string
      colorBadge: string
      startMilestone: UnifiedMilestone
      endMilestone: UnifiedMilestone
      phaseDays: number
      items: UnifiedMilestone[]
      startPercent: number
      widthPercent: number
    }> = []

    // Phase 1: Posting & Pre-Bid (Posting up to Pre-Bid)
    const phase1Items = items.filter((m) =>
      /posting|issuance|pre-bid/i.test(m.title) ||
      ['ib-posting', 'bid-documents-issuance', 'pre-bid-conference'].includes(m.key),
    )

    // Phase 2: Submission & Opening (Clarifications and Bid Opening)
    const phase2Items = items.filter((m) =>
      /clarification|bulletin|submission.*opening/i.test(m.title) ||
      ['clarification-deadline', 'bid-submission-opening'].includes(m.key),
    )

    // Phase 3: Evaluation & Post-Qual (Bid Eval & Post-Qual)
    const phase3Items = items.filter((m) =>
      /evaluation|post-qual/i.test(m.title) ||
      ['bid-evaluation', 'post-qualification'].includes(m.key),
    )

    // Phase 4: Award & Contracting (Resolution, NOA, Contract, NTP)
    const phase4Items = items.filter((m) =>
      /resolution|award|contract|proceed/i.test(m.title) ||
      ['bac-resolution-award', 'notice-of-award', 'contract-signing', 'notice-to-proceed'].includes(m.key),
    )

    const rawGroups = [
      {
        id: 'phase-1',
        title: 'Posting & Pre-Bid Phase',
        description: 'Mandatory 7-day posting and pre-bid consultation',
        colorBadge: 'border-sky-500/30 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
        items: phase1Items,
      },
      {
        id: 'phase-2',
        title: 'Bidding & Preparation Window',
        description: 'Statutory 30-45 calendar day submission window',
        colorBadge: 'border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
        items: phase2Items,
      },
      {
        id: 'phase-3',
        title: 'Evaluation & Post-Qualification',
        description: 'Technical/financial evaluation and qualification',
        colorBadge: 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        items: phase3Items,
      },
      {
        id: 'phase-4',
        title: 'Award, Contract & NTP',
        description: 'BAC resolution, NOA, contract execution & NTP',
        colorBadge: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        items: phase4Items,
      },
    ]

    const startTime = boundaryData.startDate.getTime()
    const totalDurationMs = Math.max(24 * 60 * 60 * 1000, boundaryData.endDate.getTime() - startTime)

    for (const group of rawGroups) {
      if (group.items.length === 0) continue
      const first = group.items[0]
      const last = group.items[group.items.length - 1]
      const pStart = first.targetDate.getTime()
      const pEnd = last.targetDate.getTime()
      const phaseDays = Math.max(1, differenceInCalendarDays(last.targetDate, first.targetDate))
      const startPercent = Math.min(95, Math.max(0, ((pStart - startTime) / totalDurationMs) * 100))
      const widthPercent = Math.max(8, Math.min(100 - startPercent, ((pEnd - pStart) / totalDurationMs) * 100 || 10))

      phases.push({
        id: group.id,
        title: group.title,
        description: group.description,
        colorBadge: group.colorBadge,
        startMilestone: first,
        endMilestone: last,
        phaseDays,
        items: group.items,
        startPercent,
        widthPercent,
      })
    }

    return phases
  }, [boundaryData])

  if (!bacResolutionId) {
    return null
  }

  return (
    <Card className={cn('border border-default-200 shadow-sm overflow-hidden bg-white dark:bg-card', className)}>
      {/* Header with Title, Badges & View Switcher */}
      <CardHeader className="py-3 px-4 bg-muted/20 border-b border-default-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Bidding Activity Timeline & Milestones
            </CardTitle>
            <Badge variant="outline" className="text-[10px] py-0 px-2 font-normal border-primary/20 text-primary bg-primary/5">
              RA 9184 Standard Schedule
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {description ||
              'Sequential milestones, statutory allowable limits, and calendar tracking for this resolution.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* View mode toggle */}
          <div className="inline-flex items-center rounded-lg border border-default-200 bg-muted/40 p-0.5 text-xs">
            <Button
              type="button"
              variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 px-2.5 text-xs font-medium gap-1.5 shadow-none rounded-md',
                viewMode === 'pipeline' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setViewMode('pipeline')}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Milestone Pipeline
            </Button>
            <Button
              type="button"
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 px-2.5 text-xs font-medium gap-1.5 shadow-none rounded-md',
                viewMode === 'gantt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setViewMode('gantt')}
            >
              <GanttChart className="h-3.5 w-3.5" />
              Phase Timeline
            </Button>
          </div>

          {action}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-xs text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading bidding milestones and timeline...</span>
          </div>
        ) : !boundaryData || boundaryData.items.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/5 space-y-2">
            <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="font-medium text-foreground">No bidding schedule milestones generated yet</p>
            <p className="text-[11px] max-w-sm mx-auto">
              Open the schedule workspace above to generate standard RA 9184 milestones from the IB posting date.
            </p>
          </div>
        ) : (
          <TooltipProvider>
            {/* KPI Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/25 rounded-xl border border-default-200/70 text-xs">
              {/* Total Window Span */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">Window Span</div>
                  <div className="font-semibold text-foreground text-sm">
                    {boundaryData.totalCalendarDays} calendar days
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {format(boundaryData.startDate, 'MMM d, yyyy')} – {format(boundaryData.endDate, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Progress Count */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">Milestone Progress</div>
                  <div className="font-semibold text-foreground text-sm">
                    {boundaryData.completedCount} of {boundaryData.totalCount} Completed
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {boundaryData.totalCount - boundaryData.completedCount} milestones pending
                  </div>
                </div>
              </div>

              {/* Immediate Next Milestone */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground font-medium">Next Target Action</div>
                  <div className="font-semibold text-foreground text-sm truncate">
                    {boundaryData.nextUpcoming ? boundaryData.nextUpcoming.title : 'All Milestones Completed'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {boundaryData.nextUpcoming
                      ? `${boundaryData.nextUpcoming.dateLabel} • ${boundaryData.nextUpcoming.remainingBadgeLabel}`
                      : 'Workflow finalized'}
                  </div>
                </div>
              </div>
            </div>

            {/* VIEW 1: MILESTONE PIPELINE (Sequential Journey) */}
            {viewMode === 'pipeline' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <ListOrdered className="h-3.5 w-3.5 text-primary" />
                    Chronological Milestone Sequence
                  </span>
                  <span>RA 9184 Prescribed Deadlines</span>
                </div>

                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-default-200">
                  {boundaryData.items.map((item, idx) => {
                    const badgeClass = getRemainingDaysBadgeClass(item.statusVariant)

                    return (
                      <div key={item.id || idx} className="relative group">
                        {/* Step Marker Node */}
                        <div
                          className={cn(
                            'absolute -left-6 top-2.5 h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-2xs transition-transform group-hover:scale-110',
                            item.isCompleted
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : item.isToday || (item.remainingDays !== null && item.remainingDays <= 7)
                                ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 dark:ring-amber-900/50 animate-pulse'
                                : 'bg-white dark:bg-card text-muted-foreground border-default-300',
                          )}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <span>{item.order < 10 ? `0${item.order}` : item.order}</span>
                          )}
                        </div>

                        {/* Milestone Card */}
                        <div className="p-3 bg-white dark:bg-card rounded-lg border border-default-200/90 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {item.title}
                              </span>
                              {item.isOverridden && (
                                <Badge variant="outline" className="text-[9px] py-0 px-1 text-amber-600 border-amber-300">
                                  Overridden
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium text-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-default-100 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {item.dateLabel}
                                {item.timeLabel && (
                                  <span className="text-muted-foreground font-normal">
                                    • {item.timeLabel}
                                  </span>
                                )}
                              </span>

                              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border', badgeClass)}>
                                {item.remainingBadgeLabel}
                              </span>
                            </div>
                          </div>

                          {/* Milestone Meta Bar */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t border-default-100 pt-1.5">
                            {/* Statutory RA 9184 limit */}
                            <span className="inline-flex items-center gap-1 text-default-700 font-medium">
                              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              {item.maxAllowedDays !== null
                                ? `Statutory Limit: Max ${item.maxAllowedDays} calendar days`
                                : 'Day 0 Reference Point'}
                            </span>

                            {/* Interval from previous milestone */}
                            {item.intervalDaysFromPrev !== null && item.intervalDaysFromPrev > 0 && (
                              <span className="inline-flex items-center gap-1 text-default-600">
                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                +{item.intervalDaysFromPrev} days from prior step
                              </span>
                            )}

                            {/* Venue */}
                            {item.venue && (
                              <span className="inline-flex items-center gap-1 text-default-600">
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                {item.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: PHASE TIMELINE (Visual Gantt / Macro Phases) */}
            {viewMode === 'gantt' && (
              <div className="space-y-4 pt-1">
                {/* Axis Dates */}
                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b border-default-200 pb-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Start: {format(boundaryData.startDate, 'MMM d, yyyy')}
                  </span>
                  <span className="text-center text-muted-foreground font-sans text-[11px] font-medium">
                    RA 9184 Statutory Phases Overview
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    End: {format(boundaryData.endDate, 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Macro Timeline Rail */}
                <div className="space-y-2">
                  <div className="relative w-full h-8 bg-muted/40 rounded-xl overflow-hidden border border-default-200 p-1 flex items-center">
                    {/* Contiguous Phase Blocks */}
                    {statutoryPhases.map((phase) => (
                      <Tooltip key={phase.id}>
                        <TooltipTrigger asChild>
                          <div
                            style={{
                              left: `${phase.startPercent}%`,
                              width: `${phase.widthPercent}%`,
                            }}
                            className={cn(
                              'absolute h-6 rounded-lg border text-[10px] font-semibold flex items-center justify-center px-1.5 truncate cursor-pointer transition-all hover:brightness-95 shadow-2xs',
                              phase.colorBadge,
                            )}
                          >
                            <span className="truncate">{phase.title} ({phase.phaseDays}d)</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-3 text-xs max-w-xs space-y-1.5 bg-white dark:bg-card border border-default-200 text-default-900 shadow-xl rounded-lg z-50">
                          <p className="font-bold text-xs">{phase.title}</p>
                          <p className="text-[11px] text-muted-foreground">{phase.description}</p>
                          <div className="text-[11px] text-default-700 border-t border-default-100 pt-1 space-y-0.5">
                            <div><strong>Duration:</strong> {phase.phaseDays} calendar days</div>
                            <div><strong>Start:</strong> {phase.startMilestone.title} ({phase.startMilestone.dateLabel})</div>
                            <div><strong>End:</strong> {phase.endMilestone.title} ({phase.endMilestone.dateLabel})</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}

                    {/* Today indicator line */}
                    {boundaryData.todayPercent !== null && (
                      <div
                        style={{ left: `${boundaryData.todayPercent}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                      >
                        <span className="absolute -top-3 -left-4 text-[8px] font-extrabold bg-red-500 text-white px-1 rounded-sm uppercase">
                          Today
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Milestone Pins Strip */}
                  <div className="relative w-full h-6">
                    {boundaryData.items.map((item, idx) => (
                      <Tooltip key={item.id || idx}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            style={{ left: `${item.progressPercent}%` }}
                            className={cn(
                              'absolute -top-1 -translate-x-1/2 h-5 w-5 rounded-full border flex items-center justify-center text-[9px] font-bold shadow-xs hover:scale-125 transition-transform z-20 cursor-pointer',
                              item.isCompleted
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : item.isToday || (item.remainingDays !== null && item.remainingDays <= 7)
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : 'bg-white dark:bg-card text-foreground border-default-400',
                            )}
                          >
                            {item.order}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-3 text-xs max-w-xs space-y-1.5 bg-white dark:bg-card border border-default-200 text-default-900 shadow-xl rounded-lg z-50">
                          <p className="font-bold text-xs">{item.title}</p>
                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <div><strong>Date:</strong> {item.dateLabel} {item.timeLabel ? `• ${item.timeLabel}` : ''}</div>
                            {item.venue && <div><strong>Venue:</strong> {item.venue}</div>}
                            {item.maxAllowedDays && <div><strong>RA 9184 Limit:</strong> Max {item.maxAllowedDays} calendar days</div>}
                            <div><strong>Status:</strong> {item.remainingBadgeLabel}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Phase Cards Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {statutoryPhases.map((phase) => (
                    <div key={phase.id} className="p-3 rounded-lg border border-default-200 bg-default-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{phase.title}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {phase.phaseDays} calendar days
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{phase.description}</p>
                      <div className="space-y-1 border-t border-default-200/60 pt-1.5">
                        {phase.items.map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-foreground truncate max-w-[200px]">{m.title}</span>
                            <span className="text-muted-foreground font-mono text-[10px]">{m.dateLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
