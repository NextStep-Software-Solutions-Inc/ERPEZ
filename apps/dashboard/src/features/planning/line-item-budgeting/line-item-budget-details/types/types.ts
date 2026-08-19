export type LineItemBudgetDetails = {
  id: string
  lineItemBudgetId: string
  lineItemBudgetActivityId: string
  wfpObjectiveActivityExpenditureId?: string
  objectId: string
  description?: string
  unitQuantity?: number
  unitCost?: number
  timelineType?: string
  startDate?: string
  endDate?: string
  budget: number
  lineItemBudget: {
    id: string
    libNumber?: string
    name?: string
  }
  lineItemBudgetActivity: {
    id: string
    name?: string
  }
  object: {
    id: string
    name?: string
    code?: string
    parentId?: string
    parentObject?: {
      id: string
      name?: string
      code?: string
    }
  }
  wfpObjectiveActivityExpenditure: {
    id: string
    itemDescription?: string
    quantity?: number
    unitCost?: number
  }
  expenseClass: {
    id: string
    name?: string
    code?: string
    type?: string
  }
}

export type LineItemBudgetDetailsSearch = {
  libId?: string
  libActivityId?: string
  lineItemBudgetDetailsId?: string
}
