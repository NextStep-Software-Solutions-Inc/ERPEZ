import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { deleteDialogAtom, closeDeleteDialogAtom } from '../atoms'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

interface DeleteFiscalYearDialogProps {
  allFiscalYears?: AppFiscalYear[]
  onSuccess?: () => void
}

export default function DeleteFiscalYearDialog({
  allFiscalYears = [],
  onSuccess,
}: DeleteFiscalYearDialogProps) {
  const dialogState = useAtomValue(deleteDialogAtom)
  const closeDialog = useSetAtom(closeDeleteDialogAtom)

  // Don't render if no ID is selected
  if (!dialogState.selectedId) {
    return null
  }

  const selectedFY = allFiscalYears.find((fy) => fy.id === dialogState.selectedId)

  const onDelete = () => {
    if (!dialogState.selectedId) return

    try {
      // Mock delete operation
      toast.success('Fiscal year deleted successfully')
      onSuccess?.()
      closeDialog()
    } catch (error) {
      toast.error('Failed to delete fiscal year')
    }
  }

  const handleCancelDelete = () => {
    closeDialog()
  }

  return (
    <ConfirmAlertDialog
      loading={false}
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Are you absolutely sure you want to delete this fiscal year?"
      description={`This action cannot be undone. This will permanently delete the fiscal year "${selectedFY?.year}" from the server. All associated planning data will also be removed.`}
    />
  )
}
