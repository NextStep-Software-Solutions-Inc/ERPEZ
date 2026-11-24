import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

export type ValidateSupplierPayload = {
  id?: string | null
  name: string
  businessPermitNo: string
  contactPerson: string
  contactNumber: string
  address: string
  email: string
  tinNumber: string
  philGEPSNumber?: string | null
  supplierCategoryId: string
}

const endpoint = '/suppliers/validate'

export const validateSupplierRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  undefined,
  ValidateSupplierPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<boolean>>(
      finalUrl,
      payload,
      {
        headers: {
          'x-skip-toast': 'true',
        },
      },
    )
    return response.data
  },
}
