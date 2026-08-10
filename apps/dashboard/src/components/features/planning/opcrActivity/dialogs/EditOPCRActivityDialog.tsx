import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    createMutationHookFromTemplate,
    useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateOPCRActivityRequest } from '../handlers/updateOPCRActivityRequest'
import CreateOPCRActivityForm from '../forms/CreateOPCRActivityForm'
import {
    closeEditDialogAtom,
    editDialogAtom,
    editingActivityAtom,
} from '../atoms/dialogAtoms'
import type { CreateOPCRActivityPayload } from '../forms/CreateOPCRActivityForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface EditOPCRActivityDialogProps {
    onUpdated?: (data: any) => void
}

const useUpdateOPCRActivity = createMutationHookFromTemplate(updateOPCRActivityRequest)

export default function EditOPCRActivityDialog({
    onUpdated,
}: EditOPCRActivityDialogProps) {
    const { mutateAsync, isPending } = useUpdateOPCRActivity()
    const [dialogState, setDialogState] = useAtom(editDialogAtom)
    const editingActivity = useAtomValue(editingActivityAtom)
    const closeDialog = useSetAtom(closeEditDialogAtom)
    const queryClient = useQueryClient()

    const handleUpdateOPCRActivity = (data: CreateOPCRActivityPayload) => {
        if (!editingActivity) return

        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: editingActivity.id },
                    payload: {
                        id: editingActivity.id,
                        name: data.name,
                        budget: data.budget,
                        dukpiAssignmentId: data.dukpiAssignmentId, 
                        PAPDepartmentIds: data.PAPDepartmentIds,
                    },
                    queryParams: {}
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/opcr-activities'),
                        })
                        closeDialog()
                        onUpdated?.(data)
                    },
                },
            ),
            {
                loading: 'Updating OPCR Activity...',
                success: 'OPCR Activity updated successfully!',
                error: 'Failed to update OPCR Activity.',
            },
        )
    }

    const handleCancel = (): void => {
        setDialogState({ isOpen: false, showUnsavedWarning: true })
    }

    const handleConfirmDiscard = (): void => {
        setDialogState({ isOpen: false, showUnsavedWarning: false })
        closeDialog()
    }

    const handleOpenChange = (open: boolean): void => {
        if (!open && !dialogState.showUnsavedWarning) {
            handleCancel()
        } else if (open) {
            setDialogState({ isOpen: true, showUnsavedWarning: false })
        }
    }

    if (!editingActivity) return null

    return (
        <>
            <ResponsiveDialog
                open={dialogState.isOpen && !dialogState.showUnsavedWarning}
                onOpenChange={handleOpenChange}
                title="Edit OPCR Activity"
                className="min-h-[90vh] sm:max-w-[700px]"
            >
                <CreateOPCRActivityForm
                    mode="edit"
                    initialData={{
                        name: editingActivity.name, 
                        budget: editingActivity.budget, 
                        PAPDepartmentIds: editingActivity.PAPDepartments.map(dept => dept.deliveryUnit.id), 
                    }}
                    opcrId={editingActivity.opcrId}
                    onSubmit={handleUpdateOPCRActivity}
                    onClose={() => handleOpenChange(false)}
                    isSubmitting={isPending}
                />
            </ResponsiveDialog>

            <ConfirmAlertDialog
                open={dialogState.showUnsavedWarning}
                onOpenChange={(open) => setDialogState({ ...dialogState, showUnsavedWarning: open })}
                title="Unsaved Changes"
                description="You have unsaved changes that will be lost. Are you sure you want to continue?"
                onConfirm={handleConfirmDiscard}
                confirmLabel="Discard Changes"
                cancelLabel="Keep Editing"
            />
        </>
    )
}