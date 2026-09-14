/**
 * Upload File Attachment
 * Mutation handler - uploads activity evidence or parameter attachments
 * POST /market-scoping/:id/upload
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/market-scoping/:id/upload' as const

export interface UploadFilePayload extends FormData {
  // FormData properties are automatically included
}

export interface UploadFileResponse {
  fileId: string
  fileName: string
  fileUrl: string
  uploadedDate: string
}

export const uploadFileRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UploadFileResponse>,
  undefined,
  FormData
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<UploadFileResponse>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
