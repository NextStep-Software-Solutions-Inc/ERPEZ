import { useCallback, useState } from 'react'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOPCRActivityRequest } from '../handlers/createOPCRActivityRequest'
import CreateOPCRActivityForm from '../forms/CreateOPCRActivityForm'
import type { CreateOPCRActivityPayload } from '../forms/CreateOPCRActivityForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface AddOPCRActivityDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kpiId: string
    opcrId: string
    deliveryUnitId: string
    dukpiAssignmentId: string
    inAccordion?: boolean
    onCreated?: (data: CreateOPCRActivityPayload) => void
}

const useCreateOPCRActivity = createMutationHookFromTemplate(createOPCRActivityRequest)

export default function AddOPCRActivityDialog({
    open,
    onOpenChange,
    kpiId,
    opcrId,
    deliveryUnitId,
    dukpiAssignmentId,
    onCreated,
}: AddOPCRActivityDialogProps) {
    const { mutateAsync, isPending } = useCreateOPCRActivity()
    const queryClient = useQueryClient()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)

    const handleCreateOPCRActivity = useCallback((data: CreateOPCRActivityPayload) => {
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
                        setHasUnsavedChanges(false)
                        onCreated?.(data)
                        onOpenChange(false)
                    },
                },
            ),
            {
                loading: 'Creating OPCR Activity...',
                success: 'OPCR Activity created successfully!',
                error: 'Failed to create OPCR Activity.',
            },
        )
    }, [mutateAsync, queryClient, onCreated, onOpenChange])

    const handleCloseAttempt = useCallback(() => {
        if (hasUnsavedChanges) {
            setPendingClose(() => () => onOpenChange(false))
            setShowUnsavedWarning(true)
        } else {
            onOpenChange(false)
        }
    }, [hasUnsavedChanges, onOpenChange])

    const handleConfirmClose = useCallback(() => {
        setHasUnsavedChanges(false)
        if (pendingClose) {
            pendingClose()
            setPendingClose(null)
        }
        setShowUnsavedWarning(false)
    }, [pendingClose])

    const handleCancelClose = useCallback(() => {
        setShowUnsavedWarning(false)
        setPendingClose(null)
    }, [])

    const handleFormStateChange = useCallback((isDirty: boolean) => {
        setHasUnsavedChanges(isDirty)
    }, [])

    return (
        <>
            <ResponsiveDialog
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        handleCloseAttempt()
                    } else {
                        onOpenChange(true)
                    }
                }}
                title="Add OPCR Activity"
                description="Create a new activity for this KPI with budget allocation."
                className="sm:max-w-[780px]"
            >
                <CreateOPCRActivityForm
                    onSubmit={handleCreateOPCRActivity}
                    onClose={handleCloseAttempt}
                    isSubmitting={isPending}
                    kpiId={kpiId}
                    opcrId={opcrId}
                    deliveryUnitId={deliveryUnitId}
                    dukpiAssignmentId={dukpiAssignmentId}
                    onFormStateChange={handleFormStateChange} 
                />
            </ResponsiveDialog>

            <ConfirmAlertDialog
                open={showUnsavedWarning}
                onOpenChange={(isOpen) => !isOpen && handleCancelClose()}
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
