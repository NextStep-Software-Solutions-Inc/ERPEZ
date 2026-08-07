/**
 * CreateCostItemDialog
 * Modal for creating a new Cost Master item.
 */

import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { createCostItemDialogOpenAtom } from '../atoms/costMasterDialogAtoms'
import { createCostItemAtom } from '../../atoms/costMasterAtoms'
import { CostItemForm } from '../forms/CostItemForm'
import type { CostItemFormValues } from '../forms/CostItemFormSchema'

export function CreateCostItemDialog() {
  const [open, setOpen] = useAtom(createCostItemDialogOpenAtom)
  const createCostItem = useSetAtom(createCostItemAtom)

  const handleSubmit = (data: CostItemFormValues) => {
    createCostItem({
      costItemName: data.costItemName,
      category: data.category,
      subcategory: data.subcategory ?? null,
      standardUnitCost: data.standardUnitCost,
      unitOfMeasure: data.unitOfMeasure,
      description: data.description,
      uacsCode: data.uacsCode ?? null,
      isActive: data.isActive,
    })
    toast.success(`"${data.costItemName}" added to the Cost Master.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Cost Master Item</DialogTitle>
          <DialogDescription>
            Create a predefined cost item that planners can add from the master
            list in PPMP builder blocks.
          </DialogDescription>
        </DialogHeader>
        <CostItemForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
