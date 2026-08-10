/**
 * usePpmpFormData
 * Custom hook that manages all data-fetching for the CreatePpmpMetadataForm.
 * Centralizes API queries in one place for cleaner component code.
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getFundSourcesRequest } from '@/components/features/planning/fund-receiving/handlers/getFundSourcesRequest'
import { getLIBsRequest } from '../../line-item-budgeting/line-item-budget/handlers/getLIBsRequest'
import { getPPMPsRequest } from '../handlers/getPpmpsRequest'

const useOffices = createQueryHookFromTemplate(getOfficesRequest)
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)
const useLibs = createQueryHookFromTemplate(getLIBsRequest)
const usePpmps = createQueryHookFromTemplate(getPPMPsRequest)

interface UsePpmpFormDataOptions {
  enabled?: boolean
}

export function usePpmpFormData({
  enabled = false,
}: UsePpmpFormDataOptions = {}) {
  const { data: offices, isLoading: isOfficesLoading } = useOffices({
    pathParams: {},
    queryParams: { pageSize: 1000 },
    enabled,
  })

  const { data: fiscalYears, isLoading: isFiscalYearsLoading } = useFiscalYears(
    {
      pathParams: {},
      queryParams: { pageSize: 1000 },
      enabled,
    },
  )

  const { data: libs, isLoading: isLibsLoading } = useLibs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
    enabled,
  })

  const { data: fundSources, isLoading: isFundSourcesLoading } = useFundSources(
    {
      pathParams: {},
      queryParams: { pageSize: 1000 },
      enabled,
    },
  )

  const { data: ppmps, isLoading: isPpmpsLoading } = usePpmps({
    pathParams: {},
    queryParams: { pageSize: 1000 },
    enabled,
  })

  const isLoading =
    enabled &&
    (isOfficesLoading ||
      isFiscalYearsLoading ||
      isLibsLoading ||
      isFundSourcesLoading ||
      isPpmpsLoading)

  return {
    offices: offices?.data ?? [],
    fiscalYears: fiscalYears?.data ?? [],
    libs: libs?.data ?? [],
    fundSources: fundSources?.data ?? [],
    ppmps: ppmps?.data ?? [],
    isLoading,
  }
}
