// Types and schema for EditPerformanceMeasuresForm

import { z } from 'zod'

// Types for KPI ratings
export interface KpiRating {
  id?: string
  value: number
  remarks: string
}

export interface KpiRatingEntry {
  performanceMeasureId: string
  ratings: Array<KpiRating>
}

// Schema for editing KPIRatings
export const editPerformanceMeasuresSchema = z.object({
    KPIRatings: z.array(z.object({
        performanceMeasureId: z.string(),
        ratings: z.array(z.object({
            id: z.string().optional(),
            value: z.number().min(1).max(5),
            remarks: z.string()
        })).min(1, 'At least one rating per measure')
    })).min(1, 'At least one measure is required')
})

export type EditPerformanceMeasuresFormValues = z.infer<typeof editPerformanceMeasuresSchema>
export type EditPerformanceMeasuresSubmission = Array<{
  id: string
  performanceMeasureId: string
  numericalRating: number
  remarks: string
}>

export interface EditPerformanceMeasuresFormProps {
    onSubmit: (data: EditPerformanceMeasuresSubmission) => void
    onCancel: () => void
    isLoading?: boolean
    performanceMeasureId?: string
}