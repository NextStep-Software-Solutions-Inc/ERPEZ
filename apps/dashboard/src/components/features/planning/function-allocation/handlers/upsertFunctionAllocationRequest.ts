import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FunctionAllocation } from '../table'
import type { UpsertFunctionAllocationType } from '../form/UpsertFunctionAllocationForm'
import type { QueryParams } from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id'

type UpsertFunctionAllocationPayload = UpsertFunctionAllocationType

export const upsertFunctionAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FunctionAllocation>,
  QueryParams,
  UpsertFunctionAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FunctionAllocation>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
