import { useAtomValue } from 'jotai'
import {
  activeDialogAtom,
  createDialogAtom,
  deleteDialogAtom,
  deleteMultipleDialogAtom,
  inactiveDialogAtom,
  updateDialogAtom,
} from './atoms'
import CreateFundSourceDialog from './dialog/CreateFundSourceDialog'
import UpdateFundSourceDialog from './dialog/UpdateFundSourceDialog'
import DeleteFundSourceDialog from './dialog/DeleteFundSourceDialog'
import DeleteMultipleFundSourcesDialog from './dialog/DeleteMultipleFundSourcesDialog'
import ActiveDialog from './dialog/ActiveDialog'
import InactiveDialog from './dialog/InactiveDialog'

/**
 * Global dialog manager for Fund Source feature
 * Renders all dialogs based on Jotai state
 * Should be rendered once at the app level or feature level
 */
export default function FundSourceDialogManager() {
  const createDialog = useAtomValue(createDialogAtom)
  const updateDialog = useAtomValue(updateDialogAtom)
  const deleteDialog = useAtomValue(deleteDialogAtom)
  const deleteMultipleDialog = useAtomValue(deleteMultipleDialogAtom)
  const activeDialog = useAtomValue(activeDialogAtom)
  const inactiveDialog = useAtomValue(inactiveDialogAtom)

  return (
    <>
      {/* Create Dialog */}
      {createDialog.isOpen && <CreateFundSourceDialog />}

      {/* Update Dialog */}
      {updateDialog.isOpen && updateDialog.selectedId && (
        <UpdateFundSourceDialog />
      )}

      {/* Delete Single Dialog */}
      {deleteDialog.isOpen && deleteDialog.selectedId && (
        <DeleteFundSourceDialog />
      )}

      {/* Delete Multiple Dialog */}
      {deleteMultipleDialog.isOpen &&
        deleteMultipleDialog.selectedIds.length > 0 && (
          <DeleteMultipleFundSourcesDialog />
        )}

      {/* Active Dialog */}
      {activeDialog.isOpen && activeDialog.selectedFundSource && (
        <ActiveDialog />
      )}

      {/* Inactive Dialog */}
      {inactiveDialog.isOpen && inactiveDialog.selectedFundSource && (
        <InactiveDialog />
      )}
    </>
  )
}
