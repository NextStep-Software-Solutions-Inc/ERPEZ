/**
 * Market Scoping Form - Core Domain Types
 * Location: src/features/planning/market-scoping/
 */

/**
 * Main Market Scoping Form entity
 * Represents a single market scoping activity from creation through approval
 */
export interface MarketScopingForm {
  id: string
  userId?: string // Creator/Representative user ID
  projectName: string
  estimatedBudget: number
  periodFrom: string // mm/yyyy format
  periodTo: string // mm/yyyy format
  expectedDeliveryDate: string // mm/yyyy format
  deliveryDate?: string // ISO date string from API backend
  linkedLibActivityId?: string // Optional reference to LIB Activity
  targetLineItemBudgetId?: string // Optional reference to Project-level LIB
  targetLineItemBudgetNumber?: string // Optional LIB budget number
  targetLineItemBudget?: {
    id?: string
    libNumber?: string
  }
  targetLineItemBudgetActivityId?: string // Optional reference to Activity-level LIB Activity
  targetLineItemBudgetActivityName?: string // Optional activity name
  targetLineItemBudgetActivity?: {
    id?: string
    name?: string
    lineItemBudgetId?: string
    lineItemBudget?: {
      id?: string
      libNumber?: string
    }
  }
  agencyName: string
  departmentUnit: string
  representativeName: string
  representativeDesignation: string
  activities: ActivityEvidence[]
  activitiesConducted?: ActivityEvidence[]
  parameters: ParameterEvaluation[]
  parameterEvaluations?: ParameterEvaluation[]
  status: MarketScopingStatus
  createdBy: string
  createdDate: Date
  updatedDate?: Date
  submittedDate?: Date
  approvedDate?: Date
  rejectionDate?: Date
  rejectionReason?: string
  approvalRouting: ApprovalRoutingStep[]
  pdfGeneratedDate?: Date
  pdfUrl?: string
  signedDocumentFileId?: string
}

/**
 * Activity Evidence tracking
 * Represents each market scoping activity conducted and its supporting documents
 */
export interface ActivityEvidence {
  id: string
  activitySettingsId?: string // ID from market-scoping-activity-settings API
  activityType: string // Type from API settings
  label?: string // Label from API settings
  description?: string // User-provided description or from API
  attachments: FileAttachment[]
  checked: boolean
}

/**
 * NGPA Parameter Evaluation
 * Represents evaluation of each NGPA parameter
 */
export interface ParameterEvaluation {
  parameterId: string
  parameterSettingsId?: string // ID from market-scoping-parameter-settings API
  parameterName: string // Name from API settings
  displayName: string // Human-readable name from API
  guidedQuestion: string // Guiding question for evaluator from API
  considered?: 'Yes' | 'No' | 'NotApplicable'
  recommendations: string // Mandatory text area
  attachments: FileAttachment[]
}

/**
 * File Attachment entity
 */
export interface FileAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number // in bytes (may be absent for stored files)
  fileType?: string // MIME type (may be absent for stored files)
  uploadedDate?: Date
  rawFile?: File
}

/**
 * Approval Routing Step
 * Tracks the approval workflow through organizational hierarchy
 */
export interface ApprovalRoutingStep {
  step: number
  actor: string // User ID or email
  actorName: string
  role: string // Department Head, Agency Head, etc.
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated'
  action?: string // Specific action message
  actionDate?: Date
  rejectionReason?: string
  escalationReason?: string
}

/**
 * Market Scoping Status enum
 */
export type MarketScopingStatus =
  'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Archived'

/**
 * Form step definitions for wizard
 */
export enum FormStep {
  ProjectOverview = 1,
  ActivitiesConducted = 2,
  ParameterEvaluation = 3,
  Review = 4,
}

/**
 * API Response wrapper for Market Scoping operations
 */
export interface MarketScopingApiResponse {
  success: boolean
  data: MarketScopingForm
  message?: string
  errors?: Record<string, string>
}

/**
 * List response for Market Scoping records
 */
export interface MarketScopingListResponse {
  success: boolean
  data: MarketScopingForm[]
  pagination?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * PDF Generation response
 */
export interface PdfGenerationResponse {
  success: boolean
  data: {
    pdfUrl: string
    fileName: string
    generatedDate: Date
  }
  message?: string
}

/**
 * Approval action payload
 */
export interface ApprovalActionPayload {
  marketScopingId: string
  action: 'approve' | 'reject'
  rejectionReason?: string
  comments?: string
}

/**
 * Validation result for form steps
 */
export interface StepValidationResult {
  isValid: boolean
  errors: Record<string, string>
}
