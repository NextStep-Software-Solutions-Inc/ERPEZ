import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateKpiBasicInfoRequest } from '../handlers/updateKpiBasicInfoRequest'
import { useKpiData } from '@/providers/KpiProvider'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateKpiBasicInfo = createMutationHookFromTemplate(updateKpiBasicInfoRequest)

interface DeleteModeOfVerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    movId: string
}

export default function DeleteModeOfVerificationDialog({
    open,
    onOpenChange,
    movId,
}: DeleteModeOfVerificationDialogProps) {
    const kpi = useKpiData()
    const { mutateAsync } = useUpdateKpiBasicInfo()
    const queryClient = useQueryClient()

    const movToDelete = kpi.KPIModeOfVerifications.find(mov => mov.id === movId)
    const movName = movToDelete?.name || 'this mode of verification'

    const handleDeleteMov = (): void => {
        const updatedMovs = kpi.KPIModeOfVerifications.filter(mov => mov.id !== movId)

        toast.promise(
            mutateAsync(
                {
                    pathParams: { id: kpi.id },
                    payload: {
                        name: kpi.name,
                        description: kpi.description || '',
                        functionType: kpi.functionType,
                        isOfficeMandate: kpi.isOfficeMandate,
                        isPercentage: kpi.isPercentage,
                        isTargetValueAllocable: kpi.isTargetValueAllocable,
                        SDGIds: kpi.SDGs.map(s => s.id),
                        AttributeIds: kpi.Attributes.map(a => a.id),
                        MFOPAP: kpi.MFOPAP,
                        KPITargets: kpi.KPITargets,
                        KPIRatings: kpi.KPIRatings,
                        KPIMOVs: updatedMovs,
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
                loading: 'Deleting mode of verification...',
                success: 'Mode of verification deleted successfully!',
                error: 'Failed to delete mode of verification.',
            },
        )
    }

    return (
        <ConfirmAlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Mode of Verification"
            description={`Are you sure you want to delete "${movName}"? This action cannot be undone.`}
            onConfirm={handleDeleteMov}
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />
    )
}