import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExpenseClassForm, type ExpenseClassFormValues } from '../forms/ExpenseClassForm'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createExpenseClassRequest } from '../handlers/createExpenseClassRequest'
import { getExpenseClassesRequest } from '../handlers/getExpenseClassesRequest'

const useCreateExpenseClass = createMutationHookFromTemplate(createExpenseClassRequest)

interface AddExpenseClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (createdId?: string) => void
}

export function AddExpenseClassDialog({ open, onOpenChange, onSuccess }: AddExpenseClassDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateExpenseClass()

  const handleFormSubmit = async (data: ExpenseClassFormValues) => {
    try {
      const createdId = await mutateAsync({
        pathParams: {},
        payload: {
          code: data.code,
          name: data.name,
          description: data.description,
          type: data.type,
          isActive: data.isActive,
        },
      })
      toast.success(`Expense class "${data.name}" created successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getExpenseClassesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getExpenseClassesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.(createdId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense class.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Expense Class"
      description="Enter the details for the new expense class."
      size="sm"
      showCloseButton
    >
      <ExpenseClassForm
        onSubmit={handleFormSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
      />
    </ResponsiveDialog>
  )
}