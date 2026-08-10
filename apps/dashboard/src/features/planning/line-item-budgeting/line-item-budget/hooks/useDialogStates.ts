import { useState } from 'react'

export interface UseDialogStatesReturn {
  // Filter Panel
  showFilterPanel: boolean
  setShowFilterPanel: (show: boolean) => void

  // Bulk Delete
  showBulkDelete: boolean
  setShowBulkDelete: (show: boolean) => void
}

/**
 * Custom hook for managing all dialog states
 */
export const useDialogStates = (): UseDialogStatesReturn => {
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  return {
    showFilterPanel,
    setShowFilterPanel,
    showBulkDelete,
    setShowBulkDelete,
  }
}
