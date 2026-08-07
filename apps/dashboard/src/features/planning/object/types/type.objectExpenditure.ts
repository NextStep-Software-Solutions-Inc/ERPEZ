export type ObjectExpenditure = {
  id: string
  objectId: string
  expenseClassId: string
  name?: string
  description?: string
  isActive: boolean
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}
