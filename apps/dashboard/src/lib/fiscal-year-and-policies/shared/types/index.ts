/**
 * Shared types for Fiscal Year & Policies module
 * Centralized type definitions for all features
 */

// ============================================
// ENUMS: Status & Classification
// ============================================

export enum FiscalYearStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
}

export enum BudgetCallStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum PolicyType {
  PROCUREMENT = 'procurement',
  FINANCIAL = 'financial',
  GOVERNANCE = 'governance',
}

export enum FunctionCategory {
  CORE = 'Core',
  STRATEGIC = 'Strategic',
  SUPPORT = 'Support',
}

export enum ProcurementMethodType {
  OPEN_BIDDING = 'open_bidding',
  LIMITED_BIDDING = 'limited_bidding',
  NEGOTIATED_PROCUREMENT = 'negotiated_procurement',
}

export enum QETDimension {
  QUANTITY = 'quantity',
  EFFICIENCY = 'efficiency',
  TIMELINESS = 'timeliness',
}

// ============================================
// ENTITY TYPES: Core business objects
// ============================================

export type BudgetCall = {
  id: string
  fiscalYearId: string
  name: string
  description?: string
  status: BudgetCallStatus
  startDate: string
  endDate: string
  template?: Record<string, unknown>
  parentBudgetCallId?: string // For hierarchical relationships
  order?: number
}

export type ProcurementThreshold = {
  id: string
  fiscalYearId: string
  code: string
  name: string
  method: ProcurementMethodType
  minAmount: number
  maxAmount?: number
  parentThresholdId?: string // For hierarchical relationships
  order?: number
  isArchived: boolean
}

export type RatingScale = {
  id: string
  fiscalYearId: string
  name: string
  code?: string
  description?: string
  type: 'general' | 'custom'
  scaleType: 'fixed' | 'non_fixed'
  ratings: RatingLevel[]
  applicableToQET?: QETDimension[]
  isArchived: boolean
}

export type RatingLevel = {
  rating: 1 | 2 | 3 | 4 | 5
  description: string
  minValue?: number
  maxValue?: number
}

export type FunctionWeight = {
  functionCategory: FunctionCategory
  percentage: number
}

// ============================================
// PAYLOAD TYPES: API request bodies
// ============================================

export type CreateFiscalYearPayload = {
  yearNumber: number
  description?: string
  startDate: string
  endDate: string
}

export type UpdateFiscalYearPayload = Partial<CreateFiscalYearPayload>

export type CreateEconomicIndicatorPayload = {
  fiscalYearId: string
  code: string
  name: string
  value: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  metadata?: Record<string, unknown>
}

export type UpdateEconomicIndicatorPayload = Partial<
  Omit<CreateEconomicIndicatorPayload, 'fiscalYearId'>
>

export type CreateBudgetCallPayload = {
  fiscalYearId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  parentBudgetCallId?: string
}

export type UpdateBudgetCallPayload = Partial<
  Omit<CreateBudgetCallPayload, 'fiscalYearId'>
>

export type CreateProcurementThresholdPayload = {
  fiscalYearId: string
  code: string
  name: string
  method: ProcurementMethodType
  minAmount: number
  maxAmount?: number
  parentThresholdId?: string
}

export type UpdateProcurementThresholdPayload = Partial<
  Omit<CreateProcurementThresholdPayload, 'fiscalYearId'>
>

export type CreateRatingScalePayload = {
  fiscalYearId: string
  name: string
  code?: string
  description?: string
  type: 'general' | 'custom'
  scaleType: 'fixed' | 'non_fixed'
  ratings: Omit<RatingLevel, 'id'>[]
  applicableToQET?: QETDimension[]
}

export type UpdateRatingScalePayload = Partial<
  Omit<CreateRatingScalePayload, 'fiscalYearId'>
>

// ============================================
// RESPONSE TYPES: API responses
// ============================================

export interface PaginationMeta {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T> {
  data: T
  message?: string
  timestamp?: string
}

// ============================================
// QUERY PARAM TYPES: Filtering & Pagination
// ============================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FiscalYearFilters extends PaginationParams, SortParams {
  status?: FiscalYearStatus
  searchTerm?: string
}

export interface BudgetCallFilters extends PaginationParams, SortParams {
  fiscalYearId?: string
  status?: BudgetCallStatus
}

export interface ProcurementThresholdFilters
  extends PaginationParams,
    SortParams {
  fiscalYearId?: string
  method?: ProcurementMethodType
}
