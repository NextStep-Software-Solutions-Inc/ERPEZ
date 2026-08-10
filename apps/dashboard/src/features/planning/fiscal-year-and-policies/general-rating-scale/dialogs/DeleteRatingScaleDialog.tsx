/**
 * Delete Rating Scale Dialog
 * Pattern: SPMS AlertDialog for destructive actions (Master KPI aligned)
 */

import { useAtom } from 'jotai'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteRatingScaleDialogOpenAtom,
  selectedRatingScaleForDeleteAtom,
  selectedRatingScaleAtom,
} from '../atoms'
import { deleteRatingScaleHandler, getRatingScaleUsage } from '../handlers'

interface DeleteRatingScaleDialogProps {
  /**
   * Fiscal year ID for the rating scale
   */
  fiscalYearId: string
  /**
   * Callback when deletion is successful
   */
  onSuccess?: () => void
}

export function DeleteRatingScaleDialog({
  fiscalYearId,
  onSuccess,
}: DeleteRatingScaleDialogProps) {
  const [open, setOpen] = useAtom(deleteRatingScaleDialogOpenAtom)
  const [selectedRatingScale] = useAtom(selectedRatingScaleForDeleteAtom)
  const [_selectedDetail, setSelectedDetail] = useAtom(selectedRatingScaleAtom)
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedRatingScale) return null

  // Get usage information
  const usageInfo = getRatingScaleUsage(selectedRatingScale.id)
  const isInUse = usageInfo.usageCount > 0

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteRatingScaleHandler(fiscalYearId, selectedRatingScale.id)
      toast.success('Rating scale deleted successfully')

      // Clear selected item if it was the one deleted
      setSelectedDetail(null)
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete rating scale'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Rating Scale</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>{selectedRatingScale.adjectivalRatingName}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning if scale is in use */}
        {isInUse && (
          <Alert variant="outline" className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              This rating scale is used by {usageInfo.usageCount} success
              indicator(s). You must reassign or delete those indicators before
              removing this scale.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || isInUse}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
