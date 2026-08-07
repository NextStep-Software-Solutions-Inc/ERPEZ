import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { OfficeTypeEntity } from '@/components/features/planning/organizational-structure/types'
import type { APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/office-types/:id'

// NOTE: This handler returns a single OfficeTypeEntity object as APIResponse<OfficeTypeEntity>.
// All consumers (e.g., UpdateOfficeTypeDialog) must expect officeTypeData to be an object, not an array.
export const getOfficeTypeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeTypeEntity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OfficeTypeEntity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
