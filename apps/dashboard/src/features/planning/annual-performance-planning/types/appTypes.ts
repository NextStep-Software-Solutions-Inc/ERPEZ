/**
 * APP Module Type Definitions
 * 
 * Centralized type definitions for all APP components, forms, and utilities
 */

/* ==================== Aggregation Types ==================== */

export type AggregationType = 'sum' | 'average' | 'fixed'

export interface AggregationConfig {
  type: AggregationType
  icon: string
  label: string
  description: string
  formula: string
}

/* ==================== Negotiation & Workflow ==================== */

export type NegotiationStatus = 'draft' | 'proposed' | 'negotiating' | 'agreed'

export interface NegotiationStatusConfig {
  status: NegotiationStatus
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

export interface StatusTransition {
  from: NegotiationStatus
  to: NegotiationStatus
  action?: string
}

export interface StatusHistoryItem {
  status: NegotiationStatus
  timestamp: Date
  userId: string
  userName: string
  userRole: string
  comment?: string
}

/* ==================== Fiscal Year ==================== */

export type FiscalYearStatus = 'setup' | 'active' | 'closed'

export interface FiscalYear {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: FiscalYearStatus
  createdAt: Date
  updatedAt: Date
  departmentId: string
}

export interface FiscalYearValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/* ==================== KPI & Target ==================== */

export type SourceType = 'mandated' | 'negotiable' | 'shopped'

export interface KPI {
  id: string
  name: string
  description?: string
  unit: string
  departmentId: string
  sourceType: SourceType
  isActive: boolean
  createdAt: Date
}

export interface TargetValue {
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
}

export interface Target extends TargetValue {
  id: string
  kpiId: string
  fiscalYearId: string
  aggregationType: AggregationType
  status: NegotiationStatus
  sourceType: SourceType
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TargetSnapshot extends Target {
  version: number
  snapshotDate: Date
}

/* ==================== Comments & Communication ==================== */

export interface Comment {
  id: string
  targetId: string
  authorId: string
  author: User
  text: string
  createdAt: Date
  updatedAt?: Date
  isEdited: boolean
}

export interface CommentThread {
  targetId: string
  comments: Comment[]
  totalCount: number
}

/* ==================== User & Access ==================== */

export interface User {
  id: string
  name: string
  email: string
  role: 'planning_officer' | 'office_head' | 'approver' | 'viewer'
  avatar?: string
  department?: Department
}

export interface Department {
  id: string
  name: string
  code: string
  parentDepartmentId?: string
}

/* ==================== Form Data ==================== */

export interface AppStep1FormData {
  fiscalYearName: string
  startDate: Date
  endDate: Date
}

export interface AppStep2FormData {
  fiscalYearId: string
  kpis: Array<{
    kpiId: string
    aggregationType: AggregationType
  }>
}

export interface AppStep3FormData {
  fiscalYearId: string
  targets: Array<{
    kpiId: string
    annual: number
    q1: number
    q2: number
    q3: number
    q4: number
    status: NegotiationStatus
  }>
}

export interface AppFormData {
  step1: AppStep1FormData
  step2: AppStep2FormData
  step3: AppStep3FormData
}

/* ==================== Component Props ==================== */

export interface TimelineCardProps {
  startDate: Date
  endDate: Date
  status: FiscalYearStatus
  isLocked: boolean
}

export interface SnapshotItemProps {
  id: string
  name: string
  isSnapshotting?: boolean
  snapshotVersion?: number
}

export interface TargetRowProps {
  rowId: string
  kpiName: string
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
  aggregationType: AggregationType
  sourceType: SourceType
  isLocked?: boolean
  negotiationStatus?: NegotiationStatus
  onValueChange?: (field: string, value: number) => void
  onDelete?: () => void
  onComment?: () => void
  onStatusChange?: (status: NegotiationStatus) => void
  onAutoSpread?: () => void
}

export interface CommentDrawerProps {
  open: boolean
  onClose: () => void
  kpiName: string
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
  aggregationType?: AggregationType
  comments: Comment[]
  onAddComment: (text: string) => void
  currentUser: {
    name: string
    role: string
    avatar?: string
  }
}

export interface SimulationDialogProps {
  open: boolean
  onClose: () => void
  aggregationType: AggregationType
  expectedTarget: number
  kpiName: string
}

export interface NegotiationStatusStepperProps {
  currentStatus: NegotiationStatus
  onStatusChange?: (status: NegotiationStatus) => void
  readOnly?: boolean
  showDescription?: boolean
}

export interface AggregationPresetsProps {
  value: AggregationType
  onChange: (type: AggregationType) => void
  disabled?: boolean
}

/* ==================== Validation Results ==================== */

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface QuarterlyValidation extends ValidationResult {
  mismatch?: number
  tolerance?: number
}

export interface TargetValidationResult {
  kpiId: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/* ==================== API Request/Response ==================== */

export interface FiscalYearCreateRequest {
  name: string
  startDate: Date
  endDate: Date
  departmentId: string
}

export interface FiscalYearCreateResponse extends FiscalYear {}

export interface TargetUpdateRequest {
  kpiId: string
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
}

export interface TargetStatusUpdateRequest {
  targetId: string
  status: NegotiationStatus
}

export interface TargetStatusBatchUpdateRequest {
  updates: TargetStatusUpdateRequest[]
}

export interface CommentCreateRequest {
  targetId: string
  text: string
}

export interface CommentCreateResponse extends Comment {}

/* ==================== Utilities ==================== */

export interface QuarterlyValues {
  q1: number
  q2: number
  q3: number
  q4: number
}

export type QuarterlyTuple = [number, number, number, number]

export interface AggregationResult {
  annual: number
  quarterly: QuarterlyTuple
  isValid: boolean
}

/* ==================== Constants ==================== */

export const AGGREGATION_TYPES: Record<AggregationType, string> = {
  sum: 'Sum (Σ)',
  average: 'Average (x̄)',
  fixed: 'Fixed (▢)',
}

export const NEGOTIATION_STATUSES: Record<NegotiationStatus, string> = {
  draft: 'Draft',
  proposed: 'Proposed',
  negotiating: 'Negotiating',
  agreed: 'Agreed',
}

export const SOURCE_TYPES: Record<SourceType, string> = {
  mandated: 'Mandated',
  negotiable: 'Negotiable',
  shopped: 'Shopped',
}

export const FISCAL_YEAR_STATUSES: Record<FiscalYearStatus, string> = {
  setup: 'Setup',
  active: 'Active',
  closed: 'Closed',
}

/* ==================== Enums for Direct Import ==================== */

export enum AggregationTypeEnum {
  SUM = 'sum',
  AVERAGE = 'average',
  FIXED = 'fixed',
}

export enum NegotiationStatusEnum {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  NEGOTIATING = 'negotiating',
  AGREED = 'agreed',
}

export enum SourceTypeEnum {
  MANDATED = 'mandated',
  NEGOTIABLE = 'negotiable',
  SHOPPED = 'shopped',
}

export enum FiscalYearStatusEnum {
  SETUP = 'setup',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

/* ==================== Error Types ==================== */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>,
  ) {
    super('VALIDATION_ERROR', message, validationErrors)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT_ERROR', message)
    this.name = 'ConflictError'
  }
}

/* ==================== UI State ==================== */

export interface AppUIState {
  step: 1 | 2 | 3
  loading: boolean
  error?: string
  success?: string
}

export interface TargetRowUIState {
  isEditing: boolean
  showValidation: boolean
  isAutoSpreading: boolean
  commentCount: number
}

/* ==================== Feature Flags ==================== */

export interface FeatureFlags {
  enableSnapshotting: boolean
  enableSimulation: boolean
  enableComments: boolean
  enableStatusTracking: boolean
  enableAutoSpread: boolean
  enableDepartmentFiltering: boolean
  enableURLRouting: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableSnapshotting: true,
  enableSimulation: true,
  enableComments: true,
  enableStatusTracking: true,
  enableAutoSpread: true,
  enableDepartmentFiltering: false,
  enableURLRouting: false,
}
