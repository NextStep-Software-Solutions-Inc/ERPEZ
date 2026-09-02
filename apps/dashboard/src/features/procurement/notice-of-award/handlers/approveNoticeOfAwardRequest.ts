import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { ApproveNoticeOfAwardPayload } from '../types'

export const approveNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/approve',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: ApproveNoticeOfAwardPayload & {
      philgepsPostedAt?: string | null
      philgepsReferenceNumber?: string | null
      remarks?: string | null
    }
  }): Promise<void> => {
    let signedDocumentFileId: string | undefined
    let signedDocumentFileName: string | undefined

    if (data.signedDocument) {
      signedDocumentFileName = data.signedDocument.name
      const formData = new FormData()
      formData.append('file', data.signedDocument)

      const uploadResponse = await api.post<APIResponse<string>>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (uploadResponse.data?.succeeded && uploadResponse.data.data) {
        signedDocumentFileId = uploadResponse.data.data
      }
    }

    const payload = {
      signedDocumentFileId,
      signedDocumentFileName,
      philgepsPostedAt: data.philgepsPostedAt || null,
      philgepsReferenceNumber: data.philgepsReferenceNumber || null,
      remarks: data.remarks || 'Approved and issued by HoPE',
    }

    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/approve`, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to approve Notice of Award.')
    }
  },
}
