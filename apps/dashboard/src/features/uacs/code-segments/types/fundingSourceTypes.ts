/**
 * Fund Source Type Enumeration
 * Valid types based on API validation
 */
export enum FundSourceType {
  FUND_CLUSTER = 'Fund Cluster',
  FINANCING_SOURCE = 'Financing Source',
  AUTHORIZATION_CODE = 'Authorization Code',
  FUND_CATEGORY = 'Fund Category',
  FUND_SUB_CATEGORY = 'Fund Sub Category',
}

/**
 * Funding Source
 * Represents the source of funds with max 5 character code
 * 
 * API Response: GET /fund-sources
 * API Request: POST/PUT /fund-sources
 */
export interface FundingSource {
  id: string
  parentId?: string | null
  code: string // Max 5 characters
  name: string
  type: FundSourceType | string // One of: Fund Cluster, Financing Source, Authorization Code, Fund Category, Fund Sub Category
  isActive: boolean
  totalReceivedFunds: number
  totalDUAllocatedFunds: number
  createdAt: string
  createdBy: string

  // Optional fields for UI/form purposes (not from API)
  fiscalYear?: number
  description?: string
  updatedAt?: string
  updatedBy?: string
}

// Payload types for API requests
export interface CreateFundingSourcePayload {
  parentId?: string | null
  code: string // Max 5 characters
  name: string
  type: FundSourceType | string
  isActive?: boolean
}

export interface UpdateFundingSourcePayload extends Partial<CreateFundingSourcePayload> {}