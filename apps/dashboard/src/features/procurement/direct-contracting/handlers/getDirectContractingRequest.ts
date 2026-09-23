import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { DirectContracting } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id'

export const getDirectContractingRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  DirectContracting
> = {
  endpoint,
  key: ({ url }) => ['direct-contracting', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: DirectContracting }>(finalUrl, { signal })
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to fetch Direct Contracting entry.')
    }
    return response.data.data
  },
}
