import { useState, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle } from 'lucide-react'

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => Promise<void>
  onDiscard: () => void
  isSaving?: boolean
  title?: string
  description?: string
  itemCount?: number
}

/**
 * UnsavedChangesDialog - Confirmation dialog for unsaved changes
 *
 * Shows when user tries to close/navigate away with unsaved changes
 * Allows user to:
 * - Save changes (calls onSave)
 * - Discard changes (calls onDiscard)
 * - Cancel (keeps dialog open)
 *
 * Usage:
 * ```tsx
 * const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
 * const [unsavedItemCount, setUnsavedItemCount] = useState(0)
 *
 * const handleNavigate = () => {
 *   if (hasUnsavedChanges) {
 *     setShowUnsavedDialog(true)
 *     return
 *   }
 *   // Proceed with navigation
 * }
 *
 * return (
 *   <>
 *     <UnsavedChangesDialog
 *       open={showUnsavedDialog}
 *       onOpenChange={setShowUnsavedDialog}
 *       onSave={handleSave}
 *       onDiscard={handleDiscard}
 *       itemCount={unsavedItemCount}
 *     />
 *   </>
 * )
 * ```
 *
 * Documentation: documentations/unsaved-changes-dialog.md
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  isSaving = false,
  title = 'You have unsaved changes',
  description,
  itemCount = 0,
}: UnsavedChangesDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSave = useCallback(async () => {
    if (!onSave) return

    setIsProcessing(true)
    try {
      await onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      // Keep dialog open if save fails
    } finally {
      setIsProcessing(false)
    }
  }, [onSave, onOpenChange])

  const handleDiscard = useCallback(() => {
    onDiscard()
    onOpenChange(false)
  }, [onDiscard, onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {description || (
              <>
                {itemCount > 0 ? (
                  <>
                    You have {itemCount} unsaved change{itemCount !== 1 ? 's' : ''}.
                    <br />
                    Do you want to save before leaving?
                  </>
                ) : (
                  <>
                    Your changes have not been saved.
                    <br />
                    Do you want to save before leaving?
                  </>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel disabled={isProcessing || isSaving}>
            Keep Editing
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDiscard}
            disabled={isProcessing || isSaving}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Discard
          </AlertDialogAction>

          {onSave && (
            <AlertDialogAction
              onClick={handleSave}
              disabled={isProcessing || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing || isSaving ? 'Saving...' : 'Save'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Helper component for navigation guards
 */
export function useNavigationGuard() {
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  const handleNavigate = useCallback((callback: () => void, hasUnsavedChanges: boolean) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => callback)
      setUnsavedDialogOpen(true)
      return false
    }
    callback()
    return true
  }, [])

  const handleSave = useCallback(async (saveCallback: () => Promise<void>) => {
    try {
      await saveCallback()
      if (pendingNavigation) {
        pendingNavigation()
        setPendingNavigation(null)
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
  }, [pendingNavigation])

  const handleDiscard = useCallback(() => {
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }, [pendingNavigation])

  return {
    unsavedDialogOpen,
    setUnsavedDialogOpen,
    handleNavigate,
    handleSave,
    handleDiscard,
  }
}
