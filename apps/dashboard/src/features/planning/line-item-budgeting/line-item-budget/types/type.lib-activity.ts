import { OPCRActivity } from '@/features/planning/opcr'
import {
  WFPObjectiveActivity,
  WFPObjectiveActivityExpenditure,
} from '@/features/planning/wfp/types/type.wfp'
import { ExpenseClass } from '@/features/uacs/code-segments/types/commonTypes'
import { LineItemBudgetDetails } from '../../line-item-budget-details/types/types'

export type Activity = {
  id: string
  name: string
  papCode?: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  wfpObjectiveActivity?: WFPObjectiveActivity
  opcrActivity?: OPCRActivity
  outputIndicator?: string
  outputIndicatorWeight?: number
  timelineType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  expenditure?: number
  target?: number
}

export type LIBActivity = {
  id: string
  lineItemBudgetId: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  name?: string
  papCode?: string
  budget?: number
  lineItemBudget: {
    id: string
    libNumber: string
    name: string
  }
  wfpObjectiveActivity?: WFPObjectiveActivity
  opcrActivity?: OPCRActivity
  details?: LineItemBudgetDetails[]
}

export type Details = {
  id: string
  objectId: string
  object: Object
  expenseClass:
    | ExpenseClass
    | {
        id: string
        name?: string
        code?: string
        type?: string
      }
  wfpObjectiveActivityExpenditureId?: string
  wfpObjectiveActivityExpenditure: WFPObjectiveActivityExpenditure
  description?: string
  unitQuantity?: number
  unitCost?: number
  timelineType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  startDate?: string
  endDate?: string
  budget: number
}
