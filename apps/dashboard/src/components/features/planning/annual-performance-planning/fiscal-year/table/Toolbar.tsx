import { Plus } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/react-table'
import { createDialogAtom } from '../atoms'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

interface ToolbarProps {
  table: Table<AppFiscalYear>
  showColumnVisibility?: boolean
}

export default function Toolbar({ table, showColumnVisibility }: ToolbarProps) {
  const setCreateDialog = useSetAtom(createDialogAtom)

  const handleCreate = () => {
    setCreateDialog({
      isOpen: true,
      showUnsavedWarning: false,
    })
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        placeholder="Search fiscal years..."
        value={(table.getState().globalFilter as string) ?? ''}
        onChange={(event) =>
          table.setGlobalFilter(event.target.value)
        }
        className="max-w-sm"
      />
      <Button
        onClick={handleCreate}
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Fiscal Year
      </Button>
    </div>
  )
}
