import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExpenseClassForm, type ExpenseClassFormValues } from '../forms/ExpenseClassForm'
import { toast } from 'sonner'
import type { ExpenseClass } from '../types/expenseClassTypes'

interface UpdateExpenseClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseClass?: ExpenseClass
  onSuccess?: (data: ExpenseClassFormValues) => void
}

export function UpdateExpenseClassDialog({
  open,
  onOpenChange,
  expenseClass,
  onSuccess,
}: UpdateExpenseClassDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ExpenseClassFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`Expense Class "${data.name}" updated successfully!`)
      onOpenChange(false)
      onSuccess?.(data)
    } catch (err) {
      toast.error('Failed to update expense class.')
    } finally {
      setIsLoading(false)
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
        isLoading={isLoading}
        initialData={expenseClass}
      />
    </ResponsiveDialog>
  )
}
