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

interface DeleteExpenseClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseClass?: ExpenseClass
  onConfirm?: () => Promise<void>
}

export function DeleteExpenseClassDialog({
  open,
  onOpenChange,
  expenseClass,
  onConfirm,
}: DeleteExpenseClassDialogProps) {
  const handleDelete = async () => {
    try {
      await onConfirm?.()
      toast.success(`Expense class "${expenseClass?.name}" deleted successfully!`)
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to delete expense class.')
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
