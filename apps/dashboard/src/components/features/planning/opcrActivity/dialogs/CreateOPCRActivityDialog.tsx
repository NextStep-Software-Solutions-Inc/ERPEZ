import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    createMutationHookFromTemplate,
    useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOPCRActivityRequest } from '../handlers/createOPCRActivityRequest'
import CreateOPCRActivityForm from '../forms/CreateOPCRActivityForm'
import {
    closeCreateDialogAtom,
    createDialogAtom,
} from '../atoms/dialogAtoms'
import {
    clearCreateFormAtom,
    createFormDataAtom,
    hasUnsavedCreateFormAtom,
} from '../atoms/formAtoms'
import type { CreateOPCRActivityPayload } from '../forms/CreateOPCRActivityForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateOPCRActivityDialogProps {
    onCreated?: (data: CreateOPCRActivityPayload) => void
}

const useCreateOPCRActivity = createMutationHookFromTemplate(createOPCRActivityRequest)

export default function CreateOPCRActivityDialog({
    onCreated,
}: CreateOPCRActivityDialogProps) {
    const { mutateAsync, isPending } = useCreateOPCRActivity()
    const [dialogState, setDialogState] = useAtom(createDialogAtom)
    const formData = useAtomValue(createFormDataAtom)
    const closeDialog = useSetAtom(closeCreateDialogAtom)
    const clearForm = useSetAtom(clearCreateFormAtom)
    const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)
    const queryClient = useQueryClient()

    const handleCreateOPCRActivity = (data: CreateOPCRActivityPayload) => {
        toast.promise(
            mutateAsync(
                {
                    pathParams: {},
                    payload: data,
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/opcr-activities'),
                        })
                        clearForm()
                        onCreated?.(data)
                        closeDialog()
                    },
                },
            ),
            {
                loading: 'Creating OPCR Activity...',
                success: 'OPCR Activity created successfully!',
                error: 'Failed to create OPCR Activity.',
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
                title="Create New OPCR Activity"
                description="Add a new activity to this OPCR with budget allocation."
                className='sm:max-w-[780px]'
            >
                <CreateOPCRActivityForm
                    onSubmit={handleCreateOPCRActivity}
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