import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateAPPFormValues } from '../types'

const endpoint = '/apps' as const

interface CreateAPPPayload {
  appNumber: string
  name: string
  fiscalYearId: string
  officeId: string
  isFinal?: string
  remarks?: string
  description?: string
}

/**
 * Create a new APP (Annual Procurement Plan) with metadata
 * Initializes APP record with Draft status
 *
 * Payload: CreateAPPFormValues
 * Response: AppMaster
 *
 * Usage:
 * ```tsx
 * const useCreateApp = createMutationHookFromTemplate(createAppRequest)
 * const { mutate } = useCreateApp()
 * mutate({ ppmpIds: [...], fiscalYear: 2024, appName: "...", appCode: "...", appType: "Indicative", officeId: "...", fiscalYearId: "..." })
 * ```
 */
interface CreateAPPResponse {
  succeeded: boolean
  message: string
  data: string  // UUID string
  errors: null | unknown
}

export const createAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  { id: string },  // Returns object with ID for navigation
  undefined,
  CreateAPPFormValues
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload = {} as CreateAPPFormValues }) => {
    const p = payload as CreateAPPFormValues
    
    // Map form values to API payload
    const apiPayload: CreateAPPPayload = {
      appNumber: p.appCode || '',
      name: p.appName || '',
      fiscalYearId: p.fiscalYearId || 'default-fiscal-year-id',
      officeId: p.officeId || 'default-office-id',
      isFinal: 'false',
      description: `${p.appType || 'Indicative'} APP for FY ${p.fiscalYear}`,
      remarks: '',
    }

    try {
      const response = await api.post<CreateAPPResponse>(finalUrl, apiPayload)
      // API returns: { succeeded, message, data: "uuid-string", errors }
      // Extract the UUID from response.data.data
      const appId = response.data.data
      if (!appId) {
        throw new Error('No APP ID returned from server')
      }
      return { id: appId }
    } catch (error) {
      console.error('Failed to create APP:', error)
      throw error
    }
  },
}
