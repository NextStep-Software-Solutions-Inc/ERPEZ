import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { closeSubmitDialogAtom, submitDialogAtom } from '../atoms/dialogAtoms'
import { submitOPCRRequest } from '../handlers/submitOPCRRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useSubmitOPCR = createMutationHookFromTemplate(submitOPCRRequest)

interface SubmitOpcrDialogProps {
    opcrId?: string
    onSuccess?: () => void
}

export default function SubmitOpcrDialog({
    opcrId,
    onSuccess,
}: SubmitOpcrDialogProps) {
    const { mutateAsync, isPending } = useSubmitOPCR()
    const dialogState = useAtomValue(submitDialogAtom)
    const closeDialog = useSetAtom(closeSubmitDialogAtom)
    const queryClient = useQueryClient()

    const selectedOpcrId = opcrId || dialogState.selectedId

    // Don't render if no OPCR ID is selected
    if (!selectedOpcrId) {
        return null
    }

    const onSubmit = () => {
        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: selectedOpcrId },
                    payload: { status: 'Submitted' },
                    queryParams: {},
                },
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
                loading: 'Submitting OPCR...',
                success: (res) => {
                    onSuccess?.()
                    closeDialog()
                    return res.message || 'OPCR submitted successfully'
                },
                error: 'Failed to submit OPCR.',
            },
        )
    }

    const handleCancel = () => {
        void queryClient.cancelQueries({
            queryKey: ['/opcrs'],
        })
        closeDialog()
    }

    return (
        <ConfirmAlertDialog
            loading={isPending}
            onConfirm={onSubmit}
            onCancel={handleCancel}
            open={dialogState.isOpen}
            onOpenChange={(open) => !open && closeDialog()}
            title="Submit OPCR"
            description="Submitting this OPCR will mark it as submitted and cannot be undone. Are you sure you want to continue?"
            confirmLabel="Submit"
            cancelLabel="Cancel"
        />
    )
}
