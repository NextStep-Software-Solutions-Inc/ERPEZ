/**
 * KPI Measurement Configuration Types
 * Defines Success Indicators linked to KPIs with rating scale templates
 */

/**
 * Success Indicator for a KPI
 * Represents how a KPI is measured with observable terms and rating scales
 */
export interface Indicator {
  id: string
  kpiId: string
  code: string
  name: string
  description: string
  dimensions: string[]
  mov: string[] // Means of Verification
  ratingScaleTemplateIds: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Form values for creating/editing an indicator
 */
export interface IndicatorFormValues {
  code: string
  name: string
  description: string
  dimensions: string[]
  mov: string[]
  ratingScaleTemplateIds: string[]
}

/**
 * KPI with associated indicators
 */
export interface KpiWithIndicators {
  id: string
  code: string
  name: string
  description?: string
  operationalDefinition?: string
  indicators: Indicator[]
}
