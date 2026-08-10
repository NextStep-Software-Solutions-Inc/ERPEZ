import { z } from 'zod'

/**
 * Zod schema for KPI assignment form validation
 * Matches the KpiAssignment payload structure
 */
export const assignKpiToOfficeSchema = z.object({
  fyActiveKPIId: z.string().min(1, 'KPI is required'),
  officeId: z.string().min(1, 'Office is required'),
  assignedTargetAnnual: z
    .number()
    .min(0.01, 'Annual target must be greater than 0'),
  assignedTargetQ1: z
    .number()
    .min(0, 'Q1 target must be 0 or greater')
    .optional(),
  assignedTargetQ2: z
    .number()
    .min(0, 'Q2 target must be 0 or greater')
    .optional(),
  assignedTargetQ3: z
    .number()
    .min(0, 'Q3 target must be 0 or greater')
    .optional(),
  assignedTargetQ4: z
    .number()
    .min(0, 'Q4 target must be 0 or greater')
    .optional(),
  isLocked: z.boolean().default(false),
})

export type AssignKpiFormValues = z.infer<typeof assignKpiToOfficeSchema>

/**
 * API payload type for creating a KPI assignment
 * Sent to /kpi-assignments endpoint
 */
export type CreateKpiAssignmentPayload = {
  fyActiveKPIId: string
  officeId: string
  assignedTargetAnnual: number
  assignedTargetQ1?: number | null
  assignedTargetQ2?: number | null
  assignedTargetQ3?: number | null
  assignedTargetQ4?: number | null
  isLocked?: boolean
}

/**
 * Helper to transform form values to API payload
 */
export const transformToPayload = (
  values: AssignKpiFormValues,
): CreateKpiAssignmentPayload => ({
  fyActiveKPIId: values.fyActiveKPIId,
  officeId: values.officeId,
  assignedTargetAnnual: values.assignedTargetAnnual,
  assignedTargetQ1: values.assignedTargetQ1 ?? undefined,
  assignedTargetQ2: values.assignedTargetQ2 ?? undefined,
  assignedTargetQ3: values.assignedTargetQ3 ?? undefined,
  assignedTargetQ4: values.assignedTargetQ4 ?? undefined,
  isLocked: values.isLocked ?? false,
})

/**
 * Default form values
 */
export const defaultAssignKpiFormValues: Partial<AssignKpiFormValues> = {
  assignedTargetAnnual: 0,
  assignedTargetQ1: 0,
  assignedTargetQ2: 0,
  assignedTargetQ3: 0,
  assignedTargetQ4: 0,
  isLocked: false,
}
