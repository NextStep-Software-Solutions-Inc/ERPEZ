import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApproveBacResolutionPayload, BacResolution } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/approve'

export const approveBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  { id: string },
  ApproveBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    let attachmentFileId = payload?.attachmentFileId

    // 1. Upload signed document file first if provided to obtain attachmentFileId
    if (!attachmentFileId && payload?.signedDocument) {
      const formData = new FormData()
      formData.append('file', payload.signedDocument)

      const uploadResponse = await api.post<APIResponse<string>>(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      attachmentFileId = uploadResponse.data?.data
      if (!attachmentFileId) {
        throw new Error('Failed to upload signed document.')
      }
    }

    // 2. Call the approve endpoint with attachmentFileId
    const response = await api.post<BacResolution>(finalUrl, {
      ...payload,
      attachmentFileId,
    })
    return response.data
  },
}

