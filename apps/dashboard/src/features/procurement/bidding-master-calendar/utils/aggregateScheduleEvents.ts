import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import { MASTER_CALENDAR_PROJECT_OVERRIDES } from '../data/mockBiddingMasterCalendarData'
import { deriveProjectStatus } from './deriveProjectStatus'
import type { BacResolution } from '../../bac-resolution/types'
import { getPrimaryLinkedConsolidatedPr } from '../../bac-resolution/utils/bacResolutionWorkflow'
import type { BiddingSchedule } from '../../bidding-schedule/types'
import {
  formatScheduleTime,
  resolveMilestoneExecutionStatus,
} from '../../bidding-schedule/utils/milestonePresentation'
import type {
  BiddingMasterCalendarAppBand,
  BiddingMasterCalendarEvent,
} from '../types'

interface AggregateScheduleEventsOptions {
  schedules: BiddingSchedule[]
  resolutions: BacResolution[]
  appBands: BiddingMasterCalendarAppBand[]
  today?: Date
}

export function aggregateScheduleEvents({
  schedules,
  resolutions,
  appBands,
  today = new Date(),
}: AggregateScheduleEventsOptions): BiddingMasterCalendarEvent[] {
  const todayStart = startOfDay(today)
  const resolutionMap = new Map(resolutions.map((item) => [item.id, item]))
  const appBandMap = new Map(
    appBands.map((item) => [item.bacResolutionId, item]),
  )

  return schedules.flatMap((schedule) => {
    const resolution = resolutionMap.get(schedule.bacResolutionId)
    const projectOverride =
      MASTER_CALENDAR_PROJECT_OVERRIDES[schedule.bacResolutionId]
    const projectNames =
      resolution?.linkedConsolidatedPrs.map((item) => item.projectName) ?? []
    const primaryLinkedPr = resolution
      ? getPrimaryLinkedConsolidatedPr(resolution)
      : null
    const officeLabel =
      projectOverride?.officeLabel ??
      primaryLinkedPr?.endUser ??
      'Procurement Office'
    const fiscalYear =
      resolution?.resolutionDate.slice(0, 4) ??
      schedule.ibPostingDate.slice(0, 4)
    const resolvedMilestoneDates = schedule.milestones.map(
      (milestone) => milestone.overrideDate ?? milestone.computedDate,
    )
    const derivedProjectStatus = deriveProjectStatus(
      resolvedMilestoneDates,
      schedule.status,
      todayStart,
    )
    const appBand = appBandMap.get(schedule.bacResolutionId)

    return schedule.milestones.map((milestone) => {
      const eventDate = milestone.overrideDate ?? milestone.computedDate
      const executionStatus = resolveMilestoneExecutionStatus(
        milestone,
        todayStart,
      )

      return {
        id: `${schedule.id}-${milestone.id}`,
        bacResolutionId: schedule.bacResolutionId,
        bacResolutionNumber: schedule.bacResolutionNumber,
        scheduleId: schedule.id,
        scheduleStatus: schedule.status,
        fiscalYear,
        procurementCategory: schedule.procurementCategory,
        projectNames,
        primaryProjectName:
          projectOverride?.projectTitle ??
          projectNames[0] ??
          resolution?.description ??
          schedule.bacResolutionNumber,
        officeLabel,
        linkedCprCount: resolution?.linkedConsolidatedPrs.length ?? 0,
        milestoneId: milestone.id,
        milestoneKey: milestone.milestoneKey,
        milestoneName: milestone.name,
        milestoneOrder: milestone.order,
        eventDate,
        eventTime: formatScheduleTime(milestone.time),
        isEdited: milestone.isEdited,
        executionStatus,
        sourceType: schedule.status,
        derivedProjectStatus,
        appTargetMonth: appBand?.monthKey ?? null,
        isDueSoon: executionStatus === 'due-soon',
        isOverdue: executionStatus === 'overdue',
        isProvisional:
          resolution?.status === 'draft' && schedule.status === 'draft',
      }
    })
  })
}
