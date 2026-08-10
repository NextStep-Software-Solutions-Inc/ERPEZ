import { useAtomValue } from 'jotai'
import {
    createDialogAtom,
    deleteDialogAtom,
    deleteMultipleDialogAtom,
    submitDialogAtom,
    updateDialogAtom,
} from '../atoms'
import CreateOpcrDialog from './CreateOpcrDialog'
import UpdateOpcrDialog from './UpdateOpcrDialog'
import DeleteOpcrDialog from './DeleteOpcrDialog'
import DeleteMultipleOPCRsDialog from './DeleteMultipleOPCRsDialog'
import SubmitOpcrDialog from './SubmitOpcrDialog'

interface OpcrDialogManagerProps {
    deliveryUnitId?: string
}

export default function OpcrDialogManager({ deliveryUnitId }: OpcrDialogManagerProps) {
    const createDialog = useAtomValue(createDialogAtom)
    const updateDialog = useAtomValue(updateDialogAtom)
    const deleteDialog = useAtomValue(deleteDialogAtom)
    const deleteMultipleDialog = useAtomValue(deleteMultipleDialogAtom)
    const submitDialog = useAtomValue(submitDialogAtom)

    return (
        <>
            {/* Create Dialog */}
            {createDialog.isOpen && (
                <CreateOpcrDialog deliveryUnitId={deliveryUnitId} />
            )}

            {/* Update Dialog */}
            {updateDialog.isOpen && updateDialog.selectedId && (
                <UpdateOpcrDialog opcrId={updateDialog.selectedId} />
            )}

            {/* Delete Dialog */}
            {deleteDialog.isOpen && deleteDialog.selectedOPCR && (
                <DeleteOpcrDialog opcr={deleteDialog.selectedOPCR} />
            )}

            {/* Delete Multiple Dialog */}
            {deleteMultipleDialog.isOpen && deleteMultipleDialog.selectedIds?.length > 0 && (
                <DeleteMultipleOPCRsDialog />
            )}

            {/* Submit Dialog */}
            {submitDialog.isOpen && submitDialog.selectedId && (
                <SubmitOpcrDialog opcrId={submitDialog.selectedId} />
            )}
        </>
    )
}
