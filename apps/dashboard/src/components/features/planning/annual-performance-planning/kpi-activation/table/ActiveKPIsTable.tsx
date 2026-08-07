/**
 * Active KPIs Table
 * Displays and manages active KPIs with inline editing and deletion
 */

import { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import { ActiveKPIsToolbar } from './ActiveKPIsToolbar'
import { DeleteConfirmationDialog } from '../dialogs'
import type { ActiveKPI } from '@/components/features/planning/annual-performance-planning/shared/types/step2Types'
import type { AggregationMethod } from '@/features/planning/annual-performance-planning/appTypes'
import type { MetaActions } from '@/types/global'

interface ActiveKPIsTableProps {
  activeKPIs: ActiveKPI[]
  onAddKPI: () => void
  onEditKPI: (kpi: ActiveKPI) => void
  onDeleteKPI: (kpiId: string) => void
  onAggregationChange: (kpiId: string, method: AggregationMethod) => void
}

interface AggregationMethodEditorProps {
  currentMethod: AggregationMethod
  defaultMethod: AggregationMethod
  onMethodChange: (method: AggregationMethod) => void
  isModified: boolean
}

// Inline aggregation method editor component
function AggregationMethodEditor({
  currentMethod,
  defaultMethod,
  onMethodChange,
  isModified,
}: AggregationMethodEditorProps) {
  return (
    <Badge
      variant={isModified ? 'soft' : 'outline'}
      className="text-xs cursor-pointer"
      onClick={() => {
        // Toggle between default and current
        onMethodChange(currentMethod === defaultMethod ? 'SUM' : defaultMethod)
      }}
    >
      {currentMethod}
    </Badge>
  )
}

export function ActiveKPIsTable({
  activeKPIs,
  onAddKPI,
  onEditKPI,
  onDeleteKPI,
  onAggregationChange,
}: ActiveKPIsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    kpiId: string
    kpiName: string
  }>({ isOpen: false, kpiId: '', kpiName: '' })

  const handleDeleteClick = (kpiId: string, kpiName: string) => {
    setDeleteConfirmation({ isOpen: true, kpiId, kpiName })
  }

  const handleConfirmDelete = () => {
    onDeleteKPI(deleteConfirmation.kpiId)
    setDeleteConfirmation({ isOpen: false, kpiId: '', kpiName: '' })
  }

  const columns = useMemo<ColumnDef<ActiveKPI>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'KPI Code',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'KPI Name',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.getValue('name')}</div>
            {row.original.description && (
              <div className="text-sm text-gray-500 truncate max-w-lg">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'functionType',
        header: 'Function Type',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.getValue('functionType')}
          </Badge>
        ),
      },
      {
        accessorKey: 'aggregationMethod',
        header: 'Aggregation Method',
        cell: ({ row }) => (
          <AggregationMethodEditor
            currentMethod={row.original.aggregationMethod}
            defaultMethod={row.original.defaultAggregation}
            onMethodChange={(method) => onAggregationChange(row.original.id, method)}
            isModified={row.original.isModified}
          />
        ),
      },
      {
        accessorKey: 'isModified',
        header: 'Status',
        cell: ({ row }) =>
          row.original.isModified && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              Modified
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditKPI(row.original)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(row.original.id, row.original.name)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onAggregationChange, onEditKPI]
  )

  const actions: MetaActions = ['delete', 'write']

  return (
    <>
      <TemplateTable<ActiveKPI>
        title={`Active KPIs (${activeKPIs.length})`}
        columns={columns}
        data={activeKPIs}
        actions={actions}
        toolbar={() => (
          <ActiveKPIsToolbar
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onAddKPI={onAddKPI}
          />
        )}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        fixedPageSize={10}
        minRows={5}
        maxRows={50}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        kpiName={deleteConfirmation.kpiName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, kpiId: '', kpiName: '' })}
      />
    </>
  )
}
