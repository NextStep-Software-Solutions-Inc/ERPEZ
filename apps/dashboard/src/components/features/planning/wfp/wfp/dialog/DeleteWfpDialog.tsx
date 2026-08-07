import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { deleteWfpRequest } from '../handlers/deleteWfpRequest'
import { deleteDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteWfp = createMutationHookFromTemplate(deleteWfpRequest)

export default function DeleteWfpDialog() {
  const [dialogState, setDialogState] = useAtom(deleteDialogAtom)
  const { mutateAsync, isPending } = useDeleteWfp()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const id = dialogState.selectedId
    if (!id) return

    try {
      await mutateAsync({
        pathParams: { id },
      })

      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes('/wfps')
        ),
      })

      toast.success('WFP deleted successfully!')
      setDialogState({ isOpen: false, selectedId: null })
    } catch (error) {
      toast.error('Failed to delete WFP.')
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={handleDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Are you absolutely sure you want to delete this WFP?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
