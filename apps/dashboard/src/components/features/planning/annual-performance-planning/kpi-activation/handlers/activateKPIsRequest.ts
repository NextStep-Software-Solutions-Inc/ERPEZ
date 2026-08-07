import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

/**
 * Payload for locking fiscal year KPI status
 */
export interface LockFiscalYearKPIsPayload {
  isLocked: boolean
}

/**
 * Response from lock status endpoint
 */
export interface LockFiscalYearKPIsResponse {
  succeeded: boolean
  message: string
  data?: {
    fiscalYearId: string
    isLocked: boolean
    lockedAt?: string
  }
}

const endpoint = '/fy-active-kpis/fiscal-years/:fiscalYearId/lock-status'

/**
 * Mutation blueprint for locking/unlocking fiscal year KPI status
 * Locks the KPI configuration for a fiscal year once draft KPIs are selected
 * 
 * Usage:
 * const useLockFiscalYearKPIs = createMutationHookFromTemplate(lockFiscalYearKPIsRequest)
 * const { mutateAsync } = useLockFiscalYearKPIs()
 * await mutateAsync({ 
 *   pathParams: { fiscalYearId }, 
 *   queryParams: { fiscalYearId },
 *   payload: { isLocked: true }
 * })
 */
export const activateKPIsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  LockFiscalYearKPIsResponse,
  { fiscalYearId: string },
  LockFiscalYearKPIsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<LockFiscalYearKPIsResponse>(finalUrl, payload)
    return response.data
  },
}

