import * as erpSharedLib from 'erpez-shared-lib'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
interface DeleteFiscalYearDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteFiscalYearDialog({
  open,
  onOpenChange,
  onCancel,
}: DeleteFiscalYearDialogProps) {
  const queryClient = useQueryClient()
  const onDelete = () => {}

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['delete-fiscal-years'],
    })
    onCancel?.()
  }

  return (
    <ConfirmAlertDialog
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={open}
      onOpenChange={onOpenChange}
      title="Are you absolutely sure you want to delete this fiscal year configuration?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
