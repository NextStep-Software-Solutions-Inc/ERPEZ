'use client'

import { useAtomValue, useSetAtom } from 'jotai'

import CreateOfficeDialog from './dialog/CreateOfficeDialog'
import UpdateOfficeDialog from './dialog/UpdateOfficeDialog'
import DeleteOfficeDialog from './dialog/DeleteOfficeDialog'
import CreatePositionDialog from './dialog/CreatePositionDialog'
import UpdatePositionDialog from './dialog/UpdatePositionDialog'
import DeletePositionDialog from './dialog/DeletePositionDialog'
import CreatePersonnelDialog from './dialog/CreatePersonnelDialog'
import UpdatePersonnelDialog from './dialog/UpdatePersonnelDialog'
import PMTBodyDialog from './dialog/PMTBodyDialog'
import {
  createOfficeDialogAtom,
  updateOfficeDialogAtom,
  deleteOfficeDialogAtom,
  createPositionDialogAtom,
  updatePositionDialogAtom,
  deletePositionDialogAtom,
  createPersonnelDialogAtom,
  updatePersonnelDialogAtom,
  pmtBodyDialogAtom,
} from './atoms'

/**
 * OrganizationalStructureDialogManager
 *
 * Centralized dialog manager for the organizational structure feature.
 * Orchestrates all dialog visibility and interactions using Jotai atoms.
 * This component conditionally renders all dialogs based on their respective atom states.
 *
 * Dialog Types:
 * - Office: Create, Update, Delete operations
 * - Position: Create, Update, Delete operations
 * - Personnel: Create, Update, Delete operations
 * - PMT Body: Special dialog for PMT configuration
 *
 * Benefits:
 * - Single component for all dialog orchestration
 * - Centralized state management via Jotai atoms
 * - localStorage persistence for dialog states
 * - Type-safe dialog state management
 * - Easier to test and maintain
 */
export default function OrganizationalStructureDialogManager() {
  // Office dialogs
  const createOfficeDialog = useAtomValue(createOfficeDialogAtom)
  const setCreateOfficeDialog = useSetAtom(createOfficeDialogAtom)
  const updateOfficeDialog = useAtomValue(updateOfficeDialogAtom)
  const setUpdateOfficeDialog = useSetAtom(updateOfficeDialogAtom)
  const deleteOfficeDialog = useAtomValue(deleteOfficeDialogAtom)
  const setDeleteOfficeDialog = useSetAtom(deleteOfficeDialogAtom)

  // Position dialogs
  const createPositionDialog = useAtomValue(createPositionDialogAtom)
  const setCreatePositionDialog = useSetAtom(createPositionDialogAtom)
  const updatePositionDialog = useAtomValue(updatePositionDialogAtom)
  const setUpdatePositionDialog = useSetAtom(updatePositionDialogAtom)
  const deletePositionDialog = useAtomValue(deletePositionDialogAtom)
  const setDeletePositionDialog = useSetAtom(deletePositionDialogAtom)

  // Personnel dialogs
  const createPersonnelDialog = useAtomValue(createPersonnelDialogAtom)
  const setCreatePersonnelDialog = useSetAtom(createPersonnelDialogAtom)
  const updatePersonnelDialog = useAtomValue(updatePersonnelDialogAtom)
  const setUpdatePersonnelDialog = useSetAtom(updatePersonnelDialogAtom)

  // PMT body dialog
  const pmtBodyDialog = useAtomValue(pmtBodyDialogAtom)
  const setPmtBodyDialog = useSetAtom(pmtBodyDialogAtom)

  return (
    <>
      {/* Office Dialogs */}
      <CreateOfficeDialog
        open={createOfficeDialog.isOpen}
        onOpenChange={(open) =>
          setCreateOfficeDialog({ ...createOfficeDialog, isOpen: open })
        }
      />
      {updateOfficeDialog.isOpen && updateOfficeDialog.selectedId && (
        <UpdateOfficeDialog
          open={updateOfficeDialog.isOpen}
          onOpenChange={(open) =>
            setUpdateOfficeDialog({
              ...updateOfficeDialog,
              isOpen: open,
              selectedId: open ? updateOfficeDialog.selectedId : null,
            })
          }
          unitId={updateOfficeDialog.selectedId}
        />
      )}
      {deleteOfficeDialog.isOpen && deleteOfficeDialog.selectedId && (
        <DeleteOfficeDialog
          open={deleteOfficeDialog.isOpen}
          onOpenChange={(open) =>
            setDeleteOfficeDialog({
              ...deleteOfficeDialog,
              isOpen: open,
              selectedId: open ? deleteOfficeDialog.selectedId : null,
            })
          }
          unitId={deleteOfficeDialog.selectedId}
        />
      )}

      {/* Position Dialogs */}
      <CreatePositionDialog
        open={createPositionDialog.isOpen}
        onOpenChange={(open) =>
          setCreatePositionDialog({ ...createPositionDialog, isOpen: open })
        }
      />
      {updatePositionDialog.isOpen && updatePositionDialog.selectedId && (
        <UpdatePositionDialog
          open={updatePositionDialog.isOpen}
          onOpenChange={(open) =>
            setUpdatePositionDialog({
              ...updatePositionDialog,
              isOpen: open,
              selectedId: open ? updatePositionDialog.selectedId : null,
            })
          }
          positionId={updatePositionDialog.selectedId}
        />
      )}
      {deletePositionDialog.isOpen && deletePositionDialog.selectedId && (
        <DeletePositionDialog
          open={deletePositionDialog.isOpen}
          onOpenChange={(open) =>
            setDeletePositionDialog({
              ...deletePositionDialog,
              isOpen: open,
              selectedId: open ? deletePositionDialog.selectedId : null,
            })
          }
          positionId={deletePositionDialog.selectedId}
        />
      )}

      {/* Personnel Dialogs */}
      <CreatePersonnelDialog
        open={createPersonnelDialog.isOpen}
        onOpenChange={(open) =>
          setCreatePersonnelDialog({ ...createPersonnelDialog, isOpen: open })
        }
      />
      {updatePersonnelDialog.isOpen && updatePersonnelDialog.selectedId && (
        <UpdatePersonnelDialog
          open={updatePersonnelDialog.isOpen}
          onOpenChange={(open) =>
            setUpdatePersonnelDialog({
              ...updatePersonnelDialog,
              isOpen: open,
              selectedId: open ? updatePersonnelDialog.selectedId : null,
            })
          }
          personnelId={updatePersonnelDialog.selectedId}
        />
      )}

      {/* PMT Body Dialog */}
      <PMTBodyDialog
        open={pmtBodyDialog.isOpen}
        onOpenChange={(open) =>
          setPmtBodyDialog({ ...pmtBodyDialog, isOpen: open })
        }
      />
    </>
  )
}
