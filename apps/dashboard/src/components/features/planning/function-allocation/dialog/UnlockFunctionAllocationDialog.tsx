import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { unlockFunctionAllocationRequest } from '../handlers/unlockFunctionAllocationRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useUnlockFunctionAllocation = createMutationHookFromTemplate(
  unlockFunctionAllocationRequest,
)
interface UnlockFunctionAllocationDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function UnlockFunctionAllocationDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: UnlockFunctionAllocationDialogProps) {
  const { mutateAsync, isPending } = useUnlockFunctionAllocation()

  const queryClient = useQueryClient()
  const onUnlock = async () => {
    try {
      // Wait for all unlock operations to complete
      await Promise.all(ids.map((id) => mutateAsync({ pathParams: { id } })))

      // Invalidate fiscal years queries after all unlocks are successful
      void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            query.queryKey[0].startsWith('/fiscal-years'),
        })
      toast.success('Fiscal years unlocked successfully')
      onSuccess?.()
      onOpenChange?.(false)
    } catch (error) {
      toast.error('Failed to unlock some fiscal years')
    }
  }

  const handleCancelUnlock = () => {
    void queryClient.cancelQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].includes('/fiscal-years') &&
        query.queryKey[0].includes('/unlock'),
    })
    onCancel?.()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onUnlock}
      onCancel={handleCancelUnlock}
      open={open}
      onOpenChange={onOpenChange}
      title="Are you absolutely sure you want to Unlock this function allocation?"
      description="This action cannot be undone. This will permanently Unlock the record from the server."
    />
  )
}
