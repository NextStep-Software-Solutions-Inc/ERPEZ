import { getFiscalMonthsRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/getFiscalMonthsRequest'
import { lockFiscalMonthRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/lockFiscalMonthRequest'
import { unlockFiscalMonthRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/unlockFiscalMonthRequest'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useFiscalMonths = createQueryHookFromTemplate(getFiscalMonthsRequest)
const useLockFiscalMonth = createMutationHookFromTemplate(
  lockFiscalMonthRequest,
)
const useUnlockFiscalMonth = createMutationHookFromTemplate(
  unlockFiscalMonthRequest,
)

/**
 * Custom hook for all fiscal year related queries and mutations
 */
export function useFiscalYearQueries() {
  const queryClient = useQueryClient()

  const { data: fiscalYears } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })

  const { data: fiscalMonths } = useFiscalMonths({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })
  const { mutate: lockFiscalMonth } = useLockFiscalMonth()
  const { mutate: unlockFiscalMonth } = useUnlockFiscalMonth()

  return {
    fiscalYears: fiscalYears?.data || [],
    fiscalMonths: fiscalMonths?.data || [],
    lockFiscalMonth,
    unlockFiscalMonth,
    queryClient,
  }
}
