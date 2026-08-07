import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddObjectGroupForm, AddObjectGroupFormValues } from '../forms/AddObjectGroupForm'
import { AddDescGroupForm } from '../forms/AddDescGroupForm'
import { AddProjectItemForm, AddProjectItemFormValues } from '../forms/AddProjectItemForm'

interface AddObjectGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddObjectGroupFormValues) => void
}

export function AddObjectGroupDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddObjectGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add New Object Item Group
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add an expenditure item classification group and define its allotment class.
          </DialogDescription>
        </DialogHeader>
        <AddObjectGroupForm
          onSubmit={(values) => {
            onSubmit(values)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddDescGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (description: string) => void
}

export function AddDescGroupDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddDescGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add Description Group
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create a sub-expenditure category classification description.
          </DialogDescription>
        </DialogHeader>
        <AddDescGroupForm
          onSubmit={(values) => {
            onSubmit(values.description)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddProjectItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddProjectItemFormValues) => void
}

export function AddProjectItemDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddProjectItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add Project Item
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set details, pricing and timeline for the new project line-item.
          </DialogDescription>
        </DialogHeader>
        <AddProjectItemForm
          onSubmit={(values) => {
            onSubmit(values)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
