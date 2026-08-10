import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
// import * as createKPIModeOfVerificationRequest from '../handlers/createKPIModeOfVerificationRequest'
import { createKPIModeOfVerificationRequest } from '../../kpi-mode-of-verifications/handlers/createKPIModeOfVerificationRequest'
import { createFileRequest } from '../../file-upload/handlers/createFileRequest'
import AddModeOfVerificationForm from '../form/AddModeOfVerificationForm'
import type { AddModeOfVerificationSubmission } from '../form/AddModeOfVerificationForm'
import { useKpiData } from '@/providers/KpiProvider'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useCreateKPIModeOfVerification = createMutationHookFromTemplate(createKPIModeOfVerificationRequest)
const useUploadFile = createMutationHookFromTemplate(createFileRequest)

interface AddModeOfVerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddModeOfVerificationDialog({
    open,
    onOpenChange,
}: AddModeOfVerificationDialogProps) {
    const kpi = useKpiData()
    const { mutateAsync: createMOV } = useCreateKPIModeOfVerification()
    const { mutateAsync: uploadFile } = useUploadFile()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleAddMOV = async (data: AddModeOfVerificationSubmission) => {
        try {
            // First, upload files
            const KPIMOVsWithUploadedFiles = await Promise.all(
                data.KPIMOVs.map(async (mov) => {
                    if (mov.file) {
                        const result = await uploadFile({
                            pathParams: {},
                            payload: { file: mov.file },
                        });
                        if (!result || !result.data) {
                            throw new Error('File upload failed');
                        }
                        return {
                            name: mov.name,
                            description: mov.description,
                            fileId: result.data,
                        };
                    } else {
                        return {
                            name: mov.name,
                            description: mov.description,
                            fileId: mov.fileId || undefined,
                        };
                    }
                })
            );

            // Then, create MOVs
            const promises = KPIMOVsWithUploadedFiles.map((mov) => {
                const payload = {
                    kpiId: kpi.id,
                    name: mov.name,
                    description: mov.description,
                    fileId: mov.fileId,
                }

                return createMOV({
                    pathParams: {},
                    payload,
                    queryParams: {}
                })
            })

            await Promise.all(promises)
            void queryClient.invalidateQueries({
                predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    query.queryKey[0].startsWith('/kpis'),
            })
            onOpenChange(false)
            toast.success('Modes of verification added successfully!')
        } catch (error: unknown) {
            console.error('Failed to add modes of verification:', error)
            let message = 'Failed to add modes of verification.'
            if (error instanceof Error && error.message) {
                message = `Failed to add modes of verification: ${error.message}`
            }
            toast.error(message)
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
                title="Add Modes of Verification"
                description="Add new verification methods for this KPI"
                className="sm:max-w-[500px]"
            >
                <AddModeOfVerificationForm
                    onSubmit={handleAddMOV}
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