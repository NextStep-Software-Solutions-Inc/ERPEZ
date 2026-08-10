import { z } from 'zod'
import {
  FunctionCategory,
  TargetDistributionBehavior,
  MonitoringFrequency,
  MeasurementUnit,
} from '../types'

/**
 * Key Performance Indicator Form Validation Schema
 * Shared between Create and Edit operations
 */
export const kpiSchema = z.object({
  code: z.string().min(1, 'Indicator Code is required').max(50),
  name: z.string().min(1, 'Indicator Name is required').max(200),
  operationalDefinition: z
    .string()
    .min(1, 'Operational Definition is required'),
  monitoringFrequency: z.enum(MonitoringFrequency),
  measurementUnit: z.enum(MeasurementUnit),
  isGAD: z.boolean(),
  parentKPIId: z.string().nullable(),
  mfopapId: z.string().nullable(),
  // API status string; currently forwarded as-is because the backend values
  // are not yet normalized into a closed enum in this layer.
  status: z.string().optional(),
  functionCategory: z.enum(FunctionCategory),
  complianceTags: z.array(z.string()),
  developmentGoals: z.array(z.string()),
  targetDistributionBehavior: z.enum(TargetDistributionBehavior).nullable(),
  isOptIn: z.boolean(),
})

/**
 * Creates a schema that includes duplicate name check
 */
export const createKpiSchemaWithRefinement = (
  availableKpis: { id: string; name: string }[],
  currentKpiId?: string,
) => {
  return kpiSchema.superRefine((data, ctx) => {
    const isDuplicate = availableKpis.some(
      (kpi) =>
        kpi.name.toLowerCase() === data.name.toLowerCase() &&
        kpi.id !== currentKpiId,
    )

    if (isDuplicate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `An indicator with the name "${data.name}" already exists.`,
        path: ['name'],
      })
    }
  })
}

export type KpiFormValues = z.infer<typeof kpiSchema>
