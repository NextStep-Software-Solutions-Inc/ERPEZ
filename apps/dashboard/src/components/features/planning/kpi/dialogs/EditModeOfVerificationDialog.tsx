import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateKPIModeOfVerificationRequest } from '../../kpi-mode-of-verifications/handlers/updateKPIModeOfVerificationRequest'
import { createFileRequest } from '../../file-upload/handlers/createFileRequest'
import EditModeOfVerificationForm from '../form/EditModeOfVerificationForm'
import type { EditModeOfVerificationSubmission } from '../form/EditModeOfVerificationForm'
import { useKpiData } from '@/providers/KpiProvider'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateKPIModeOfVerification = createMutationHookFromTemplate(updateKPIModeOfVerificationRequest)
const useUploadFile = createMutationHookFromTemplate(createFileRequest)

interface EditModeOfVerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    movId: string
}

export default function EditModeOfVerificationDialog({
    open,
    onOpenChange,
    movId,
}: EditModeOfVerificationDialogProps) {
    const kpi = useKpiData()
    const { mutateAsync: updateKPIModeOfVerification } = useUpdateKPIModeOfVerification()
    const { mutateAsync: uploadFile } = useUploadFile()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleUpdateKpi = async (data: EditModeOfVerificationSubmission) => {
        try {
            let fileId: string | undefined;
            if (data.file) {
                try {
                    const result = await uploadFile({
                        pathParams: {},
                        payload: { file: data.file },
                    });
                    fileId = result.data;
                    if (!fileId) {
                        throw new Error('File upload failed to return a valid file ID.');
                    }
                } catch (uploadError) {
                    toast.error('File upload failed.');
                    throw uploadError; // Re-throw to prevent proceeding with the update
                }
            }

            await updateKPIModeOfVerification({
                pathParams: { id: movId },
                payload: {
                    kpiId: kpi.id,
                    name: data.name,
                    description: data.description,
                    ...(fileId && { fileId })
                },
                queryParams: {},
            });

            void queryClient.invalidateQueries({
                predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    query.queryKey[0].startsWith('/kpis'),
            })
            onOpenChange(false)
            toast.success('Mode of verification updated successfully!')

        } catch (error) {
            toast.error('Failed to update mode of verification.')
        }
    }

    const handleCancel = (): void => {
        setShowUnsavedWarning(true)
    }

    const handleConfirmDiscard = (): void => {
        setShowUnsavedWarning(false)
        onOpenChange(false)
    }

    const handleOpenChange = (): void => {
        if (!open && !showUnsavedWarning) {
            handleCancel()
        } else if (open) {
            setShowUnsavedWarning(false)
        }
    }

    return (
        <>
            <ResponsiveDialog
                open={open && !showUnsavedWarning}
                onOpenChange={handleOpenChange}
                title="Edit Modes of Verification"
                description="Update KPI verification methods"
                className="sm:max-w-[600px]"
            >
                <EditModeOfVerificationForm
                    movId={movId}
                    onSubmit={handleUpdateKpi}
                    onCancel={() => setShowUnsavedWarning(true)}
                    isLoading={false} // You can connect this to mutation loading state if needed
                />
            </ResponsiveDialog>

            <ConfirmAlertDialog
                open={showUnsavedWarning}
                onOpenChange={setShowUnsavedWarning}
                title="Unsaved Changes"
                description="You have unsaved changes that will be lost. Are you sure you want to continue?"
                onConfirm={handleConfirmDiscard}
                confirmLabel="Discard Changes"
                cancelLabel="Keep Editing"
            />
        </>
    )
}