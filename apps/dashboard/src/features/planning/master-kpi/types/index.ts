/**
 * Key Performance Indicator Types & Interfaces
 */

import { Attribute } from '@/components/features/planning/attribute/types'
import { SDG } from '@/components/features/planning/SDGs/types'

/**
 * Function categories for KPI classification
 */
export enum FunctionCategory {
  STRATEGIC = 'Strategic',
  CORE = 'Core',
  SUPPORT = 'Support',
}

/**
 * Compliance/reporting tags for KPIs
 */
export enum ComplianceTag {
  ISO_9001 = 'ISO 9001',
  PREXC = 'PREXC',
  CITIZENS_CHARTER = "Citizen's Charter",
  PBB = 'PBB',
  CSSP = 'CSSP',
}

/**
 * Development goals (SDG + PDP)
 */
export enum DevelopmentGoal {
  SDG_1 = 'SDG 1: No Poverty',
  SDG_2 = 'SDG 2: Zero Hunger',
  SDG_3 = 'SDG 3: Good Health and Well-being',
  SDG_4 = 'SDG 4: Quality Education',
  SDG_5 = 'SDG 5: Gender Equality',
  SDG_6 = 'SDG 6: Clean Water and Sanitation',
  SDG_7 = 'SDG 7: Affordable and Clean Energy',
  SDG_8 = 'SDG 8: Decent Work and Economic Growth',
  SDG_9 = 'SDG 9: Industry, Innovation, and Infrastructure',
  SDG_10 = 'SDG 10: Reduced Inequalities',
  SDG_11 = 'SDG 11: Sustainable Cities and Communities',
  SDG_12 = 'SDG 12: Responsible Consumption and Production',
  SDG_13 = 'SDG 13: Climate Action',
  SDG_14 = 'SDG 14: Life Below Water',
  SDG_15 = 'SDG 15: Life on Land',
  SDG_16 = 'SDG 16: Peace, Justice and Strong Institutions',
  SDG_17 = 'SDG 17: Partnerships for the Goals',
  PDP_CHAPTER = 'PDP Chapter',
}

/**
 * Frequency of Monitoring - How often a KPI is monitored
 */
export enum MonitoringFrequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  SEMI_ANNUAL = 'Semi-Annual',
  ANNUAL = 'Annual',
}

/**
 * Measurement Unit - Type of measurement for KPI values
 */
export enum MeasurementUnit {
  NUMBER = 'Number/Count',
  PERCENTAGE = 'Percentage (%)',
}

/**
 * KPI Target Period
 */
export enum Period {
  ANNUALLY = 'Annually',
  QUARTERLY = 'Quarterly',
}

/**
 * Quarter names for quarterly targets
 */
export enum QuarterName {
  FIRST = 'FirstQuarter',
  SECOND = 'SecondQuarter',
  THIRD = 'ThirdQuarter',
  FOURTH = 'FourthQuarter',
}

/**
 * Target Distribution Behavior - determines how KPI targets are distributed and aggregated
 */
export enum TargetDistributionBehavior {
  DIVISIBLE_SUMMATIVE = 'Divisible',
  UNIFORM_AVERAGE = 'Uniform',
  MILESTONE_NON_DIVISIBLE = 'Milestone',
  SUMMATION = 'Summation',
  MAXIMUM = 'Maximum',
  MINIMUM = 'Minimum',
}

/**
 * Master KPI Tag (grouping compliance and development goal info)
 */
export interface MasterKPITag {
  functionCategory: FunctionCategory
  complianceTags: ComplianceTag[]
  developmentGoals: DevelopmentGoal[]
}

/**
 * KPI Target - Defines specific target values for a KPI
 */
export type KPITarget = {
  id: string
  kpiId: string
  targetValue: number
  remainingTargetValue: number
  period?: string
  quarterName?: string
  createdAt: string
  createdBy?: string
}

/**
 * Master KPI Entity
 */
export type MasterKPI = {
  id: string
  code: string
  name: string
  operationalDefinition: string
  monitoringFrequency: MonitoringFrequency
  measurementUnit: MeasurementUnit
  functionCategory: FunctionCategory
  attributes?: Attribute[]
  SDGs?: SDG[]
  isGAD: boolean
  parentKPIId?: string | null
  mfopapId?: string | null
  complianceTags: ComplianceTag[]
  targetDistributionBehavior: TargetDistributionBehavior | null
  distributionBehavior?: TargetDistributionBehavior | null
  isOptIn: boolean
  isActive: boolean
  status: string | null
  createdAt?: string
  updatedAt?: string
  isArchived: boolean
  archivedAt?: string | null
  tags?: MasterKPITag
}

export type KPI = {
  id: string
  code: string
  name: string
  operationalDefinition: string
  monitoringFrequency: MonitoringFrequency
  measurementUnit: MeasurementUnit
  functionCategory: FunctionCategory
  attributes?: Attribute[]
  SDGs?: SDG[]
  isGAD: boolean
  parentKPIId?: string | null
  mfopapId?: string | null
  complianceTags: ComplianceTag[]
  targetDistributionBehavior: TargetDistributionBehavior | null
  distributionBehavior?: TargetDistributionBehavior | null
  isOptIn: boolean
  isActive: boolean
  status: string | null
  createdAt?: string
  updatedAt?: string
  isArchived: boolean
  archivedAt?: string | null
  tags?: MasterKPITag
}

/**
 * KPI API response sub-types
 */
export type KpiParentResponse = {
  id: string
  name: string | null
  code: string | null
  description: string | null
  status: string | null
  functionCategory: string | null
}

export type KpiMeasurementResponse = {
  id: string
  kpiId: string
  dimension: string | null
  moVs: string[] | null
  ratingScaleTemplateId: string | null
  isMOVEditable: boolean
  isScaleEditable: boolean
  createdAt: string
  createdBy: string | null
}

export type KpiTargetResponse = {
  id: string
  kpiId: string
  targetValue: number
  remainingTargetValue: number
  period: string | null
  quarterName: string | null
  createdAt: string
  createdBy: string | null
}

export type KpiRatingResponse = {
  id: string
  kpiId: string
  performanceMeasureId: string
  numericalRating: number
  remarks: string | null
  createdAt: string
  createdBy: string | null
}

export type KpiModeOfVerificationResponse = {
  id: string
  kpiId: string
  name: string | null
  description: string | null
  url: string | null
}

export type KpiMfopapResponse = {
  id: string
  parentId: string | null
  name: string | null
  code: string | null
  type: string | null
  isActive: boolean
  fiscalYearId: string | null
}

export type KpiSdgResponse = {
  id: string
  name: string | null
  description: string | null
}

export type KpiDetailResponse = {
  id: string
  parentKPIId: string | null
  ParentKPI: KpiParentResponse | null
  mfopapId: string | null
  name: string | null
  code: string | null
  description: string | null
  measurementUnit: string | null
  distributionBehavior: string | null
  functionCategory: string | null
  monitoringFrequency: string | null
  isOptInAvailable: boolean
  isGAD: boolean
  status: string | null
  createdAt: string
  createdBy: string | null
  KPIMeasurements: KpiMeasurementResponse[] | null
  KPITargets: KpiTargetResponse[] | null
  KPIRatings: KpiRatingResponse[] | null
  KPIModeOfVerifications: KpiModeOfVerificationResponse[] | null
  MFOPAP: KpiMfopapResponse | null
  Attributes: Attribute[] | null
  SDGs: KpiSdgResponse[] | null
}

export type MasterKPIFormValues = {
  code: string
  name: string
  operationalDefinition: string
  monitoringFrequency: MonitoringFrequency
  measurementUnit: MeasurementUnit
  isGAD: boolean
  parentKPIId?: string | null
  mfopapId?: string | null
  status: string | null
  functionCategory: FunctionCategory
  complianceTags: ComplianceTag[]
  developmentGoals: DevelopmentGoal[]
  targetDistributionBehavior?: TargetDistributionBehavior | null
  isOptIn?: boolean
}
/**
 * Lookup option for SDG selectors
 */
export type KpiSdgOption = {
  id: string
  name: string
  description?: string | null
}

/**
 * Lookup option for attribute selectors
 */
export type KpiAttributeOption = {
  id: string
  name: string
  code: string
  description?: string | null
}

/**
 * Payload for creating a KPI through the API
 */
export type CreateKpiPayload = {
  parentKPIId?: string
  mfopapId?: string
  name: string
  code: string
  description: string
  measurementUnit: ApiMeasurementUnit
  distributionBehavior: ApiDistributionBehavior
  functionCategory?: string | null
  monitoringFrequency: ApiMonitoringFrequency
  isOptInAvailable: boolean
  isGAD: boolean
  SDGIds?: string[]
  AttributeIds?: string[]
}

/**
 * Backend API payload enums for KPI creation
 */
export type ApiMeasurementUnit = 'Number' | 'Percentage' | 'Currency'
export type ApiDistributionBehavior =
  | 'Summation'
  | 'Divisible'
  | 'Uniform'
  | 'Maximum'
  | 'Minimum'
  | 'Milestone'
export type ApiMonitoringFrequency = 'Quarterly' | 'SemiAnnual' | 'Annual'

/**
 * Color mapping for Compliance Tags
 */
export function getComplianceTagColor(tag: ComplianceTag): string {
  const colorMap: Record<ComplianceTag, string> = {
    [ComplianceTag.ISO_9001]: 'bg-blue-100 text-blue-800',
    [ComplianceTag.PREXC]: 'bg-purple-100 text-purple-800',
    [ComplianceTag.CITIZENS_CHARTER]: 'bg-green-100 text-green-800',
    [ComplianceTag.PBB]: 'bg-orange-100 text-orange-800',
    [ComplianceTag.CSSP]: 'bg-pink-100 text-pink-800',
  }
  return colorMap[tag] || 'bg-gray-100 text-gray-800'
}

/**
 * Color mapping for Distribution Behavior
 */
export function getDistributionBehaviorColor(
  behavior: TargetDistributionBehavior | undefined | null,
): string {
  const colorMap: Record<TargetDistributionBehavior, string> = {
    [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]:
      'bg-cyan-100 text-cyan-800',
    [TargetDistributionBehavior.UNIFORM_AVERAGE]:
      'bg-emerald-100 text-emerald-800',
    [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]:
      'bg-amber-100 text-amber-800',
    [TargetDistributionBehavior.SUMMATION]: 'bg-yellow-100 text-yellow-800',
    [TargetDistributionBehavior.MAXIMUM]: 'bg-purple-100 text-purple-800',
    [TargetDistributionBehavior.MINIMUM]: 'bg-pink-100 text-pink-800',
  }
  return behavior ? colorMap[behavior] : 'bg-gray-100 text-gray-800'
}

/**
 * Get human-readable label for Distribution Behavior
 */
export function getDistributionBehaviorLabel(
  behavior: TargetDistributionBehavior | undefined | null,
): string {
  const labelMap: Record<TargetDistributionBehavior, string> = {
    [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]: 'Divisible / Summative',
    [TargetDistributionBehavior.UNIFORM_AVERAGE]: 'Uniform / Average',
    [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]:
      'Milestone / Non-Divisible',
    [TargetDistributionBehavior.MAXIMUM]: 'Maximum',
    [TargetDistributionBehavior.MINIMUM]: 'Minimum',
    [TargetDistributionBehavior.SUMMATION]: 'Summation',
  }
  return behavior ? labelMap[behavior] : 'Not Set'
}

/**
 * Get description for Distribution Behavior
 */
export function getDistributionBehaviorDescription(
  behavior: TargetDistributionBehavior | null,
): string {
  const descriptionMap: Record<TargetDistributionBehavior, string> = {
    [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]:
      'Used for absolute numbers and quantities where the total is the sum of parts (e.g., "Number of Startups Founded").',
    [TargetDistributionBehavior.UNIFORM_AVERAGE]:
      'Used for percentages, rates, and ratios where targets are assigned uniformly (e.g., "Budget Utilization Rate").',
    [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]:
      'Used for compliance events, pass/fail deliverables where the target is typically "1" (e.g., "Submit PPMP by deadline").',
    [TargetDistributionBehavior.SUMMATION]:
      'Used for summation targets where the total is the sum of individual contributions (e.g., "Total Sales").',
    [TargetDistributionBehavior.MAXIMUM]:
      'Used for maximum value targets (e.g., "Maximum Budget Allocation").',
    [TargetDistributionBehavior.MINIMUM]:
      'Used for minimum value targets (e.g., "Minimum Attendance Requirement").',
  }
  return behavior ? descriptionMap[behavior] : ''
}

/**
 * Get human-readable label for Frequency of Monitoring
 */
export function getFrequencyLabel(
  frequency: MonitoringFrequency | null,
): string {
  const labelMap: Record<MonitoringFrequency, string> = {
    [MonitoringFrequency.MONTHLY]: 'Monthly',
    [MonitoringFrequency.QUARTERLY]: 'Quarterly',
    [MonitoringFrequency.SEMI_ANNUAL]: 'Semi-Annual',
    [MonitoringFrequency.ANNUAL]: 'Annual',
  }
  return frequency ? labelMap[frequency] : 'Not Set'
}

/**
 * Get human-readable label for Measurement Unit
 */
export function getMeasurementUnitLabel(
  unit: MeasurementUnit | undefined | null,
): string {
  const labelMap: Record<MeasurementUnit, string> = {
    [MeasurementUnit.NUMBER]: 'Number/Count',
    [MeasurementUnit.PERCENTAGE]: 'Percentage (%)',
  }
  return unit ? labelMap[unit] : 'Not Set'
}
