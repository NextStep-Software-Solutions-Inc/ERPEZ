/**
 * Activity Types Table
 * Reusable table component for displaying and managing activity types
 * Features: Sortable columns, searchable, filterable, action buttons
 */

import { useMemo } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ActivityTypeDefinition } from '@/features/planning/market-scoping/types/managementTypes'

interface ActivityTypesTableProps {
  data: ActivityTypeDefinition[]
  onEdit: (activity: ActivityTypeDefinition) => void
  onDelete: (activity: ActivityTypeDefinition) => void
  isLoading?: boolean
}

export default function ActivityTypesTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}: ActivityTypesTableProps) {
  const columns = useMemo(
    () => [
      { key: 'type', label: 'Activity Type', width: 'auto' },
      { key: 'label', label: 'Label', width: 'auto' },
      { key: 'description', label: 'Description', width: 'auto' },
      { key: 'sortOrder', label: 'Sort Order', width: 'w-20' },
      { key: 'status', label: 'Status', width: 'w-24' },
      { key: 'actions', label: 'Actions', width: 'w-24' },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading activity types...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity types found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((col) => (
              <TableHead key={col.key} className={`font-semibold ${col.width}`}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((activity) => (
            <TableRow key={activity.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{activity.type}</TableCell>
              <TableCell>{activity.label}</TableCell>
              <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                {activity.description}
              </TableCell>
              <TableCell className="text-center text-sm">{activity.sortOrder}</TableCell>
              <TableCell className="text-center">
                <Badge
                  color={activity.isActive ? 'default' : 'secondary'}
                  className="whitespace-nowrap"
                >
                  {activity.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(activity)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    title="Edit activity type"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(activity)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    title="Delete activity type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
