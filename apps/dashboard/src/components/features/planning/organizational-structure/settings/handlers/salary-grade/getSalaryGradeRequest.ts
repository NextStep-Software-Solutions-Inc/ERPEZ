import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { SalaryGradeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/salary-grades/:id'

// NOTE: This handler returns a single SalaryGradeSetting object as APIResponse<SalaryGradeSetting>.
// All consumers (e.g., UpdateSalaryGradeDialog) must expect salaryGradeData to be an object, not an array.
export const getSalaryGradeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SalaryGradeSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SalaryGradeSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
