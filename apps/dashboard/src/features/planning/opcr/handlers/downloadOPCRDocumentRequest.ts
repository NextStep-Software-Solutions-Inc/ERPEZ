import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/:documentId/download' as const

export interface DownloadOPCRDocumentResponse {
  blob: Blob
}

export const downloadOPCRDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  DownloadOPCRDocumentResponse,
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
