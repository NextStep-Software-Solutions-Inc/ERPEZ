import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { deleteKpiRequest } from '@/components/features/planning/kpi/handlers/deleteKpiRequest'

const useDeleteKpiMutation = createMutationHookFromTemplate(deleteKpiRequest)

export function useKpiDelete() {
    const deleteKpiMutation = useDeleteKpiMutation()
    const queryClient = useQueryClient()

    const deleteKpi = (kpiId: string, onSuccess?: () => void) => {
        deleteKpiMutation.mutate(
            { pathParams: { id: kpiId } },
            {
                onSuccess: () => {
                    void queryClient.invalidateQueries({
                        predicate: (query) =>
                            typeof query.queryKey[0] === 'string' &&
                            query.queryKey[0].startsWith('/kpis'),
                    })
                    toast.success('KPI deleted successfully')
                    onSuccess?.()
                },
                onError: () => {
                    toast.error('Failed to delete KPI')
                },
            },
        )
    }

    return {
        deleteKpi,
        isPending: deleteKpiMutation.isPending,
    }
}
