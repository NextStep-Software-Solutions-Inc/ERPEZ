import type { GanttActivity, TimelineItem, WFPResponse, WFPObjectiveTargetResponse } from '@/features/planning/types'

/**
 * Get default project start date (Jan 1 of current year)
 * Used as fallback when no timelines or project dates available
 */
function getDefaultProjectStart(): string {
  return `${new Date().getFullYear()}-01-01`
}

/**
 * Get default project end date (Dec 31 of current year)
 * Used as fallback when no timelines or project dates available
 */
function getDefaultProjectEnd(): string {
  return `${new Date().getFullYear()}-12-31`
}

/**
 * Transform a WFP objective target to a GanttActivity
 * 
 * Date Priority (highest to lowest):
 * 1. Activity timelines (if present)
 * 2. Project dates passed as parameters (if provided)
 * 3. Current fiscal year (Jan 1 - Dec 31) as final fallback
 * 
 * @param target - WFP objective target from API
 * @param projectStartDate - Optional project start date fallback (e.g., from WFP.projectStartDate)
 * @param projectEndDate - Optional project end date fallback (e.g., from WFP.projectEndDate)
 * @returns GanttActivity for use in GanttChart component
 */
export function transformWFPTargetToGanttActivity(
  target: WFPObjectiveTargetResponse,
  projectStartDate?: string,
  projectEndDate?: string
): GanttActivity {
  // Calculate total budget from expenditures
  const budget = (target.wfpObjectiveTargetExpenditures || []).reduce(
    (sum, exp) => sum + (exp.unitCost || 0),
    0
  )

  // Determine start and end from timelines, falling back to project dates
  // If neither timelines nor project dates available, use current fiscal year as fallback
  let start: string = projectStartDate || getDefaultProjectStart()
  let end: string = projectEndDate || getDefaultProjectEnd()

  if (target.wfpObjectiveTimelines && target.wfpObjectiveTimelines.length > 0) {
    const sortedTimelines = [...target.wfpObjectiveTimelines].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    start = sortedTimelines[0].startDate
    end = sortedTimelines[sortedTimelines.length - 1].endDate
  }

  // Transform timelines to TimelineItem format
  const timelines: TimelineItem[] = (target.wfpObjectiveTimelines || []).map(tl => ({
    id: tl.id,
    timelineType: tl.timelineType || 'Unspecified',
    startDate: tl.startDate,
    endDate: tl.endDate,
    targetValue: tl.targetValue
  }))

  return {
    id: target.id,
    name: target.activityName || 'Unnamed Activity',
    budget,
    start,
    end,
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    timelines
  }
}

/**
 * Transform WFP API response to GanttActivity array
 * Flattens wfpObjectives[].wfpObjectiveTargets[] into a single activity array
 * @param wfpData - The WFP API response object
 * @param projectStartDate - Optional project start date (fallback when timelines are empty)
 * @param projectEndDate - Optional project end date (fallback when timelines are empty)
 * @returns Array of GanttActivity ready for GanttChart component
 */
export function transformWFPDataToGanttActivities(
  wfpData: WFPResponse,
  projectStartDate?: string,
  projectEndDate?: string
): GanttActivity[] {
  // Use projectStartDate/projectEndDate from wfpData if available, otherwise use parameters
  const startDate = projectStartDate || wfpData.projectStartDate
  const endDate = projectEndDate || wfpData.projectEndDate

  // Handle null wfpObjectives array
  if (!wfpData.wfpObjectives) {
    return []
  }

  return wfpData.wfpObjectives.flatMap(objective => {
    // Handle null wfpObjectiveTargets array
    if (!objective.wfpObjectiveTargets) {
      return []
    }
    
    return objective.wfpObjectiveTargets.map(target => 
      transformWFPTargetToGanttActivity(target, startDate, endDate)
    )
  })
}

/**
 * Example usage:
 * 
 * const wfpResponse = await fetchWFPData()
 * const activities = transformWFPDataToGanttActivities(
 *   wfpResponse.data,
 *   wfpResponse.data.projectStartDate,  // Fallback for empty timelines
 *   wfpResponse.data.projectEndDate     // Fallback for empty timelines
 * )
 * 
 * <GanttChart
 *   activities={activities}
 *   mode={wfpResponse.data.mode === 'External' ? 'external' : 'opcr'}
 *   projectStartDate={wfpResponse.data.projectStartDate}
 *   projectEndDate={wfpResponse.data.projectEndDate}
 * />
 */
