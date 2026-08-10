import { useAtomValue } from 'jotai'
import {
    createDialogAtom,
    deleteDialogAtom,
    deleteMultipleDialogAtom,
    selectedSubKpiAtom,
    updateDialogAtom,
} from '../atoms'
import CreateSubKpiDialog from './CreateSubKpiDialog'
import UpdateSubKpiDialog from './UpdateSubKpiDialog'
import DeleteSubKpiDialog from './DeleteSubKpiDialog'

interface SubKpiDialogManagerProps {
    kpiId: string
}

export default function SubKpiDialogManager({ kpiId }: SubKpiDialogManagerProps) {
    const createDialog = useAtomValue(createDialogAtom)
    const updateDialog = useAtomValue(updateDialogAtom)
    const deleteDialog = useAtomValue(deleteDialogAtom)
    const deleteMultipleDialog = useAtomValue(deleteMultipleDialogAtom)
    const selectedSubKpi = useAtomValue(selectedSubKpiAtom)

    return (
        <>
            {/* Create Dialog */}
            {createDialog.isOpen && (
                <CreateSubKpiDialog kpiId={kpiId} />
            )}

            {/* Update Dialog */}
            {updateDialog.isOpen && selectedSubKpi && (
                <UpdateSubKpiDialog subKpi={selectedSubKpi} />
            )}

            {/* Delete Single Dialog */}
            {deleteDialog.isOpen && deleteDialog.selectedIds.length > 0 && (
                <DeleteSubKpiDialog ids={deleteDialog.selectedIds} />
            )}

            {/* Delete Multiple Dialog */}
            {deleteMultipleDialog.isOpen && deleteMultipleDialog.selectedIds?.length > 0 && (
                <DeleteSubKpiDialog ids={deleteMultipleDialog.selectedIds} />
            )}
        </>
    )
}
