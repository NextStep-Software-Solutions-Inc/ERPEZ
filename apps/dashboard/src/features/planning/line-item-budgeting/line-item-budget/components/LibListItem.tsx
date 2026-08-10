import { Eye, Edit3, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { getStatusColor } from '../utils'

interface LibListItemProps {
  lib: LIB
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (lib: LIB) => void
  onEdit: (lib: LIB) => void
  onDelete: (id: string) => void
}

export const LibListItem = ({
  lib,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: LibListItemProps) => {
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(lib.id)}
        />
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-900">{lib.name}</p>
          <p className="text-sm text-gray-500">{lib.libNumber}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{lib.sourceType}</p>
          <p className="text-xs text-gray-500">{lib.sourceName}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lib.status)}`}
        >
          {lib.status}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            ₱{(lib.totalAmount / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500">{lib.fiscalYear.year}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-900">
            {lib.activities?.length || 0} activities
          </p>
          <p className="text-xs text-gray-500">0 completed</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(lib)}
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lib)}
            title="Edit"
          >
            <Edit3 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(lib.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
