import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PMTMaximumSeatsFormValues, PMTMaximumSeatsSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/pmt-maximum-seats'

type CreatePMTMaximumSeatsPayload = PMTMaximumSeatsFormValues

export const createPMTMaximumSeatsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PMTMaximumSeatsSetting>,
  undefined,
  CreatePMTMaximumSeatsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PMTMaximumSeatsSetting>>(finalUrl, payload)
    return response.data
  },
}
