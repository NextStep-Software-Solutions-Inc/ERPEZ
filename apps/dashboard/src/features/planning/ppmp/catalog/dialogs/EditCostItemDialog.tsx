/**
 * EditCostItemDialog
 * Modal for editing an existing Cost Master item.
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  editCostItemDialogOpenAtom,
  costItemToEditAtom,
} from '../atoms/costMasterDialogAtoms'
import { updateCostItemAtom } from '../../atoms/costMasterAtoms'
import { CostItemForm } from '../forms/CostItemForm'
import type { CostItemFormValues } from '../forms/CostItemFormSchema'

export function EditCostItemDialog() {
  const [open, setOpen] = useAtom(editCostItemDialogOpenAtom)
  const item = useAtomValue(costItemToEditAtom)
  const updateCostItem = useSetAtom(updateCostItemAtom)

  if (!item) return null

  const defaultValues: Partial<CostItemFormValues> = {
    costItemName: item.costItemName,
    category: item.category,
    subcategory: item.subcategory ?? '',
    standardUnitCost: item.standardUnitCost,
    unitOfMeasure: item.unitOfMeasure,
    description: item.description,
    uacsCode: item.uacsCode ?? '',
    isActive: item.isActive,
  }

  const handleSubmit = (data: CostItemFormValues) => {
    updateCostItem({
      costItemId: item.id,
      changes: {
        costItemName: data.costItemName,
        category: data.category,
        subcategory: data.subcategory ?? null,
        standardUnitCost: data.standardUnitCost,
        unitOfMeasure: data.unitOfMeasure,
        description: data.description,
        uacsCode: data.uacsCode ?? null,
        isActive: data.isActive,
      },
    })
    toast.success(`"${data.costItemName}" updated successfully.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Cost Master Item</DialogTitle>
          <DialogDescription>
            Update the predefined cost item that planners can select from the
            master list.
          </DialogDescription>
        </DialogHeader>
        <CostItemForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
