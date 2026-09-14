/**
 * Upload a Purchase Order supporting document (multipart/form-data)
 */

import type { APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export async function uploadPoDocument(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<APIResponse<string>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (!response.data.succeeded || !response.data.data) {
    throw new Error(response.data.message || 'File upload failed.')
  }
  return response.data.data
}
