import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MasterDoc } from '../types'

interface DeleteMasterDocumentDialogProps {
  doc: MasterDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteMasterDocumentDialog({
  doc,
  open,
  onOpenChange,
  onConfirm,
}: DeleteMasterDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> Delete Master Document
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this document from the Master
            database? This will remove it from all default checklists.
          </DialogDescription>
        </DialogHeader>
        <div className="p-3 border rounded font-mono text-sm bg-muted/40">
          {doc?.name}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
