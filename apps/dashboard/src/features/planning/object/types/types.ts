export type Object = {
  id: string
  parent?: {}
  name?: string
  code?: string
  isActive: boolean
  fiscalYearId?: string
  expenseClassId?: string
  childObjectCount: number
  wfpObjectiveActivityExpenditureCount: number
  transactionCount: number
}
