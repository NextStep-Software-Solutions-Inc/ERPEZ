import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/files/download/:fileId' as const
export interface DownloadFileResponse {
  blob: Blob
}

export const getFileRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  DownloadFileResponse,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<Blob>(finalUrl, {
      responseType: 'blob',
    })
    return { blob: response.data }
  },
}
