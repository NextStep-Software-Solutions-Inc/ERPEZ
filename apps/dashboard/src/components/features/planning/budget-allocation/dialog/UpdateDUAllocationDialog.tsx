import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateDUAllocationRequest } from '../handlers/updateDUAllocationRequest'
import CreateBudgetAllocationForm from '../form/CreateBudgetAllocationForm'
import type { z } from 'zod'
import type {
  createBudgetAllocationSchema,
} from '../form/CreateBudgetAllocationForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

type UpdateBudgetAllocationFormType = z.infer<typeof createBudgetAllocationSchema>

interface UpdateDUAllocationDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  allocationId: string | null
  initialData?: Partial<UpdateBudgetAllocationFormType>
}

const useUpdateDUAllocation = createMutationHookFromTemplate(
  updateDUAllocationRequest,
)

export default function UpdateDUAllocationDialog({
  open,
  onOpenChange,
  allocationId,
  initialData,
}: UpdateDUAllocationDialogProps) {
  const { mutateAsync, isPending } = useUpdateDUAllocation()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleUpdateDUAllocation = async (data: UpdateBudgetAllocationFormType): Promise<void> => {
    if (!allocationId) {
      toast.error('Allocation ID is missing')
      return
    }

    await toast.promise(
      mutateAsync(
        {
          pathParams: { id: allocationId },
          payload: {
            purpose: data.purpose,
            amount: data.amount,
            duFundAllocations: data.duFundAllocations,
          },
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/du-allocations',
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Updating Budget Allocation...',
        success: 'Budget Allocation updated successfully!',
        error: 'Failed to update Budget Allocation.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Edit Budget Allocation"
        description="Update fund allocation details for the Delivery Unit."
        className="sm:max-w-[700px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <CreateBudgetAllocationForm
          mode="edit"
          initialValues={initialData}
          onSubmit={handleUpdateDUAllocation}
          onCancel={() => setShowUnsavedWarning(true)}
          isLoading={isPending}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={() => {
          setShowUnsavedWarning(false)
          onOpenChange?.(false)
        }}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
