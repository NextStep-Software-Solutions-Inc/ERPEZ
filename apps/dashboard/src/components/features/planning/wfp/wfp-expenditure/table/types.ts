
export type WFPObjectiveTargetExpenditure = {
  id: string
  wfpObjectiveTargetId: string
  expenditureType: string
  lineItem: Array<{
    expenseAmount: number
    items: Array<{
      name: string
      unitEstimates: number
      quantity: number
      subTotal: number
    }>
  }>
  wfpObjectiveTarget: {
    id: string
    activityName: string
  }
}

/**
 * Nested expenditure item as returned in WFPObjectiveTarget.wfpObjectiveTargetExpenditures[]
 */
export type WFPObjectiveTargetExpenditureItem = {
  id: string
  itemDescription: string
  quantity: number
  unitCost: number
  object: Objects
}

export type Objects= {
  id: string
  name: string
  code: string
  parent: {
    id: string
    name: string
    code: string
  } | null
  isActive: boolean
  parentId?: string
}