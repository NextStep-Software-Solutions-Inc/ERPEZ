import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PMTMaximumSeatsFormValues, PMTMaximumSeatsSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/pmt-maximum-seats/:id'

type UpdatePMTMaximumSeatsPayload = PMTMaximumSeatsFormValues

export const updatePMTMaximumSeatsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PMTMaximumSeatsSetting>,
  undefined,
  UpdatePMTMaximumSeatsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PMTMaximumSeatsSetting>>(finalUrl, payload)
    return response.data
  },
}
