import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { KPITarget } from '@/features/planning/annual-performance-planning/appTypes'
import api from '@/services/api'
import { USE_MOCK_DATA, MOCK_KPI_TARGETS } from '../mocks'

interface BatchUpdateTargetPayload {
  targets: Array<{
    cellId: string
    value: number
    deliveryUnitId: string
    kpiId: string
  }>
}

const endpoint = '/kpi-targets/batch-update'

export const batchUpdateTargetsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  KPITarget[],
  BatchUpdateTargetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    // Use mock data for development/testing
    if (USE_MOCK_DATA) {
      // Simulate updating targets
      const updatedTargets = MOCK_KPI_TARGETS.data.map(target => {
        const update = payload.targets.find(t => t.cellId === target.id)
        return update ? { ...target, targetValue: update.value } : target
      })
      return new Promise((resolve) =>
        setTimeout(() => resolve(updatedTargets), 300)
      )
    }

    const response = await api.post<KPITarget[]>(finalUrl, payload)
    return response.data
  },
}
