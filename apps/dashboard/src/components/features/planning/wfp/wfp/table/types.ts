import type { DeliveryUnit } from '../../../delivery-unit'
import type { WFPObjectiveTarget } from '../../wfp-objective-target/table/types'
import type { OPCRActivity } from '../../opcr/table/types'
import { WFPObjective } from '@/features/planning/wfp/types/type.wfp'

/** Represents an external objective for non-OPCR WFP mode */
export type ExternalObjective = {
  id: string
  description: string
  outcome: string
  weight: number
  wfpObjectiveTargets?: WFPObjectiveTarget[]
}

export type WFP = {
  id: string
  officeName: string
  deliveryUnitId: string
  projectTitle: string
  generalObjective: string
  objectiveCount: number
  mode: 'OPCR' | 'External'
  projectStartDate: string
  projectEndDate: string
  status: 'Pending' | 'Returned' | 'Approved' | 'Submitted' | 'Draft'
  linkedOPCRId?: string | null // Links to one specific OPCR when mode = 'OPCR'
}

export type WorkPlanActivity = {
  id: string
  title: string
  outputIndicator: string
  target: number
  timeline: Array<string>
}

export type SpecificObjective = {
  id: string
  title: string
  description: string
  expectedOutcome: string
  activities: Array<WorkPlanActivity>
}

export type FinancialItem = {
  id: string
  description: string
  unitCost: number
  quantity: number
  subTotal: number
}

export type WFPDetails = WFP & {
  description: string
  agencyDepartment: string
  implementingEntity: string
  proposedBudget: number
  implementationPeriod: string
  objective: string
  specificObjectives: Array<SpecificObjective>
  wfpObjectiveTargets: Array<WFPObjectiveTarget>
  totalBudget: number
  deliveryUnits: DeliveryUnit
  wfpObjectives: WFPObjective[]
  deliveryUnit: {
    id: string
    office: {
      id: string
      name: string
      officeHead: string
      description: string
      address: string
      email: string
      contactNumber: string
      responsibilityCenterCode: string
    }
  }
  activityCount: number
}
export interface WFPPlan {
  id: string
  name: string
  code: string
  fiscalYear: number
  officeName: string
  fundName: string
  mode: 'opcr' | 'external'
  projectStartDate?: string
  projectEndDate?: string
  status?: 'Pending' | 'Approved' | 'Returned' | 'Submitted' | 'Draft'
  generalObjective?: string
  description?: string
  proposedBudget?: number
  // For OPCR mode
  opcrActivities?: OPCRActivity[]
  // For External mode
  objectives?: ExternalObjective[]
}
