import { useAtom, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import CreateKpiAssignmentForm from '../form/CreateDuKpiAssignmentForm'
import { createDeliveryUnitAssignKpiRequest } from '../../delivery-unit/handlers/createDeliveryUnitAssignKpiRequest'
import { closeCreateDialogAtom, createDialogAtom } from '../atoms/dialogAtoms'
import type { CreateKpiAssignmentFormType } from '../form/CreateDuKpiAssignmentForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

const useCreateDuKpiAssignment = createMutationHookFromTemplate(createDeliveryUnitAssignKpiRequest)

export default function CreateKpiAssignmentDialog() {
    const [dialogState, setDialogState] = useAtom(createDialogAtom)
    const closeDialog = useSetAtom(closeCreateDialogAtom)
    const { mutateAsync } = useCreateDuKpiAssignment()
    const queryClient = useQueryClient()

    const handleCreateKpi = (data: CreateKpiAssignmentFormType): void => {
        toast.promise(
            mutateAsync(
                {
                    pathParams: {
                        id: data.deliveryUnitId,
                    },
                    payload: data
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/delivery-units'),
                        })
                        closeDialog()
                    }
                }),
            {
                loading: 'Creating KPI Assignment...',
                success: 'KPI Assignment created successfully!',
                error: 'Failed to create KPI Assignment.',
            },
        )
    }

    const handleCancel = (): void => {
        setDialogState({ ...dialogState, showUnsavedWarning: true })
    }

    const handleConfirmDiscard = (): void => {
        setDialogState({ ...dialogState, showUnsavedWarning: false })
        closeDialog()
    }

    const handleOpenChange = (open: boolean): void => {
        if (!open && !dialogState.showUnsavedWarning) {
            handleCancel()
        } else if (open) {
            setDialogState({ ...dialogState, isOpen: true, showUnsavedWarning: false })
        }
    }

    return (
        <>
            <ResponsiveDialog
                open={dialogState.isOpen && !dialogState.showUnsavedWarning}
                onOpenChange={handleOpenChange}
                title="Create Delivery Unit KPI Assignment"
                description='Assign KPIs to a delivery unit'
                className='min-h-[50vh] sm:max-w-[700px]'
            >
                <CreateKpiAssignmentForm
                    onSubmit={(data) => handleCreateKpi(data)}
                    onCancel={(form) => {
                        if (form.state.isDirty) {
                            setDialogState({ ...dialogState, showUnsavedWarning: true })
                        } else {
                            closeDialog()
                        }
                    }}
                    initialValues={dialogState.deliveryUnitId ? { deliveryUnitId: dialogState.deliveryUnitId } : undefined}
                    disableDeliveryUnitSelect={!!dialogState.deliveryUnitId}
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