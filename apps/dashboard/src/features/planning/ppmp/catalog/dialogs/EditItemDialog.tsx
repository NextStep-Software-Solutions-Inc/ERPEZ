/**
 * EditItemDialog
 * Modal for editing an existing Non-CSE catalog item.
 * Controlled by editItemDialogOpenAtom + itemToEditAtom.
 * Uses updateCatalogItemAtom (Jotai write atom).
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
import { CatalogItemForm } from '../forms/CatalogItemForm'
import {
  editItemDialogOpenAtom,
  itemToEditAtom,
} from '../atoms/catalogDialogAtoms'
import { updateCatalogItemAtom } from '../atoms/catalogAtoms'
import type { CatalogItemFormValues } from '../forms/CatalogItemFormSchema'
import type { UpdateCatalogItemInput, CatalogUoM } from '../types/catalog.types'

export function EditItemDialog() {
  const [open, setOpen] = useAtom(editItemDialogOpenAtom)
  const item = useAtomValue(itemToEditAtom)
  const updateItem = useSetAtom(updateCatalogItemAtom)

  if (!item) return null

  const defaultValues: Partial<CatalogItemFormValues> = {
    name: item.name,
    itemType: item.itemType,
    category: item.category,
    subcategory: item.subcategory ?? '',
    unitOfMeasure: item.unitOfMeasure as CatalogUoM,
    currentPrice: item.currentPrice,
    specification: item.specification ?? '',
    supplier: item.supplier ?? '',
    uacsCode: item.uacsCode ?? '',
    unspscCode: item.unspscCode ?? '',
    isCSE: item.isCSE,
    imageUrl: item.imageUrl ?? null,
    status: item.status,
  }

  const handleSubmit = (data: CatalogItemFormValues) => {
    const input: UpdateCatalogItemInput = {
      itemId: item.id,
      changes: {
        name: data.name,
        itemType: data.itemType,
        category: data.category,
        subcategory: data.subcategory ?? null,
        unitOfMeasure: data.unitOfMeasure,
        currentPrice: data.currentPrice,
        specification: data.specification ?? undefined,
        supplier: data.supplier ?? null,
        imageUrl: data.imageUrl ?? null,
        uacsCode: data.uacsCode ?? null,
        unspscCode: data.unspscCode,
        isCSE: data.isCSE,
        status: data.status,
        isActive: data.status === 'Active',
      },
    }
    updateItem(input)
    toast.success(`"${data.name}" updated successfully.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Catalog Item</DialogTitle>
          <DialogDescription>
            Update the details for{' '}
            <span className="font-medium">{item.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <CatalogItemForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
