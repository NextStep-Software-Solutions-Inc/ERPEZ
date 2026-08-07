import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MasterDocumentFormData } from '../types'
import { MasterDocumentForm } from './MasterDocumentForm'

interface CreateMasterDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: MasterDocumentFormData) => void
}

export function CreateMasterDocumentDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateMasterDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Register Master Document Type</DialogTitle>
          <DialogDescription>
            Add a new legal requirement or form parameter to the agency
            database.
          </DialogDescription>
        </DialogHeader>
        <MasterDocumentForm
          key={open ? 'create-open' : 'create-closed'}
          submitLabel="Create Document Type"
          onCancel={() => onOpenChange(false)}
          onSubmit={onCreate}
        />
      </DialogContent>
    </Dialog>
  )
}
