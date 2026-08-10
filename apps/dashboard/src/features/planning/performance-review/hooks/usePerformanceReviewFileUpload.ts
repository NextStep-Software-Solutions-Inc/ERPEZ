/**
 * Performance Review – Sequential File Upload Hook
 * Handles uploading MOV files one by one and storing their IDs in state
 */

import { useCallback } from 'react'
import { usePerformanceReviewFileUploadStore } from '../store/performanceReviewFileUploadStore'
import { createFileRequest } from '@/components/features/planning/file-upload/handlers/createFileRequest'

/**
 * Result of a sequential file upload operation
 */
export interface SequentialUploadResult {
  fileIds: string[]
  movIndices: number[]
}

/**
 * Custom hook for sequential MOV file uploads
 *
 * @example
 * const { uploadFilesSequentially } = usePerformanceReviewFileUpload()
 *
 * const { fileIds, movIndices } = await uploadFilesSequentially('item-1', [
 *   { file: file1, movIndex: 0 },
 *   { file: file2, movIndex: 1 }
 * ])
 */
export function usePerformanceReviewFileUpload() {
  const {
    startUpload,
    setUploadSuccess,
    setUploadError,
    initializeItemUploads,
  } = usePerformanceReviewFileUploadStore()

  /**
   * Upload files sequentially with error handling
   * @param itemId - The KPI item ID
   * @param filesWithIndices - Array of {file: File, movIndex: number} to upload
   * @returns Promise with fileIds and indices on success
   * @throws Error with message on first upload failure
   */
  const uploadFilesSequentially = useCallback(
    async (
      itemId: string,
      filesWithIndices: Array<{ file: File; movIndex: number }>,
    ): Promise<SequentialUploadResult> => {
      if (!filesWithIndices || filesWithIndices.length === 0) {
        return { fileIds: [], movIndices: [] }
      }

      // Initialize store for this item
      initializeItemUploads(itemId, filesWithIndices.length)

      const results: SequentialUploadResult = {
        fileIds: [],
        movIndices: [],
      }

      // Upload each file sequentially
      for (const { file, movIndex } of filesWithIndices) {
        try {
          // Mark as uploading
          startUpload(itemId, movIndex, file)

          // Execute file upload via the request template
          const response = await createFileRequest.fetcher({
            finalUrl: createFileRequest.endpoint,
            payload: { file },
          })

          // Extract file ID from response
          // Response is APIResponse<string>, so response.data contains the fileId
          const fileId = response.data

          // Store success
          setUploadSuccess(itemId, movIndex, fileId)
          results.fileIds.push(fileId)
          results.movIndices.push(movIndex)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'File upload failed'

          // Store error
          setUploadError(itemId, movIndex, errorMessage)

          // Throw to stop sequence and allow caller to handle
          throw new Error(
            `Failed to upload MOV file at index ${movIndex}: ${errorMessage}`,
          )
        }
      }

      return results
    },
    [startUpload, setUploadSuccess, setUploadError, initializeItemUploads],
  )

  return { uploadFilesSequentially }
}
