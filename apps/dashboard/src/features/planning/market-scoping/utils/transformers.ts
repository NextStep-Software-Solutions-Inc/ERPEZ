/**
 * Data Transformation Utilities
 * Convert API responses to form-friendly structures and vice versa
 */

import type {
  MarketScopingForm,
  ActivityEvidence,
  ParameterEvaluation,
} from "../types/marketScopingTypes";
import type {
  GetMarketScopingResponse,
  CreateMarketScopingRequest,
  UpdateMarketScopingRequest,
} from "../types/marketScopingApiTypes";

/**
 * Transform API response to form-ready structure
 */
export function transformApiResponseToForm(input: GetMarketScopingResponse | MarketScopingForm): Partial<MarketScopingForm> {
  const data = 'data' in input ? input.data : input;
  if (!data) return {};
  return {
    id: data.id,
    projectName: data.projectName,
    estimatedBudget: data.estimatedBudget,
    periodFrom: data.periodFrom,
    periodTo: data.periodTo,
    expectedDeliveryDate: data.expectedDeliveryDate,
    linkedLibActivityId: data.linkedLibActivityId,
    agencyName: data.agencyName,
    departmentUnit: data.departmentUnit,
    representativeName: data.representativeName,
    representativeDesignation: data.representativeDesignation,
    activities: data.activities || [],
    parameters: data.parameters || [],
    status: data.status,
    createdBy: data.createdBy,
    createdDate: data.createdDate ? new Date(data.createdDate) : new Date(),
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    submittedDate: data.submittedDate ? new Date(data.submittedDate) : undefined,
    approvedDate: data.approvedDate ? new Date(data.approvedDate) : undefined,
    approvalRouting: data.approvalRouting || [],
  };
}

/**
 * Transform form data to a Create API request payload.
 * Includes all required fields for creating a new market scoping form.
 */
export function transformFormToCreatePayload(form: Partial<MarketScopingForm>): CreateMarketScopingRequest {
  return {
    userId: form.userId ?? "",
    projectName: form.projectName ?? "",
    estimatedBudget: form.estimatedBudget ?? 0,
    periodFrom: form.periodFrom ?? "",
    periodTo: form.periodTo ?? "",
    deliveryDate: form.expectedDeliveryDate ?? "",
    targetLineItemBudgetActivityId: form.linkedLibActivityId,
    activitiesConducted: [],
    parameterEvaluations: [],
  };
}

/**
 * Transform form data to an Update API request payload.
 * Only includes fields that can be patched on a Draft form.
 */
export function transformFormToUpdatePayload(form: Partial<MarketScopingForm>): UpdateMarketScopingRequest {
  return {
    projectName: form.projectName,
    estimatedBudget: form.estimatedBudget,
    periodFrom: form.periodFrom,
    periodTo: form.periodTo,
    expectedDeliveryDate: form.expectedDeliveryDate,
    linkedLibActivityId: form.linkedLibActivityId,
    representativeName: form.representativeName,
    representativeDesignation: form.representativeDesignation,
  };
}

/**
 * Initialize empty activity evidence objects
 * Returns all 6 predefined activities + 1 "Other"
 */
export function initializeActivities(): ActivityEvidence[] {
  return [
    {
      id: "consultations",
      activitySettingsId: "consultations",
      activityType: "Consultations",
      label: "Consultations with potential suppliers",
      attachments: [],
      checked: false,
    },
    {
      id: "philgeps",
      activitySettingsId: "philgeps",
      activityType: "PhilGEPS",
      label: "PhilGEPS Sourcing",
      attachments: [],
      checked: false,
    },
    {
      id: "pricesourcing",
      activitySettingsId: "pricesourcing",
      activityType: "PriceSourcing",
      label: "Price Sourcing",
      attachments: [],
      checked: false,
    },
    {
      id: "suppliervisits",
      activitySettingsId: "suppliervisits",
      activityType: "SupplierVisits",
      label: "Supplier Visits",
      attachments: [],
      checked: false,
    },
    {
      id: "benchmarking",
      activitySettingsId: "benchmarking",
      activityType: "BenchmarkingStudies",
      label: "Benchmarking Studies",
      attachments: [],
      checked: false,
    },
    {
      id: "regulatory",
      activitySettingsId: "regulatory",
      activityType: "RegulatoryReview",
      label: "Regulatory Review",
      attachments: [],
      checked: false,
    },
    {
      id: "other",
      activitySettingsId: "other",
      activityType: "Other",
      label: "Other Market Research Activities",
      description: "",
      attachments: [],
      checked: false,
    },
  ];
}

/**
 * Initialize empty parameter evaluation objects
 * Returns all 6 NGPA parameters
 */
export function initializeParameters(): ParameterEvaluation[] {
  return [
    {
      parameterId: "project-cost-estimate",
      parameterSettingsId: "project-cost-estimate",
      parameterName: "ProjectCostEstimate",
      displayName: "Project Cost Estimate",
      guidedQuestion:
        "Have you conducted thorough market research to establish a realistic project cost estimate?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
    {
      parameterId: "project-design-spec",
      parameterSettingsId: "project-design-spec",
      parameterName: "ProjectDesignSpecification",
      displayName: "Project Design and Specification",
      guidedQuestion:
        "Have you clearly defined and documented the technical specifications and design requirements?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
    {
      parameterId: "technical-criteria",
      parameterSettingsId: "technical-criteria",
      parameterName: "TechnicalCriteria",
      displayName: "Technical Criteria",
      guidedQuestion:
        "Have you established and validated technical criteria for supplier/contractor evaluation?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
    {
      parameterId: "delivery-lead-time",
      parameterSettingsId: "delivery-lead-time",
      parameterName: "DeliveryLeadTime",
      displayName: "Delivery Lead Time",
      guidedQuestion:
        "Have you confirmed realistic delivery timelines based on market conditions?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
    {
      parameterId: "storage-warehousing",
      parameterSettingsId: "storage-warehousing",
      parameterName: "StorageWarehousingRequirements",
      displayName: "Storage and Warehousing Requirements",
      guidedQuestion:
        "Have you assessed and documented storage/warehousing needs for the project?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
    {
      parameterId: "identified-risks",
      parameterSettingsId: "identified-risks",
      parameterName: "IdentifiedRisks",
      displayName: "Identified Risk/s",
      guidedQuestion:
        "Have you identified and documented potential risks and mitigation strategies?",
      considered: "No",
      recommendations: "",
      attachments: [],
    },
  ];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for clean human-readable display (e.g. "Aug 2024")
 */
export function formatHumanDate(dateStr?: string): string {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  
  // If MM/YYYY format (e.g. 08/2024)
  if (/^\d{2}\/\d{4}$/.test(dateStr)) {
    const [month, year] = dateStr.split('/');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  // If ISO date string format (e.g. 2024-08-01T00:00:00Z)
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  return dateStr;
}

/**
 * Format date for display (mm/yyyy)
 */
export function formatDateMonthYear(date: string): string {
  const [month, year] = date.split("/");
  const monthName = new Date(`${year}-${month}-01`).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );
  return monthName;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get status badge color/variant
 */
export function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Draft":
      return "secondary";
    case "PendingApproval":
      return "outline";
    case "Approved":
      return "default";
    case "Rejected":
      return "destructive";
    default:
      return "default";
  }
}
