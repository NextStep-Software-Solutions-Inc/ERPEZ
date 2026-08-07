import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkActionsBarProps {
  count: number
  onDelete: () => void
  onClearSelection: () => void
}

export const BulkActionsBar = ({
  count,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            {count} LIB{count !== 1 ? 's' : ''} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:bg-red-50 border-red-200"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  )
}
