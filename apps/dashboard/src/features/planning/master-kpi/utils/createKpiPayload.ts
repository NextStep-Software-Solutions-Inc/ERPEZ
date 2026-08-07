import {
  MonitoringFrequency,
  MeasurementUnit,
  TargetDistributionBehavior,
} from '../types'
import type {
  ApiDistributionBehavior,
  ApiMeasurementUnit,
  ApiMonitoringFrequency,
  CreateKpiPayload,
} from '../types'
import type { KpiFormValues } from '../forms/kpi.schema'

export type UpdateKpiPayload = Omit<
  CreateKpiPayload,
  'parentKPIId' | 'mfopapId' | 'SDGIds' | 'AttributeIds'
> & {
  parentKPIId: string | null
  mfopapId: string | null
  SDGIds: string[]
  AttributeIds: string[]
}

const mapMeasurementUnitToApi = (
  measurementUnit: MeasurementUnit,
): ApiMeasurementUnit => {
  switch (measurementUnit) {
    case MeasurementUnit.NUMBER:
      return 'Number'
    case MeasurementUnit.PERCENTAGE:
      return 'Percentage'
    default:
      return 'Number'
  }
}

const mapDistributionBehaviorToApi = (
  behavior: TargetDistributionBehavior | null | undefined,
  measurementUnit: MeasurementUnit,
): ApiDistributionBehavior => {
  if (behavior == null) {
    return measurementUnit === MeasurementUnit.PERCENTAGE
      ? 'Uniform'
      : 'Summation'
  }

  switch (behavior) {
    case TargetDistributionBehavior.DIVISIBLE_SUMMATIVE:
      return 'Divisible'
    case TargetDistributionBehavior.UNIFORM_AVERAGE:
      return 'Uniform'
    case TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE:
      return 'Milestone'
    case TargetDistributionBehavior.SUMMATION:
      return 'Summation'
    case TargetDistributionBehavior.MAXIMUM:
      return 'Maximum'
    case TargetDistributionBehavior.MINIMUM:
      return 'Minimum'
  }
}

const mapMonitoringFrequencyToApi = (
  frequency: MonitoringFrequency,
): ApiMonitoringFrequency => {
  switch (frequency) {
    case MonitoringFrequency.SEMI_ANNUAL:
      return 'SemiAnnual'
    case MonitoringFrequency.ANNUAL:
      return 'Annual'
    case MonitoringFrequency.MONTHLY:
    case MonitoringFrequency.QUARTERLY:
    default:
      return 'Quarterly'
  }
}

const getDefaultDistributionBehavior = (
  measurementUnit: MeasurementUnit,
): ApiDistributionBehavior => {
  return measurementUnit === MeasurementUnit.PERCENTAGE
    ? 'Uniform'
    : 'Summation'
}

export const createKpiPayloadFromForm = (
  data: KpiFormValues,
): CreateKpiPayload => {
  const payload: CreateKpiPayload = {
    name: data.name.trim(),
    code: data.code.trim(),
    description: data.operationalDefinition.trim(),
    measurementUnit: mapMeasurementUnitToApi(data.measurementUnit),
    distributionBehavior:
      data.targetDistributionBehavior != null
        ? mapDistributionBehaviorToApi(
            data.targetDistributionBehavior,
            data.measurementUnit,
          )
        : getDefaultDistributionBehavior(data.measurementUnit),
    monitoringFrequency: mapMonitoringFrequencyToApi(data.monitoringFrequency),
    isOptInAvailable: data.isOptIn,
    isGAD: data.isGAD,
  }

  if (data.parentKPIId) {
    payload.parentKPIId = data.parentKPIId
  }

  if (data.mfopapId) {
    payload.mfopapId = data.mfopapId
  }

  payload.functionCategory = data.functionCategory

  if (data.developmentGoals.length > 0) {
    payload.SDGIds = data.developmentGoals
  }

  if (data.complianceTags.length > 0) {
    payload.AttributeIds = data.complianceTags
  }

  return payload
}

export const updateKpiPayloadFromForm = (
  data: KpiFormValues,
): UpdateKpiPayload => ({
  ...createKpiPayloadFromForm(data),
  parentKPIId: data.parentKPIId ?? null,
  mfopapId: data.mfopapId ?? null,
  SDGIds: [...data.developmentGoals],
  AttributeIds: [...data.complianceTags],
})
