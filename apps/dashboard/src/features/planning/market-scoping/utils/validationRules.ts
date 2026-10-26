/**
 * Market Scoping Form Validation Rules
 * Using Zod for schema validation
 */

import { z } from 'zod'

/**
 * Date format validation (mm/yyyy)
 */
const monthYearFormat = z
  .string()
  .regex(/^\d{2}\/\d{4}$/, 'Date must be in MM/YYYY format')
  .refine((date) => {
    const [month] = date.split('/').map(Number)
    return month >= 1 && month <= 12
  }, 'Month must be between 01 and 12')

/**
 * Project Overview Step validation
 */
export const projectOverviewSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),

  projectName: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(255, 'Project name must not exceed 255 characters'),

  estimatedBudget: z
    .number()
    .positive('Budget must be a positive number')
    .refine((val) => val > 0, 'Budget cannot be zero'),

  periodFrom: monthYearFormat,

  periodTo: monthYearFormat,

  expectedDeliveryDate: monthYearFormat,

  linkedLibActivityId: z.string().optional(),
  targetLineItemBudgetId: z.string().optional(),
  targetLineItemBudgetActivityId: z.string().optional(),
  representativeName: z.string().optional(),
  representativeDesignation: z.string().optional(),
  departmentUnit: z.string().optional(),
  agencyName: z.string().optional(),
})

export type ProjectOverviewFormData = z.infer<typeof projectOverviewSchema>

/**
 * Activity Evidence validation
 */
export const activityEvidenceSchema = z.object({
  id: z.string(),
  activityType: z.enum([
    'Consultations',
    'PhilGEPS',
    'PriceSourcing',
    'SupplierVisits',
    'BenchmarkingStudies',
    'RegulatoryReview',
    'Other',
  ]),
  description: z.string().optional(),
  attachments: z.array(
    z.object({
      id: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
      uploadedDate: z.date(),
    }),
  ),
  checked: z.boolean(),
})

/**
 * Activities Conducted step validation
 * At least one activity must be checked, and all checked activities must have attachments
 */
export const activitiesConductedSchema = z
  .array(activityEvidenceSchema)
  .refine(
    (activities) => activities.some((a) => a.checked),
    'At least one activity must be selected',
  )
  .refine((activities) => {
    // All checked activities must have at least one attachment
    return activities
      .filter((a) => a.checked)
      .every((a) => a.attachments.length > 0)
  }, 'All checked activities must have supporting documents attached')

export type ActivityEvidenceFormData = z.infer<typeof activityEvidenceSchema>

/**
 * Parameter Evaluation validation
 */
export const parameterEvaluationSchema = z.object({
  parameterId: z.string(),
  parameterName: z.enum([
    'ProjectCostEstimate',
    'ProjectDesignSpecification',
    'TechnicalCriteria',
    'DeliveryLeadTime',
    'StorageWarehousingRequirements',
    'IdentifiedRisks',
  ]),
  displayName: z.string(),
  guidedQuestion: z.string(),
  considered: z.enum(['Yes', 'No', 'NotApplicable']),
  recommendations: z
    .string()
    .min(10, 'Recommendations must be at least 10 characters')
    .max(2000, 'Recommendations must not exceed 2000 characters'),
  attachments: z.array(
    z.object({
      id: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
      uploadedDate: z.date(),
    }),
  ),
})

/**
 * Parameter Evaluation step validation
 * All 6 parameters must have status and recommendation
 */
export const parameterEvaluationStepSchema = z
  .array(parameterEvaluationSchema)
  .refine(
    (parameters) => parameters.length === 6,
    'All 6 NGPA parameters must be evaluated',
  )
  .refine(
    (parameters) =>
      parameters.every(
        (p) => p.considered && p.recommendations.trim().length > 0,
      ),
    'All parameters must have status and recommendations',
  )

export type ParameterEvaluationFormData = z.infer<
  typeof parameterEvaluationSchema
>

/**
 * Complete Market Scoping Form validation
 */
export const completeMarketScopingSchema = z.object({
  projectName: z.string().min(3),
  estimatedBudget: z.number().positive(),
  periodFrom: monthYearFormat,
  periodTo: monthYearFormat,
  expectedDeliveryDate: monthYearFormat,
  linkedLibActivityId: z.string().optional(),
  agencyName: z.string(),
  departmentUnit: z.string(),
  representativeName: z.string(),
  representativeDesignation: z.string(),
  activities: activitiesConductedSchema,
  parameters: parameterEvaluationStepSchema,
})

/**
 * Validate budget period consistency
 * Ensures periodTo >= periodFrom
 */
export const validateBudgetPeriod = (
  periodFrom: string,
  periodTo: string,
): boolean => {
  const [fromMonth, fromYear] = periodFrom.split('/').map(Number)
  const [toMonth, toYear] = periodTo.split('/').map(Number)

  const fromDate = new Date(fromYear, fromMonth - 1)
  const toDate = new Date(toYear, toMonth - 1)

  return toDate >= fromDate
}

/**
 * Validate delivery date is within or after budget period
 */
export const validateDeliveryDate = (
  periodFrom: string,
  deliveryDate: string,
): boolean => {
  const [fromMonth, fromYear] = periodFrom.split('/').map(Number)
  const [delMonth, delYear] = deliveryDate.split('/').map(Number)

  const fromDate = new Date(fromYear, fromMonth - 1)
  const delivDate = new Date(delYear, delMonth - 1)

  return delivDate >= fromDate
}

/**
 * Custom error messages for form display
 */
export const fieldErrorMessages: Record<string, string> = {
  projectName: 'Project name is required and must be 3-255 characters',
  estimatedBudget: 'Budget must be a positive number',
  periodFrom: 'Start date must be in MM/YYYY format',
  periodTo: 'End date must be in MM/YYYY format',
  expectedDeliveryDate: 'Delivery date must be in MM/YYYY format',
  activities:
    'At least one activity must be selected with supporting documents',
  parameters: 'All parameters must be evaluated with recommendations',
}
