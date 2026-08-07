import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
interface DownloadResponse {
  blob: Blob
}

export const downloadDocumentRequest: MutationBlueprintFromTemplate<
  '/files/:documentId/download',
  DownloadResponse
> = {
  endpoint: '/files/:documentId/download',
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<Blob>(finalUrl, {
      responseType: 'blob',
    })
    return { blob: response.data }
  },
}
