
import type { Objects } from "../../wfp-expenditure/table/types"

export type WFPObjectiveTarget = {
  id: string
  activityName: string
  weight: number
  indicator?: string
  timelineType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
  wfpObjective: {
    id: string
    description: string
    weight: number
    outcome: string
    deliveryUnitId: string
  }
  wfpObjectiveTargetExpenditures: Array<{
    id: string
    itemDescription: string
    quantity: number
    unitCost: number
    object: Objects
  }>
  wfpObjectiveTimelines: Array<{
    id: string
    startDate: string
    endDate: string
    targetValue: number
    timelineType: string
  }>
}
