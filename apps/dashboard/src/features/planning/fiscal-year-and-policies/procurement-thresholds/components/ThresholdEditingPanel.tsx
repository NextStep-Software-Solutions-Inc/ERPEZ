import { useState, useCallback } from 'react'
import { ThresholdDisplayView } from './ThresholdDisplayView'
import { ThresholdEditingView } from './ThresholdEditingView'
import { CancelConfirmationDialog } from '../../components/shared/CancelConfirmationDialog'
import { SaveConfirmationDialog } from '../../components/shared/SaveConfirmationDialog'
import {
  ProcurementMethodThreshold,
  ThresholdChangePreview,
} from '@/lib/fiscal-year-and-policies/procurement-threshold.types'
import { ThresholdBoundary } from '@/lib/fiscal-year-and-policies/types'
// // import type {
// //   ProcurementMethodThreshold,
// //   ThresholdBoundary,
// //   ThresholdChangePreview,
// } from '@/lib/fiscal-year-and-policies/types'

interface ThresholdEditingPanelProps {
  threshold: ProcurementMethodThreshold
  boundary: ThresholdBoundary
  methodName: string
  onThresholdChange: (updatedThreshold: ProcurementMethodThreshold) => void
}

export function ThresholdEditingPanel({
  threshold,
  boundary,
  methodName,
  onThresholdChange,
}: ThresholdEditingPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [savePreview, setSavePreview] = useState<ThresholdChangePreview | null>(
    null,
  )

  const currentMin = threshold.min ?? boundary.min
  const currentMax = threshold.max ?? boundary.max

  // Enter edit mode
  const handleEditClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  // Handle cancel - check if dirty
  const handleCancelClick = useCallback(() => {
    // For now, assume any cancel click has changes (dirty state checked by panel)
    // If user made changes, show confirmation. Otherwise, close directly.
    // We'll determine dirty state based on edit session state.
    setShowCancelConfirm(true)
  }, [])

  // Confirm discard - close without saving
  const handleConfirmDiscard = useCallback(() => {
    setShowCancelConfirm(false)
    setIsEditing(false)
  }, [])

  // Keep editing - close cancel dialog
  const handleKeepEditing = useCallback(() => {
    setShowCancelConfirm(false)
  }, [])

  // Handle save click - show preview confirmation
  const handleSaveClick = useCallback(
    (newMin: number, newMax: number) => {
      const preview: ThresholdChangePreview = {
        procurementMethodId: threshold.procurementMethodId,
        methodName,
        oldMin: currentMin !== null ? currentMin : 0,
        oldMax: currentMax !== null ? currentMax : 0,
        newMin,
        newMax,
      }
      setSavePreview(preview)
      setShowSaveConfirm(true)
    },
    [threshold.procurementMethodId, methodName, currentMin, currentMax],
  )

  // Confirm save - commit changes
  const handleConfirmSave = useCallback(() => {
    if (!savePreview) return

    onThresholdChange({
      ...threshold,
      min: savePreview.newMin,
      max: savePreview.newMax,
      isConfigured: true,
    })

    setShowSaveConfirm(false)
    setSavePreview(null)
    setIsEditing(false)
  }, [savePreview, threshold, onThresholdChange])

  // Cancel save - close dialog, return to editing
  const handleCancelSave = useCallback(() => {
    setShowSaveConfirm(false)
    setSavePreview(null)
  }, [])

  return (
    <>
      {/* Display or Edit View */}
      {!isEditing ? (
        <ThresholdDisplayView
          threshold={threshold}
          boundary={boundary}
          methodName={methodName}
          onEditClick={handleEditClick}
        />
      ) : (
        <ThresholdEditingView
          currentMin={currentMin}
          currentMax={currentMax}
          boundary={boundary}
          onSave={handleSaveClick}
          onCancel={handleCancelClick}
        />
      )}

      {/* Confirmation Dialogs */}
      <CancelConfirmationDialog
        isOpen={showCancelConfirm}
        onConfirm={handleConfirmDiscard}
        onCancel={handleKeepEditing}
      />

      <SaveConfirmationDialog
        isOpen={showSaveConfirm}
        preview={savePreview}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </>
  )
}
