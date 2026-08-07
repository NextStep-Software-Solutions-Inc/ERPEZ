/**
 * Performance Review – File Upload State Store (Zustand)
 * Manages sequential MOV file uploads with per-file status tracking
 *
 * Structure:
 * {
 *   uploadingFiles: {
 *     "item-id-1": {
 *       0: { status: 'success', fileId: 'uuid', file: File },
 *       1: { status: 'uploading', fileId: null, error: null, file: File },
 *       2: { status: 'error', fileId: null, error: 'Network error', file: File }
 *     }
 *   }
 * }
 */

import { create } from 'zustand'

export type UploadFileStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'error'
  | 'idle'

export interface UploadFileState {
  status: UploadFileStatus
  fileId: string | null
  error: string | null
  file: File | null
}

interface PerformanceReviewFileUploadState {
  // Map: itemId -> Map: movIndex -> UploadFileState
  uploadingFiles: Map<string, Map<number, UploadFileState>>

  // Actions
  initializeItemUploads: (itemId: string, count: number) => void
  startUpload: (itemId: string, movIndex: number, file: File) => void
  setUploadSuccess: (itemId: string, movIndex: number, fileId: string) => void
  setUploadError: (itemId: string, movIndex: number, error: string) => void
  clearItemUploads: (itemId: string) => void
  clearAllUploads: () => void
  getItemUploadState: (itemId: string) => Map<number, UploadFileState> | null
  getUploadState: (itemId: string, movIndex: number) => UploadFileState | null
}

export const usePerformanceReviewFileUploadStore =
  create<PerformanceReviewFileUploadState>((set, get) => ({
    uploadingFiles: new Map(),

    initializeItemUploads: (itemId: string, count: number) => {
      set((state) => {
        const newMap = new Map(state.uploadingFiles)
        const itemMap = new Map<number, UploadFileState>()

        for (let i = 0; i < count; i++) {
          itemMap.set(i, {
            status: 'idle',
            fileId: null,
            error: null,
            file: null,
          })
        }

        newMap.set(itemId, itemMap)
        return { uploadingFiles: newMap }
      })
    },

    startUpload: (itemId: string, movIndex: number, file: File) => {
      set((state) => {
        const newMap = new Map(state.uploadingFiles)
        const itemMap = newMap.get(itemId) || new Map<number, UploadFileState>()

        itemMap.set(movIndex, {
          status: 'uploading',
          fileId: null,
          error: null,
          file,
        })

        newMap.set(itemId, itemMap)
        return { uploadingFiles: newMap }
      })
    },

    setUploadSuccess: (itemId: string, movIndex: number, fileId: string) => {
      set((state) => {
        const newMap = new Map(state.uploadingFiles)
        const itemMap = newMap.get(itemId) || new Map<number, UploadFileState>()
        const currentState = itemMap.get(movIndex)

        itemMap.set(movIndex, {
          status: 'success',
          fileId,
          error: null,
          file: currentState?.file || null,
        })

        newMap.set(itemId, itemMap)
        return { uploadingFiles: newMap }
      })
    },

    setUploadError: (itemId: string, movIndex: number, error: string) => {
      set((state) => {
        const newMap = new Map(state.uploadingFiles)
        const itemMap = newMap.get(itemId) || new Map<number, UploadFileState>()
        const currentState = itemMap.get(movIndex)

        itemMap.set(movIndex, {
          status: 'error',
          fileId: null,
          error,
          file: currentState?.file || null,
        })

        newMap.set(itemId, itemMap)
        return { uploadingFiles: newMap }
      })
    },

    clearItemUploads: (itemId: string) => {
      set((state) => {
        const newMap = new Map(state.uploadingFiles)
        newMap.delete(itemId)
        return { uploadingFiles: newMap }
      })
    },

    clearAllUploads: () => {
      set({ uploadingFiles: new Map() })
    },

    getItemUploadState: (itemId: string) => {
      return get().uploadingFiles.get(itemId) || null
    },

    getUploadState: (itemId: string, movIndex: number) => {
      const itemMap = get().uploadingFiles.get(itemId)
      return itemMap?.get(movIndex) || null
    },
  }))
