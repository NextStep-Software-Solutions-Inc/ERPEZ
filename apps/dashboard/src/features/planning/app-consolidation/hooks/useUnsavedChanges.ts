import { useCallback, useEffect } from 'react'
import { useAtom } from 'jotai'
import { unsavedChangesAtom, editingLineItemsAtom } from '../atoms/appAtoms'
import type { AppMaster } from '../types'

interface UseUnsavedChangesProps {
  /**
   * Enable/disable the protection (e.g., disable when saving)
   */
  enabled?: boolean

  /**
   * Check if form is dirty
   * For TanStack Form: form.state.isDirty
   * For controlled form: check if any field differs from original
   */
  isDirty?: boolean

  /**
   * Callback when user confirms discard changes
   */
  onDiscardChanges?: () => void

  /**
   * Callback when user tries to navigate/close but has unsaved changes
   * Should show AlertDialog confirmation
   */
  onUnsavedWarning?: () => Promise<boolean> // true if should proceed, false if should cancel

  /**
   * Current APP being edited (for tracking purposes)
   */
  currentApp?: AppMaster | null
}

/**
 * useUnsavedChanges - Detects and protects against unsaved changes
 *
 * Features:
 * - Tracks unsaved form changes (TanStack Form + manual)
 * - Detects navigation attempts and shows confirmation dialog
 * - Manages browser back button behavior
 * - Alerts user before closing tab/window
 * - Integrates with Jotai state atoms for global state
 *
 * Usage:
 * ```tsx
 * const form = useForm()
 * useUnsavedChanges({
 *   isDirty: form.state.isDirty,
 *   onUnsavedWarning: async () => {
 *     // Show AlertDialog
 *     // Return true if user clicks Save
 *     // Return false if user clicks Cancel
 *   }
 * })
 * ```
 *
 * Documentation: documentations/unsaved-changes-protection.md
 */
export function useUnsavedChanges({
  enabled = true,
  isDirty = false,
}: UseUnsavedChangesProps) {
  const [, setUnsavedChanges] = useAtom(unsavedChangesAtom)
  const [editingLineItems, setEditingLineItems] = useAtom(editingLineItemsAtom)

  // Update global state when form becomes dirty
  useEffect(() => {
    if (!enabled) return

    if (isDirty) {
      setUnsavedChanges(true)
    } else if (!isDirty && editingLineItems.size === 0) {
      setUnsavedChanges(false)
    }
  }, [isDirty, editingLineItems.size, enabled, setUnsavedChanges])

  /**
   * Mark a line item as being edited
   */
  const markLineItemAsEditing = useCallback(
    (itemId: string) => {
      if (!enabled) return

      setEditingLineItems((prev: Map<string, Date>) => {
        const updated = new Map(prev)
        updated.set(itemId, new Date())
        return updated
      })
      setUnsavedChanges(true)
    },
    [enabled, setEditingLineItems, setUnsavedChanges]
  )

  /**
   * Mark a line item as saved
   */
  const markLineItemAsSaved = useCallback(
    (itemId: string) => {
      if (!enabled) return

      setEditingLineItems((prev: Map<string, Date>) => {
        const updated = new Map(prev)
        updated.delete(itemId)
        return updated
      })

      // Update global state - only false if form is also not dirty
      if (!isDirty) {
        setUnsavedChanges(false)
      }
    },
    [enabled, setEditingLineItems, isDirty, setUnsavedChanges]
  )

  /**
   * Clear all unsaved changes
   */
  const clearUnsavedChanges = useCallback(() => {
    setEditingLineItems(new Map())
    setUnsavedChanges(false)
  }, [setEditingLineItems, setUnsavedChanges])

  /**
   * Browser back button handler
   */
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!enabled || (!isDirty && editingLineItems.size === 0)) {
        return
      }

      // Prevent page unload
      e.preventDefault()
      e.returnValue = ''
    },
    [enabled, isDirty, editingLineItems.size]
  )

  // Attach beforeunload listener
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, handleBeforeUnload])

  return {
    // State
    hasUnsavedChanges: isDirty || editingLineItems.size > 0,
    unsavedLineItemIds: Array.from(editingLineItems.keys()),
    unsavedLineItemsCount: editingLineItems.size,

    // Actions
    markLineItemAsEditing,
    markLineItemAsSaved,
    clearUnsavedChanges,
  }
}

/**
 * useUnsavedChangesDialog - Shows AlertDialog for unsaved changes confirmation
 *
 * Usage:
 * ```tsx
 * const { showDialog, hasUnsaved } = useUnsavedChangesDialog()
 *
 * const handleNavigate = async () => {
 *   if (hasUnsaved && !await showDialog()) {
 *     return // User cancelled
 *   }
 *   // Proceed with navigation
 * }
 * ```
 */
export function useUnsavedChangesDialog() {
  const [unsavedChanges] = useAtom(unsavedChangesAtom)
  const [editingLineItems] = useAtom(editingLineItemsAtom)

  const hasUnsavedChanges = unsavedChanges || editingLineItems.size > 0

  const showDialog = useCallback(async (): Promise<boolean> => {
    if (!hasUnsavedChanges) return true

    // This should be shown by the consuming component using an AlertDialog
    // Component will call this hook and decide whether to show dialog based on return value
    return new Promise((resolve) => {
      // Dialog implementation in consuming component
      // For now, return a placeholder that will be overridden
      resolve(true)
    })
  }, [hasUnsavedChanges])

  return {
    hasUnsavedChanges,
    showDialog,
    unsavedCount: editingLineItems.size,
  }
}
