import { useAtomValue, useSetAtom } from 'jotai'

import {
  createDialogAtom,
  deleteDialogAtom,
  deleteMultipleDialogAtom,
} from './atoms'
import CreateDUAllocationDialog from './dialog/CreateDUAllocationDialog'
import DeleteDUAllocationDialog from './dialog/DeleteDUAllocationDialog'

export default function BudgetAllocationDialogManager() {
  const createDialog = useAtomValue(createDialogAtom)
  const deleteDialog = useAtomValue(deleteDialogAtom)
  const deleteMultipleDialog = useAtomValue(deleteMultipleDialogAtom)

  const setCreateDialog = useSetAtom(createDialogAtom)
  const setDeleteDialog = useSetAtom(deleteDialogAtom)
  const setDeleteMultipleDialog = useSetAtom(deleteMultipleDialogAtom)

  return (
    <>
      {/* Create Dialog */}
      <CreateDUAllocationDialog
        open={createDialog.isOpen}
        onOpenChange={(open) =>
          setCreateDialog({ ...createDialog, isOpen: open })
        }
      />

      {/* Delete Single Dialog */}
      {deleteDialog.selectedId && (
        <DeleteDUAllocationDialog
          open={deleteDialog.isOpen}
          onOpenChange={(open) =>
            setDeleteDialog({ ...deleteDialog, isOpen: open })
          }
          ids={[deleteDialog.selectedId]}
        />
      )}

      {/* Delete Multiple Dialog */}
      {deleteMultipleDialog.selectedIds.length > 0 && (
        <DeleteDUAllocationDialog
          open={deleteMultipleDialog.isOpen}
          onOpenChange={(open) =>
            setDeleteMultipleDialog({ ...deleteMultipleDialog, isOpen: open })
          }
          ids={deleteMultipleDialog.selectedIds}
        />
      )}
    </>
  )
}
