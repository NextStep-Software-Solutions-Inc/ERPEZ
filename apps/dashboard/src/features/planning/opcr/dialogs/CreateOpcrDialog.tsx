import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    createMutationHookFromTemplate,
    useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOPCRRequest } from '../handlers/createOPCRRequest'
import CreateOpcrForm from '../forms/CreateOpcrForm'
import {
    closeCreateDialogAtom,
    createDialogAtom,
} from '../atoms/dialogAtoms'
import {
    clearCreateFormAtom,
    createFormDataAtom,
    hasUnsavedCreateFormAtom,
} from '../atoms/formAtoms'
import type { CreateOPCRFormValues } from '../forms/CreateOpcrForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateOpcrDialogProps {
    onCreated?: (data: CreateOPCRFormValues) => void
    deliveryUnitId?: string
}

const useCreateOPCR = createMutationHookFromTemplate(createOPCRRequest)

export default function CreateOpcrDialog({
    onCreated,
}: CreateOpcrDialogProps) {
    const { mutateAsync, isPending } = useCreateOPCR()
    const [dialogState, setDialogState] = useAtom(createDialogAtom)
    const formData = useAtomValue(createFormDataAtom)
    const closeDialog = useSetAtom(closeCreateDialogAtom)
    const clearForm = useSetAtom(clearCreateFormAtom)
    const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)
    const queryClient = useQueryClient()

    const handleCreateOPCR = (data: CreateOPCRFormValues) => {
        const payload = {
            deliveryUnitId: data.deliveryUnitId,
            fiscalYearId: data.fiscalYearId,
            name: data.name
        }

        toast.promise(
            mutateAsync(
                {
                    pathParams: {},
                    payload,
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/opcrs'),
                        })
                        clearForm()
                        onCreated?.(data)
                        closeDialog()
                    },
                },
            ),
            {
                loading: 'Creating OPCR...',
                success: 'OPCR created successfully!',
                error: 'Failed to create OPCR.',
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

    return (
        <>
            <ResponsiveDialog
                open={dialogState.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleClose()
                    }
                }}
                title="Create New OPCR "
                description="Select the fiscal year and delivery unit for the new OPCR."
            >
                <CreateOpcrForm
                    onSubmit={handleCreateOPCR}
                    onClose={handleClose}
                    isSubmitting={isPending}
                    initialData={formData}
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
