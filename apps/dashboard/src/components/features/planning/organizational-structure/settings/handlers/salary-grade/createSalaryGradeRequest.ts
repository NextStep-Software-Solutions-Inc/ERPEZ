import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { SalaryGradeFormValues, SalaryGradeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/salary-grades'

type CreateSalaryGradePayload = SalaryGradeFormValues

export const createSalaryGradeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SalaryGradeSetting>,
  undefined,
  CreateSalaryGradePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SalaryGradeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
