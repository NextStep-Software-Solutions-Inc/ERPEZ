import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { UpdateObjectCodeForm, type UpdateObjectCodeFormValues } from '../forms/UpdateObjectCodeForm'
import { toast } from 'sonner'
import type { ObjectCode } from '../types/objectCodeTypes'
import { createMutationHookFromTemplate, createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { updateObjectCodeRequest } from '../handlers/updateObjectCodeRequest'
import { getObjectCodesRequest } from '../handlers/getObjectCodesRequest'
import { getExpenseClassesRequest } from '../handlers/getExpenseClassesRequest'

const useUpdateObjectCode = createMutationHookFromTemplate(updateObjectCodeRequest)
const useExpenseClasses = createQueryHookFromTemplate(getExpenseClassesRequest)

interface UpdateObjectCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectCode?: ObjectCode
  onSuccess?: () => void
}

export function UpdateObjectCodeDialog({
  open,
  onOpenChange,
  objectCode,
  onSuccess,
}: UpdateObjectCodeDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateObjectCode()

  // Fetch expense classes to resolve expenseClassId if changed
  const { data: expenseClassesResponse } = useExpenseClasses({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const handleSubmit = async (data: UpdateObjectCodeFormValues) => {
    if (!objectCode?.id) return

    try {
      const expenseClasses = expenseClassesResponse?.data || []
      const matchedExpenseClass = data.expenseClass
        ? expenseClasses.find(
            (ec) =>
              ec.code?.toUpperCase() === data.expenseClass ||
              ec.name?.toUpperCase().includes(data.expenseClass!)
          )
        : undefined

      await mutateAsync({
        pathParams: { id: objectCode.id },
        payload: {
          name: data.name,
          code: data.code,
          isActive: data.isActive,
          expenseClassId: matchedExpenseClass ? matchedExpenseClass.id : objectCode.expenseClassId || null,
        },
      })

      toast.success(`Object Code "${data.name}" updated successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getObjectCodesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getObjectCodesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update object code.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Object Code"
      description="Update the details of the object code."
      size="sm"
      showCloseButton
    >
      <UpdateObjectCodeForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
        initialData={objectCode}
      />
    </ResponsiveDialog>
  )
}

