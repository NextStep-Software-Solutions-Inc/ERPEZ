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
  monitoringFrequency: z.string().min(1, 'Monitoring Frequency is required'),
  measurementUnit: z.string().min(1, 'Measurement Unit is required'),
  isGAD: z.boolean(),
  parentKPIId: z.string().nullable(),
  mfopapId: z.string().nullable(),
  status: z.string().optional(),
  functionCategory: z.string().min(1, 'Function Category is required'),
  complianceTags: z.array(z.string()),
  developmentGoals: z.array(z.string()),
  targetDistributionBehavior: z.string().nullable().optional(),
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
