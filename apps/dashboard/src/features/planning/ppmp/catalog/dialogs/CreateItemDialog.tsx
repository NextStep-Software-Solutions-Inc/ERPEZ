/**
 * CreateItemDialog
 * Modal for creating a new Non-CSE catalog item.
 * Controlled by createItemDialogOpenAtom.
 * Uses createCatalogItemAtom (Jotai write atom).
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
import { CatalogItemForm } from '../forms/CatalogItemForm'
import { createItemDialogOpenAtom } from '../atoms/catalogDialogAtoms'
import { createCatalogItemAtom } from '../atoms/catalogAtoms'
import type { CatalogItemFormValues } from '../forms/CatalogItemFormSchema'
import type { CreateCatalogItemInput } from '../types/catalog.types'

export function CreateItemDialog() {
  const [open, setOpen] = useAtom(createItemDialogOpenAtom)
  const createItem = useSetAtom(createCatalogItemAtom)

  const handleSubmit = (data: CatalogItemFormValues) => {
    const input: CreateCatalogItemInput = {
      name: data.name,
      category: data.category,
      subcategory: data.subcategory ?? null,
      unitOfMeasure: data.unitOfMeasure,
      currentPrice: data.currentPrice,
      specification: data.specification ?? '',
      itemType: data.itemType,
      supplier: data.supplier ?? null,
      imageUrl: data.imageUrl ?? null,
      uacsCode: data.uacsCode ?? null,
      unspscCode: data.unspscCode,
      isCSE: data.isCSE,
    }
    createItem(input)
    toast.success(`"${data.name}" added to catalog.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Catalog Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new Non-CSE procurement item. Fields
            marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <CatalogItemForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
