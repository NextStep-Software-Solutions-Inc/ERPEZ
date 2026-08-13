import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { deleteWFPObjectiveRequest } from '../handlers/deleteWFPObjectiveRequest'
import { deleteDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteWFPObjective = createMutationHookFromTemplate(deleteWFPObjectiveRequest)

export default function DeleteWFPObjectiveDialog() {
  const [dialogState, setDialogState] = useAtom(deleteDialogAtom)
  const { mutateAsync, isPending } = useDeleteWFPObjective()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const ids = dialogState.selectedIds
    if (!ids.length) return

    try {
      await Promise.all(
        ids.map((id) =>
          mutateAsync({
            pathParams: { id },
          }),
        ),
      )

      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('/wfp-objectives') ||
            key.includes('/wfps')
          )
        ),
      })

      toast.success('WFP Objective(s) deleted successfully!')
      setDialogState({ isOpen: false, selectedIds: [] })
    } catch (error) {
      toast.error('Failed to delete WFP Objective(s).')
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={handleDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Are you absolutely sure you want to delete this WFP Objective?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
