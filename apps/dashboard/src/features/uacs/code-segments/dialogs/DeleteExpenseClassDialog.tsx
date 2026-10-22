import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { ExpenseClass } from '../types/expenseClassTypes'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteExpenseClassRequest } from '../handlers/deleteExpenseClassRequest'
import { getExpenseClassesRequest } from '../handlers/getExpenseClassesRequest'

const useDeleteExpenseClass = createMutationHookFromTemplate(deleteExpenseClassRequest)

interface DeleteExpenseClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseClass?: ExpenseClass
  onSuccess?: () => void
  onConfirm?: () => Promise<void>
}

export function DeleteExpenseClassDialog({
  open,
  onOpenChange,
  expenseClass,
  onSuccess,
  onConfirm,
}: DeleteExpenseClassDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteExpenseClass()

  const handleDelete = async () => {
    if (!expenseClass?.id) return

    try {
      if (onConfirm) {
        await onConfirm()
      } else {
        await mutateAsync({
          pathParams: { id: expenseClass.id },
        })
      }

      toast.success(`Expense class "${expenseClass.name}" deleted successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getExpenseClassesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getExpenseClassesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense class.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TrashIcon className="h-5 w-5 text-red-500" />
            Delete Expense Class
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">"{expenseClass?.name}"</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

