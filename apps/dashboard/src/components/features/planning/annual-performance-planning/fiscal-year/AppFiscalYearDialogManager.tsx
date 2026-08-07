import { useAtomValue } from 'jotai'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import CreateFiscalYearDialog from './dialog/CreateFiscalYearDialog'
import UpdateFiscalYearDialog from './dialog/UpdateFiscalYearDialog'
import DeleteFiscalYearDialog from './dialog/DeleteFiscalYearDialog'
import { createDialogAtom, deleteDialogAtom, updateDialogAtom } from './atoms'

interface AppFiscalYearDialogManagerProps {
  allFiscalYears?: AppFiscalYear[]
  onCreated?: (data: AppFiscalYear) => void
  onUpdated?: (data: AppFiscalYear) => void
  onDeleted?: () => void
}

export default function AppFiscalYearDialogManager({
  allFiscalYears = [],
  onCreated,
  onUpdated,
  onDeleted,
}: AppFiscalYearDialogManagerProps) {
  const createDialog = useAtomValue(createDialogAtom)
  const updateDialog = useAtomValue(updateDialogAtom)
  const deleteDialog = useAtomValue(deleteDialogAtom)

  return (
    <>
      {/* Create Dialog */}
      {createDialog.isOpen && <CreateFiscalYearDialog onCreated={onCreated} />}

      {/* Update Dialog */}
      {updateDialog.isOpen && updateDialog.selectedId && (
        <UpdateFiscalYearDialog
          allFiscalYears={allFiscalYears}
          onUpdated={onUpdated}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialog.isOpen && deleteDialog.selectedId && (
        <DeleteFiscalYearDialog
          allFiscalYears={allFiscalYears}
          onSuccess={onDeleted}
        />
      )}
    </>
  )
}
