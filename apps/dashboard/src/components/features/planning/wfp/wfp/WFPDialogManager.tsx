import { useAtomValue } from 'jotai'
import {
  approveDialogAtom,
  createDialogAtom,
  deleteDialogAtom,
  updateDialogAtom,
} from './atoms'
import CreateWFPDialog from './dialog/CreateWFPDialog'
import UpdateWFPDialog from './dialog/UpdateWFPDialog'
import DeleteWfpDialog from './dialog/DeleteWfpDialog'
import ApproveWfpDialog from './dialog/ApproveWfpDialog'
import SubmitWfpDialog from './dialog/SubmitWfpDialog'

export default function WFPDialogManager() {
  const createDialog = useAtomValue(createDialogAtom)
  const updateDialog = useAtomValue(updateDialogAtom)
  const deleteDialog = useAtomValue(deleteDialogAtom)
  const approveDialog = useAtomValue(approveDialogAtom)

  return (
    <>
      {/* Create Dialog */}
      {createDialog.isOpen && <CreateWFPDialog />}

      {/* Update Dialog */}
      {updateDialog.isOpen && updateDialog.selectedId && (
        <UpdateWFPDialog />
      )}

      {/* Delete Single Dialog */}
      {deleteDialog.isOpen && deleteDialog.selectedId && (
        <DeleteWfpDialog 
        />
      )}

      {/* Delete Multiple Dialog */}
      {/* {deleteMultipleDialog.isOpen &&
        deleteMultipleDialog.selectedIds.length > 0 && (
          <DeleteMultipleWFPsDialog />
        )} */}

      {/* Approve Dialog */}
      {approveDialog.isOpen && approveDialog.selectedId && (
        <ApproveWfpDialog 
        />
      )}

      {/* Submit Dialog */}
      <SubmitWfpDialog />
    </>
  )
}
