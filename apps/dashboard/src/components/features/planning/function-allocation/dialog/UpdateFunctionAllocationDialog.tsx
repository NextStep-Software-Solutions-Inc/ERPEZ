import { Activity, useState } from 'react'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import UpsertFunctionAllocationForm from '../form/UpsertFunctionAllocationForm'
import { upsertFunctionAllocationRequest } from '../handlers/upsertFunctionAllocationRequest'
import { getFiscalYearRequest } from '../../fiscal-year/handlers/getFiscalYearRequest'
import type { UpsertFunctionAllocationType } from '../form/UpsertFunctionAllocationForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateFunctionAllocationDialogProps {
  id: string
  onUpdated?: (data: UpsertFunctionAllocationType) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useUpdateFunctionAllocation = createMutationHookFromTemplate(
  upsertFunctionAllocationRequest,
)
const useFiscalYear = createQueryHookFromTemplate(getFiscalYearRequest)

export default function UpdateFunctionAllocationDialog({
  id,
  onUpdated,
  open,
  onCancel,
  onOpenChange,
}: UpdateFunctionAllocationDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const { mutateAsync } = useUpdateFunctionAllocation()
  const queryClient = useQueryClient()
  const { data: fiscalYear } = useFiscalYear({
    pathParams: { id },
    queryParams: {},
  })

  const handleUpdateFunctionAllocation = (
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
              predicate: (query) => query.queryKey[0] === '/fiscal-years',
            })
            onUpdated?.(data)
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Updating Function Allocation...',
        success: 'Function Allocation updated successfully!',
        error: 'Failed to update Function Allocation.',
      },
    )
  }

  return (
    <>
      <Activity mode={showUnsavedWarning ? 'hidden' : 'visible'}>
        <ResponsiveDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Edit Function Allocation"
        >
          <UpsertFunctionAllocationForm
            onSubmit={(data) => handleUpdateFunctionAllocation(data)}
            onCancel={(form) =>
              form.state.isDirty
                ? setShowUnsavedWarning(true)
                : onCancel
                  ? onCancel()
                  : onOpenChange?.(false)
            }
            isEdit={true}
            fiscalYearId={id}
            initialValues={
              fiscalYear?.data
                ? {
                    yearId: fiscalYear.data.id,
                    functionAllocations: fiscalYear.data.functionAllocations,
                  }
                : undefined
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
