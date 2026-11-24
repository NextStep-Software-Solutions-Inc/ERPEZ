import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/approve'

export interface ApproveDirectContractingPayload {
  directContractingId: string
  signedDocument: File
}

export const approveDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  ApproveDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Approve Direct Contracting payload is required.')
    }

    // 1. Upload the signed PDF file in the background
    const formData = new FormData()
    formData.append('file', payload.signedDocument)

    const uploadResponse = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const attachmentFileId = uploadResponse.data?.data
    if (!attachmentFileId) {
      throw new Error('Failed to upload signed document.')
    }

    // 2. Call the approved endpoint using the uploaded file ID
    const response = await api.patch<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, {
      attachmentFileId,
    })

    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to approve request.')
    }

    return response.data.data
  },
}
