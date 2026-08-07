// Utility to transform WFP API response into a grouped structure for Gantt chart
// Grouped by Objective > Activity > Timelines

export interface GanttTimeline {
  id: string
  timelineType: string
  startDate: string
  endDate: string
  targetValue: number
}

export interface GanttActivityGrouped {
  id: string
  name: string
  timelines: GanttTimeline[]
  budget: number
}

export interface GanttObjectiveGroup {
  id: string
  name: string
  activities: GanttActivityGrouped[]
}

export function transformWFPDataToGanttGroups(wfpData: {
  wfpObjectives: Array<{
    id: string
    description: string
    wfpObjectiveTargets: Array<{
      id: string
      activityName: string
      wfpObjectiveTimelines: Array<{
        id: string
        timelineType: string
        startDate: string
        endDate: string
        targetValue: number
      }>
      wfpObjectiveTargetExpenditures?: Array<{
        unitCost: number
      }>
    }>
  }>
}): GanttObjectiveGroup[] {
  return wfpData.wfpObjectives.map(objective => ({
    id: objective.id,
    name: objective.description,
    activities: objective.wfpObjectiveTargets.map(target => ({
      id: target.id,
      name: target.activityName,
      timelines: target.wfpObjectiveTimelines.map(tl => ({
        id: tl.id,
        timelineType: tl.timelineType,
        startDate: tl.startDate,
        endDate: tl.endDate,
        targetValue: tl.targetValue
      })),
      budget: (target.wfpObjectiveTargetExpenditures || []).reduce(
        (sum, exp) => sum + (exp.unitCost || 0),
        0
      )
    }))
  }))
}
