import { Object } from '../../object/types/types'

export type WFPObjective = {
  id: string
  wfpId: string
  description?: string
  weight: number
  outcome?: string
  createdAt: string
  createdBy?: string
  wfpObjectiveActivitiesCount: number
  wfpObjectiveActivities?: WFPObjectiveActivity[]
}

export type WFPObjectiveActivity = {
  id: string
  wfpObjectiveId: string
  activityName?: string
  indicator?: string
  weight: number
  createdAt: string
  createdBy?: string
  wfpObjectiveTimelines?: WFPObjectiveTimeline[]
  wfpObjectiveActivityExpenditures?: WFPObjectiveActivityExpenditure[]
}

export type WFPObjectiveActivityDetails = WFPObjectiveActivity & {
  wfpObjectiveTimelines: WFPObjectiveTimeline[]
  wfpObjectiveActivityExpenditures: WFPObjectiveActivityExpenditure[]
}

export type WFPObjectiveActivityExpenditure = {
  id: string
  wfpObjectiveActivityId: string
  object: Object
  itemDescription?: string
  quantity: number
  unitCost: number
  createdAt: string
  createdBy?: string
}

export type WFPObjectiveTimeline = {
  id: string
  wfpObjectiveActivityId: string
  timelineType?: string
  startDate: string
  endDate: string
  targetValue: number
  createdAt: string
  createdBy?: string
}
