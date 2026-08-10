import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    createMutationHookFromTemplate,
    createQueryHookFromTemplate,
    useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateOPCRRequest } from '../handlers/updateOPCRRequest'
import { getOPCRRequest } from '../handlers/getOPCRRequest'
import UpdateOpcrForm from '../forms/UpdateOpcrForm'
import {
    closeUpdateDialogAtom,
    updateDialogAtom,
} from '../atoms/dialogAtoms'
import {
    clearUpdateFormAtom,
    hasUnsavedUpdateFormAtom,
} from '../atoms/formAtoms'
import type { UpdateOPCRFormValues } from '../forms/UpdateOpcrForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateOpcrDialogProps {
    opcrId?: string
    onUpdated?: (data: UpdateOPCRFormValues) => void
    deliveryUnitId?: string
}

const useUpdateOPCR = createMutationHookFromTemplate(updateOPCRRequest)
const useGetOPCR = createQueryHookFromTemplate(getOPCRRequest)

export default function UpdateOpcrDialog({
    opcrId,
    onUpdated,
    deliveryUnitId,
}: UpdateOpcrDialogProps) {
    const { mutateAsync, isPending } = useUpdateOPCR()
    const [dialogState, setDialogState] = useAtom(updateDialogAtom)
    const closeDialog = useSetAtom(closeUpdateDialogAtom)
    const clearForm = useSetAtom(clearUpdateFormAtom)
    const hasUnsavedChanges = useAtomValue(hasUnsavedUpdateFormAtom)
    const queryClient = useQueryClient()
    const selectedId = opcrId || dialogState.selectedId

    // Fetch OPCR data for prepopulation
    const { data: opcrData } = useGetOPCR({
        pathParams: { id: selectedId! },
        queryParams: {},
    })
    const opcr = opcrData?.data

    const initialData = {
        fiscalYearId: opcr?.fiscalYear.id || '',
        deliveryUnitId: opcr?.deliveryUnit.id || ''
    }

    const handleUpdateOPCR = (data: UpdateOPCRFormValues) => {
        if (!selectedId) return

        const payload = {
            deliveryUnitId: data.deliveryUnitId,
            fiscalYearId: data.fiscalYearId,
        }

        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: selectedId },
                    payload,
                    queryParams: {},
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/opcrs'),
                        })
                        onUpdated?.(data)
                        clearForm()
                        closeDialog()
                    },
                },
            ),
            {
                loading: 'Updating OPCR...',
                success: 'OPCR updated successfully!',
                error: 'Failed to update OPCR.',
            },
        )
    }

    const handleClose = () => {
        if (hasUnsavedChanges) {
            setDialogState({ showUnsavedWarning: true })
        } else {
            clearForm()
            closeDialog()
        }
    }

    const handleConfirmClose = () => {
        clearForm()
        closeDialog()
        setDialogState({ showUnsavedWarning: false })
    }

    const handleCancelClose = () => {
        setDialogState({ showUnsavedWarning: false })
    }

    if (!selectedId || !opcr || !opcr.fiscalYear || !opcr.deliveryUnit) return null

    return (
        <>
            <ResponsiveDialog
                open={dialogState.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleClose()
                    }
                }}
                title="Update OPCR"
                description="Update the Organizational Performance Commitment Review"
            >
                <UpdateOpcrForm
                    onSubmit={handleUpdateOPCR}
                    onClose={handleClose}
                    isSubmitting={isPending}
                    initialData={initialData}
                    deliveryUnitId={deliveryUnitId}
                />
            </ResponsiveDialog>

            <ConfirmAlertDialog
                open={dialogState.showUnsavedWarning}
                onOpenChange={(open) => !open && handleCancelClose()}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                title="Unsaved Changes"
                description="You have unsaved changes that will be lost. Are you sure you want to continue?"
                confirmLabel="Discard Changes"
                cancelLabel="Keep Editing"
            />
        </>
    )
}
