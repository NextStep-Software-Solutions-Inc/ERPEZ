import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddActivityForm } from '../forms/AddActivityForm'
import { AddExpTypeForm } from '../forms/AddExpTypeForm'
import { AddItemOfExpenditureForm } from '../forms/AddItemOfExpenditureForm'
import { AddBudgetItemForm, AddBudgetItemFormValues } from '../forms/AddBudgetItemForm'
import type { Activity } from '../types/realignment.types'

interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showSourceSelect: boolean
  generatedName: string
  onSubmit: (source: 'activity' | 'opcr') => void
}

export function AddActivityDialog({
  open,
  onOpenChange,
  showSourceSelect,
  generatedName,
  onSubmit,
}: AddActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Create New Activity
          </DialogTitle>
          <DialogDescription className="text-xs">
            Register a new activity element within this budget plan.
          </DialogDescription>
        </DialogHeader>
        <AddActivityForm
          showSourceSelect={showSourceSelect}
          generatedName={generatedName}
          onSubmit={(values) => {
            onSubmit(values.source)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddExpTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: Activity | undefined
  onSubmit: (allotmentClass: 'PS' | 'MOOE' | 'CO') => void
}

export function AddExpTypeDialog({
  open,
  onOpenChange,
  activity,
  onSubmit,
}: AddExpTypeDialogProps) {
  const existingTypes = activity?.expenditureTypes.map((e) => e.type) || []
  const availableOptions = (
    [
      { value: 'PS', label: 'Personnel Services (PS)' },
      { value: 'MOOE', label: 'Maintenance & Other Operating Expenses (MOOE)' },
      { value: 'CO', label: 'Capital Outlay (CO)' },
    ] as const
  ).filter((opt) => !existingTypes.includes(opt.value))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add Expenditure Type
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select an allotment class to add to the activity.
          </DialogDescription>
        </DialogHeader>
        <AddExpTypeForm
          availableOptions={availableOptions}
          onSubmit={(values) => {
            onSubmit(values.allotmentClass)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddItemOfExpenditureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allotmentClass: 'PS' | 'MOOE' | 'CO'
  existingNames: string[]
  onSubmit: (name: string) => void
}

export function AddItemOfExpenditureDialog({
  open,
  onOpenChange,
  allotmentClass,
  existingNames,
  onSubmit,
}: AddItemOfExpenditureDialogProps) {
  const { STANDARD_ITEMS } = require('../constants/realignmentConstants')
  const standardOptions = (STANDARD_ITEMS[allotmentClass] || []).filter(
    (item: string) => !existingNames.includes(item),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add Item of Expenditure
          </DialogTitle>
          <DialogDescription className="text-xs">
            Define a specific item of expenditure under this allotment class.
          </DialogDescription>
        </DialogHeader>
        <AddItemOfExpenditureForm
          standardOptions={standardOptions}
          onSubmit={(name) => {
            onSubmit(name)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddBudgetItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddBudgetItemFormValues) => void
}

export function AddBudgetItemDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddBudgetItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Add Budgeted Sub-Item
          </DialogTitle>
          <DialogDescription className="text-xs">
            Detail the quarterly distribution of funding for this expenditure item.
          </DialogDescription>
        </DialogHeader>
        <AddBudgetItemForm
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
