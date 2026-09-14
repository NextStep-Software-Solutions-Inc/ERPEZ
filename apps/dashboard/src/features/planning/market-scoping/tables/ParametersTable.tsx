/**
 * Parameters Table
 * Reusable table component for displaying and managing evaluation parameters
 * Features: Sortable columns, searchable, filterable, action buttons
 */

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
import type { ParameterDefinition } from '@/features/planning/market-scoping/types/managementTypes'

interface ParametersTableProps {
  data: ParameterDefinition[]
  onEdit: (parameter: ParameterDefinition) => void
  onDelete: (parameter: ParameterDefinition) => void
  isLoading?: boolean
}

export default function ParametersTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}: ParametersTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading parameters...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No parameters found</div>
    )
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Parameter Name</TableHead>
            <TableHead className="font-semibold">Guided Question</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold w-20 text-center">
              Sort Order
            </TableHead>
            <TableHead className="font-semibold w-24 text-center">
              Status
            </TableHead>
            <TableHead className="font-semibold w-24 text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((parameter) => (
            <TableRow key={parameter.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {parameter.displayName}
              </TableCell>
              <TableCell className="text-sm max-w-xs truncate">
                {parameter.guidedQuestion}
              </TableCell>
              <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                {parameter.description || 'N/A'}
              </TableCell>
              <TableCell className="text-center text-sm">
                {parameter.sortOrder}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  color={parameter.isActive ? 'default' : 'secondary'}
                  className="whitespace-nowrap"
                >
                  {parameter.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(parameter)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    title="Edit parameter"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(parameter)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    title="Delete parameter"
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
