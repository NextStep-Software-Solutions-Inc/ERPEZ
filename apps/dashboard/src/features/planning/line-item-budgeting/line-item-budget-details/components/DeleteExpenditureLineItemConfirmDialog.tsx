import { useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { LineItemBudgetDetails } from '../types/types'

interface DeleteExpenditureLineItemConfirmDialogProps {
  item: LineItemBudgetDetails
  onConfirm: () => void
  isLoading?: boolean
  triggerVariant?: 'outline' | 'ghost' | 'soft' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DeleteExpenditureLineItemConfirmDialog({
  item,
  onConfirm,
  isLoading = false,
  triggerVariant = 'ghost',
  triggerSize = 'sm',
}: DeleteExpenditureLineItemConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDialogTitle>Delete Line Item</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete the line item{' '}
            <span className="font-semibold text-gray-900">
              "{item.description || 'Unnamed Item'}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting || isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
