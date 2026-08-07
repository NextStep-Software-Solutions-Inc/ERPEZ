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
}
