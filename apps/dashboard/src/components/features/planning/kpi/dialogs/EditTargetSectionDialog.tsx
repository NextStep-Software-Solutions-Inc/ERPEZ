import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
// import * as updateKpiBasicInfoRequest from '../../handlers/updateKpiBasicInfoRequest'
import { updateKpiBasicInfoRequest } from '../handlers/updateKpiBasicInfoRequest'
// import EditTargetSectionForm from './EditTargetSectionForm'
import EditTargetSectionForm from '../form/EditTargetSectionForm'
// import type { EditTargetSectionSubmission } from './EditTargetSectionForm'
import type { EditTargetSectionSubmission } from '../form/EditTargetSectionForm';
import { useKpiData } from '@/providers/KpiProvider'
// import ResponsiveDialog from '@/components/ResponsiveDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateKpiBasicInfo = createMutationHookFromTemplate(updateKpiBasicInfoRequest)

interface EditTargetSectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EditTargetSectionDialog({
    open,
    onOpenChange,
}: EditTargetSectionDialogProps) {
    const kpi = useKpiData()
    const { mutateAsync } = useUpdateKpiBasicInfo()
    const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleUpdateKpi = (data: EditTargetSectionSubmission): void => {
        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: kpi.id },
                    payload: {
                        name: kpi.name,
                        description: kpi.description,
                        functionType: kpi.functionType,
                        isOfficeMandate: kpi.isOfficeMandate,
                        isPercentage: kpi.isPercentage,
                        isTargetValueAllocable: kpi.isTargetValueAllocable,
                        SDGIds: kpi.SDGs.map(s => s.id),
                        AttributeIds: kpi.Attributes.map(a => a.id),
                        MFOPAPIds: kpi.MFOPAPs.map(m => m.id),
                        KPITargets: data.KPITargets,
                        KPIRatings: kpi.KPIRatings,
                    },
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
                loading: 'Updating KPI targets...',
                success: 'KPI targets updated successfully!',
                error: 'Failed to update KPI targets.',
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
                title="Edit Targets"
                description="Update KPI targets"
                className="sm:max-w-[600px]"
            >
                <EditTargetSectionForm
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