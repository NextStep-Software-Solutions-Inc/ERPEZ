import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createDUAllocationRequest } from '../handlers/createDUAllocationRequest'
import CreateBudgetAllocationForm from '../form/CreateBudgetAllocationForm'
import type { z } from 'zod'
import type {
  createBudgetAllocationSchema,
} from '../form/CreateBudgetAllocationForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

type CreateBudgetAllocationFormType = z.infer<typeof createBudgetAllocationSchema>

interface CreateDUAllocationDialogProps {
  onCreated?: (data: {
    deliveryUnitId: string
    purpose: string
    amount: number
    duFundAllocations: Array<unknown>
  }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  deliveryUnitId?: string
}

const useCreateDUAllocation = createMutationHookFromTemplate(
  createDUAllocationRequest,
)

export default function CreateDUAllocationDialog({
  onCreated,
  open,
  onCancel,
  onOpenChange,
  deliveryUnitId,
}: CreateDUAllocationDialogProps) {
  const { mutateAsync, isPending } = useCreateDUAllocation()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleCreateDUAllocation = (data: CreateBudgetAllocationFormType) => {
    return toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/du-allocations',
            })
            onCreated?.({
              deliveryUnitId: data.deliveryUnitId,
              purpose: data.purpose,
              amount: data.amount,
              duFundAllocations: data.duFundAllocations,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Creating Budget Allocation...',
        success: 'Budget Allocation created successfully!',
        error: 'Failed to create Budget Allocation.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Allocate Funds to Delivery Unit"
        description="Distribute funds to specific Delivery Units for effective budget management."
        className="sm:max-w-[700px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <CreateBudgetAllocationForm
          mode="create"
          onSubmit={handleCreateDUAllocation}
          onCancel={() => setShowUnsavedWarning(true)}
          fixedDeliveryUnitId={deliveryUnitId}
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
          onCancel?.() ?? onOpenChange?.(false)
        }}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
