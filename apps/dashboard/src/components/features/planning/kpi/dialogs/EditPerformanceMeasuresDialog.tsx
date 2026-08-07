import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import EditPerformanceMeasuresForm from '../../kpi-performance-measure/forms/EditPerformanceMeasuresForm'
import { updateRatingRequest } from '../../rating/handlers/updateRatingRequest'
import type { EditPerformanceMeasuresSubmission } from '../../kpi-performance-measure/forms/EditPerformanceMeasuresTypes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateRating = createMutationHookFromTemplate(updateRatingRequest)
interface EditPerformanceMeasuresDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    performanceMeasureId?: string
}

export default function EditPerformanceMeasuresDialog({
    open,
    onOpenChange,
    performanceMeasureId,
}: EditPerformanceMeasuresDialogProps) { 
    const updateRating = useUpdateRating()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleUpdateKpi = async (data: EditPerformanceMeasuresSubmission): Promise<void> => {
        // Update each rating individually, filtering out items without an id
        const updatePromises = data.filter(item => item.id).map(item =>
            updateRating.mutateAsync({
                pathParams: { id: item.id },
                payload: {
                    numericalRating: item.numericalRating,
                    remarks: item.remarks,
                },
                queryParams: {},
            })
        )

        try {
            await Promise.all(updatePromises)
            toast.success('KPI performance measures updated successfully!')
            queryClient.invalidateQueries({
                predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    query.queryKey[0].startsWith('/kpi'),
            })
            onOpenChange(false)
        } catch (error: unknown) {
            console.error('Failed to update KPI performance measures:', error)
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred while updating KPI performance measures.'
            toast.error(`Failed to update KPI performance measures: ${errorMessage}`)
        }
    }

    const handleCancel = (): void => {
        // Check if form has unsaved changes (simplified check)
        // In a real implementation, compare form state to initial values
        setShowUnsavedWarning(true)
    }

    const handleConfirmDiscard = (): void => {
        setShowUnsavedWarning(false)
        onOpenChange(false)
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(newOpen) => {
                    if (!newOpen) {
                        handleCancel()
                    } else {
                        onOpenChange(true)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Performance Measures</DialogTitle>
                    </DialogHeader>
                    <EditPerformanceMeasuresForm
                        onSubmit={handleUpdateKpi}
                        onCancel={handleCancel}
                        performanceMeasureId={performanceMeasureId}
                    />
                </DialogContent>
            </Dialog>

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