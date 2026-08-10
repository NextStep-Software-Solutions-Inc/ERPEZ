import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteOPCRRequest } from '../handlers/deleteOpcrRequest'
import {
    closeDeleteMultipleDialogAtom,
    deleteMultipleDialogAtom,
} from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteOPCR = createMutationHookFromTemplate(deleteOPCRRequest)

interface DeleteMultipleOPCRsDialogProps {
    onSuccess?: () => void
}

export default function DeleteMultipleOPCRsDialog({
    onSuccess,
}: DeleteMultipleOPCRsDialogProps) {
    const { mutateAsync, isPending } = useDeleteOPCR()
    const dialogState = useAtomValue(deleteMultipleDialogAtom)
    const closeDialog = useSetAtom(closeDeleteMultipleDialogAtom)
    const queryClient = useQueryClient()

    // Don't render if no IDs are selected
    if (!dialogState.selectedIds.length) {
        return null
    }

    const onDelete = async () => {
        try {
            // Delete all selected OPCR
            await Promise.all(
                dialogState.selectedIds.map((id) =>
                    mutateAsync({ pathParams: { id } }),
                ),
            )
            // Invalidate queries after all deletions
            void queryClient.invalidateQueries({
                predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    query.queryKey[0].startsWith('/opcrs'),
            })

            onSuccess?.()
            closeDialog()

            toast.success(
                `Successfully deleted ${dialogState.selectedIds.length} OPCR(s)`,
            )
        } catch (error) {
            toast.error('Failed to delete some OPCR')
        }
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
            title={`Are you absolutely sure you want to delete ${dialogState.selectedIds.length} OPCR(s)?`}
            description="This action cannot be undone. This will permanently delete the selected records from the server."
        />
    )
}