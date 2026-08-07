import {
  ComplianceTag,
  DevelopmentGoal,
  MonitoringFrequency,
  FunctionCategory,
  Period,
  QuarterName,
  MeasurementUnit,
  TargetDistributionBehavior,
  type MasterKPI,
  type KpiDetailResponse,
  //   type KpiListItemResponse,
  type KPITarget,
  type KpiTargetResponse,
} from '../types'

const normalizeValue = (value: string | null | undefined) =>
  (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')

const mapFunctionCategory = (value: string | null | undefined) => {
  const normalized = normalizeValue(value)
  if (normalized.includes('strategic')) return FunctionCategory.STRATEGIC
  if (normalized.includes('support')) return FunctionCategory.SUPPORT
  return FunctionCategory.CORE
}

const mapMeasurementUnit = (value: string | null | undefined) => {
  const normalized = normalizeValue(value)
  if (normalized.includes('percentage')) return MeasurementUnit.PERCENTAGE
  return MeasurementUnit.NUMBER
}

const mapFrequencyOfMonitoring = (value: string | null | undefined) => {
  const normalized = normalizeValue(value)
  if (normalized.includes('semiannual')) return MonitoringFrequency.SEMI_ANNUAL
  if (normalized.includes('annual')) return MonitoringFrequency.ANNUAL
  if (normalized.includes('monthly')) return MonitoringFrequency.MONTHLY
  return MonitoringFrequency.QUARTERLY
}

const mapDistributionBehavior = (value: string | null | undefined) => {
  const normalized = normalizeValue(value)
  if (normalized === 'divisible' || normalized === 'divisiblesummative') {
    return TargetDistributionBehavior.DIVISIBLE_SUMMATIVE
  }
  if (normalized === 'uniform' || normalized === 'uniformaverage') {
    return TargetDistributionBehavior.UNIFORM_AVERAGE
  }
  if (normalized === 'milestone' || normalized === 'milestonenondivisible') {
    return TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE
  }
  if (normalized === 'summation') return TargetDistributionBehavior.SUMMATION
  if (normalized === 'maximum') return TargetDistributionBehavior.MAXIMUM
  if (normalized === 'minimum') return TargetDistributionBehavior.MINIMUM
  return TargetDistributionBehavior.SUMMATION
}

const isComplianceTag = (value: string): value is ComplianceTag =>
  (Object.values(ComplianceTag) as Array<ComplianceTag>).includes(
    value as ComplianceTag,
  )

const isDevelopmentGoal = (value: string): value is DevelopmentGoal =>
  (Object.values(DevelopmentGoal) as Array<DevelopmentGoal>).includes(
    value as DevelopmentGoal,
  )

const mapLookupValues = <T extends string>(
  values: Array<string | null | undefined>,
  isMatch: (value: string) => value is T,
) => values.filter((value): value is T => Boolean(value && isMatch(value)))

export const mapKpiListItemToMasterKPI = (item: MasterKPI): MasterKPI => {
  const derivedComplianceTags = mapLookupValues(
    (item.attributes ?? []).map((attribute) => attribute.name),
    isComplianceTag,
  )
  const derivedDevelopmentGoals = mapLookupValues(
    (item.SDGs ?? []).map((sdg) => sdg.name),
    isDevelopmentGoal,
  )

  // Prefer explicit `tags` coming from the source item when available and non-empty.
  // Fall back to deriving tags from `attributes` and `SDGs` to avoid clearing
  // user-provided compliance tags or development goals when opening Edit.
  const complianceTags =
    item.tags &&
    Array.isArray(item.tags.complianceTags) &&
    item.tags.complianceTags.length > 0
      ? item.tags.complianceTags
      : derivedComplianceTags

  const developmentGoals =
    item.tags &&
    Array.isArray(item.tags.developmentGoals) &&
    item.tags.developmentGoals.length > 0
      ? item.tags.developmentGoals
      : derivedDevelopmentGoals

  const isActive =
    item.isActive !== undefined
      ? item.isActive
      : (item.status ?? '').toLowerCase() === 'active'

  return {
    id: item.id,
    code: item.code ?? '',
    name: item.name ?? '',
    operationalDefinition: item.operationalDefinition ?? '',
    monitoringFrequency: mapFrequencyOfMonitoring(item.monitoringFrequency),
    measurementUnit: mapMeasurementUnit(item.measurementUnit),
    // gad: item.gad,
    isGAD: item.isGAD,
    parentKPIId: item.parentKPIId,
    mfopapId: item.mfopapId,
    functionCategory: mapFunctionCategory(item.functionCategory),
    tags: {
      functionCategory: mapFunctionCategory(item.functionCategory),
      complianceTags,
      developmentGoals,
    },
    SDGs: item.SDGs,
    attributes: item.attributes,
    targetDistributionBehavior: mapDistributionBehavior(
      item.targetDistributionBehavior,
    ),
    distributionBehavior:
      item.distributionBehavior ?? item.targetDistributionBehavior,
    status: item.status,
    isOptIn: item.isOptIn,
    isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    isArchived: item.isArchived !== undefined ? item.isArchived : !isActive,
    archivedAt: null,
  }
}

export const mapKpiDetailResponseToMasterKPI = (
  item: KpiDetailResponse,
): MasterKPI => {
  const derivedComplianceTags = mapLookupValues(
    (item.Attributes ?? []).map((attribute) => attribute.name),
    isComplianceTag,
  )
  const derivedDevelopmentGoals = mapLookupValues(
    (item.SDGs ?? []).map((sdg) => sdg.name),
    isDevelopmentGoal,
  )

  return {
    id: item.id,
    code: item.code ?? '',
    name: item.name ?? '',
    operationalDefinition: item.description ?? '',
    monitoringFrequency: mapFrequencyOfMonitoring(item.monitoringFrequency),
    measurementUnit: mapMeasurementUnit(item.measurementUnit),
    isGAD: item.isGAD,
    parentKPIId: item.parentKPIId,
    mfopapId: item.mfopapId,
    functionCategory: mapFunctionCategory(item.functionCategory),
    tags: {
      functionCategory: mapFunctionCategory(item.functionCategory),
      complianceTags: derivedComplianceTags,
      developmentGoals: derivedDevelopmentGoals,
    },
    SDGs: (item.SDGs ?? []).map((sdg) => ({
      id: sdg.id,
      name: sdg.name ?? '',
      description: sdg.description ?? '',
    })),
    attributes: item.Attributes ?? [],
    targetDistributionBehavior: mapDistributionBehavior(
      item.distributionBehavior,
    ),
    distributionBehavior: mapDistributionBehavior(item.distributionBehavior),
    status: item.status,
    isOptIn: item.isOptInAvailable,
    isActive: (item.status ?? '').toLowerCase() === 'active',
    createdAt: item.createdAt,
    updatedAt: undefined,
    isArchived: false,
    archivedAt: null,
  }
}

export const mapKpiListResponseToMasterKpis = (
  items: MasterKPI[],
): MasterKPI[] => items.map(mapKpiListItemToMasterKPI)

export const mapKpiTargetResponsesToKpiTargets = (
  items: KpiTargetResponse[],
  kpiId: string,
): KPITarget[] =>
  items.map((item) => ({
    id: item.id,
    kpiId: item.kpiId || kpiId,
    period: (item.period as Period) || Period.ANNUALLY,
    quarterName: (item.quarterName as QuarterName | null) ?? null,
    targetValue: item.targetValue,
  }))
