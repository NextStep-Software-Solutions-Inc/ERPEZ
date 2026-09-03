import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectAcquisitionItem } from './getDirectAcquisitionsRequest'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id' as const

export const getDirectAcquisitionByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectAcquisitionItem
> = {
  endpoint,
  key: ({ url }) => ['direct-acquisition', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: BackendDirectAcquisitionItem }>(finalUrl, { signal })
    return response.data?.data
  },
}
