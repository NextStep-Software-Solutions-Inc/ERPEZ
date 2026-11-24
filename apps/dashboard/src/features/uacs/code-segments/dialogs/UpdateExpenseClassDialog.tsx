import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExpenseClassForm, type ExpenseClassFormValues } from '../forms/ExpenseClassForm'
import { toast } from 'sonner'
import type { ExpenseClass } from '../types/expenseClassTypes'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { updateExpenseClassRequest } from '../handlers/updateExpenseClassRequest'
import { getExpenseClassesRequest } from '../handlers/getExpenseClassesRequest'

const useUpdateExpenseClass = createMutationHookFromTemplate(updateExpenseClassRequest)

interface UpdateExpenseClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseClass?: ExpenseClass
  onSuccess?: () => void
}

export function UpdateExpenseClassDialog({
  open,
  onOpenChange,
  expenseClass,
  onSuccess,
}: UpdateExpenseClassDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateExpenseClass()

  const handleSubmit = async (data: ExpenseClassFormValues) => {
    if (!expenseClass?.id) return

    try {
      await mutateAsync({
        pathParams: { id: expenseClass.id },
        payload: {
          code: data.code,
          name: data.name,
          description: data.description,
          type: data.type,
          isActive: data.isActive,
        },
      })
      toast.success(`Expense Class "${data.name}" updated successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getExpenseClassesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getExpenseClassesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense class.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Expense Class"
      description="Update the details of the expense class."
      size="sm"
      showCloseButton
    >
      <ExpenseClassForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
        initialData={expenseClass}
      />
    </ResponsiveDialog>
  )
}

