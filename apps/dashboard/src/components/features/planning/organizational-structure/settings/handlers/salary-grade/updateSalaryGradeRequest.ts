import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { SalaryGradeFormValues, SalaryGradeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/salary-grades/:id'
type UpdateSalaryGradePayload = SalaryGradeFormValues
export const updateSalaryGradeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SalaryGradeSetting>,
  undefined,
  UpdateSalaryGradePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<SalaryGradeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
