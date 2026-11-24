/**
 * Market Scoping Management Types
 * Types for managing Activities and Parameters (admin/system settings)
 * Location: src/features/planning/market-scoping/types/
 */

/**
 * Activity Type Definition
 * Used in system administration to manage available market research activity types
 */
export interface ActivityTypeDefinition {
  id: string
  type: string
  activityType?: string
  label: string
  description: string
  isActive: boolean
  sortOrder: number
  createdDate: Date
  updatedDate?: Date
}

/**
 * Parameter Definition
 * Used in system administration to manage NGPA parameter evaluations
 */
export interface ParameterDefinition {
  id: string
  type: string
  name?: string
  displayName: string
  guidedQuestion: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdDate: Date
  updatedDate?: Date
}

/**
 * Management API Response Types
 */
export interface ActivityTypeResponse {
  data: ActivityTypeDefinition[]
  count: number
  page: number
  pageSize: number
}

export interface ParameterResponse {
  data: ParameterDefinition[]
  count: number
  page: number
  pageSize: number
}

/**
 * Management Request Payloads
 */
export interface CreateActivityTypePayload {
  activityType: string
  label: string
  description: string
  sortOrder: number
  isActive: boolean
}

export interface UpdateActivityTypePayload {
  activityType?: string
  label?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
}

export interface CreateParameterPayload {
  name: string
  guidedQuestion: string
  description?: string
  sortOrder: number
  isActive: boolean
}

export interface UpdateParameterPayload {
  name?: string
  guidedQuestion?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
}
