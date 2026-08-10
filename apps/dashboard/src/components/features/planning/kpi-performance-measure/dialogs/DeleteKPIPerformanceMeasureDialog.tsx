import { useEffect, useState } from 'react'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { deleteKPIPerformanceMeasureRequest } from '../../kpi-performance-measure/handlers/deleteKPIPerformanceMeasureRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface DeleteKPIPerformanceMeasureDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    deleteMeasureId: string
    onSuccess?: () => void
}

export default function DeleteKPIPerformanceMeasureDialog({
    open,
    onOpenChange,
    deleteMeasureId,
    onSuccess,
}: DeleteKPIPerformanceMeasureDialogProps) {
    const useDeleteKPIPerformanceMeasure = createMutationHookFromTemplate(
        deleteKPIPerformanceMeasureRequest
    )
    const { mutateAsync } = useDeleteKPIPerformanceMeasure()
    const queryClient = useQueryClient()
    const [isDeleting, setIsDeleting] = useState(false)

    // Reset deleting state when dialog closes
    useEffect(() => {
        if (!open) {
            setIsDeleting(false)
        }
    }, [open])

    const onDelete = () => {
        toast.promise(
            mutateAsync(
                { pathParams: { id: deleteMeasureId } },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/kpi'),
                        })
                    },
                },
            ),
            {
                loading: 'Deleting KPI Performance Measure...',
                success: (res) => {
                    onSuccess?.()
                    onOpenChange(false)
                    return res.message || 'Performance measure deleted successfully'
                },
                error: 'Failed to delete performance measure.',
            },
        )
    }


    return (
        <ConfirmAlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Performance Measure"
            description="This action cannot be undone. This will permanently delete the performance measure and remove all associated data."
            onConfirm={onDelete}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={isDeleting}
        />
    )
}
