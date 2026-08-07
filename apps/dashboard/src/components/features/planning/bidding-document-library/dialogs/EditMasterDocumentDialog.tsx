import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MasterDoc, MasterDocumentFormData } from '../types'
import { MasterDocumentForm } from './MasterDocumentForm'

interface EditMasterDocumentDialogProps {
  doc: MasterDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (docId: string, data: MasterDocumentFormData) => void
}

export function EditMasterDocumentDialog({
  doc,
  open,
  onOpenChange,
  onUpdate,
}: EditMasterDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Master Document Type</DialogTitle>
          <DialogDescription>
            Modify global settings for this document requirement.
          </DialogDescription>
        </DialogHeader>
        {doc && (
          <MasterDocumentForm
            key={doc.id}
            doc={doc}
            submitLabel="Save Changes"
            onCancel={() => onOpenChange(false)}
            onSubmit={(data) => onUpdate(doc.id, data)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
