import { useState } from 'react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

export interface UseBulkActionsReturn {
  selectedLibIds: Set<string>
  toggleLibSelection: (libId: string) => void
  toggleSelectAll: (libs: LIB[]) => void
  clearSelection: () => void
  deleteSelected: (onDelete: (ids: Set<string>) => void) => void
}

/**
 * Custom hook for managing bulk actions (selection, deletion)
 */
export const useBulkActions = (): UseBulkActionsReturn => {
  const [selectedLibIds, setSelectedLibIds] = useState<Set<string>>(new Set())

  const toggleLibSelection = (libId: string) => {
    setSelectedLibIds((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(libId)) {
        newSelection.delete(libId)
      } else {
        newSelection.add(libId)
      }
      return newSelection
    })
  }

  const toggleSelectAll = (libs: LIB[]) => {
    setSelectedLibIds((prev) => {
      if (prev.size === libs.length && libs.length > 0) {
        return new Set()
      } else {
        return new Set(libs.map((l) => l.id))
      }
    })
  }

  const clearSelection = () => {
    setSelectedLibIds(new Set())
  }

  const deleteSelected = (onDelete: (ids: Set<string>) => void) => {
    onDelete(selectedLibIds)
    clearSelection()
  }

  return {
    selectedLibIds,
    toggleLibSelection,
    toggleSelectAll,
    clearSelection,
    deleteSelected,
  }
}
