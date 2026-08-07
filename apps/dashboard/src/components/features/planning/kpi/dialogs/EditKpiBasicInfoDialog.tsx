import { useRef, useState } from 'react'
import {
    createMutationHookFromTemplate,
    useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateKpiBasicInfoRequest } from '../handlers/updateKpiBasicInfoRequest'
import EditKpiBasicInfoForm from '../form/EditKpiBasicInfoForm'
import type { EditKpiBasicInfoSubmission } from '../form/EditKpiBasicInfoForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useKpiData } from '@/providers/KpiProvider'
import { Button } from '@/components/ui/button'

const useUpdateKpiBasicInfo = createMutationHookFromTemplate(updateKpiBasicInfoRequest)

interface EditKpiBasicInfoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EditKpiBasicInfoDialog({
    open,
    onOpenChange,
}: EditKpiBasicInfoDialogProps) {
    const kpi = useKpiData()
    const { mutateAsync, isPending } = useUpdateKpiBasicInfo()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const formRef = useRef<HTMLFormElement>(null)

    const handleUpdateKpi = (data: EditKpiBasicInfoSubmission): void => {
        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: kpi.id },
                    payload: data,
                    queryParams: {}
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/kpis'),
                        })
                        onOpenChange(false)
                    },
                },
            ),
            {
                loading: 'Updating KPI basic information...',
                success: 'KPI basic information updated successfully!',
                error: 'Failed to update KPI basic information.',
            },
        )
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
                title="Edit Basic Information"
                className="sm:max-w-[600px]"
                footer={
                    <div className="border-t pt-4 bg-gray-50 p-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => formRef.current?.requestSubmit()}
                            disabled={isPending}
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                }
            >
                <EditKpiBasicInfoForm
                    ref={formRef}
                    onSubmit={handleUpdateKpi}
                    isLoading={isPending}
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