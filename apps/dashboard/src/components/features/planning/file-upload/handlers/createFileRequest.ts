import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import { api } from '@/services/api'

export type FileUploadPayload = {
  file: File
}
export type FileType = 'pdf' | 'image' | 'document'
export const createFileRequest: MutationBlueprintFromTemplate<
  '/files/upload',
  APIResponse<string>,
  undefined,
  FileUploadPayload
> = {
  endpoint: '/files/upload',
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload?.file) {
      throw new Error('No file provided')
    }

    const formData = new FormData()
    formData.append('file', payload.file)

    const response = await api.post<APIResponse<string>>(finalUrl, formData)

    return response.data
  },
}
