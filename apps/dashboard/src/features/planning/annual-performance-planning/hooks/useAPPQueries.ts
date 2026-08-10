import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  getKPIsRequest,
  type APIKPI,
} from '@/lib/annual-performance-planning/requests/getKPIsRequest'
import { getFYActiveKPIsRequest } from '@/features/planning/fiscal-year-and-policies/fy-active-kpi/handlers/getFYActiveKPIsRequest'
import { getFiscalYearsRequest } from '../../fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { FiscalYear } from '../../fiscal-year-and-policies/fiscal-year-management/types/types'

/**
 * Hook to fetch all KPIs
 *
 * Usage:
 * const { data, isLoading, error } = useKPIs({})
 * const kpis = data?.data || []
 */
export const useKPIs = createQueryHookFromTemplate(getKPIsRequest)

/**
 * Hook to fetch all Fiscal Years
 *
 * Usage:
 * const { data, isLoading, error } = useFiscalYears({})
 * const fiscalYears = data?.data || []
 */
export const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

/**
 * Hook to fetch FY Active KPIs (admin view) - GET /fy-active-kpis
 * Usage: useFYActiveKPIs({ pathParams: {}, queryParams: { filters: `fiscalYearId==<id>` } })
 */
export const useFYActiveKPIs = createQueryHookFromTemplate(
  getFYActiveKPIsRequest,
)

/**
 * Transform fiscal years for UI display
 */
export function formatFiscalYearForDisplay(fy: FiscalYear) {
  return {
    id: fy.id,
    name: `FY ${fy.year}`,
    originalData: fy,
  }
}

/**
 * Transform KPIs to internal format
 */
export function transformKPIToInternal(apiKPI: APIKPI) {
  const aggregationMap: Record<string, 'SUM' | 'AVERAGE'> = {
    Summation: 'SUM',
    Uniform: 'AVERAGE',
  }

  const functionTypeMap: Record<string, 'CoreFunction' | 'StrategicPriority'> =
    {
      Core: 'CoreFunction',
      Strategic: 'StrategicPriority',
    }

  return {
    ...apiKPI,
    id: apiKPI.id,
    code: apiKPI.code,
    name: apiKPI.name,
    description: apiKPI.description,
    functionType: functionTypeMap[apiKPI.functionCategory] || 'CoreFunction',
    isAvailableForShopping: apiKPI.isOptInAvailable,
    unitOfMeasure: apiKPI.measurementUnit,
    defaultAggregation: aggregationMap[apiKPI.distributionBehavior] || 'SUM',
    targetDirection: 'Increase' as const,
    ownerOffice: apiKPI.MFOPAP?.name || 'Unknown',
    status: apiKPI.status,
    isLocked: apiKPI.isLocked ?? false,
    agencyTargetAnnual: apiKPI.agencyTargetAnnual ?? null,
    agencyTargetQ1: apiKPI.agencyTargetQ1 ?? null,
    agencyTargetQ2: apiKPI.agencyTargetQ2 ?? null,
    agencyTargetQ3: apiKPI.agencyTargetQ3 ?? null,
    agencyTargetQ4: apiKPI.agencyTargetQ4 ?? null,
  }
}
