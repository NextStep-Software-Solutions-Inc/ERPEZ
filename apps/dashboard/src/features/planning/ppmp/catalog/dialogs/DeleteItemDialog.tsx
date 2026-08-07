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
import { deactivateCatalogItemAtom } from '../atoms/catalogAtoms'

export function DeleteItemDialog() {
  const [open, setOpen] = useAtom(deleteItemDialogOpenAtom)
  const item = useAtomValue(itemToDeleteAtom)
  const deactivateItem = useSetAtom(deactivateCatalogItemAtom)

  if (!item) return null

  const handleDeactivate = () => {
    deactivateItem(item.id)
    toast.success(`"${item.name}" has been deactivated.`)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="z-999">
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Catalog Item?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{item.name}</strong> will be marked as <em>Inactive</em> and
            hidden from user catalogs. This can be reversed by editing the item
            and setting status to Active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeactivate}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
