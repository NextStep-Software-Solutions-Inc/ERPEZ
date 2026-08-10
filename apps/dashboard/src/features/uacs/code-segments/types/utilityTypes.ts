import type { FundingSource } from './fundingSourceTypes'
import type { OrganizationCode } from './organizationCodeTypes'
import type { LocationCode } from './locationCodeTypes'
import type { MfoPap } from './mfoPapTypes'
import type { ObjectCode } from './objectCodeTypes'
import type { ExpenseClass, MfoPapType } from './commonTypes'

/**
 * Code Segment Type Union
 */
export type CodeSegment =
  | FundingSource
  | OrganizationCode
  | LocationCode
  | MfoPap
  | ObjectCode

/**
 * Filter options for code segments
 */
export interface CodeSegmentFilters {
  fiscalYear?: number
  isActive?: boolean
  searchTerm?: string
  expenseClass?: ExpenseClass // Only applicable for Object Codes
  type?: MfoPapType // Only applicable for MFO/PAP
}

/**
 * Pagination response for code segments
 */
export interface CodeSegmentPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
