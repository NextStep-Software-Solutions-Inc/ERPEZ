import { Edit, Trash2 } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import { updateDialogAtom, deleteDialogAtom } from '../atoms'

interface ActionsProps {
  data: AppFiscalYear
  readonly?: boolean
}

export default function Actions({ data, readonly = false }: ActionsProps) {
  const setUpdateDialog = useSetAtom(updateDialogAtom)
  const setDeleteDialog = useSetAtom(deleteDialogAtom)

  const handleEdit = () => {
    setUpdateDialog({
      isOpen: true,
      selectedId: data.id,
      showUnsavedWarning: false,
    })
  }

  const handleDelete = () => {
    setDeleteDialog({
      isOpen: true,
      selectedId: data.id,
    })
  }

  // Disable edit/delete for locked fiscal years
  const isLocked = data.status === 'Locked' || data.isLocked || readonly

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        disabled={isLocked}
        title={isLocked ? 'Cannot edit locked fiscal year' : 'Edit fiscal year'}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isLocked}
        title={isLocked ? 'Cannot delete locked fiscal year' : 'Delete fiscal year'}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}
