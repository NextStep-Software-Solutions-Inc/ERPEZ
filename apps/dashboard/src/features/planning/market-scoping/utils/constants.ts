/**
 * Market Scoping Constants
 * Location: src/features/planning/market-scoping/utils/
 */

/**
 * API Endpoints
 */
export const MARKET_SCOPING_ENDPOINTS = {
  BASE: '/api/market-scoping',
  LIST: '/api/market-scoping',
  CREATE: '/api/market-scoping',
  DETAILS: (id: string) => `/api/market-scoping/${id}`,
  UPDATE: (id: string) => `/api/market-scoping/${id}`,
  DELETE: (id: string) => `/api/market-scoping/${id}`,
  SUBMIT: (id: string) => `/api/market-scoping/${id}/submit`,
  APPROVE: (id: string) => `/api/market-scoping/${id}/approve`,
  REJECT: (id: string) => `/api/market-scoping/${id}/reject`,
  GENERATE_PDF: (id: string) => `/api/market-scoping/${id}/generate-pdf`,
  UPLOAD: (id: string) => `/api/market-scoping/${id}/upload`,
} as const

/**
 * Status values and labels
 */
export const MARKET_SCOPING_STATUSES = {
  DRAFT: {
    value: 'Draft',
    label: 'Draft',
    color: 'bg-gray-100 text-gray-900 border-gray-300',
  },
  SUBMITTED: {
    value: 'Submitted',
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  PENDING: {
    value: 'PendingApproval',
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  RETURNED: {
    value: 'Returned',
    label: 'Returned for Revision',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  APPROVED: {
    value: 'Approved',
    label: 'Approved',
    color: 'bg-green-100 text-green-900 border-green-300',
  },
  REJECTED: {
    value: 'Rejected',
    label: 'Rejected',
    color: 'bg-red-100 text-red-900 border-red-300',
  },
  ARCHIVED: {
    value: 'Archived',
    label: 'Archived',
    color: 'bg-gray-500 text-white border-gray-600',
  },
} as const

/**
 * Helper to get status object by value
 * Supports perspective-based labeling (Submitted for Creator vs Pending Approval for Approver)
 */
export const getStatusByValue = (
  statusValue?: string,
  isApprover: boolean = false,
) => {
  if (!statusValue) return MARKET_SCOPING_STATUSES.DRAFT
  const normalized = statusValue.toLowerCase()

  if (normalized === 'submitted' || normalized === 'pendingapproval') {
    return {
      value: statusValue,
      label: isApprover ? 'Pending Approval' : 'Submitted',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
    }
  }
  if (normalized === 'returned') {
    return {
      value: 'Returned',
      label: 'Returned for Revision',
      color: 'bg-orange-100 text-orange-900 border-orange-300',
    }
  }
  return (
    Object.values(MARKET_SCOPING_STATUSES).find(
      (s) => s.value.toLowerCase() === normalized,
    ) || {
      value: statusValue,
      label: statusValue,
      color: 'bg-gray-100 text-gray-900 border-gray-300',
    }
  )
}

/**
 * Activity types with descriptions
 * Based on Section 10 of Republic Act No. 12009 (GGAT Act)
 * Reference: Market Scoping Activities Conducted per RA 12009 IRR
 */
export const ACTIVITY_TYPES = {
  SupplierConsultations: {
    label:
      'Consultations with suppliers / contractors / consultants / professional associations or industry groups',
    description:
      'Direct engagement with potential providers to understand market capacity, capabilities, and pricing',
    documentation:
      'Highlights of consultations or meetings / Proof of attendance / Reports / Summaries / Screenshots / Brochures / Publications / Price quotations / Canvass sheets / Market Analysis Report or similar document/s',
  },
  SummitParticipation: {
    label: 'Participation in summits, fora, or conferences',
    description:
      'Attendance at industry events to gather market intelligence and stay informed on trends and best practices',
    documentation:
      'Highlights of consultations or meetings / Proof of Attendance / Reports',
  },
  TechnicalFinancialReview: {
    label: 'Review of technical, financial, or market/scientific reports',
    description:
      'Analysis of third-party reports and studies to establish baseline data and validate market assumptions',
    documentation:
      'Reports / Summaries / Screenshots / Brochures / Publications / Market Analysis Report or similar document / Online Product Reviews',
  },
  BrochuresPublications: {
    label:
      'Review of product or service brochures, marketing materials, industry journals and publications or related materials',
    description:
      'Examination of marketing and technical materials to understand product features, specifications, and available options',
    documentation:
      'Reports / Summaries / Screenshots / Brochures / Publications / Online Product Reviews',
  },
  PriceSourcing: {
    label:
      'Price sourcing for quotations or cost estimates from suppliers, contractors, or consultants',
    description:
      'Systematic collection of price information from multiple sources to establish realistic budget parameters',
    documentation: 'Price quotations / Canvass sheets / Online Product Reviews',
  },
  PhilGEPSReview: {
    label: 'Use of data from PhilGEPS or agency websites',
    description:
      'Consultation of government procurement databases and official records to identify reference prices and historical data',
    documentation:
      'Reports / Summaries / Screenshots / Price quotations / Canvass sheets / PhilGEPS Postings / Online Product Reviews',
  },
  OtherActivities: {
    label: 'Other analogous market scoping activity/ies undertaken',
    description:
      'Any additional market research method conducted that supports informed procurement decision-making',
    documentation: 'Supporting documentation as applicable',
  },
} as const

/**
 * NGPA Parameter configurations
 */
export const NGPA_PARAMETERS = [
  {
    id: 'project-cost-estimate',
    name: 'ProjectCostEstimate',
    displayName: 'Project Cost Estimate',
    guidedQuestion:
      'Have you conducted thorough market research to establish a realistic project cost estimate?',
  },
  {
    id: 'project-design-spec',
    name: 'ProjectDesignSpecification',
    displayName: 'Project Design and Specification',
    guidedQuestion:
      'Have you clearly defined and documented the technical specifications and design requirements?',
  },
  {
    id: 'technical-criteria',
    name: 'TechnicalCriteria',
    displayName: 'Technical Criteria',
    guidedQuestion:
      'Have you established and validated technical criteria for supplier/contractor evaluation?',
  },
  {
    id: 'delivery-lead-time',
    name: 'DeliveryLeadTime',
    displayName: 'Delivery Lead Time',
    guidedQuestion:
      'Have you confirmed realistic delivery timelines based on market conditions?',
  },
  {
    id: 'storage-warehousing',
    name: 'StorageWarehousingRequirements',
    displayName: 'Storage and Warehousing Requirements',
    guidedQuestion:
      'Have you assessed and documented storage/warehousing needs for the project?',
  },
  {
    id: 'identified-risks',
    name: 'IdentifiedRisks',
    displayName: 'Identified Risk/s',
    guidedQuestion:
      'Have you identified and documented potential risks and mitigation strategies?',
  },
] as const

/**
 * Form step definitions
 */
export const FORM_STEPS = {
  1: {
    step: 1,
    title: 'Project Overview',
    description: 'Basic project information',
  },
  2: {
    step: 2,
    title: 'Activities Conducted',
    description: 'Market research activities',
  },
  3: {
    step: 3,
    title: 'Parameter Evaluation',
    description: 'NGPA parameter assessment',
  },
  4: {
    step: 4,
    title: 'Review & Submit',
    description: 'Review and submit form',
  },
} as const

/**
 * File upload constraints
 */
const ALLOWED_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
]

export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_ACTIVITY: 5,
  MAX_FILES_PER_PARAMETER: 3,
  ALLOWED_MIME_TYPES,
} as const

/**
 * Query keys for React Query caching
 */
export const MARKET_SCOPING_QUERY_KEYS = {
  all: ['market-scoping'],
  lists: () => [...MARKET_SCOPING_QUERY_KEYS.all, 'list'],
  list: (filters?: Record<string, unknown>) => [
    ...MARKET_SCOPING_QUERY_KEYS.lists(),
    { filters },
  ],
  details: () => [...MARKET_SCOPING_QUERY_KEYS.all, 'details'],
  detail: (id: string) => [...MARKET_SCOPING_QUERY_KEYS.details(), id],
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FORM_REQUIRED_FIELDS: 'Please fill in all required fields',
  FORM_INVALID: 'Form contains validation errors',
  ACTIVITY_NO_FILES: 'Please attach files for all checked activities',
  PARAMETER_INCOMPLETE: 'All parameters must be evaluated',
  FORM_SAVE_FAILED: 'Failed to save form. Please try again.',
  FORM_SUBMIT_FAILED: 'Failed to submit form. Please try again.',
  PDF_GENERATION_FAILED: 'Failed to generate PDF. Please try again.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'File type not allowed',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  FORM_SAVED: 'Form saved successfully',
  FORM_SUBMITTED: 'Form submitted for approval',
  FORM_APPROVED: 'Form approved successfully',
  FORM_REJECTED: 'Form rejected',
  PDF_GENERATED: 'PDF generated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
} as const
