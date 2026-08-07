import { useState, useCallback } from 'react'

export interface InlineEditValues {
  procurementModeThresholdId: string
  minAmount: number
  maxAmount: number | undefined
}

interface EditState {
  editingId: string | null
  values: InlineEditValues
}

const DEFAULT_VALUES: InlineEditValues = {
  procurementModeThresholdId: '',
  minAmount: 0,
  maxAmount: undefined,
}

/**
 * Manages inline row editing state for the procurement config table.
 * Only one row can be in edit mode at a time.
 */
export function useTableEditState() {
  const [editState, setEditState] = useState<EditState>({
    editingId: null,
    values: DEFAULT_VALUES,
  })

  const startEdit = useCallback(
    (configId: string, initialValues: InlineEditValues) => {
      setEditState({ editingId: configId, values: initialValues })
    },
    [],
  )

  const cancelEdit = useCallback(() => {
    setEditState({ editingId: null, values: DEFAULT_VALUES })
  }, [])

  const updateEditValue = useCallback(
    <K extends keyof InlineEditValues>(
      field: K,
      value: InlineEditValues[K],
    ) => {
      setEditState((prev) => ({
        ...prev,
        values: { ...prev.values, [field]: value },
      }))
    },
    [],
  )

  const isEditing = (configId: string) => editState.editingId === configId

  return {
    editingId: editState.editingId,
    editValues: editState.values,
    isEditing,
    startEdit,
    cancelEdit,
    updateEditValue,
  }
}
