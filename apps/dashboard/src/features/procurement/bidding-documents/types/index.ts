import type { ProcurementCategory } from '../../bidding-schedule/types'

export type BiddingDocumentStatus = 'draft' | 'generated' | 'posted'

export type BiddingDocumentPhaseKey =
  | 'prerequisites'
  | 'structured-inputs'
  | 'section-uploads'
  | 'generation-review'
  | 'posting-lock'

export type BiddingDocumentGateKey =
  | 'confirmedSchedule'
  | 'consolidatedPrApproved'
  | 'bacResolutionIssued'
  | 'gppbTemplatesAvailable'

export type BiddingDocumentGates = Record<BiddingDocumentGateKey, boolean>

export type BiddingDocumentSectionKey =
  | 'source-and-schedule'
  | 'submission-and-security'
  | 'venues-and-contact'
  | 'goods'
  | 'infrastructure'
  | 'consulting'

export type BiddingDocumentFieldKey = string

export type BiddingDocumentFieldInputType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'select'

export type BiddingDocumentFieldOption = {
  value: string
  label: string
}

export type BiddingDocumentFieldDefinition = {
  key: BiddingDocumentFieldKey
  section: BiddingDocumentSectionKey
  label: string
  placeholder?: string
  required: boolean
  inputType: BiddingDocumentFieldInputType
  helperText?: string
  readOnly?: boolean
  source?: 'system' | 'schedule' | 'computed' | 'manual'
  sourceNote?: string
  applicableCategories?: Array<ProcurementCategory>
  options?: Array<BiddingDocumentFieldOption>
  visibleWhen?: (record: BiddingDocumentRecord) => boolean
}

export type BiddingDocumentSectionDefinition = {
  key: BiddingDocumentSectionKey
  label: string
  description: string
}

export type BiddingDocumentUploadSlotKey =
  | 'technicalSpecifications'
  | 'scheduleOfRequirements'
  | 'specialConditions'
  | 'drawingsAndTechnicalSpecifications'
  | 'billOfQuantities'
  | 'termsOfReference'
  | 'technicalProposalForms'

export type BiddingDocumentUploadSlotDefinition = {
  key: BiddingDocumentUploadSlotKey
  label: string
  required: boolean
  accept: string
  acceptedExtensions: Array<string>
  helperText: string
}

export type UploadedSectionFile = {
  fileName: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string
}

export type BiddingDocumentScheduleSnapshot = {
  ibPostingDate: string
  preBidConference: string
  bidSubmissionDeadline: string
  bidOpening: string
  bidSecurityValidity: string
}

export type BiddingDocumentPreviewPage = {
  id: string
  title: string
  lines: Array<string>
}

export type BiddingDocumentDraftFieldPrimitive =
  | string
  | number
  | boolean
  | null

export type BiddingDocumentDraftFieldObject = Record<
  string,
  BiddingDocumentDraftFieldPrimitive
>

export type BiddingDocumentDraftFieldValue =
  | BiddingDocumentDraftFieldPrimitive
  | Array<BiddingDocumentDraftFieldObject>
  | BiddingDocumentDraftFieldObject

export type BiddingDocumentSourceLinkKey =
  | 'schedule'
  | 'pr'
  | 'agencyProfile'
  | 'bacProfile'

export type BiddingDocumentWorkflowState = {
  status: BiddingDocumentStatus
  needsRegeneration: boolean
  generatedAt: string | null
  postedAt: string | null
  postedBy: string | null
  isReadOnly: boolean
}

export type BiddingDocumentDraftFormState = {
  values: Record<string, BiddingDocumentDraftFieldValue>
  persistenceKey: string
  lastSavedAt: string | null
}

export type BiddingDocumentDraftUploadState = {
  slots: Record<string, UploadedSectionFile | null>
  customizedSections: {
    specialConditions: boolean
  }
}

export type BiddingDocumentDraftState = {
  form: BiddingDocumentDraftFormState
  uploads: BiddingDocumentDraftUploadState
}

export type BiddingDocumentReviewState = {
  templateKey: ProcurementCategory
  previewPages: Array<BiddingDocumentPreviewPage>
  currentPage: number
}

export type BiddingDocumentProgressState = {
  prerequisites: {
    complete: number
    total: number
  }
  structuredInputs: {
    complete: number
    total: number
  }
  uploads: {
    complete: number
    total: number
  }
  overall: {
    complete: number
    total: number
    percent: number
  }
}

export type BiddingDocumentWorkspaceState = {
  phaseOrder: Array<BiddingDocumentPhaseKey>
  activePhase: BiddingDocumentPhaseKey
  draft: BiddingDocumentDraftState
  review: BiddingDocumentReviewState
  progress: BiddingDocumentProgressState
  sourceLinks: Record<BiddingDocumentSourceLinkKey, string>
}

export type BiddingDocumentRecord = {
  id: string
  bacResolutionId: string
  bacResolutionNumber: string
  projectTitle: string
  agencyName: string
  agencyAddress: string
  bacChairperson: string
  contractId: string
  abc: number
  fundingSource: string
  procurementCategory: ProcurementCategory
  status: BiddingDocumentStatus
  gates: BiddingDocumentGates
  structuredFields: Record<BiddingDocumentFieldKey, string>
  uploads: Record<BiddingDocumentUploadSlotKey, UploadedSectionFile | null>
  scheduleSnapshot: BiddingDocumentScheduleSnapshot
  generatedAt: string | null
  postedAt: string | null
  postedBy: string | null
  lastDraftSavedAt: string | null
  previewPages: Array<BiddingDocumentPreviewPage>
  needsRegeneration: boolean
  workflow: BiddingDocumentWorkflowState
  workspace: BiddingDocumentWorkspaceState
}
