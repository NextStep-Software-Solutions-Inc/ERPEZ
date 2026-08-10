/**
 * Performance Review Module – Core Types
 * Layer 3: Performance Review (v2)
 * Aligns with: Procurement Library module patterns
 */

import { FileType } from '@/components/features/planning/file-upload/handlers/createFileRequest'
import type { OPCRItemTargetInfo } from '@/lib/opcr'

// ─── Workflow States ──────────────────────────────────────────────────────────
export type WorkflowStatus =
  | 'OPEN_FOR_RATING'
  | 'SUBMITTED_FOR_REVIEW'
  | 'FINALIZED'
  | 'REJECTED_FOR_REVISION'

// ─── KPI Category / Function Type ────────────────────────────────────────────
export type KPICategory = 'STRATEGIC' | 'CORE' | 'SUPPORT'

export const KPI_CATEGORY_LABELS: Record<KPICategory, string> = {
  STRATEGIC: 'Strategic Functions',
  CORE: 'Core Functions',
  SUPPORT: 'Support Functions',
}

export const KPI_CATEGORY_WEIGHTS: Record<KPICategory, number> = {
  STRATEGIC: 0.45,
  CORE: 0.4,
  SUPPORT: 0.15,
}

// ─── Adjectival Rating ────────────────────────────────────────────────────────
export type AdjectivalRating =
  | 'Outstanding'
  | 'Very Satisfactory'
  | 'Satisfactory'
  | 'Unsatisfactory'
  | 'Poor'

export function getAdjectivalRating(score: number): AdjectivalRating {
  if (score >= 4.5) return 'Outstanding'
  if (score >= 3.5) return 'Very Satisfactory'
  if (score >= 2.5) return 'Satisfactory'
  if (score >= 1.5) return 'Unsatisfactory'
  return 'Poor'
}

export const ADJECTIVAL_COLOR: Record<AdjectivalRating, string> = {
  Outstanding: 'bg-green-100 text-green-800 border-green-200',
  'Very Satisfactory': 'bg-blue-100 text-blue-800 border-blue-200',
  Satisfactory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Unsatisfactory: 'bg-orange-100 text-orange-800 border-orange-200',
  Poor: 'bg-red-100 text-red-800 border-red-200',
}

// ─── Status badge colors ──────────────────────────────────────────────────────
export const WORKFLOW_STATUS_COLORS: Record<WorkflowStatus, string> = {
  OPEN_FOR_RATING: 'bg-blue-100 text-blue-800 border-blue-200',
  SUBMITTED_FOR_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
  FINALIZED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED_FOR_REVISION: 'bg-red-100 text-red-800 border-red-200',
}

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  OPEN_FOR_RATING: 'Open for Rating',
  SUBMITTED_FOR_REVIEW: 'Submitted for Review',
  FINALIZED: 'Posted',
  REJECTED_FOR_REVISION: 'Rejected for Revision',
}

// ─── MOV (Means of Verification) ─────────────────────────────────────────────
export interface MOVFile {
  id: string
  name: string
  url: string
  fileType: FileType
  uploadedAt: string
  uploadedBy: string
  /** Explicit index into `configuredMOVs` array; undefined means uncategorised */
  configuredMOVIndex?: number
  /** Explicit configured MOV name when the upload is tied to a labeled evidence slot */
  configuredMOVName?: string
}

// ─── QET Rating Inputs ────────────────────────────────────────────────────────
export interface QETRating {
  quality: number | null // Q
  efficiency: number | null // E
  timeliness: number | null // T
  average: number | null // auto-computed (Q + E + T) / n
  qualityId?: string
  efficiencyId?: string
  timelinessId?: string
}

export type RatingScaleType = 'FIXED' | 'NON_FIXED'

export interface RatingLevel {
  level: 5 | 4 | 3 | 2 | 1
  description: string
  min: number | null
  max: number | null
}

// ─── KPI Measurement Model ──────────────────────────────────────────────────
export interface KPIMeasurement {
  id: string
  kpiId: string
  name: string
  statement: string
  dimensions: string[] | null
  moVs: Array<string | null>
  ratingScaleTemplateId: string | null
  isMOVEditable: boolean
  isScaleEditable: boolean
  createdAt?: string
  createdBy?: string | null
}

// ─── KPI Line Item ───────────────────────────────────────────────────────────
export interface KPILineItem {
  id: string
  opcrItemId?: string
  opcrId: string
  category: KPICategory
  kpiName?: string | null
  officeName?: string | null
  opcrFiscalYear?: number | string | null
  measurementUnit?: string | null
  distributionBehavior?: string | null
  targetInfo?: OPCRItemTargetInfo
  functionDescription: string
  successIndicator: string
  target: string
  weight: number
  tags: Array<'quality' | 'efficiency' | 'timeliness'> // controls which QET fields to show
  // Governance flags (instance-level editable overrides)
  isScaleEditable: boolean // allow adjusting rating scale ranges for this instance
  isMOVEditable: boolean // allow adding/removing MOVs for this instance
  scaleType: RatingScaleType
  ratingLevels: RatingLevel[]
  configuredMOVs?: string[] // optional configured MOV names from measurement template
  // Ratings
  selfRating: QETRating
  finalRating: QETRating
  finalizationRemark: string
  // Supporting docs
  actual: string
  movFiles: MOVFile[]
  justification: string // required when actual < target
  ratingScaleLabel: string // e.g. '5 - Outstanding to 1 - Poor'
  ratingScaleTemplateId?: string | null
  fyActiveKPIMeasurementId?: string | null
}

// ─── Evaluation Session ───────────────────────────────────────────────────────
export interface EvaluationSession {
  id: string
  opcrId: string
  fiscalYear: string
  deliveryUnitId: string
  deliveryUnitName: string
  rateeId: string
  rateeName: string
  status: WorkflowStatus
  kpiItems: KPILineItem[]
  // Computed summary
  categoryAverages: Record<KPICategory, number | null>
  finalRatingScore: number | null
  adjectivalRating: AdjectivalRating | null
  // Audit trail
  submittedAt: string | null
  submittedBy: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  finalizedAt: string | null
  finalizedBy: string | null
  rejectedAt: string | null
  rejectedBy: string | null
  rejectionComment: string | null
  createdAt: string
  updatedAt: string
}

// ─── Delivery Unit / Ratee ────────────────────────────────────────────────────
export interface DeliveryUnit {
  id: string
  name: string
  sector: string
  cluster: string
}

// ─── OPCR Reference ──────────────────────────────────────────────────────────
export interface OPCRReference {
  id: string
  title: string
  fiscalYear: string
  deliveryUnitId: string
  deliveryUnitName: string
  status: 'APPROVED' | 'DRAFT'
  kpiCount: number
  commitmentStatus?: string
  reviewStatus?: string
  // Optional metadata
  selfRatingDone?: boolean
  finalizationDone?: boolean
  rateeName?: string
  sector?: string
  cluster?: string
}

// ─── Form Schemas (used with zod) ─────────────────────────────────────────────
export interface RateeSubmissionPayload {
  sessionId: string
  kpiItems: Array<{
    id: string
    actual: string
    selfRating: QETRating
    justification: string
    movFileIds: string[]
  }>
}

export interface PMTCalibrationPayload {
  sessionId: string
  kpiItems: Array<{
    id: string
    finalRating: QETRating
    remark: string
  }>
  action: 'APPROVE' | 'RETURN'
  comments?: string
}

// ─── Ranking Row ─────────────────────────────────────────────────────────────
export interface RankingRow {
  id: string
  rank: number
  rateeName: string
  deliveryUnitName: string
  sector: string
  cluster: string
  finalRatingScore: number
  adjectivalRating: AdjectivalRating
  fiscalYear: string
  status: WorkflowStatus
  sessionId?: string
}

// ─── Rating Scale Template Model ──────────────────────────────────────────────
export interface RatingScaleLevel {
  id: string
  ratingScaleTemplateId: string
  ratingValue: number
  description?: string
  minValue?: number
  maxValue?: number
}

export interface RatingScaleTemplate {
  id: string
  name?: string
  description?: string
  isFixed: boolean
  isDefault: boolean
  generalRatingScaleId?: string
  RatingScaleLevels: RatingScaleLevel[]
}

export interface OPCRRating {
  id: string
  opcrEvaluationId: string
  performanceMeasureId: string
  opcrId: string
  dukpiTargetAssignmentId: string
  numericalRating: number
  remarks?: string
  dimension?: 'quality' | 'efficiency' | 'timeliness' | string
}
