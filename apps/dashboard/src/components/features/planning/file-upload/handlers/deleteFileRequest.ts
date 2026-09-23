import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import { api } from '@/services/api'

export const deleteFileRequest: MutationBlueprintFromTemplate<
  '/files/temp/:fileId',
  APIResponse<boolean>,
  { fileId: string },
  undefined
> = {
  endpoint: '/files/temp/:fileId',
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl, {
      headers: {
        'x-skip-toast': 'true',
      },
    })
    return response.data
  },
}
