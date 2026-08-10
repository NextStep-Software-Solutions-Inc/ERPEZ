import { Activity, useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import UpsertFunctionAllocationForm from '../form/UpsertFunctionAllocationForm'
import { upsertFunctionAllocationRequest } from '../handlers/upsertFunctionAllocationRequest'
import type { UpsertFunctionAllocationType } from '../form/UpsertFunctionAllocationForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpsertFunctionAllocationDialogProps {
  onCreated?: (data: UpsertFunctionAllocationType) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useUpsertFunctionAllocation = createMutationHookFromTemplate(
  upsertFunctionAllocationRequest,
)

export default function UpsertFunctionAllocationDialog({
  onCreated,
  open,
  onCancel,
  onOpenChange,
}: UpsertFunctionAllocationDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const { mutateAsync } = useUpsertFunctionAllocation()
  const queryClient = useQueryClient()

  const handleCreateFunctionAllocation = (
    data: UpsertFunctionAllocationType,
  ) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: { id: data.yearId },
          queryParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fiscal-years'),
            })
            onCreated?.(data)
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Creating Function Allocation...',
        success: 'Function Allocation created successfully!',
        error: 'Failed to create Function Allocation.',
      },
    )
  }

  return (
    <>
      <Activity mode={showUnsavedWarning ? 'hidden' : 'visible'}>
        <ResponsiveDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Create Function Allocation"
          description="Configure percentage allocations for KPI functions"
        >
          <UpsertFunctionAllocationForm
            onSubmit={(data) => handleCreateFunctionAllocation(data)}
            onCancel={(form) =>
              form.state.isDirty
                ? setShowUnsavedWarning(true)
                : onCancel
                  ? onCancel()
                  : onOpenChange?.(false)
            }
          />
        </ResponsiveDialog>
      </Activity>
      <Activity mode={showUnsavedWarning ? 'visible' : 'hidden'}>
        <ConfirmAlertDialog
          open={showUnsavedWarning}
          onOpenChange={setShowUnsavedWarning}
          title="Unsaved Changes"
          description="You have unsaved changes that will be lost. Are you sure you want to continue?"
          onConfirm={onCancel || (() => onOpenChange?.(false))}
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
        />
      </Activity>
    </>
  )
}
