import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteOPCRRequest } from '../handlers/deleteOpcrRequest'
import { closeDeleteDialogAtom, deleteDialogAtom } from '../atoms/dialogAtoms'
import type { OPCR } from '../types/type.opcr'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteOPCR = createMutationHookFromTemplate(deleteOPCRRequest)

interface DeleteOpcrDialogProps {
  opcr?: OPCR
  onSuccess?: () => void
}

export default function DeleteOpcrDialog({
  opcr,
  onSuccess,
}: DeleteOpcrDialogProps) {
  const { mutateAsync, isPending } = useDeleteOPCR()
  const dialogState = useAtomValue(deleteDialogAtom)
  const closeDialog = useSetAtom(closeDeleteDialogAtom)
  const queryClient = useQueryClient()

  const selectedOpcr = opcr || dialogState.selectedOPCR

  // Don't render if no OPCR is selected
  if (!selectedOpcr) {
    return null
  }

  const opcrName =
    selectedOpcr.deliveryUnit?.officeName || `OPCR ${selectedOpcr.fiscalYear}`

  const onDelete = () => {
    toast.promise(
      mutateAsync(
        { pathParams: { id: selectedOpcr.id } },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/opcrs'),
            })
          },
        },
      ),
      {
        loading: 'Deleting OPCR...',
        success: (res) => {
          onSuccess?.()
          closeDialog()
          return res.message || 'OPCR deleted successfully'
        },
        error: 'Failed to delete OPCR.',
      },
    )
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['/opcrs'],
    })
    closeDialog()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={`Are you absolutely sure you want to delete ${opcrName}?`}
      description="This action cannot be undone. This will permanently delete the OPCR and all associated data from the server."
      confirmLabel="Delete"
      cancelLabel="Cancel"
    />
  )
}
