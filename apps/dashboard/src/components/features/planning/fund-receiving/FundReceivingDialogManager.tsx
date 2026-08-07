import { useAtomValue } from 'jotai'
import {
  createDialogAtom,
  deleteDialogAtom,
  deleteMultipleDialogAtom,
  updateDialogAtom,
} from './atoms.ts'
import CreateFundReceivingDialog from './dialog/CreateFundReceivingDialog'
import UpdateFundReceivingDialog from './dialog/UpdateFundReceivingDialog'
import DeleteFundReceivingDialog from './dialog/DeleteFundReceivingDialog'
import DeleteMultipleFundReceivingsDialog from './dialog/DeleteMultipleFundReceivingsDialog'

export default function FundReceivingDialogManager() {
  const createDialog = useAtomValue(createDialogAtom)
  const updateDialog = useAtomValue(updateDialogAtom)
  const deleteDialog = useAtomValue(deleteDialogAtom)
  const deleteMultipleDialog = useAtomValue(deleteMultipleDialogAtom)

  return (
    <>
      {/* Create Dialog */}
      {createDialog.isOpen && <CreateFundReceivingDialog />}

      {/* Update Dialog */}
      {updateDialog.isOpen && updateDialog.selectedId && (
        <UpdateFundReceivingDialog />
      )}

      {/* Delete Single Dialog */}
      {deleteDialog.isOpen && deleteDialog.selectedId && (
        <DeleteFundReceivingDialog />
      )}

      {/* Delete Multiple Dialog */}
      {deleteMultipleDialog.isOpen &&
        deleteMultipleDialog.selectedIds.length > 0 && (
          <DeleteMultipleFundReceivingsDialog />
        )}
    </>
  )
}
