import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteKpiRequest } from '../handlers/deleteKpiRequest'
import { closeDeleteDialogAtom, deleteDialogAtom } from '../atoms/dialogAtoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteKpi = createMutationHookFromTemplate(deleteKpiRequest)

export default function DeleteKpiDialog() {
    const [dialogState] = useAtom(deleteDialogAtom)
    const closeDialog = useSetAtom(closeDeleteDialogAtom)
    const { mutateAsync, isPending } = useDeleteKpi()
    const queryClient = useQueryClient()

    const handleDelete = (): void => {
        if (!dialogState.selectedKPIs.length) return

        const deletePromises = dialogState.selectedKPIs.map(kpi =>
            mutateAsync({ pathParams: { id: kpi.id } })
        )

        toast.promise(
            Promise.all(deletePromises),
            {
                loading: `Deleting ${dialogState.selectedKPIs.length} KPI${dialogState.selectedKPIs.length > 1 ? 's' : ''}...`,
                success: () => {
                    void queryClient.invalidateQueries({
                        predicate: (query) =>
                            typeof query.queryKey[0] === 'string' &&
                            query.queryKey[0].startsWith('/kpis'),
                    })
                    closeDialog()
                    return `${dialogState.selectedKPIs.length} KPI${dialogState.selectedKPIs.length > 1 ? 's' : ''} deleted successfully!`
                },
                error: 'Failed to delete some KPIs.',
            },
        )
    }

    const handleCancelDelete = (): void => {
        void queryClient.cancelQueries({
            predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].includes('kpis'),
        })
        closeDialog()
    }

    const handleOpenChange = (open: boolean): void => {
        if (!open) {
            closeDialog()
        }
    }

    return (
        <ConfirmAlertDialog
            loading={isPending}
            onConfirm={handleDelete}
            onCancel={handleCancelDelete}
            open={dialogState.isOpen}
            onOpenChange={handleOpenChange}
            title="Are you absolutely sure you want to delete this KPI?"
            description={
                dialogState.selectedKPIs.length === 1
                    ? `This action cannot be undone. This will permanently delete "${dialogState.selectedKPIs[0].name}" from the server.`
                    : `This action cannot be undone. This will permanently delete ${dialogState.selectedKPIs.length} KPIs from the server.`
            }
        />
    )
}
