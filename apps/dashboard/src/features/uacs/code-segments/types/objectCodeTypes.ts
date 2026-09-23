import type { UacsCodeSegmentBase, ExpenseClass } from './commonTypes'

/**
 * Object Code (10 digits)
 * Represents specific items/services that can be procured/budgeted
 */
export interface ObjectCode extends UacsCodeSegmentBase {
  code: string // Must be exactly 10 digits
  expenseClass: ExpenseClass
  accountGroup?: string
  parentId?: string // For subsidiary ledger support
  isSubsidiary: boolean
  children?: ObjectCode[] // Sub-objects for detailed tracking
  expenseClassId?: string | null
  fiscalYearId?: string | null
}

export interface ObjectApiResponse {
  id: string
  parent?: ObjectApiResponse | null
  name: string
  code: string
  isActive: boolean
  fiscalYearId?: string | null
  expenseClassId?: string | null
  childObjectCount: number
  wfpObjectiveActivityExpenditureCount: number
  transactionCount: number
}

export interface CreateObjectPayload {
  parentId?: string | null
  name: string
  code: string
  isActive: boolean
  fiscalYearId?: string | null
  expenseClassId?: string | null
}

export interface UpdateObjectPayload {
  name?: string
  code?: string
  isActive?: boolean
  fiscalYearId?: string | null
  expenseClassId?: string | null
}

export interface PaginatedObjectApiResponse {
  succeeded: boolean
  message: string | null
  data: ObjectApiResponse[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

