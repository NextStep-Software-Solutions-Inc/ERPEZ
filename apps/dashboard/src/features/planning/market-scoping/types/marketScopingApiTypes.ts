/**
 * Market Scoping API Request/Response Types
 * Derived from erpez-swagger.json API contracts.
 * Reference the swagger contract as the source of truth when verifying or updating these types.
 */

import type {
  MarketScopingForm,
  ApprovalActionPayload,
  FileAttachment,
} from "./marketScopingTypes";

/**
 * Raw Activity Conducted item returned in GET /market-scopings/:id API response
 */
export interface RawActivityConducted {
  id?: string;
  activityId?: string;
  activitySettingsId?: string;
  activityType?: string;
  label?: string;
  description?: string;
  attachments?: FileAttachment[];
  checked?: boolean;
}

/**
 * Raw Parameter Evaluation item returned in GET /market-scopings/:id API response
 */
export interface RawParameterEvaluation {
  parameterId?: string;
  parameterSettingsId?: string;
  parameterName?: string;
  displayName?: string;
  guidedQuestion?: string;
  isConsidered?: boolean;
  considered?: "Yes" | "No" | "NotApplicable";
  remarks?: string;
  recommendations?: string;
  attachments?: FileAttachment[];
}

/**
 * Raw Market Scoping entity returned in GET /market-scopings/:id API response
 */
export interface RawMarketScopingResponseData extends Omit<MarketScopingForm, 'activities' | 'parameters'> {
  activitiesConducted?: RawActivityConducted[];
  parameterEvaluations?: RawParameterEvaluation[];
  deliveryDate?: string;
  agency?: string;
  department?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    office?: {
      id?: string;
      name?: string;
      organization?: {
        id?: string;
        name?: string;
      };
    };
    personnelPositions?: Array<{
      position?: {
        id?: string;
        title?: string;
      };
    }>;
  };
}


/**
 * Activity conducted in market scoping
 */
export interface ActivityConducted {
  activitySettingsId: string;
  activityId: string;
  attachments: FileAttachmentPayload[];
}

/**
 * Parameter evaluation in market scoping
 */
export interface ParameterEvaluationPayload {
  parameterSettingsId: string;
  parameterId: string;
  isConsidered: boolean;
  remarks: string;
  attachments: FileAttachmentPayload[];
}

/**
 * File attachment payload
 */
export interface FileAttachmentPayload {
  fileUrl: string;
  fileName: string;
}

/**
 * Create Market Scoping Form request payload
 * Maps to POST /market-scopings endpoint
 */
export interface CreateMarketScopingRequest {
  userId: string; // UUID of the current user
  projectName: string;
  estimatedBudget: number;
  periodFrom: string; // ISO 8601 date-time
  periodTo: string; // ISO 8601 date-time
  deliveryDate: string; // ISO 8601 date-time
  /** Project-level target LIB. Mutually exclusive with targetLineItemBudgetActivityId. */
  targetLineItemBudgetId?: string;
  /** Activity-level target LIB Activity. Mutually exclusive with targetLineItemBudgetId. */
  targetLineItemBudgetActivityId?: string; // UUID reference to LIB activity
  /** Office context for authorization. Future: derived from auth token. */
  officeId: string;
  activitiesConducted: ActivityConducted[];
  parameterEvaluations: ParameterEvaluationPayload[];
}

/**
 * Update (Draft) Market Scoping Form request payload
 */
export interface UpdateMarketScopingRequest {
  userId?: string;
  projectName?: string;
  estimatedBudget?: number;
  periodFrom?: string;
  periodTo?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  linkedLibActivityId?: string;
  /** Project-level target LIB. Mutually exclusive with targetLineItemBudgetActivityId. */
  targetLineItemBudgetId?: string;
  /** Activity-level target LIB Activity. Mutually exclusive with targetLineItemBudgetId. */
  targetLineItemBudgetActivityId?: string;
  /** Office context for authorization. Future: derived from auth token. */
  officeId?: string;
  representativeName?: string;
  representativeDesignation?: string;
  activitiesConducted?: ActivityConducted[];
  parameterEvaluations?: ParameterEvaluationPayload[];
}

/**
 * Add Activity Evidence request
 */
export interface AddActivityEvidenceRequest {
  activityType:
    | "Consultations"
    | "PhilGEPS"
    | "PriceSourcing"
    | "SupplierVisits"
    | "BenchmarkingStudies"
    | "RegulatoryReview"
    | "Other";
  description?: string;
  files: File[]; // Binary file data
}

/**
 * Update Parameter Evaluation request
 */
export interface UpdateParameterEvaluationRequest {
  parameterId: string;
  considered: "Yes" | "No" | "NotApplicable";
  recommendations: string;
  files?: File[];
}

/**
 * Submit for Approval request
 */
export interface SubmitForApprovalRequest {
  marketScopingId: string;
  submissionComments?: string;
}

/**
 * Approve/Reject request
 */
export interface ApproveRejectRequest extends ApprovalActionPayload {
  actionComments?: string;
}

/**
 * List Market Scoping Query Params
 */
export interface ListMarketScopingParams {
  page?: number;
  pageSize?: number;
  status?: string;
  departmentUnit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * List response
 */
export interface ListMarketScopingResponse {
  success: boolean;
  data: MarketScopingForm[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Get single record response
 */
export interface GetMarketScopingResponse {
  success: boolean;
  data: MarketScopingForm;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

/**
 * Activity setting item returned by /market-scoping-activity-settings
 */
export interface ActivitySettingApiResponse {
  id: string;
  activityType: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Parameter setting item returned by /market-scoping-parameter-settings
 */
export interface ParameterSettingApiResponse {
  id: string;
  name: string;
  guidedQuestion: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Personnel Position entity returned by /personnel-positions
 */
export interface PersonnelPosition {
  id: string;
  userId: string;
  positionId: string;
  assignmentType: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  positionTitle: string;
  positionCode: string;
  user: {
    id: string;
    employeeNumber: string;
    username: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    nameExtension: string;
    fullName: string;
    phoneNumber: string;
    employmentStatus: string;
    dateHired: string;
    dateSeparated: string | null;
    isActive: boolean;
    officeId: string;
    officeName: string;
  };
  position: {
    id: string;
    title: string;
    functionalTitle: string;
    code: string;
    jobDescription: string;
    qualifications: string;
    fte: number;
    operationalStatus: string;
    positionTypeId: string;
    plantillaTypeId: string;
    salaryGradeId: string;
    stepId: string;
    officeId: string;
    officeName: string;
  };
}

/**
 * Minimal MSF summary embedded inside PPMPDetailedResponse and PPMPActivityResponse.
 * Contains only the fields needed by the PPMP UI to display and navigate to the MSF.
 */
export interface MSFSummary {
  id: string;
  projectName: string;
  estimatedBudget: number;
  status: string;
}

/**
 * Request body for PATCH /market-scopings/{id}/link
 * Exactly one of the two target fields should be populated (mutually exclusive).
 */
export interface LinkMarketScopingRequest {
  /** Project-level target LIB. Mutually exclusive with targetLineItemBudgetActivityId. */
  targetLineItemBudgetId?: string;
  /** Activity-level target LIB Activity. Mutually exclusive with targetLineItemBudgetId. */
  targetLineItemBudgetActivityId?: string;
  /** Office context for authorization. Future: derived from auth token. */
  officeId: string;
}
