/**
 * KPI Measurement Core Types (Domain Models)
 */

import { IndicatorDimension } from './indicator-dimension.types'

export { IndicatorDimension }

/**
 * Core KPI Measurement entity returned by the API
 * Aligned with backend structure + UI requirements
 */
export interface KPIMeasurement {
  id: string
  kpiId: string
  name: string
  statement: string
  dimensions: IndicatorDimension[] | null
  moVs: Array<string | null>
  ratingScaleTemplateId: string | null
  isMOVEditable: boolean
  isScaleEditable: boolean
  createdAt: string
  createdBy: string | null
}

/**
 * Payload for a single measurement item within a bulk operation
 */
export type KpiMeasurementItemPayload = {
  name: string
  statement: string
  dimensions: IndicatorDimension[]
  ratingScaleTemplateId: string | null
  moVs: Array<string | null>
  isMOVEditable: boolean
  isScaleEditable: boolean
}

/**
 * Payload for bulk syncing KPI measurements
 */
export type SyncKpiMeasurementsPayload = {
  kpiId: string
  measurements: KpiMeasurementItemPayload[]
}

/**
 * Payload for creating a single KPI measurement
 */
export type CreateKpiMeasurementPayload = KpiMeasurementItemPayload & {
  kpiId: string
}

/**
 * Payload for patching an existing KPI measurement
 */
export type UpdateKpiMeasurementPayload = Partial<KpiMeasurementItemPayload>

