import { Loader2 } from 'lucide-react'
import SubmitButton from './SubmitButton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmAlertDialogProps {
  onConfirm: () => void
  onCancel?: () => void
  open: boolean
  onOpenChange?: (state: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}
export function ConfirmAlertDialog({
  onConfirm,
  onCancel,
  onOpenChange,
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
}: ConfirmAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[9999]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelLabel && (
            <AlertDialogCancel onClick={onCancel}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <SubmitButton
            variant="destructive"
            disabled={loading}
            onClick={() => onConfirm()}
          >
            <Loader2
              className={cn('hidden', {
                'block animate-spin transition-all': loading,
              })}
            />
            {confirmLabel}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
