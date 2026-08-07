import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/kpi-measurements/:id'

export const deleteKpiMeasurementRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  boolean,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<boolean>(finalUrl)
    return response.data
  },
}
