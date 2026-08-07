import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { lockFunctionAllocationRequest } from '../handlers/lockFunctionAllocationRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useLockFunctionAllocation = createMutationHookFromTemplate(
  lockFunctionAllocationRequest,
)
interface LockFunctionAllocationDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function LockFunctionAllocationDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: LockFunctionAllocationDialogProps) {
  const { mutateAsync, isPending } = useLockFunctionAllocation()

  const queryClient = useQueryClient()
  const onLock = async () => {
    try {
      // Wait for all lock operations to complete
      await Promise.all(ids.map((id) => mutateAsync({ pathParams: { id } })))

      // Invalidate fiscal years queries after all locks are successful
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/fiscal-years'),
      })
      toast.success('Fiscal years locked successfully')
      onSuccess?.()
      onOpenChange?.(false)
    } catch (error) {
      toast.error('Failed to lock some fiscal years')
    }
  }

  const handleCancelLock = () => {
    void queryClient.cancelQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].includes('/fiscal-years') &&
        query.queryKey[0].includes('/lock'),
    })
    onCancel?.()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onLock}
      onCancel={handleCancelLock}
      open={open}
      onOpenChange={onOpenChange}
      title="Are you absolutely sure you want to Lock this function allocation?"
      description="This action cannot be undone. This will permanently Lock the record from the server."
    />
  )
}
