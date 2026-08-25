/**
 * DeleteItemDialog
 * Confirmation AlertDialog for deactivating a catalog item (soft-delete).
 * Controlled by deleteItemDialogOpenAtom + itemToDeleteAtom.
 * Uses deactivateCatalogItemAtom (Jotai write atom).
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  deleteItemDialogOpenAtom,
  itemToDeleteAtom,
} from '../atoms/catalogDialogAtoms'
import { deleteCatalogItemAtom } from '../atoms/catalogAtoms'

export function DeleteItemDialog() {
  const [open, setOpen] = useAtom(deleteItemDialogOpenAtom)
  const item = useAtomValue(itemToDeleteAtom)
  const deleteItem = useSetAtom(deleteCatalogItemAtom)

  if (!item) return null

  const handleDelete = () => {
    deleteItem(item.id)
    toast.success(`"${item.name}" has been removed.`)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="z-999">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Catalog Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{item.name}</strong> from
            the catalog?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
