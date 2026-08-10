
import type { WFPObjectiveTarget } from "../../wfp-objective-target/table/types"

export type WFPObjective = {
  id: string
  wfpId: string
  description: string
  weight: number
  outcome: string
  wfpObjectiveTargets: Array<WFPObjectiveTarget>
  wfp: { 
    id: string
    activityName: string
    indicator: string
    weight: number
    deliveryUnit: {
      id: string
    }
    activityBudgetRequirement: Array<{
      id: string
      description: string
    }>
    wfpObjectiveTimelines: Array<{
      id: string
      month: string
    }>
  }
}
