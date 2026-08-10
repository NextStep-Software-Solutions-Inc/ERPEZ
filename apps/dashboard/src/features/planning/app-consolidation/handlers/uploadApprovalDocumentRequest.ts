/**
 * Response from document upload endpoint
 */
export interface UploadDocumentResponse {
  success: boolean
  documentPath: string // Server storage path for document
  fileName: string
  fileSize: number
  uploadedAt: string
}

/**
 * Request handler blueprint for uploading approval document
 * Follows the factory pattern from erpez-shared-lib
 * 
 * Usage:
 * const useUploadApprovalDocument = createMutationHookFromTemplate(uploadApprovalDocumentRequest)
 * 
 * See: documentations/supplemental-app-creation.md
 */
export const uploadApprovalDocumentRequest = {
  endpoint: '/v1/documents/upload',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({
    finalUrl,
    payload,
  }: {
    finalUrl: string
    payload: FormData
  }): Promise<{ data: UploadDocumentResponse }> => {
    // Mock implementation - simulates file upload
    // In production, this will be replaced with actual API call via:
    // const api = useAPI() // from erpez-shared-lib
    // const response = await api.post(finalUrl, payload, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })

    const file = payload.get('file') as File | null
    if (!file) {
      throw new Error('No file provided')
    }

    const mockResponse: UploadDocumentResponse = {
      success: true,
      documentPath: `/documents/supplemental/${Date.now()}-${file.name}`,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    }

    return { data: mockResponse }
  },
}
