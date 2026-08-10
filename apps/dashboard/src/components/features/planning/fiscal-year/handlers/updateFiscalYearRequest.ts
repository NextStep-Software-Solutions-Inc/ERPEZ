import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FiscalYear } from '../table'
import type { CreateFiscalYearType } from '../form/CreateFiscalYearForm'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id'

type UpdateFiscalYearPayload = CreateFiscalYearType

export const updateFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  { id: string },
  CreateFiscalYearPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FiscalYear>>(finalUrl, payload)
    return response.data
  },
}
