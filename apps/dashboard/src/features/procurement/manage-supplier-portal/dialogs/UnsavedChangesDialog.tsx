/**
 * UnsavedChangesDialog Component
 * 
 * AlertDialog wrapper for confirming navigation with unsaved changes
 * Blocks navigation and prompts user to either:
 * - Discard changes and navigate away
 * - Stay and save changes
 */

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

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onStay?: () => void
  title?: string
  description?: string
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  onStay,
  title = 'Unsaved Changes',
  description = 'You have unsaved changes. Are you sure you want to leave without saving?',
}: UnsavedChangesDialogProps) {
  const handleDiscard = () => {
    onDiscard()
    onOpenChange(false)
  }

  const handleStay = () => {
    if (onStay) {
      onStay()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleStay}>
            Stay & Save
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDiscard}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
